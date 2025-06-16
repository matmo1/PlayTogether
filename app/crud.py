from sqlalchemy.orm import Session
from . import models, schemas
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# --- User Operations ---
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.user_id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = models.User(
        email=user.email,
        username=user.username,
        password_hash=hashed_password,
        full_name=user.full_name,
        gender=user.gender,
        birth_date=user.birth_date
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# --- Sport Operations ---
def get_sport(db: Session, sport_id: int):
    return db.query(models.Sport).filter(models.Sport.sport_id == sport_id).first()

def get_sports(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Sport).offset(skip).limit(limit).all()

def create_sport(db: Session, sport: schemas.SportCreate):
    db_sport = models.Sport(name=sport.name)
    db.add(db_sport)
    db.commit()
    db.refresh(db_sport)
    return db_sport

# --- Facility Operations ---
def get_facility(db: Session, facility_id: int):
    return db.query(models.Facility).filter(models.Facility.facility_id == facility_id).first()

def get_facilities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Facility).offset(skip).limit(limit).all()

def create_facility(db: Session, facility: schemas.FacilityCreate):
    db_facility = models.Facility(
        name=facility.name,
        address=facility.address,
        contact_info=facility.contact_info,
        sport_id=facility.sport_id
    )
    db.add(db_facility)
    db.commit()
    db.refresh(db_facility)
    return db_facility

# --- Activity Operations ---
def get_activity(db: Session, activity_id: int):
    return db.query(models.Activity).filter(models.Activity.activity_id == activity_id).first()

def get_activities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Activity).offset(skip).limit(limit).all()

def create_activity(db: Session, activity: schemas.ActivityCreate, user_id: int):
    db_activity = models.Activity(
        user_id=user_id,
        sport_id=activity.sport_id,
        description=activity.description,
        activity_date=activity.activity_date,
        location=activity.location
    )
    db.add(db_activity)
    db.commit()
    db.refresh(db_activity)
    return db_activity

# --- Match Operations ---
def create_match(db: Session, match: schemas.MatchCreate, user_id: int):
    db_match = models.Match(
        activity_id=match.activity_id,
        user_id=user_id,
        status=match.status
    )
    db.add(db_match)
    db.commit()
    db.refresh(db_match)
    return db_match

# --- Booking Operations ---
def create_booking(db: Session, booking: schemas.BookingCreate, user_id: int):
    db_booking = models.Booking(
        user_id=user_id,
        facility_id=booking.facility_id,
        booking_date=booking.booking_date,
        duration=booking.duration,
        status=booking.status
    )
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)
    return db_booking