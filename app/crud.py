from http.client import HTTPException

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

def create_user(db: Session, user: schemas.UserCreate, creator_role: str = "user"):
    # само ако създателят е admin допускаме експлицитна роля
    new_role = user.role if creator_role == "admin" else models.UserRole.user
    db_user = models.User(
        username=user.username,
        email=user.email,
        password_hash=pwd_context.hash(user.password),
        role=new_role,
        full_name=user.full_name,
        gender=user.gender,
        birth_date=user.birth_date,
    )
    db.add(db_user); db.commit(); db.refresh(db_user)
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

def update_facility(db, facility_id: int, data: schemas.FacilityUpdate):
    fac = db.query(models.Facility).filter(models.Facility.facility_id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(fac, k, v)
    db.commit()
    db.refresh(fac)
    return fac

def delete_facility(db, facility_id: int):
    fac = db.query(models.Facility).filter(models.Facility.facility_id == facility_id).first()
    if not fac:
        raise HTTPException(status_code=404, detail="Facility not found")
    db.delete(fac)
    db.commit()

# --- Activity Operations ---
def get_activity(db: Session, activity_id: int):
    return db.query(models.Activity).filter(models.Activity.activity_id == activity_id).first()

def get_activities(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Activity).offset(skip).limit(limit).all()

def create_activity(db: Session, activity: schemas.ActivityCreate, creator_id: int):
    # 1) валидирай спорта
    sport = get_sport(db, activity.sport_id)
    if not sport:
        raise HTTPException(status_code=404, detail="Sport not found")

    # 2) създай самата Activity
    db_activity = models.Activity(
        user_id=creator_id,
        sport_id=activity.sport_id,
        description=activity.description,
        activity_date=activity.activity_date,
        location=activity.location,
    )
    db.add(db_activity)
    db.flush()  # имаме activity_id

    # 3) ако има участници -> създай Match записи
    if activity.participant_usernames:
        for uname in activity.participant_usernames:
            user = get_user_by_username(db, uname)
            if user:
                db.add(
                    models.Match(
                        activity_id=db_activity.activity_id,
                        user_id=user.user_id,
                        status=models.MatchStatus.pending,
                    )
                )

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
    db_booking.status = db_booking.status.value
    return db_booking


def get_bookings(db: Session, skip=0, limit=100):
    bookings = db.query(models.Booking).offset(skip).limit(limit).all()
    for b in bookings:
        b.status = b.status.value      # ← превръщаме Enum → str
    return bookings



def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def get_activities_for_user(db: Session, user_id: int):
    # събития, които сам е създал
    created = db.query(models.Activity).filter(models.Activity.user_id == user_id)

    # + събития, в които е поканен
    invited = (
        db.query(models.Activity)
        .join(models.Match, models.Activity.activity_id == models.Match.activity_id)
        .filter(models.Match.user_id == user_id)
    )

    return created.union(invited).all()
