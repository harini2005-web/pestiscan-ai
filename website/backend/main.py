from pathlib import Path
import io
import json

import numpy as np
import tensorflow as tf
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, UnidentifiedImageError

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models"
MODEL_PATH = MODEL_DIR / "pestiscan_model.keras"
CLASS_PATH = MODEL_DIR / "class_names.json"
IMAGE_SIZE = (224, 224)
MAX_FILE_SIZE = 10 * 1024 * 1024
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp"}

with CLASS_PATH.open("r", encoding="utf-8") as f:
    CLASS_NAMES = json.load(f)

# The saved Keras model already includes MobileNetV2 preprocessing.
MODEL = tf.keras.models.load_model(MODEL_PATH, compile=False)

app = FastAPI(title="PestiScan AI Model API", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "model_loaded": True, "classes": CLASS_NAMES}


@app.post("/api/predict")
async def predict(file: UploadFile = File(...)):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=415, detail="Please upload a JPG, PNG, or WEBP image.")

    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="The uploaded image is empty.")
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Image is too large. Please use an image under 10 MB.")

    try:
        with Image.open(io.BytesIO(contents)) as image:
            image = image.convert("RGB").resize(IMAGE_SIZE)
            array = np.asarray(image, dtype=np.float32)
    except (UnidentifiedImageError, OSError, ValueError):
        raise HTTPException(status_code=400, detail="The uploaded file could not be read as an image.")

    batch = np.expand_dims(array, axis=0)
    try:
        scores = MODEL.predict(batch, verbose=0)[0]
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Model prediction failed: {type(exc).__name__}")

    if len(scores) != len(CLASS_NAMES):
        raise HTTPException(status_code=500, detail="The model output does not match the saved class labels.")

    order = np.argsort(scores)[::-1]
    probabilities = [
        {"class_label": CLASS_NAMES[int(i)], "confidence": round(float(scores[i]) * 100, 2)}
        for i in order
    ]
    best_index = int(order[0])
    return {
        "class_label": CLASS_NAMES[best_index],
        "confidence": round(float(scores[best_index]) * 100, 2),
        "probabilities": probabilities,
        "filename": file.filename,
    }
