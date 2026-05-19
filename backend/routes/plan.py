from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, desc
import uuid
from database import get_db
from models import Event, User
from schemas import EventRequest, EventPlan, ThemeSummary, ItineraryItem, BudgetItem, Recommendation, EventHistoryItem, EventUpdate
from dependencies import get_current_user
from services import generate_ai_event_plan
from typing import List

router = APIRouter()

@router.patch("/{event_id}", response_model=EventHistoryItem)
async def update_event(
    event_id: uuid.UUID,
    update_data: EventUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Event).where(Event.id == event_id, Event.user_id == current_user.id)
    )
    event = result.scalar_one_or_none()
    
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    # Update fields from the incoming JSON
    if update_data.generated_plan_json is not None:
        event.generated_plan_json = update_data.generated_plan_json
        
        # Sync top-level relational fields from the JSON
        plan_data = update_data.generated_plan_json
        if "guest_count" in plan_data:
            event.guest_count = plan_data["guest_count"]
        if "budget_target" in plan_data:
            event.budget = plan_data["budget_target"]
            
    # Explicitly update relational fields if provided in update_data
    if update_data.guest_count is not None:
        event.guest_count = update_data.guest_count
    if update_data.budget is not None:
        event.budget = update_data.budget
    if update_data.theme_preference is not None:
        event.theme_preference = update_data.theme_preference
        
    await db.commit()
    await db.refresh(event)
    return event

@router.post("/generate", response_model=EventHistoryItem)
async def generate_plan(
    request: EventRequest, 
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Generate event plan (mock or AI)
    event_plan = await generate_ai_event_plan(request)
    
    # Save to database
    new_event = Event(
        user_id=current_user.id,
        event_type=request.event_type,
        location=request.location,
        date=request.date,
        time=request.time,
        guest_count=request.guest_count,
        budget=request.budget,
        theme_preference=request.theme_preference,
        age_group=request.age_group,
        cultural_preference=request.cultural_preference,
        dietary_constraints=request.dietary_constraints,
        special_notes=request.special_notes,
        generated_plan_json=event_plan.model_dump()
    )
    db.add(new_event)
    await db.commit()
    await db.refresh(new_event)
    
    return new_event

@router.get("/history", response_model=List[EventHistoryItem])
async def get_history(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Event)
        .where(Event.user_id == current_user.id)
        .order_by(desc(Event.created_at))
    )
    events = result.scalars().all()
    return events

@router.post("/optimize", response_model=EventPlan)
async def optimize_plan(
    plan: EventPlan,
    instruction: str = "Optimize the budget and itinerary for the current guest count and budget target.",
    current_user: User = Depends(get_current_user)
):
    # This will call a new service method to re-generate/re-balance the plan
    from services.ai_plan_service import optimize_event_plan
    optimized_plan = await optimize_event_plan(plan, instruction)
    return optimized_plan
