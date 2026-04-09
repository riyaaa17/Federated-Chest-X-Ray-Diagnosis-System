import os
from dotenv import load_dotenv
from passlib.context import CryptContext
from jose import jwt, JWTError
from datetime import datetime, timedelta, UTC

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")

# create a password hasing engine which uses bcrypt
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# hash password
def hash_password(password: str):
    return pwd_context.hash(password)

# Verify password
def verify_password(plain, hashed):
    return pwd_context.verify(plain, hashed)

# Create token which expires after 24 hours
def create_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(UTC).replace(tzinfo=None) + timedelta(hours=24)
    to_encode.update({"exp":expire})
    
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Verify token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except JWTError:
        return None