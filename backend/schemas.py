from pydantic import BaseModel, Field, field_validator, EmailStr, ConfigDict
from typing import List, Optional
from datetime import datetime
import uuid

class EventRequest(BaseModel):
    event_type: str = Field(..., min_length=1)
    location: str = Field(..., min_length=1)
    date: str = Field(..., min_length=1)
    time: str = Field(..., min_length=1)
    guest_count: int = Field(..., gt=0)
    budget: float = Field(..., gt=0)
    theme_preference: Optional[str] = None
    age_group: Optional[str] = None
    cultural_preference: Optional[str] = None
    dietary_constraints: Optional[str] = None
    special_notes: Optional[str] = None

    @field_validator('event_type', 'location', 'date', 'time')
    @classmethod
    def not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Must not be empty')
        return v.strip()

class ThemeSummary(BaseModel):
    title: str
    description: str
    vibe: str
    location: str

class ItineraryItem(BaseModel):
    time: str
    title: str
    description: str
    icon: Optional[str] = None

class BudgetItem(BaseModel):
    item: str
    category: str
    estimated_cost: float
    notes: str

class Recommendation(BaseModel):
    type: str
    title: str
    description: str
    location: Optional[str] = None
    estimated_price: Optional[str] = None
    rating: Optional[str] = None  # Sentiment grade A-F
    review_snippet: Optional[str] = None
    source_url: Optional[str] = None
    image_url: Optional[str] = None
    specialties: Optional[List[str]] = None

class EventPlan(BaseModel):
    theme_summary: ThemeSummary
    itinerary: List[ItineraryItem]
    budget_matrix: List[BudgetItem]
    recommendations: List[Recommendation]
    total_estimated_cost: float
    generated_for: str
    guest_count: int
    budget_target: float
    notes: str
    blueprint_url: Optional[str] = None

# Auth Schemas
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut

# History Schemas
class EventHistoryItem(BaseModel):
    id: uuid.UUID
    event_type: str
    location: str
    date: str
    time: str
    guest_count: int
    budget: float
    generated_plan_json: dict
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)

class EventUpdate(BaseModel):
    guest_count: Optional[int] = None
    budget: Optional[float] = None
    theme_preference: Optional[str] = None
    generated_plan_json: Optional[dict] = None

# Phase 5 Bot Schemas
class BotChatRequest(BaseModel):
    message: str
    bot_mode: str = "planner"
    event_context: Optional[dict] = None
    plan_id: Optional[str] = None
    location: Optional[str] = None

    @field_validator('message')
    @classmethod
    def message_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError('Message must not be empty')
        return v.strip()

    @field_validator('bot_mode')
    @classmethod
    def bot_mode_valid(cls, v: str) -> str:
        valid_modes = {"planner", "budget", "vendors", "food", "decor", "timeline", "culture"}
        if v not in valid_modes:
            raise ValueError(f"bot_mode must be one of {valid_modes}")
        return v

class VendorMatch(BaseModel):
    name: str
    type: str
    location: str
    description: str
    estimated_price_range: str
    review_snippet: str
    sentiment_grade: str
    source_url: Optional[str] = None
    image_url: Optional[str] = None

    @field_validator('sentiment_grade')
    @classmethod
    def grade_valid(cls, v: str) -> str:
        if v not in {"A", "B", "C", "D", "F"}:
            raise ValueError("sentiment_grade must be A, B, C, D, or F")
        return v

class ResourceImage(BaseModel):
    title: str
    image_url: str
    source_url: Optional[str] = None

class BotChatResponse(BaseModel):
    bot_response: str
    matched_vendors: List[VendorMatch]
    resource_images: List[ResourceImage]
    used_search: bool
    provider: str
    bot_mode: str
    plan_update: Optional[dict] = None
    notes: Optional[str] = None
