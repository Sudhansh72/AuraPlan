from schemas import EventRequest, EventPlan, ThemeSummary, ItineraryItem, BudgetItem, Recommendation
from datetime import datetime, timedelta

def generate_mock_event_plan(request: EventRequest) -> EventPlan:
    vibe = request.theme_preference or "Modern & Elegant"
    title = f"{request.event_type} in {request.location}"
    if request.cultural_preference:
        title = f"{request.cultural_preference} {title}"
    
    description = f"A bespoke {request.event_type.lower()} experience tailored for {request.guest_count} guests in {request.location}."
    if request.special_notes:
        description += f" Incorporating: {request.special_notes}"
        
    theme_summary = ThemeSummary(
        title=title,
        description=description,
        vibe=vibe,
        location=request.location
    )
    
    budget_allocations = [
        ("Venue", "Infrastructure", 0.30),
        ("Catering", "Food & Beverage", 0.35),
        ("Decor", "Aesthetics", 0.12),
        ("Music/Entertainment", "Experience", 0.08),
        ("Photography", "Media", 0.08),
        ("Dessert/Cake", "Food & Beverage", 0.04),
        ("Contingency", "Risk Management", 0.03),
    ]
    
    budget_matrix = []
    total_cost = 0.0
    for item, category, weight in budget_allocations:
        cost = round(request.budget * weight, 2)
        notes = f"Allocated based on {request.guest_count} guests."
        if category == "Food & Beverage" and request.dietary_constraints:
            notes += f" Accounted for: {request.dietary_constraints}"
        
        budget_matrix.append(BudgetItem(
            item=item,
            category=category,
            estimated_cost=cost,
            notes=notes
        ))
        total_cost += cost
    
    try:
        start_dt = datetime.strptime(request.time, "%H:%M")
    except ValueError:
        try:
            start_dt = datetime.strptime(request.time, "%I:%M %p")
        except ValueError:
            start_dt = datetime.strptime("18:00", "%H:%M")

    def format_time(dt, offset_hours):
        new_dt = dt + timedelta(hours=offset_hours)
        return new_dt.strftime("%H:%M")

    itinerary = [
        ItineraryItem(time=format_time(start_dt, 0), title="Guest Arrival", description=f"Welcome drinks and gathering at the {request.location} venue."),
        ItineraryItem(time=format_time(start_dt, 1.0), title="Welcome Moment", description=f"Opening remarks and introduction for the {request.event_type}."),
        ItineraryItem(time=format_time(start_dt, 1.5), title="Main Event Entrance", description=f"The centerpiece moment of the celebration."),
        ItineraryItem(time=format_time(start_dt, 2.5), title="Gourmet Dining", description=f"Curated menu served with attention to {request.dietary_constraints or 'all preferences'}."),
        ItineraryItem(time=format_time(start_dt, 4.0), title="Speeches & Toasts", description="Heartfelt messages from key participants."),
        ItineraryItem(time=format_time(start_dt, 5.0), title="Celebration & Music", description="DJ and interactive entertainment session."),
        ItineraryItem(time=format_time(start_dt, 6.0), title="Final Toast & Departure", description="Closing thanks and safe travels for all guests.")
    ]
    
    rec_vibe = "Premium" if request.budget / request.guest_count > 200 else "Practical"
    recommendations = [
        Recommendation(type="Venue", title=f"The {request.location} Loft", description=f"A {rec_vibe.lower()} space perfect for {request.event_type}."),
        Recommendation(type="Food", title="Aura Catering Co.", description=f"Specialized in {request.cultural_preference or 'International'} cuisine."),
        Recommendation(type="Decor", title="Ethereal Designs", description=f"Translating the '{vibe}' vibe into physical space."),
        Recommendation(type="Music", title="Sonic Pulse DJ", description="Expertly curated playlists for diverse age groups."),
        Recommendation(type="Photography", title="Lens & Light Studio", description="Capturing high-fidelity memories of your special day.")
    ]
    
    event_plan = EventPlan(
        theme_summary=theme_summary,
        itinerary=itinerary,
        budget_matrix=budget_matrix,
        recommendations=recommendations,
        total_estimated_cost=total_cost,
        generated_for=request.event_type,
        guest_count=request.guest_count,
        budget_target=request.budget,
        notes=f"Generated for {request.age_group or 'all ages'}."
    )
    
    return event_plan