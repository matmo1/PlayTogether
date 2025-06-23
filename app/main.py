from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List
from datetime import timedelta, datetime
from jose import jwt, JWTError
import os
from passlib.context import CryptContext

from app import models, schemas, crud
from app.database import engine, get_db

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security Config
SECRET_KEY = os.getenv("JWT_SECRET", "CHANGE_THIS_SECRET")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Auth Utilities
def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db: Session, email: str, password: str):
    user = crud.get_user_by_email(db, email=email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user_id(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
        return int(user_id)
    except JWTError:
        raise credentials_exception

# User Endpoints
@app.post("/users/", response_model=schemas.User, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    return crud.create_user(db=db, user=user)

@app.get("/users/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.get("/users/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

# Sport Endpoints
@app.post("/sports/", response_model=schemas.Sport, status_code=status.HTTP_201_CREATED)
def create_sport(sport: schemas.SportCreate, db: Session = Depends(get_db)):
    return crud.create_sport(db=db, sport=sport)

@app.get("/sports/", response_model=List[schemas.Sport])
def read_sports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sports = crud.get_sports(db, skip=skip, limit=limit)
    return sports

# Facility Endpoints
@app.post("/facilities/", response_model=schemas.Facility, status_code=status.HTTP_201_CREATED)
def create_facility(facility: schemas.FacilityCreate, db: Session = Depends(get_db)):
    return crud.create_facility(db=db, facility=facility)

@app.get("/facilities/", response_model=List[schemas.Facility])
def read_facilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    facilities = crud.get_facilities(db, skip=skip, limit=limit)
    return facilities

# Activity Endpoints
@app.post("/users/{user_id}/activities/", response_model=schemas.Activity)
def create_activity_for_user(
    user_id: int, 
    activity: schemas.ActivityCreate, 
    db: Session = Depends(get_db)
):
    return crud.create_activity(db=db, activity=activity, user_id=user_id)

@app.get("/activities/", response_model=List[schemas.Activity])
def read_activities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    activities = crud.get_activities(db, skip=skip, limit=limit)
    return activities

# Match Endpoints
@app.post("/matches/", response_model=schemas.Match)
def create_match(
    match: schemas.MatchCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # Verify activity exists
    activity = crud.get_activity(db, activity_id=match.activity_id)
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    
    # Prevent self-matching
    if activity.user_id == user_id:
        raise HTTPException(status_code=400, detail="Cannot match with your own activity")
    
    # Check for existing match
    existing_match = db.query(models.Match).filter(
        models.Match.activity_id == match.activity_id,
        models.Match.user_id == user_id
    ).first()
    if existing_match:
        raise HTTPException(status_code=400, detail="Match already exists")
    
    return crud.create_match(db=db, match=match, user_id=user_id)

@app.get("/matches/", response_model=List[schemas.Match])
def read_matches(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    return db.query(models.Match).filter(
        models.Match.user_id == user_id
    ).offset(skip).limit(limit).all()

# Booking Endpoints
@app.post("/users/{user_id}/bookings/", response_model=schemas.Booking)
def create_booking_for_user(
    user_id: int, 
    booking: schemas.BookingCreate, 
    db: Session = Depends(get_db)
):
    return crud.create_booking(db=db, booking=booking, user_id=user_id)

@app.get("/bookings/", response_model=List[schemas.Booking])
def read_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    bookings = crud.get_bookings(db, skip=skip, limit=limit)
    return bookings

# Auth Endpoint
@app.post("/token", response_model=schemas.Token)
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(
        data={"sub": str(user.user_id)},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}