from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import io
import os
import traceback

app = FastAPI(title="NutriVision YOLO Segmentation API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load Model
model = None
try:
    # pyrefly: ignore [missing-import]
    from ultralytics import YOLO
    import traceback
    model_path = os.path.join(os.path.dirname(__file__), "best.pt")
    print(f"[Vision] Looking for best.pt at: {model_path}")
    print(f"[Vision] File exists: {os.path.exists(model_path)}")
    if os.path.exists(model_path):
        print(f"[Vision] File size: {os.path.getsize(model_path)} bytes")
        model = YOLO(model_path)
        print(f"[Vision] ✅ Model YOLO loaded successfully: {model_path}")
    else:
        print(f"[Vision] ❌ ERROR: best.pt not found at {model_path}")
        print(f"[Vision] Files in dir: {os.listdir(os.path.dirname(__file__))}")
except Exception as e:
    print(f"[Vision] ❌ ERROR: Failed to load YOLO model: {e}")
    print(traceback.format_exc())
    model = None

@app.get("/health")
async def health():
    return {"status": "ok", "model_loaded": model is not None, "service": "NutriVision Vision AI"}

@app.post("/predict-pixels")
async def predict_pixels(file: UploadFile = File(...)):
    """
    Endpoint untuk mendeteksi makanan dan menghitung total piksel area mask.
    """
    if model is None:
        raise HTTPException(status_code=500, detail="Model YOLO belum dimuat (file best.pt tidak ditemukan).")
        
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Jalankan inferensi dengan retina_masks untuk ukuran mask asli
        results = model.predict(source=image, save=False, retina_masks=True, conf=0.05)
        
        predictions = []
        for result in results:
            print(f"DEBUG: Detected {len(result.boxes)} objects.")
            if result.masks is not None:
                class_names = result.names
                boxes = result.boxes
                masks = result.masks.data.cpu().numpy()
                polygons = result.masks.xyn if hasattr(result.masks, 'xyn') else []
                
                print(f"DEBUG: Masks shape: {masks.shape}")
                
                for i, mask in enumerate(masks):
                    class_id = int(boxes[i].cls.item())
                    confidence = float(boxes[i].conf.item())
                    food_name = class_names[class_id]
                    total_pixels = int(np.sum(mask > 0.5))
                    
                    poly_points = []
                    if i < len(polygons):
                        raw_poly = polygons[i]
                        if len(raw_poly) > 0:
                            step = max(1, len(raw_poly) // 60)
                            sub_poly = raw_poly[::step]
                            poly_points = sub_poly.tolist()
                    
                    print(f"DEBUG: Found {food_name} (conf: {confidence:.2f}) with {total_pixels} pixels and {len(poly_points)} polygon points.")
                    
                    predictions.append({
                        "food_name": food_name,
                        "confidence": confidence,
                        "total_pixels": total_pixels,
                        "polygon_xyn": poly_points
                    })
            else:
                print("DEBUG: No masks found in result.")
        
        return JSONResponse(content=predictions)
        
    except Exception as e:
        print(f"DEBUG: Exception in predict_pixels: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat inferensi: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    # reload=False untuk production (Railway)
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)

