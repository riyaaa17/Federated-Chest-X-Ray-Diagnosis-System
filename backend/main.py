from fastapi import FastAPI, UploadFile, File, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from utils.gradcam import generate_gradcam
from utils.rag import ask_question
from utils.auth import hash_password, verify_password, create_token, verify_token
from utils.db import users_collection
from pydantic import BaseModel
import tensorflow as tf
import numpy as np
import cv2
import base64
import os
os.environ["KERAS_BACKEND"] = "tensorflow"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = tf.keras.models.load_model("model/federated_model.keras")
class_names = ["No Finding", "Effusion", "Atelectasis", "Cardiomegaly", "Pneumothorax"]


class ChatRequest(BaseModel):
    question: str
    

class User(BaseModel):
    email:str
    password: str


# Header() lets fastapi read headers
def get_current_user(authorization: str = Header(None)): 
    if not authorization:
        raise HTTPException(status_code=401, detail="Token missing")
    
    token = authorization.split(" ")[1] # Extract token from Bearer <token>"
    payload = verify_token(token)
    
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    return payload


@app.get("/")
def home():
    return {"message": "Medical AI Backend Running"}

# Depends in fastapi runs the specified function before endpoint (here get_current_user)
@app.post("/predict")
async def predict(file: UploadFile = File(...), user=Depends(get_current_user)):
    # Read image
    contents = await file.read()
    
    # Convert img bytes to numpy array
    np_array = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_array, cv2.IMREAD_COLOR)
    original_img = img.copy()
    
    # Preprocess img
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = cv2.resize(img, (224, 224))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)
    
    # Run Predictions
    predictions = model.predict(img)
    pred_index = np.argmax(predictions[0])
    predicted_label = class_names[pred_index]
    confidence = float(predictions[0][pred_index])
    
    if confidence > 0.7:
        band = "High Likelihood"
    elif confidence < 0.7 and confidence > 0.25:
        band = "Moderate"
    else:
        band = "Low"
    
    # Get Gradcam heatmap
    heatmap_bytes, _ = generate_gradcam(original_img, model, "conv5_block16_concat")
    heatmap_base64 = base64.b64encode(heatmap_bytes).decode("utf-8") # convert image bytes to base64 format
    
    # return result
    return {
        "prediction": {
            "label": predicted_label,
            "confidence": confidence,
            "band": band,
        },
        "gradcam":heatmap_base64
    }
    
@app.post("/chat")
def chat(request: ChatRequest, user=Depends(get_current_user)):
    answer = ask_question(request.question)
    
    return{
        "question": request.question,
        "answer": answer
    }


@app.post("/signup")
def signup(user: User):
    existing_user = users_collection.find_one({"email": user.email})
    
    if existing_user:
        return {"error": "User already exists"}
    
    hashed_pw = hash_password(user.password)
    
    users_collection.insert_one({
        "email": user.email,
        "password": hashed_pw
    })
    
    return {"message": "User created"}

@app.post("/login")
def login(user: User):
    db_user = users_collection.find_one({"email":user.email})
    
    if not db_user:
        return {"error": "User not found"}
    
    if not verify_password(user.password, db_user["password"]):
        return {"error": "Invalid password"}
    
    token = create_token({"sub": user.email})
    
    return {"access_token": token}

# Add this endpoint so AuthContext can verify tokens on page refresh
@app.get("/auth/me")
def get_me(user = Depends(get_current_user)):
    return {"email": user["sub"]}