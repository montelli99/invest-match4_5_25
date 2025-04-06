"""Routes API for the InvestMatch platform.

This module provides route-related API endpoints and permissions endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
import databutton as db
from enum import Enum

from app.apis.models import UserRole
from app.apis.auth_utils import get_firebase_admin, get_role_verifier

router = APIRouter(tags=["routes"])

@router.get("/admin/analytics/dashboard")
def route_admin_analytics_dashboard_endpoint():
    """Get the admin analytics dashboard
    
    This endpoint matches the exact path expected by the frontend.
    This is a synchronous implementation that directly generates dashboard data.
    Function renamed to avoid duplicate operation ID with admin_analytics module.
    
    Returns:
        AdminDashboard containing platform-wide analytics data
    """
    from app.apis.admin_analytics import get_admin_analytics_dashboard
    # Call the synchronous implementation we created in admin_analytics
    return get_admin_analytics_dashboard()

class Permission(BaseModel):
    """Model representing a granular permission"""
    resource: str = Field(..., description="Resource the permission applies to")
    actions: List[str] = Field(..., description="Actions allowed on the resource")
    description: Optional[str] = Field(None, description="Description of the permission")
    
    model_config = {"arbitrary_types_allowed": True}

class Role(BaseModel):
    """Model representing a user role with permissions"""
    id: str = Field(..., description="Role identifier")
    name: str = Field(..., description="Human-readable role name")
    permissions: List[Permission] = Field(..., description="Permissions granted to this role")
    
    model_config = {"arbitrary_types_allowed": True}

class RolePermissionResponse(BaseModel):
    """Response model for role permissions"""
    routes: Dict[str, List[str]] = Field(..., description="Route access by role")
    features: Dict[str, bool] = Field(..., description="Feature flags")
    roles: Dict[str, Role] = Field(..., description="Detailed role permissions")
    
    model_config = {"arbitrary_types_allowed": True}

@router.post("/permissions")
async def get_permissions(token: Optional[Dict] = None):
    """Get permission structure for roles
    
    This endpoint provides role-based permissions data that the frontend uses
    to determine which features are available to each user role.
    
    Returns detailed permission structures for all roles, as well as
    backward-compatible routes and features dictionaries.
    """
    try:
        # Define the permissions for each role
        admin_permissions = [
            Permission(
                resource="moderation",
                actions=["view", "update", "create", "delete", "batch"],
                description="Full access to moderation system"
            ),
            Permission(
                resource="users",
                actions=["view", "update", "create", "delete"],
                description="Full access to user management"
            ),
            Permission(
                resource="analytics",
                actions=["view", "export"],
                description="Full access to analytics dashboard"
            ),
            Permission(
                resource="settings",
                actions=["view", "update"],
                description="Access to system settings"
            ),
            Permission(
                resource="rules",
                actions=["view", "create", "update", "delete", "test"],
                description="Full access to content rules"
            )
        ]
        
        moderator_permissions = [
            Permission(
                resource="moderation",
                actions=["view", "update"],
                description="View and update moderation content"
            ),
            Permission(
                resource="users",
                actions=["view"],
                description="View user profiles"
            ),
            Permission(
                resource="analytics",
                actions=["view"],
                description="View-only access to analytics dashboard"
            ),
            Permission(
                resource="rules",
                actions=["view", "test"],
                description="View and test content rules"
            )
        ]
        
        analyst_permissions = [
            Permission(
                resource="analytics",
                actions=["view", "export"],
                description="Full access to analytics dashboard"
            ),
            Permission(
                resource="moderation",
                actions=["view"],
                description="View-only access to moderation content"
            ),
            Permission(
                resource="rules",
                actions=["view"],
                description="View-only access to content rules"
            )
        ]
        
        user_permissions = [
            Permission(
                resource="profile",
                actions=["view", "update"],
                description="Access to own profile"
            ),
            Permission(
                resource="matching",
                actions=["view", "create"],
                description="Access to matching system"
            )
        ]
        
        # Define roles with their permissions
        roles = {
            "admin": Role(
                id="admin",
                name="Administrator",
                permissions=admin_permissions
            ),
            "moderator": Role(
                id="moderator",
                name="Content Moderator",
                permissions=moderator_permissions
            ),
            "analyst": Role(
                id="analyst",
                name="Analytics Analyst",
                permissions=analyst_permissions
            ),
            "user": Role(
                id="user",
                name="Standard User",
                permissions=user_permissions
            )
        }
        
        # Create backward-compatible response structure
        return RolePermissionResponse(
            routes={
                "admin": ["/admin/*", "/moderation/*", "/analytics/*", "/settings/*"],
                "moderator": ["/moderation/*", "/analytics/view"],
                "analyst": ["/analytics/*", "/moderation/view"],
                "user": ["/profile/*", "/matching/*"]
            },
            features={
                "can_approve_reports": True,
                "can_edit_rules": True,
                "can_view_analytics": True,
                "can_manage_users": True,
                "can_batch_moderate": True,
                "can_export_data": True,
                "can_test_patterns": True,
                "can_view_effectiveness": True,
                "can_view_audit_logs": True
            },
            roles=roles
        )
    except Exception as e:
        print(f"Error getting permissions: {e}")
        raise HTTPException(
            status_code=500,
            detail="Error retrieving permissions data"
        ) from e
