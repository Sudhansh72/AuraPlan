from fastapi import APIRouter, Depends, HTTPException, status
from typing import Annotated
from schemas import BotChatRequest, BotChatResponse, UserOut
from dependencies import get_current_user
from services.bot_service import generate_bot_response
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["bot"])

@router.post("/chat", response_model=BotChatResponse)
async def bot_chat(
    request: BotChatRequest,
    current_user: Annotated[UserOut, Depends(get_current_user)]
):
    try:
        response = await generate_bot_response(request)
        return response
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in bot chat route: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate bot response"
        )