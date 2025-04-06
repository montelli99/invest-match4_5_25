from typing import List, Optional, Dict, Literal
from time import sleep
from threading import Thread
from pydantic import BaseModel
from fastapi import APIRouter, HTTPException, Response
import databutton as db
from datetime import datetime
from app.apis.models import ExtendedUserProfile, Message, UserRole
import json
import csv
from io import StringIO

router = APIRouter(tags=["data-export"])

class ExportRequest(BaseModel):
    """Request model for data export"""
    user_id: str
    format: Literal["csv", "json", "pdf"] = "json"
    include_profile: bool = True
    include_matches: bool = True
    include_messages: bool = True
    include_analytics: bool = True
    start_date: Optional[str] = None  # ISO format date string
    end_date: Optional[str] = None    # ISO format date string

class EstimateRequest(BaseModel):
    """Request model for size estimation"""
    user_id: str
    include_profile: bool = True
    include_matches: bool = True
    include_messages: bool = True
    include_analytics: bool = True
    start_date: Optional[str] = None  # ISO format date string
    end_date: Optional[str] = None    # ISO format date string

class EstimateResponse(BaseModel):
    """Response model for size estimation"""
    estimated_size_bytes: int

class ExportProgress(BaseModel):
    """Model for tracking export progress"""
    export_id: str
    progress: int = 0
    status: Literal["processing", "completed", "failed"] = "processing"
    download_url: Optional[str] = None
    error_message: Optional[str] = None

class ExportResponse(BaseModel):
    """Response model for export requests"""
    export_id: str
    status: str  # 'processing', 'completed', 'failed'
    download_url: Optional[str] = None
    error_message: Optional[str] = None

def get_user_profile_data(user_id: str) -> dict:
    """Retrieve user profile data"""
    profiles = db.storage.json.get('user_profiles', default={})
    return profiles.get(user_id, {})

def get_user_matches(user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[dict]:
    """Retrieve user matching history"""
    matches = db.storage.json.get('user_matches', default=[])
    filtered_matches = []
    
    for match in matches:
        if match.get('user_id') == user_id:
            match_date = datetime.fromisoformat(match.get('created_at', ''))
            
            if start_date and match_date < datetime.fromisoformat(start_date):
                continue
            if end_date and match_date > datetime.fromisoformat(end_date):
                continue
                
            filtered_matches.append(match)
    
    return filtered_matches

def get_user_messages(user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[dict]:
    """Retrieve user message history"""
    messages = db.storage.json.get('messages', default=[])
    filtered_messages = []
    
    for msg in messages:
        if msg.get('sender_id') == user_id or msg.get('receiver_id') == user_id:
            msg_date = datetime.fromisoformat(msg.get('timestamp', ''))
            
            if start_date and msg_date < datetime.fromisoformat(start_date):
                continue
            if end_date and msg_date > datetime.fromisoformat(end_date):
                continue
                
            filtered_messages.append(msg)
    
    return filtered_messages

def get_user_analytics(user_id: str, start_date: Optional[str] = None, end_date: Optional[str] = None) -> dict:
    """Retrieve user analytics data"""
    analytics = db.storage.json.get('user_analytics', default={})
    user_analytics = analytics.get(user_id, {})
    
    if start_date or end_date:
        filtered_analytics = {}
        for key, value in user_analytics.items():
            if isinstance(value, list) and 'date' in value[0]:
                filtered_analytics[key] = [
                    item for item in value
                    if (not start_date or datetime.fromisoformat(item['date']) >= datetime.fromisoformat(start_date)) and
                       (not end_date or datetime.fromisoformat(item['date']) <= datetime.fromisoformat(end_date))
                ]
            else:
                filtered_analytics[key] = value
        return filtered_analytics
    
    return user_analytics

def convert_to_csv(data: dict) -> str:
    """Convert data to CSV format"""
    output = StringIO()
    writer = csv.writer(output)
    
    # Write headers
    headers = ['category', 'field', 'value']
    writer.writerow(headers)
    
    # Write data
    def flatten_dict(d: dict, prefix=''):
        rows = []
        for key, value in d.items():
            if isinstance(value, dict):
                rows.extend(flatten_dict(value, f"{prefix}{key}."))
            elif isinstance(value, list):
                # Ensure list items are JSON serializable
                serializable_list = []
                for item in value:
                    if isinstance(item, (dict, list)):
                        serializable_list.append(json.dumps(item))
                    else:
                        serializable_list.append(str(item))
                rows.append([prefix, key, json.dumps(serializable_list)])
            else:
                # Convert any non-string values to string
                str_value = str(value) if value is not None else ''
                rows.append([prefix.rstrip('.'), key, str_value])
        return rows
    
    for category, category_data in data.items():
        if isinstance(category_data, dict):
            rows = flatten_dict(category_data)
            for row in rows:
                writer.writerow([category] + row)
        elif isinstance(category_data, list):
            writer.writerow([category, 'data', json.dumps(category_data)])
        else:
            writer.writerow([category, 'value', str(category_data)])
    
    return output.getvalue()

def estimate_data_size(request: EstimateRequest) -> int:
    """Estimate the size of the exported data in bytes"""
    total_size = 0
    
    if request.include_profile:
        profile_data = get_user_profile_data(request.user_id)
        total_size += len(json.dumps(profile_data).encode())
    
    if request.include_matches:
        matches_data = get_user_matches(request.user_id, request.start_date, request.end_date)
        total_size += len(json.dumps(matches_data).encode())
    
    if request.include_messages:
        messages_data = get_user_messages(request.user_id, request.start_date, request.end_date)
        total_size += len(json.dumps(messages_data).encode())
    
    if request.include_analytics:
        analytics_data = get_user_analytics(request.user_id, request.start_date, request.end_date)
        total_size += len(json.dumps(analytics_data).encode())
    
    return total_size

@router.post('/estimate-size')
def estimate_export_size(request: EstimateRequest) -> EstimateResponse:
    """Estimate the size of the exported data"""
    try:
        size = estimate_data_size(request)
        return EstimateResponse(estimated_size_bytes=size)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error estimating export size: {str(e)}"
        )

def process_export(export_id: str, request: ExportRequest):
    """Process export in background thread"""
    try:
        progress_data = ExportProgress(export_id=export_id)
        db.storage.json.put(f"progress_{export_id}", progress_data.dict())
        
        # Initialize export data
        export_data = {}
        steps = sum([request.include_profile, request.include_matches,
                    request.include_messages, request.include_analytics])
        current_step = 0
        
        # Collect requested data
        if request.include_profile:
            export_data['profile'] = get_user_profile_data(request.user_id)
            current_step += 1
            progress_data.progress = int((current_step / steps) * 100)
            db.storage.json.put(f"progress_{export_id}", progress_data.dict())
            
        if request.include_matches:
            export_data['matches'] = get_user_matches(
                request.user_id,
                request.start_date,
                request.end_date
            )
            current_step += 1
            progress_data.progress = int((current_step / steps) * 100)
            db.storage.json.put(f"progress_{export_id}", progress_data.dict())
            
        if request.include_messages:
            export_data['messages'] = get_user_messages(
                request.user_id,
                request.start_date,
                request.end_date
            )
            current_step += 1
            progress_data.progress = int((current_step / steps) * 100)
            db.storage.json.put(f"progress_{export_id}", progress_data.dict())
            
        if request.include_analytics:
            export_data['analytics'] = get_user_analytics(
                request.user_id,
                request.start_date,
                request.end_date
            )
            current_step += 1
            progress_data.progress = int((current_step / steps) * 100)
            db.storage.json.put(f"progress_{export_id}", progress_data.dict())
        
        # Generate export file
        if request.format == "json":
            db.storage.json.put(export_id, export_data)
        elif request.format == "csv":
            csv_data = convert_to_csv(export_data)
            db.storage.text.put(export_id, csv_data)
        elif request.format == "pdf":
            # PDF generation would require additional libraries
            # For now, we'll return JSON data that can be formatted as PDF in the frontend
            db.storage.json.put(export_id, export_data)
        
        # Update progress to completed
        progress_data.status = "completed"
        progress_data.download_url = f"/api/download/{export_id}"
        db.storage.json.put(f"progress_{export_id}", progress_data.dict())
        
    except Exception as e:
        progress_data.status = "failed"
        progress_data.error_message = str(e)
        db.storage.json.put(f"progress_{export_id}", progress_data.dict())

@router.post('/export-data')
def export_user_data(request: ExportRequest) -> ExportResponse:
    """Export user data in the specified format"""
    try:
        # Generate export ID
        export_id = f"export_{request.user_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Start export in background thread
        Thread(target=process_export, args=(export_id, request)).start()
        
        return ExportResponse(
            export_id=export_id,
            status="processing"
        )
    except Exception as e:
        return ExportResponse(
            export_id="",
            status="failed",
            error_message=str(e)
        )

@router.get('/export-progress/{export_id}')
def get_export_progress(export_id: str) -> ExportProgress:
    """Get the progress of an export"""
    try:
        progress_data = db.storage.json.get(f"progress_{export_id}")
        if progress_data is None:
            raise HTTPException(status_code=404, detail="Export not found") from None
        return ExportProgress(**progress_data)
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error getting export progress: {str(e)}"
        ) from e


@router.get('/download/{export_id}')
def download_export(export_id: str):
    """Download an exported data file"""
    try:
        if export_id.endswith('csv'):
            data = db.storage.text.get(export_id)
            if data is None:
                raise HTTPException(status_code=404, detail="Export file not found") from None
            media_type = 'text/csv'
            content = data
        else:
            data = db.storage.json.get(export_id)
            if data is None:
                raise HTTPException(status_code=404, detail="Export file not found") from None
            media_type = 'application/json'
            try:
                content = json.dumps(data, ensure_ascii=False)
            except TypeError as e:
                raise HTTPException(
                    status_code=500,
                    detail=f"Error serializing data: {str(e)}"
                ) from e
            
        return Response(
            content=content,
            media_type=media_type,
            headers={
                'Content-Disposition': f'attachment; filename="{export_id}.{media_type.split("/")[1]}"'
            }
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing export: {str(e)}"
        ) from e
