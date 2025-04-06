"""Content V2 API for the InvestMatch platform.

This module provides content moderation endpoints that match the expected frontend path structure.
This is a clean implementation that avoids circular imports.
"""

from fastapi import APIRouter, HTTPException
from typing import Optional
from pydantic import BaseModel

# Create router with unique prefix
router = APIRouter(prefix="/content_v2", tags=["content"])

# Define endpoint functions with lazy imports
@router.get("/reports", operation_id="get_content_reports_v2")
async def get_content_reports_v2(status: Optional[str] = None):
    """Get content reports, matching the frontend path expectations
    
    Uses lazy imports to avoid circular dependencies.
    """
    print("Content V2 API: get_content_reports_v2 called")
    try:
        # Lazy import the function
        from app.apis.content_rules import get_content_reports_v12
        # Call the imported function
        print("Content V2 API: Calling get_content_reports_v12")
        return await get_content_reports_v12(status)
    except ImportError as e:
        print(f"Content V2 API: Error importing get_content_reports_v12: {e}")
        # Return empty fallback data if import fails
        return {"reports": []}
    except Exception as e:
        print(f"Content V2 API: Error in get_content_reports_v2: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving content reports"
        ) from e

@router.get("/rules", operation_id="get_content_rules_v2")
async def get_content_rules_v2():
    """Get content rules, matching the frontend path expectations
    
    Uses lazy imports to avoid circular dependencies.
    """
    print("Content V2 API: get_content_rules_v2 called")
    try:
        # Lazy import the function
        from app.apis.content_rules import get_content_rules_v12
        # Call the imported function
        print("Content V2 API: Calling get_content_rules_v12")
        return await get_content_rules_v12()
    except ImportError as e:
        print(f"Content V2 API: Error importing get_content_rules_v12: {e}")
        # Return empty fallback data if import fails
        return {"rules": []}
    except Exception as e:
        print(f"Content V2 API: Error in get_content_rules_v2: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving content rules"
        ) from e
