from fastapi import APIRouter

router = APIRouter()

@router.get("/api-health")
def check_health_router():
    """Health check endpoint for the models API router
    
    Function renamed to avoid duplicate operation ID with other health check endpoints.
    """
    return {"status": "ok", "message": "Models API router is operational"}
