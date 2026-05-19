import json
import logging
import asyncio
from fastapi import HTTPException
from google import genai
from google.genai import types
import config
from schemas import BotChatRequest, BotChatResponse
from services.search_service import search_vendors

logger = logging.getLogger(__name__)

def _get_mock_bot_response(request: BotChatRequest) -> str:
    mode = request.bot_mode
    if mode == "planner":
        return f"As your AuraPlan architect, I've processed your directive regarding '{request.message}'. I recommend reviewing the event scope to ensure optimal flow."
    elif mode == "budget":
        return f"Analyzing financial matrix for '{request.message}'. You can reallocate funds from less critical categories to balance the budget."
    elif mode == "vendors":
        return f"I have evaluated local entities based on '{request.message}'. See the options below."
    elif mode == "food":
        return f"Menu adjustments logged: '{request.message}'. Ensure all dietary restrictions are accommodated."
    elif mode == "decor":
        return f"Aesthetic parameters noted: '{request.message}'. Consider incorporating subtle lighting to enhance the atmosphere."
    elif mode == "timeline":
        return f"Temporal flow update: '{request.message}'. I recommend a 15-minute buffer between major segments."
    elif mode == "culture":
        return f"Cultural integration plan: '{request.message}'. We will ensure respectful and accurate representation."
    return f"Directive received: {request.message}."

def _is_vendor_intent(message: str) -> bool:
    keywords = [
        "vendors", "venue", "catering", "caterer", "photographer", 
        "photography", "dj", "music", "decor", "florist", "flowers", 
        "nearby", "options", "prices", "quotes", "recommendations"
    ]
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in keywords)

def _is_edit_intent(message: str) -> bool:
    keywords = [
        "change", "update", "modify", "increase", "decrease", "add", "remove",
        "set", "adjust", "edit", "rescale", "re-scale", "rebalance", "re-balance"
    ]
    msg_lower = message.lower()
    return any(kw in msg_lower for kw in keywords)

def _get_provider_for_mode(mode: str) -> str:
    # Map modes to the most appropriate search provider
    mode_mapping = {
        "planner": "ddg",       # General wide search
        "budget": "mock",      # Primarily internal math
        "vendors": "tavily",    # Deep vetted search
        "food": "ddg",         # Switched from brave to ddg
        "decor": "ddg",        # Visual and trend search
        "timeline": "mock",    # Internal logic
        "culture": "ddg"       # Switched from brave to ddg
    }
    return mode_mapping.get(mode, config.SEARCH_PROVIDER)

def _get_specialized_instruction(mode: str, event_summary: str) -> str:
    instructions = {
        "planner": "You are the Lead Architect. Focus on the high-level vision, guest flow, and overall cohesion. Provide strategic advice.",
        "budget": "You are the Financial Strategist. Your priority is ROI. Suggest cost-saving hacks, reallocations, and value-based alternatives. Keep it realistic.",
        "vendors": "You are the Procurement Officer. Focus on logistics, vetting, contracts, and finding the perfect match between vendor style and event theme.",
        "food": "You are the Culinary Consultant. Focus on menu engineering, dietary safety, presentation, and seasonal ingredients. Avoid medical claims.",
        "decor": "You are the Visual Stylist. Focus on aesthetics, lighting, textures, and the 'Aura-Futurism' vibe. Suggest sensory details.",
        "timeline": "You are the Temporal Coordinator. Focus on the itinerary, setup/teardown timing, and ensuring zero 'dead time' for guests.",
        "culture": "You are the Cultural Liaison. Focus on respectful integration of traditions, etiquette, and authentic representation without stereotyping."
    }
    base = instructions.get(mode, "You are an expert event planner AI.")
    return f"{base}\nEvent Context: {event_summary if event_summary else 'No event context provided'}\n\nGuidelines:\n- Keep the response concise, helpful, and event-planning focused.\n- Do not make fake claims about real vendor availability.\n- Avoid unsafe medical/legal claims.\n- Do not output raw HTML."

async def generate_bot_response(request: BotChatRequest) -> BotChatResponse:
    matched_vendors = []
    resource_images = []
    used_search = False
    plan_update = None

    # Determine the search provider for this specific task
    target_provider = _get_provider_for_mode(request.bot_mode)

    # Check vendor search intent
    if _is_vendor_intent(request.message):
        if config.ENABLE_VENDOR_SEARCH:
            # Temporarily override config to use the mode-specific provider
            original_provider = config.SEARCH_PROVIDER
            config.SEARCH_PROVIDER = target_provider
            try:
                matched_vendors, resource_images, used_search = await search_vendors(request.message, request.location)
            finally:
                config.SEARCH_PROVIDER = original_provider

    # Generate bot response
    bot_text = ""
    chat_provider = config.CHAT_PROVIDER

    if config.CHAT_PROVIDER == "mock":
        bot_text = _get_mock_bot_response(request)
    elif config.CHAT_PROVIDER == "gemini":
        if not config.GEMINI_API_KEY:
            if config.AI_FALLBACK_TO_MOCK:
                bot_text = _get_mock_bot_response(request)
                chat_provider = "mock"
            else:
                raise HTTPException(status_code=502, detail="AI Provider configured but API key missing")
        else:
            try:
                # Compact event context
                event_summary = ""
                if request.event_context:
                    ec = request.event_context
                    summary_parts = []
                    if "theme_summary" in ec and isinstance(ec["theme_summary"], dict):
                        summary_parts.append(f"Theme: {ec['theme_summary'].get('title', 'Unknown')}")
                    if "guest_count" in ec:
                        summary_parts.append(f"Guests: {ec['guest_count']}")
                    if "budget_target" in ec:
                        summary_parts.append(f"Budget: {ec['budget_target']}")
                    event_summary = " | ".join(summary_parts)

                system_instruction = _get_specialized_instruction(request.bot_mode, event_summary)

                # If it's an edit intent, we ask Gemini to return a structured update if appropriate
                if _is_edit_intent(request.message) and request.event_context:
                    system_instruction += "\n\nCRITICAL: The user wants to modify the plan. If the request is a specific modification (e.g. 'add a dinner at 8pm', 'increase guest count to 100'), you MUST include a JSON object representing the UPDATED EventPlan in your response, wrapped in triple backticks with 'PLAN_UPDATE' label. Example: ```PLAN_UPDATE { ... } ```. Always ensure the JSON is valid and complete as per EventPlan schema."

                # Add info about search results if available
                if used_search and matched_vendors:
                    vendor_data = "\n".join([f"- {v.name} ({v.type}): {v.description}" for v in matched_vendors[:3]])
                    request.message = f"User Directive: {request.message}\n\nI found these potential vendors via {target_provider.upper()}:\n{vendor_data}\n\nPlease incorporate this info into your advice."

                client = genai.Client(api_key=config.GEMINI_API_KEY)
                try:
                    response = await asyncio.wait_for(
                        client.aio.models.generate_content(
                            model=config.AI_MODEL,
                            contents=request.message,
                            config=types.GenerateContentConfig(
                                system_instruction=system_instruction,
                                temperature=0.5,
                            )
                        ),
                        timeout=config.AI_TIMEOUT_SECONDS
                    )
                    bot_text = response.text

                    # Extract plan update if present
                    if "```PLAN_UPDATE" in bot_text:
                        try:
                            parts = bot_text.split("```PLAN_UPDATE")
                            json_str = parts[1].split("```")[0].strip()
                            plan_update = json.loads(json_str)
                            # Remove the JSON from the displayed text
                            bot_text = parts[0] + (parts[1].split("```")[1] if len(parts[1].split("```")) > 1 else "")
                            bot_text = bot_text.strip()
                        except Exception as json_e:
                            logger.error(f"Failed to parse PLAN_UPDATE: {json_e}")

                except asyncio.TimeoutError:
                    if config.AI_FALLBACK_TO_MOCK:
                        bot_text = _get_mock_bot_response(request)
                        chat_provider = "mock"
                    else:
                        raise HTTPException(status_code=504, detail="AI provider timeout")

            except Exception as e:
                logger.error(f"Gemini generation failed: {e}")
                if config.AI_FALLBACK_TO_MOCK:
                    bot_text = _get_mock_bot_response(request)
                    chat_provider = "mock"
                else:
                    raise HTTPException(status_code=502, detail="AI generation failed")

    notes = None
    if _is_vendor_intent(request.message) and not config.ENABLE_VENDOR_SEARCH:
        notes = "Live vendor search is currently disabled. Showing conceptual categories."
    elif used_search:
        notes = f"Strategy synthesized using live {target_provider.upper()} intelligence."

    return BotChatResponse(
        bot_response=bot_text,
        matched_vendors=matched_vendors,
        resource_images=resource_images,
        used_search=used_search,
        provider=chat_provider,
        bot_mode=request.bot_mode,
        plan_update=plan_update,
        notes=notes
    )