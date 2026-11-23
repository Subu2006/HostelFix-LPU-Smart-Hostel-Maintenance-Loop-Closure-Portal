"""Pydantic request and response schemas for strict API input validation."""

from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)


class RegisterRequest(BaseModel):
    reg_no: str = Field(..., min_length=3, max_length=32)
    full_name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=120)
    password: str = Field(..., min_length=6, max_length=128)
    hostel_block: str = Field(default="BH-1")
    room_no: str = Field(default="304")


class ComplaintCreate(BaseModel):
    block_code: str = Field(..., min_length=2, max_length=16)
    room_no: str = Field(..., min_length=1, max_length=32)
    category: str = Field(..., min_length=2, max_length=40)
    description: str = Field(..., min_length=5, max_length=1000)
    visit_slot: str = Field(default="10:00 AM – 12:00 PM")
    has_photo: bool = Field(default=False)


class ComplaintStaffUpdate(BaseModel):
    technician_name: Optional[str] = None
    status: Optional[str] = None
    visit_slot: Optional[str] = None
    staff_note: Optional[str] = None
    delay_reason: Optional[str] = None


class ComplaintClosureRequest(BaseModel):
    action: str = Field(..., pattern="^(resolve|reopen)$")
    rating: Optional[int] = Field(default=None, ge=1, le=5)
    feedback_comment: str = Field(default="")
    reopen_reason: str = Field(default="")


class RestockRequest(BaseModel):
    quantity: int = Field(default=10, ge=1, le=500)


class ObservationCreate(BaseModel):
    participant_code: str = Field(..., min_length=2, max_length=8)
    task_code: str = Field(..., min_length=2, max_length=8)
    outcome: str = Field(..., min_length=3, max_length=64)
    duration: str = Field(..., min_length=2, max_length=16)
    notes: str = Field(default="", max_length=1000)
