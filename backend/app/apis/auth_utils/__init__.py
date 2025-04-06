import firebase_admin
from firebase_admin import auth
import databutton as db
from functools import lru_cache
from fastapi import HTTPException
from app.apis.models import UserRole

# Custom exceptions for better error handling
class AdminError(Exception):
    """Base exception for admin-related errors"""
    pass

class FirebaseError(AdminError):
    """Exception for Firebase-related errors"""
    pass

class RoleError(AdminError):
    """Exception for role-related errors"""
    pass

class FirebaseAdmin:
    """Service class for Firebase Admin operations"""
    def __init__(self):
        self._ensure_initialized()
    
    def _ensure_initialized(self):
        """Ensure Firebase Admin SDK is initialized"""
        try:
            firebase_admin.get_app()
        except ValueError:
            service_account = db.secrets.get("FIREBASE_SERVICE_ACCOUNT")
            if not service_account:
                raise FirebaseError("Firebase service account not configured") from None
            import json
            cred = firebase_admin.credentials.Certificate(json.loads(service_account))
            firebase_admin.initialize_app(cred)
    
    def verify_token(self, token: dict) -> dict:
        """Verify Firebase ID token and return claims"""
        try:
            decoded_token = auth.verify_id_token(token.get("idToken"))
            return decoded_token
        except Exception as e:
            raise FirebaseError(f"Token verification failed: {str(e)}") from e
    
    def get_user(self, user_id: str):
        """Get user by ID"""
        try:
            return auth.get_user(user_id)
        except auth.UserNotFoundError:
            raise FirebaseError(f"User {user_id} not found") from None
        except Exception as e:
            raise FirebaseError(f"Error getting user: {str(e)}") from e
    
    def update_user_claims(self, user_id: str, claims: dict):
        """Update user custom claims"""
        try:
            auth.set_custom_user_claims(user_id, claims)
        except Exception as e:
            raise FirebaseError(f"Error updating user claims: {str(e)}") from e
    
    def list_users(self):
        """List all users"""
        try:
            return auth.list_users()
        except Exception as e:
            raise FirebaseError(f"Error listing users: {str(e)}") from e

@lru_cache()
def get_firebase_admin() -> FirebaseAdmin:
    """Get or create FirebaseAdmin instance"""
    return FirebaseAdmin()

class RoleVerifier:
    """Service class for role verification"""
    def __init__(self, firebase_admin: FirebaseAdmin):
        self.firebase_admin = firebase_admin

    def verify_admin(self, token: dict, required_role: UserRole) -> str:
        """Verify if the user has the required role and return their UID"""
        try:
            decoded_token = self.firebase_admin.verify_token(token)
            claims = decoded_token.get("claims", {})
            uid = decoded_token["uid"]
            
            # Super admins have access to everything
            if claims.get(UserRole.SUPER_ADMIN):
                return uid
            
            # Check role hierarchy
            if required_role == UserRole.SUPER_ADMIN:
                if not claims.get(UserRole.SUPER_ADMIN):
                    raise RoleError("Super admin privileges required") from None
            elif required_role == UserRole.ADMIN:
                if not (claims.get(UserRole.ADMIN) or claims.get(UserRole.SUPER_ADMIN)):
                    raise RoleError("Admin privileges required") from None
            elif required_role == UserRole.MODERATOR:
                if not any(claims.get(role) for role in [UserRole.MODERATOR, UserRole.ADMIN, UserRole.SUPER_ADMIN]):
                    raise RoleError("Moderator privileges required") from None
            
            return uid
        except (FirebaseError, RoleError) as e:
            raise HTTPException(status_code=403, detail=str(e)) from e
        except Exception as e:
            raise HTTPException(status_code=401, detail=str(e)) from e

def get_role_verifier(firebase_admin: FirebaseAdmin = None) -> RoleVerifier:
    if firebase_admin is None:
        firebase_admin = get_firebase_admin()
    """Get RoleVerifier instance"""
    return RoleVerifier(firebase_admin)


from fastapi import APIRouter
from pydantic import BaseModel

class TokenRequest(BaseModel):
    """Request model for token validation"""
    token: dict


def get_user_id(token: dict) -> str | None:
    """Get user ID from token"""
    try:
        firebase_admin = get_firebase_admin()
        decoded_token = firebase_admin.verify_token(token)
        return decoded_token.get("uid")
    except Exception as e:
        print(f"Error getting user ID: {e}")
        return None

def is_admin(token: dict) -> bool:
    """Check if user has admin role"""
    try:
        firebase_admin = get_firebase_admin()
        decoded_token = firebase_admin.verify_token(token)
        claims = decoded_token.get("claims", {})
        return bool(claims.get(UserRole.ADMIN) or claims.get(UserRole.SUPER_ADMIN))
    except Exception as e:
        print(f"Error checking admin status: {e}")
        return False

router = APIRouter()