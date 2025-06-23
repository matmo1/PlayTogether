from datetime import datetime, date
from typing import Optional, List
from pydantic import BaseModel, EmailStr
from enum import Enum

class Gender(str, Enum):
    male = "male"
    female = "female"
    other = "other"

class MatchStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class BookingStatus(str, Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"

class UserBase(BaseModel):
    username: str
    email: EmailStr

class UserCreate(UserBase):
    password: str
    email: EmailStr
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

class SportBase(BaseModel):
    name: str

class Sport(SportBase):
    sport_id: int

    class Config:
        from_attributes = True
        
class SportCreate(SportBase):
    pass

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

class MatchBase(BaseModel):
    status: MatchStatus = MatchStatus.pending

class MatchCreate(MatchBase):
    activity_id: int

class Match(MatchBase):
    match_id: int
    activity_id: int
    user_id: int
    created_at: datetime

    class Config:
        from_attributes = True

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

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None