from fastapi import APIRouter
from pydantic import BaseModel, validator, Field

router = APIRouter()
from typing import Dict, List, Optional, Any
from datetime import datetime
import pandas as pd
import json
import zlib
import databutton as db
from hashlib import md5
import re

class DataSourceConfig(BaseModel):
    """Configuration for a data source"""
    name: str
    cache_duration_hours: int = Field(default=24, ge=1, le=168)  # 1 hour to 1 week
    compression_enabled: bool = True
    max_historical_records: int = Field(default=10, ge=1, le=100)
    schema_version: str = "1.0.0"

class CacheConfig(BaseModel):
    """Configuration for caching behavior"""
    sources: Dict[str, DataSourceConfig] = {
        "SEC_EDGAR": DataSourceConfig(name="SEC_EDGAR", cache_duration_hours=24),
        "CRUNCHBASE": DataSourceConfig(name="CRUNCHBASE", cache_duration_hours=48),
        "OPENBB": DataSourceConfig(name="OPENBB", cache_duration_hours=72)
    }

class NormalizedData(BaseModel):
    """Base model for normalized data with versioning"""
    schema_version: str
    normalized_at: datetime
    source: str
    data: Dict[str, Any]

class StorageManager:
    def __init__(self):
        self.cache_config = CacheConfig()

    def _compress_data(self, data: bytes) -> bytes:
        """Compress data using zlib"""
        return zlib.compress(data)

    def _decompress_data(self, data: bytes) -> bytes:
        """Decompress zlib compressed data"""
        return zlib.decompress(data)

    def _get_cache_key(self, source: str, data_type: str) -> str:
        """Generate a standardized cache key"""
        return f"{source.lower()}_{data_type}_cache"

    def _sanitize_storage_key(self, key: str) -> str:
        """Sanitize storage key to only allow alphanumeric and ._- symbols"""
        return re.sub(r'[^a-zA-Z0-9._-]', '', key)

    def store_normalized_data(self, source: str, data: pd.DataFrame):
        """Store normalized data with compression if enabled"""
        try:
            source_config = self.cache_config.sources[source]
            cache_key = self._sanitize_storage_key(self._get_cache_key(source, "data"))

            # Convert DataFrame to bytes
            data_bytes = data.to_json().encode()

            # Compress if enabled
            if source_config.compression_enabled:
                data_bytes = self._compress_data(data_bytes)

            # Store as binary
            db.storage.binary.put(cache_key, data_bytes)

            # Update metadata
            metadata = {
                "last_updated": datetime.now().isoformat(),
                "schema_version": source_config.schema_version,
                "record_count": len(data),
                "compressed": source_config.compression_enabled
            }
            metadata_key = self._sanitize_storage_key(f"{source.lower()}_metadata")
            db.storage.json.put(metadata_key, metadata)

        except Exception as e:
            print(f"Error storing normalized data: {str(e)}")
            raise

    def get_normalized_data(self, source: str) -> Optional[pd.DataFrame]:
        """Retrieve normalized data, handling decompression if needed"""
        try:
            cache_key = self._sanitize_storage_key(self._get_cache_key(source, "data"))
            metadata_key = self._sanitize_storage_key(f"{source.lower()}_metadata")

            # Get metadata first
            metadata = db.storage.json.get(metadata_key, default=None)
            if not metadata:
                return None

            # Get compressed data
            data_bytes = db.storage.binary.get(cache_key)

            # Decompress if needed
            if metadata.get("compressed", False):
                data_bytes = self._decompress_data(data_bytes)

            # Convert back to DataFrame
            return pd.read_json(data_bytes.decode())

        except Exception as e:
            print(f"Error retrieving normalized data: {str(e)}")
            return None

    def store_historical_data(self, source: str, investor_id: str, data: Dict):
        """Store historical data with pruning"""
        try:
            source_config = self.cache_config.sources[source]
            history_key = self._sanitize_storage_key(f"historical_{investor_id}")

            # Get existing history
            existing_history = db.storage.json.get(history_key, default=[])

            # Add new record
            new_record = {
                "snapshot_date": datetime.now().isoformat(),
                "schema_version": source_config.schema_version,
                "data": data
            }
            existing_history.append(new_record)

            # Prune old records if needed
            if len(existing_history) > source_config.max_historical_records:
                existing_history = existing_history[-source_config.max_historical_records:]

            # Store updated history
            db.storage.json.put(history_key, existing_history)

        except Exception as e:
            print(f"Error storing historical data: {str(e)}")
            raise

    def is_cache_valid(self, source: str) -> bool:
        """Check if cache is still valid based on configuration"""
        try:
            metadata_key = self._sanitize_storage_key(f"{source.lower()}_metadata")
            metadata = db.storage.json.get(metadata_key, default=None)

            if not metadata:
                return False

            source_config = self.cache_config.sources[source]
            last_updated = datetime.fromisoformat(metadata["last_updated"])
            cache_age = datetime.now() - last_updated

            return cache_age.total_seconds() < (source_config.cache_duration_hours * 3600)

        except Exception as e:
            print(f"Error checking cache validity: {str(e)}")
            return False

# Data normalization functions
def normalize_fund_size(value: Optional[float]) -> Optional[float]:
    """Normalize fund size to a standard unit (millions)"""
    if value is None:
        return None
    return round(value / 1_000_000, 2)  # Convert to millions and round to 2 decimals

def normalize_date(date_str: str) -> str:
    """Normalize date string to ISO format"""
    try:
        return datetime.fromisoformat(date_str).isoformat()
    except ValueError:
        return datetime.now().isoformat()

def normalize_investment_focus(focus_list: Optional[List[str]]) -> Optional[List[str]]:
    """Normalize investment focus areas"""
    if not focus_list:
        return None
    # Convert to lowercase and remove duplicates while preserving order
    seen = set()
    return [x.lower() for x in focus_list if not (x.lower() in seen or seen.add(x.lower()))]

# Create global storage manager instance
storage_manager = StorageManager()
