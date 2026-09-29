from datetime import timedelta
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.profiles import Profile
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.deps import get_current_user, require_admin
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED)
def register(user_in: UserRegister, db: Session = Depends(get_db)):
    """Register a new user profile with role."""
    normalized_email = user_in.email.strip().lower()
    existing = db.query(Profile).filter(Profile.email == normalized_email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A user with this email address already exists."
        )
    
    role = user_in.role.strip().upper()
    if role not in ["ADMIN", "MARKET_MANAGER", "COLLECTOR"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be 'ADMIN', 'MARKET_MANAGER', or 'COLLECTOR'."
        )

    user = Profile(
        name=user_in.name.strip(),
        email=normalized_email,
        phone=user_in.phone.strip() if user_in.phone else None,
        role=role,
        hashed_password=get_password_hash(user_in.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    """Authenticate user with email and password."""
    normalized_email = login_data.email.strip().lower()
    user = db.query(Profile).filter(Profile.email == normalized_email).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.post("/login/oauth2", response_model=Token, include_in_schema=False)
def login_oauth2(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """OAuth2 compatible login endpoint for Swagger UI."""
    normalized_email = form_data.username.strip().lower()
    user = db.query(Profile).filter(Profile.email == normalized_email).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(subject=user.id, role=user.role)
    return Token(
        access_token=token,
        token_type="bearer",
        user=UserResponse.model_validate(user)
    )

@router.get("/me", response_model=UserResponse)
def get_me(current_user: Profile = Depends(get_current_user)):
    """Get profile of current authenticated user."""
    return UserResponse.model_validate(current_user)

@router.get("/users", response_model=List[UserResponse])
def list_users(
    skip: int = 0,
    limit: int = 100,
    role: str = None,
    current_user: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin: List all registered users."""
    query = db.query(Profile)
    if role:
        query = query.filter(Profile.role == role.strip().upper())
    users = query.offset(skip).limit(limit).all()
    return [UserResponse.model_validate(u) for u in users]

@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: str,
    new_role: str,
    current_user: Profile = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin: Update user role."""
    role = new_role.strip().upper()
    if role not in ["ADMIN", "MARKET_MANAGER", "COLLECTOR"]:
        raise HTTPException(status_code=400, detail="Invalid role specified.")
    
    user = db.query(Profile).filter(Profile.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")
    
    user.role = role
    db.commit()
    db.refresh(user)
    return UserResponse.model_validate(user)
