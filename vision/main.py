from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from ultralytics import YOLO
# pyrefly: ignore [missing-import]
import numpy as np
from PIL import Image
import io

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
try:
    # Letakkan file best.pt Anda di folder vision/ ini
    model = YOLO("best.pt")
except Exception as e:
    print(f"Warning: Failed to load best.pt. Make sure the file exists. Error: {e}")
    model = None

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
        # Menurunkan confidence ke 0.05 agar lebih sensitif mendeteksi makanan yang tertutup teks
        results = model.predict(source=image, save=False, retina_masks=True, conf=0.05)
        
        predictions = []
        for result in results:
            print(f"DEBUG: Detected {len(result.boxes)} objects.")
            if result.masks is not None:
                class_names = result.names
                boxes = result.boxes
                masks = result.masks.data.cpu().numpy() # Format: (N, H, W)
                
                # Extract normalized polygon coordinates (0.0 - 1.0) for frontend rendering
                # Ultralytics provides masks.xyn as a list of numpy arrays
                polygons = result.masks.xyn if hasattr(result.masks, 'xyn') else []
                
                print(f"DEBUG: Masks shape: {masks.shape}")
                
                for i, mask in enumerate(masks):
                    class_id = int(boxes[i].cls.item())
                    confidence = float(boxes[i].conf.item())
                    food_name = class_names[class_id]
                    
                    # Hitung total piksel di mana mask bernilai 1 (objek makanan)
                    total_pixels = int(np.sum(mask > 0.5))
                    
                    # Ambil polygon mask untuk objek ini (jika ada)
                    # Kita batasi jumlah titik (misal skip setiap 3 titik) agar payload JSON tidak terlalu raksasa
                    poly_points = []
                    if i < len(polygons):
                        raw_poly = polygons[i]
                        if len(raw_poly) > 0:
                            # Subsample point untuk optimasi transfer jaringan (1 dari 3 titik)
                            step = max(1, len(raw_poly) // 60) # Maksimal ~60 titik per objek untuk UI mulus
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
    # Jalankan server FastAPI di port 8000
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
