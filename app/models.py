from sqlalchemy import Column, Integer, String, Enum, DateTime, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class Gender(enum.Enum):
    male = "male"
    female = "female"
    other = "other"

class MatchStatus(enum.Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"

class BookingStatus(enum.Enum):
    pending = "pending"
    confirmed = "confirmed"
    cancelled = "cancelled"

class User(Base):
    __tablename__ = 'users'
    
    user_id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(100))
    gender = Column(Enum(Gender))
    birth_date = Column(Date)
    created_at = Column(DateTime, server_default='now()')
    
    activities = relationship("Activity", back_populates="user")
    matches = relationship("Match", back_populates="user")
    bookings = relationship("Booking", back_populates="user")

class Sport(Base):
    __tablename__ = 'sports'
    
    sport_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    
    facilities = relationship("Facility", back_populates="sport")
    activities = relationship("Activity", back_populates="sport")

class Facility(Base):
    __tablename__ = 'facilities'
    
    facility_id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    address = Column(String(255))
    contact_info = Column(String(100))
    sport_id = Column(Integer, ForeignKey('sports.sport_id'), nullable=True)
    
    sport = relationship("Sport", back_populates="facilities")
    bookings = relationship("Booking", back_populates="facility")

class Activity(Base):
    __tablename__ = 'activities'
    
    activity_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    sport_id = Column(Integer, ForeignKey('sports.sport_id'), nullable=False)
    description = Column(Text)
    activity_date = Column(DateTime)
    location = Column(String(255))
    created_at = Column(DateTime, server_default='now()')
    
    user = relationship("User", back_populates="activities")
    sport = relationship("Sport", back_populates="activities")
    matches = relationship("Match", back_populates="activity")

class Match(Base):
    __tablename__ = 'matches'
    
    match_id = Column(Integer, primary_key=True, index=True)
    activity_id = Column(Integer, ForeignKey('activities.activity_id'), nullable=False)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    status = Column(Enum(MatchStatus), server_default='pending')
    created_at = Column(DateTime, server_default='now()')
    
    activity = relationship("Activity", back_populates="matches")
    user = relationship("User", back_populates="matches")

class Booking(Base):
    __tablename__ = 'bookings'
    
    booking_id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.user_id'), nullable=False)
    facility_id = Column(Integer, ForeignKey('facilities.facility_id'), nullable=False)
    booking_date = Column(DateTime)
    duration = Column(Integer)
    status = Column(Enum(BookingStatus), server_default='pending')
    created_at = Column(DateTime, server_default='now()')
    
    user = relationship("User", back_populates="bookings")
    facility = relationship("Facility", back_populates="bookings")