import asyncio
import logging
from typing import List
from fastapi import HTTPException
from google import genai
from google.genai import types
from schemas import EventRequest, EventPlan, Recommendation
import config
from .mock_plan_service import generate_mock_event_plan
from services.search_service import search_vendors
import json

logger = logging.getLogger(__name__)

async def _get_real_recommendations(event_type: str, location: str) -> List[Recommendation]:
    recs = []
    
    # Define categories to search
    categories = [
        {"type": "Venue", "query": f"Best {event_type} venues"},
        {"type": "Catering", "query": f"Best {event_type} catering services"},
        {"type": "Photography", "query": f"Professional {event_type} photographers"},
        {"type": "Decor & Florals", "query": f"Top event decorators and florists for {event_type}"},
        {"type": "Entertainment", "query": f"Live bands and DJs for {event_type}"}
    ]

    # Run searches in parallel for efficiency
    search_tasks = [search_vendors(cat["query"], location) for cat in categories]
    results = await asyncio.gather(*search_tasks)

    for i, (vendors, images, _) in enumerate(results):
        if vendors:
            v = vendors[0]
            cat_type = categories[i]["type"]
            recs.append(Recommendation(
                type=cat_type,
                title=v.name,
                description=v.description,
                location=v.location,
                estimated_price=v.estimated_price_range,
                rating=v.sentiment_grade,
                review_snippet=v.review_snippet,
                source_url=v.source_url,
                image_url=images[0].image_url if images else None,
                specialties=[cat_type, "Vetted"]
            ))
            
    return recs

def validate_ai_plan(plan: EventPlan, request: EventRequest) -> bool:
    # Post-AI validation rules
    if plan.budget_target != request.budget:
        return False
    if plan.guest_count != request.guest_count:
        return False
    
    # Calculate sum of budget_matrix items
    total_items_cost = sum(item.estimated_cost for item in plan.budget_matrix)
    # Check if total_estimated_cost <= budget_target (allowing tiny rounding differences)
    if plan.total_estimated_cost > request.budget + 1.0:
        return False
    # Check if total_items_cost matches total_estimated_cost approximately
    if abs(plan.total_estimated_cost - total_items_cost) > 1.0:
        return False

    return True

async def generate_ai_event_plan(request: EventRequest) -> EventPlan:
    if config.AI_PROVIDER == "mock":
        return await asyncio.to_thread(generate_mock_event_plan, request)
        
    if config.AI_PROVIDER == "gemini":
        if not config.GEMINI_API_KEY:
            if config.AI_FALLBACK_TO_MOCK:
                plan = await asyncio.to_thread(generate_mock_event_plan, request)
                plan.notes += " (Generated via mock fallback: API key missing)"
                return plan
            else:
                raise HTTPException(status_code=502, detail="AI plan generation is temporarily unavailable. Please try again later.")
                
        try:
            client = genai.Client(api_key=config.GEMINI_API_KEY)
            
            prompt = f"""
            Act as a precision event architect.
            Event Type: {request.event_type}
            Location: {request.location}
            Date: {request.date}
            Time: {request.time}
            Guest Count: {request.guest_count}
            Budget: {request.budget}
            Theme Preference: {request.theme_preference or 'None'}
            Age Group: {request.age_group or 'None'}
            Cultural Preference: {request.cultural_preference or 'None'}
            Dietary Constraints: {request.dietary_constraints or 'None'}
            Special Notes: {request.special_notes or 'None'}
            
            Return a JSON object exactly matching the EventPlan schema.
            The generated plan must be realistic for the submitted budget.
            Keep total_estimated_cost less than or equal to budget_target.
            Create a practical itinerary using real clock times.
            Do not use H+1 / H+2 technical labels.
            Respect dietary constraints and cultural/religious preferences carefully.
            Do not claim availability of real venues/vendors. Use generic category-level recommendations.
            Keep tone professional, warm, and helpful.
            """
            
            response = await client.aio.models.generate_content(
                model=config.AI_MODEL,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    response_schema=EventPlan.model_json_schema(),
                    temperature=0.4,
                ),
            )
            
            if getattr(response, "parsed", None) is not None:
                generated_plan = EventPlan.model_validate(response.parsed)
            else:
                generated_plan = EventPlan.model_validate_json(response.text)
                
            # Fetch real recommendations if enabled
            try:
                real_recs = await _get_real_recommendations(request.event_type, request.location)
                if real_recs:
                    # Filter out generic recommendations if we have real ones
                    # or just prepend real ones
                    generated_plan.recommendations = real_recs + generated_plan.recommendations
            except Exception as rec_e:
                logger.warning(f"Failed to fetch real recommendations: {rec_e}")

            if not validate_ai_plan(generated_plan, request):
                raise ValueError("Generated plan failed validation constraints.")
                
            return generated_plan
            
        except Exception as e:
            logger.error(f"Gemini API generation failed: {str(e)}")
            if config.AI_FALLBACK_TO_MOCK:
                plan = await asyncio.to_thread(generate_mock_event_plan, request)
                plan.notes += " (Generated via mock fallback: AI service unavailable)"
                return plan
            else:
                raise HTTPException(status_code=502, detail="AI plan generation is temporarily unavailable. Please try again later.")

    # Unsupported provider
    if config.AI_FALLBACK_TO_MOCK:
        plan = await asyncio.to_thread(generate_mock_event_plan, request)
        plan.notes += " (Generated via mock fallback: Unsupported provider)"
        return plan
    else:
        raise HTTPException(status_code=500, detail="Invalid AI provider configuration.")

async def optimize_event_plan(plan: EventPlan, instruction: str) -> EventPlan:
    if config.AI_PROVIDER == "mock":
        # Simply return the same plan with a note for mock
        plan.notes += f" (Mock optimized: {instruction})"
        return plan
        
    try:
        client = genai.Client(api_key=config.GEMINI_API_KEY)
        
        prompt = f"""
        Act as a precision event architect. 
        You are given an existing event plan and a directive for optimization.
        
        Existing Plan Context:
        Theme: {plan.theme_summary.title}
        Guest Count: {plan.guest_count}
        Budget Target: {plan.budget_target}
        
        Directive: {instruction}
        
        Review the current budget_matrix and itinerary. 
        If the guest count or budget target has changed, redistribute the funds and adjust the timing/activities to be realistic and optimized.
        Maintain the 'Aura-Futurism' vibe.
        
        Return a JSON object exactly matching the EventPlan schema.
        Current Plan: {plan.model_dump_json()}
        """
        
        response = await client.aio.models.generate_content(
            model=config.AI_MODEL,
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=EventPlan.model_json_schema(),
                temperature=0.3,
            ),
        )
        
        if getattr(response, "parsed", None) is not None:
            optimized_plan = EventPlan.model_validate(response.parsed)
        else:
            optimized_plan = EventPlan.model_validate_json(response.text)
            
        # Add a conceptual blueprint if not present
        if not optimized_plan.blueprint_url:
            # Using a high-quality architectural placeholder
            optimized_plan.blueprint_url = f"https://images.unsplash.com/photo-1503387762-592dea58ef21?q=80&w=2000&auto=format&fit=crop"
            
        optimized_plan.notes += " (System Optimized)"
        return optimized_plan
        
    except Exception as e:
        logger.error(f"Optimization failed: {e}")
        plan.notes += f" (Optimization failed: {str(e)})"
        return plan