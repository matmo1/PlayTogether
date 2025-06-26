from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from typing import Optional
from datetime import timedelta, datetime
from jose import jwt
import os
from passlib.context import CryptContext
from app import models, schemas, crud
from app.database import engine, get_db
from fastapi import Security
from fastapi.security import OAuth2PasswordBearer
from typing import Optional
from app.routes import admin
from app.routes import admin

from app.deps import get_current_user, admin_required, create_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")
models.Base.metadata.create_all(bind=engine)

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # или ["*"] докато разработваш
    allow_credentials=True,
    allow_methods=["*"],                      # GET, POST, PUT, DELETE, OPTIONS…
    allow_headers=["*"],                      # Content-Type, Authorization…
)



pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

app.include_router(admin.router)

@app.post("/activities/", response_model=schemas.Activity)
def create_activity(
    activity: schemas.ActivityCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.create_activity(db, activity, creator_id=current_user.user_id)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def authenticate_user(db, email: str, password: str):
    user = crud.get_user_by_email(db, email=email)
    if not user or not verify_password(password, user.password_hash):
        return None
    return user

from typing import Optional

# --- User Endpoints ---
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

# --- Sport Endpoints ---
@app.post("/sports/", response_model=schemas.Sport, status_code=status.HTTP_201_CREATED)
def create_sport(sport: schemas.SportCreate, db: Session = Depends(get_db)):
    return crud.create_sport(db=db, sport=sport)

@app.get("/sports/", response_model=List[schemas.Sport])
def read_sports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    sports = crud.get_sports(db, skip=skip, limit=limit)
    return sports

# --- Facility Endpoints ---
@app.post("/facilities/", response_model=schemas.Facility, status_code=status.HTTP_201_CREATED)
def create_facility(facility: schemas.FacilityCreate, db: Session = Depends(get_db)):
    return crud.create_facility(db=db, facility=facility)

@app.get("/facilities/", response_model=List[schemas.Facility])
def read_facilities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    facilities = crud.get_facilities(db, skip=skip, limit=limit)
    return facilities

@app.put("/facilities/{facility_id}", response_model=schemas.Facility)
def edit_facility(
    facility_id: int,
    data: schemas.FacilityUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # пример: само admin роля
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    return crud.update_facility(db, facility_id, data)

@app.delete("/facilities/{facility_id}", status_code=204)
def remove_facility(
    facility_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not allowed")
    crud.delete_facility(db, facility_id)


# --- Activity Endpoints ---
@app.post("/users/{user_id}/activities/", response_model=schemas.Activity)
def create_activity_for_user(
    user_id: int, activity: schemas.ActivityCreate, db: Session = Depends(get_db)
):
    return crud.create_activity(db=db, activity=activity, user_id=user_id)

@app.get("/activities/", response_model=List[schemas.Activity])
def read_activities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    activities = crud.get_activities(db, skip=skip, limit=limit)
    return activities

# --- Match Endpoints ---
@app.post("/matches/", response_model=schemas.Match)
def create_match(match: schemas.MatchCreate, db: Session = Depends(get_db)):
    return crud.create_match(db=db, match=match)

# --- Booking Endpoints ---
@app.post("/users/{user_id}/bookings/", response_model=schemas.Booking)
def create_booking_for_user(
    user_id: int, booking: schemas.BookingCreate, db: Session = Depends(get_db)
):
    return crud.create_booking(db=db, booking=booking, user_id=user_id)

@app.get("/bookings/", response_model=List[schemas.Booking])
def read_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    bookings = crud.get_bookings(db, skip=skip, limit=limit)
    return bookings

# --- Auth Token Endpoint ---
@app.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # 👉 добавяме role и username в payload-а
    access_token = create_access_token(
        {"sub": str(user.user_id), "username": user.username, "role": user.role}
    )
    return {"access_token": access_token, "token_type": "bearer"}


@app.get("/activities/my", response_model=List[schemas.Activity])
def read_my_activities(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return crud.get_activities_for_user(db, current_user.user_id)

@app.get("/admin/users", dependencies=[Depends(admin_required)])
def list_users(db: Session = Depends(get_db)):
    return db.query(models.User).all()
