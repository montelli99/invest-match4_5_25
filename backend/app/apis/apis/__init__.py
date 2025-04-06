"""APIs package initialization.

This module exports routers from various API modules.
All models should be imported from app.apis.models.
"""

from fastapi import APIRouter
from app.apis.profile import router as profile_router
from app.apis.profile_management import router as profile_management_router
from app.apis.relationship_management import router as relationship_management_router
from app.apis.relationship_strength import router as relationship_strength_router

# Create router for this module
router = APIRouter()

# Export routers for FastAPI app
routers = [
    profile_router,
    profile_management_router,
    relationship_management_router,
    relationship_strength_router
]

__all__ = ['router', 'routers']