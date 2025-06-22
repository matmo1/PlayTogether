from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from enum import Enum

class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class MatchStatus(str, Enum):
    pending = "Pending"
    accepted = "Accepted"
    rejected = "Rejected"

class BookingStatus(str, Enum):
    pending = "Pending"
    confirmed = "Confirmed"
    cancelled = "Cancelled"

# User Schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    full_name: Optional[str] = None
    gender: Optional[Gender] = None
    birth_date: Optional[date] = None

class User(UserBase):
    user_id: int
    full_name: Optional[str]
    gender: Optional[Gender]
    birth_date: Optional[date]
    created_at: datetime

    class Config:
        from_attributes = True
# Sport Schemas
class SportBase(BaseModel):
    name: str

class SportCreate(SportBase):
    pass

class Sport(SportBase):
    sport_id: int

    class Config:
        from_attributes = True

# Facility Schemas
class FacilityBase(BaseModel):
    name: str
    address: Optional[str] = None
    contact_info: Optional[str] = None

class FacilityCreate(FacilityBase):
    sport_id: int

class Facility(FacilityBase):
    facility_id: int
    sport_id: int

    class Config:
        from_attributes = True

# Activity Schemas
class ActivityBase(BaseModel):
    description: str
    activity_date: datetime
    location: str

class ActivityCreate(ActivityBase):
    sport_id: int

class Activity(ActivityBase):
    activity_id: int
    user_id: int
    sport_id: int
    created_at: datetime

    class Config:
        from_attributes = True

# Match Schemas
class MatchBase(BaseModel):
    status: MatchStatus = MatchStatus.pending

class MatchCreate(MatchBase):
    activity_id: int

class Match(MatchBase):
    match_id: int
    activity_id: int
    user_id: int

    class Config:
        from_attributes = True

# Booking Schemas
class BookingBase(BaseModel):
    booking_date: datetime
    duration: int
    status: BookingStatus = BookingStatus.pending

class BookingCreate(BookingBase):
    facility_id: int

class Booking(BookingBase):
    booking_id: int
    user_id: int
    facility_id: int
    created_at: datetime

    class Config:
        from_attributes = True