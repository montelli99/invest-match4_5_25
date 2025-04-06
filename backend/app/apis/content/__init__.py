"""Content API for the InvestMatch platform.

This module provides content moderation endpoints that match the expected frontend path structure.

NOTE: This module is designed to provide compatible endpoints that match the frontend path expectations.
It delegates actual functionality to the content_rules module.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

# Create router with unique prefix
router = APIRouter(prefix="/content", tags=["content"])

# Define fallback models that will only be used if imports fail
class ContentReport(BaseModel):
    """Fallback model for ContentReport"""
    id: str = ""
    content_id: str = ""
    status: str = "pending"

class ContentRule(BaseModel):
    """Fallback model for ContentRule"""
    id: str = ""
    pattern: str = ""
    is_active: bool = True

# Define endpoint functions with lazy imports
@router.get("/reports", operation_id="get_content_reports_wrapper")
async def get_content_reports_wrapper(status: Optional[str] = None):
    """Get content reports, matching the frontend path expectations
    
    Uses lazy imports to avoid circular dependencies.
    """
    print("Content API: get_content_reports_wrapper called")
    try:
        # Lazy import the function
        from app.apis.content_rules import get_content_reports_v12
        # Call the imported function
        print("Content API: Calling get_content_reports_v12")
        return await get_content_reports_v12(status)
    except ImportError as e:
        print(f"Content API: Error importing get_content_reports_v12: {e}")
        # Return empty fallback data if import fails
        return {"reports": []}
    except Exception as e:
        print(f"Content API: Error in get_content_reports_wrapper: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving content reports"
        ) from e

@router.get("/rules", operation_id="get_content_rules_wrapper")
async def get_content_rules_wrapper():
    """Get content rules, matching the frontend path expectations
    
    Uses lazy imports to avoid circular dependencies.
    """
    print("Content API: get_content_rules_wrapper called")
    try:
        # Lazy import the function
        from app.apis.content_rules import get_content_rules_v12
        # Call the imported function
        print("Content API: Calling get_content_rules_v12")
        return await get_content_rules_v12()
    except ImportError as e:
        print(f"Content API: Error importing get_content_rules_v12: {e}")
        # Return empty fallback data if import fails
        return {"rules": []}
    except Exception as e:
        print(f"Content API: Error in get_content_rules_wrapper: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving content rules"
        ) from e
