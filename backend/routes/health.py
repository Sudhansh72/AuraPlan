from fastapi import APIRouter

router = APIRouter()

@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "AuraPlan API",
        "version": "0.1.0"
    }
