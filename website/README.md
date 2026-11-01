# PestiScan AI — ML-integrated local demo

This project connects the React website to the trained MobileNetV2 Keras model. Uploaded images are sent to a local FastAPI backend, which returns the predicted class and the model's class probabilities.

## Requirements

- Windows 10/11
- Python 3.10–3.12 (64-bit; Python 3.11 is a good choice)
- Node.js LTS
- Internet connection for the first-time package installation

## Run the ML backend

Open a VS Code terminal in this project folder and run:

```powershell
py -3.11 -m venv .venv
.venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
cd backend
python -m uvicorn main:app --reload --port 8000
```

Keep this terminal running. The first installation is large because TensorFlow is included.

Check the backend by opening http://127.0.0.1:8000/api/health. It should return `"model_loaded": true` and the three class labels.

## Run the website

Open a **second** VS Code terminal in the project root (the folder containing `package.json`) and run:

```powershell
npm install
npm run dev
```

Open the local URL Vite prints, usually http://localhost:5173.

## Try a prediction

1. Select **Image screening**.
2. Upload a JPG, PNG, or WEBP image under 10 MB.
3. Click **Run visual screening**.
4. The page displays the model's top predicted class and confidence. The combined results page shows the probabilities for all classes.
5. Export CSV if you want to save the prediction.

## Notes

- The backend loads `backend/models/pestiscan_model.keras` and `backend/models/class_names.json`.
- Keep the backend terminal running while using the website. If the website cannot connect, check that `http://127.0.0.1:8000/api/health` opens successfully.
- This package is configured for local demonstration. The frontend and backend need separate hosting/configuration for public deployment.
- The model outputs the classes it was trained on. Its confidence score is not a direct measurement of pesticide concentration; performance and the dataset's label meaning should be validated before making scientific claims.
