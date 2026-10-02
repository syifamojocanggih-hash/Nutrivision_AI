from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import numpy as np
from PIL import Image
import io
import os
import hashlib
import traceback

app = FastAPI(title="NutriVision Multi-Model YOLO Segmentation API")

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------------------------------------
# Model Discovery & Loading System
# -------------------------------------------------------------
loaded_models = []
merged_model = None
primary_model = None

def get_file_hash(filepath: str) -> str:
    """Hash cepat (ukuran + 1MB awal) untuk mendeteksi file duplikat."""
    try:
        size = os.path.getsize(filepath)
        with open(filepath, "rb") as f:
            head = f.read(1024 * 1024)
        return hashlib.md5(f"{size}".encode() + head).hexdigest()
    except Exception:
        return ""

def compute_iou(box1, box2):
    """Menghitung Intersection over Union (IoU) antara dua bounding box [x1, y1, x2, y2]."""
    x1 = max(box1[0], box2[0])
    y1 = max(box1[1], box2[1])
    x2 = min(box1[2], box2[2])
    y2 = min(box1[3], box2[3])
    
    inter_w = max(0.0, x2 - x1)
    inter_h = max(0.0, y2 - y1)
    inter_area = inter_w * inter_h
    
    area1 = max(0.0, box1[2] - box1[0]) * max(0.0, box1[3] - box1[1])
    area2 = max(0.0, box2[2] - box2[0]) * max(0.0, box2[3] - box2[1])
    union_area = area1 + area2 - inter_area
    
    return (inter_area / union_area) if union_area > 0 else 0.0

try:
    from ultralytics import YOLO

    model_dir = os.path.dirname(__file__)
    print(f"[Vision] Scanning for model checkpoints in: {model_dir}")

    # 1. Cek apakah best_merged.pt sudah ada, jika belum coba buat secara otomatis
    merged_path = os.path.join(model_dir, "best_merged.pt")
    if not os.path.exists(merged_path):
        try:
            from merge_weights import get_unique_model_files, merge_checkpoints
            candidate_files = get_unique_model_files(model_dir)
            if len(candidate_files) >= 2:
                print(f"[Vision] 🍲 Auto-merging {len(candidate_files)} checkpoints to create best_merged.pt...")
                merge_checkpoints(candidate_files, merged_path)
        except Exception as merge_err:
            print(f"[Vision] ℹ️ Auto-merge skipped or failed: {merge_err}")

    if os.path.exists(merged_path):
        try:
            merged_model = YOLO(merged_path)
            print(f"[Vision] ✅ Loaded unified Model Soup: {merged_path}")
        except Exception as e:
            print(f"[Vision] ⚠️ Could not load merged model: {e}")

    # 2. Temukan semua model unik (.pt) untuk Ensemble Engine
    seen_hashes = {}
    unique_candidates = []
    
    # Urutkan agar best.pt dan best_p10 diprioritaskan
    priority_order = ["best.pt", "best_p10.pt", "best_p9.pt", "best_p7.pt", "best_p6.pt"]
    all_pt_files = sorted([f for f in os.listdir(model_dir) if f.endswith(".pt") and f != "best_merged.pt"])
    
    # Sort files according to priority
    sorted_pt_files = sorted(all_pt_files, key=lambda x: priority_order.index(x) if x in priority_order else 99)

    for fname in sorted_pt_files:
        fpath = os.path.join(model_dir, fname)
        h = get_file_hash(fpath)
        if h in seen_hashes:
            print(f"[Vision] ⏩ Skipping duplicate model: {fname} (same as {seen_hashes[h]})")
            continue
        seen_hashes[h] = fname
        unique_candidates.append((fname, fpath))

    # Batasi ensemble maksimal 4 model terbaik untuk hemat RAM di cloud hosting
    max_ensemble = int(os.environ.get("MAX_ENSEMBLE_MODELS", 4))
    ensemble_selection = unique_candidates[:max_ensemble]

    print(f"[Vision] Loading {len(ensemble_selection)} unique checkpoints for Ensemble...")
    for fname, fpath in ensemble_selection:
        try:
            m = YOLO(fpath)
            loaded_models.append((fname, m))
            print(f"[Vision] ✅ Loaded ensemble model: {fname}")
        except Exception as e:
            print(f"[Vision] ⚠️ Failed loading {fname}: {e}")

    # Set primary baseline model
    if merged_model:
        primary_model = merged_model
    elif loaded_models:
        primary_model = loaded_models[0][1]
        
    print(f"[Vision] ✅ Initialization complete. Total ensemble models: {len(loaded_models)}")

except Exception as e:
    print(f"[Vision] ❌ ERROR during model initialization: {e}")
    print(traceback.format_exc())

# -------------------------------------------------------------
# Endpoints
# -------------------------------------------------------------
@app.get("/health")
async def health():
    return {
        "status": "ok",
        "model_loaded": (len(loaded_models) > 0 or merged_model is not None),
        "total_models": len(loaded_models),
        "loaded_models": [name for name, _ in loaded_models],
        "merged_model_available": merged_model is not None,
        "default_mode": "ensemble" if len(loaded_models) > 1 else "single",
        "service": "NutriVision Vision AI"
    }

@app.get("/models")
async def list_models():
    return {
        "ensemble_models": [{"name": name} for name, _ in loaded_models],
        "merged_model_available": merged_model is not None,
        "total": len(loaded_models)
    }

@app.post("/predict-pixels")
async def predict_pixels(
    file: UploadFile = File(...), 
    conf: float = 0.20,
    mode: str = Query(default="auto", description="Pilihan mode: 'auto', 'ensemble', 'merged', atau 'single'")
):
    """
    Endpoint untuk mendeteksi makanan dan menghitung total piksel area mask.
    Mendukung Ensemble Fusion dari beberapa model YOLO untuk akurasi maksimal.
    """
    if len(loaded_models) == 0 and merged_model is None:
        raise HTTPException(status_code=500, detail="Model YOLO belum dimuat (file checkpoint tidak ditemukan).")
        
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Tentukan mode eksekusi
        active_mode = mode
        if active_mode == "auto":
            # Jika tersedia multiple models, gunakan ensemble; jika merged_model tersedia dan hanya 1 model, gunakan merged
            active_mode = "ensemble" if len(loaded_models) > 1 else ("merged" if merged_model else "single")

        # ---------------------------------------------------------
        # Jalur 1: Single Model atau Merged Model
        # ---------------------------------------------------------
        if active_mode in ("single", "merged") or len(loaded_models) <= 1:
            target_model = merged_model if (active_mode == "merged" and merged_model) else primary_model
            results = target_model.predict(source=image, save=False, retina_masks=True, conf=conf)
            
            predictions = []
            for result in results:
                if result.masks is not None:
                    class_names = result.names
                    boxes = result.boxes
                    masks = result.masks.data.cpu().numpy()
                    polygons = result.masks.xyn if hasattr(result.masks, 'xyn') else []
                    
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
                        
                        predictions.append({
                            "food_name": food_name,
                            "confidence": round(confidence, 3),
                            "total_pixels": total_pixels,
                            "polygon_xyn": poly_points
                        })
            return JSONResponse(content=predictions)

        # ---------------------------------------------------------
        # Jalur 2: Multi-Model Ensemble Fusion
        # ---------------------------------------------------------
        all_candidates = []
        for model_name, m in loaded_models:
            results = m.predict(source=image, save=False, retina_masks=True, conf=conf)
            for result in results:
                if result.masks is not None:
                    class_names = result.names
                    boxes = result.boxes
                    masks = result.masks.data.cpu().numpy()
                    polygons = result.masks.xyn if hasattr(result.masks, 'xyn') else []
                    xyxy_boxes = boxes.xyxy.cpu().numpy() if hasattr(boxes, 'xyxy') else []
                    
                    for i, mask in enumerate(masks):
                        class_id = int(boxes[i].cls.item())
                        confidence = float(boxes[i].conf.item())
                        food_name = class_names[class_id]
                        total_pixels = int(np.sum(mask > 0.5))
                        box = xyxy_boxes[i].tolist() if i < len(xyxy_boxes) else [0, 0, 0, 0]
                        
                        poly_points = []
                        if i < len(polygons):
                            raw_poly = polygons[i]
                            if len(raw_poly) > 0:
                                step = max(1, len(raw_poly) // 60)
                                sub_poly = raw_poly[::step]
                                poly_points = sub_poly.tolist()
                        
                        all_candidates.append({
                            "food_name": food_name,
                            "confidence": confidence,
                            "total_pixels": total_pixels,
                            "polygon_xyn": poly_points,
                            "box": box,
                            "model_name": model_name
                        })

        # Urutkan kandidat berdasarkan confidence tertinggi
        all_candidates.sort(key=lambda x: x["confidence"], reverse=True)

        # Fuse kandidat menggunakan Spatial IoU Matching & Consensus
        fused = []
        iou_thresh = 0.40

        for cand in all_candidates:
            matched = False
            for target in fused:
                iou = compute_iou(cand["box"], target["box"])
                if iou >= iou_thresh:
                    matched = True
                    # Jika nama makanan sama -> konsensus model tercapai
                    if cand["food_name"] == target["food_name"]:
                        target["votes"] += 1
                        target["models"].append(cand["model_name"])
                        # Berikan boost confidence karena disetujui lebih dari satu model
                        target["confidence"] = min(0.99, round(max(target["confidence"], cand["confidence"]) + 0.03, 3))
                        # Jika kandidat memiliki mask yang lebih jelas/besar, perbarui polygon & pixel
                        if cand["confidence"] > target["best_conf"]:
                            target["total_pixels"] = cand["total_pixels"]
                            target["polygon_xyn"] = cand["polygon_xyn"]
                            target["best_conf"] = cand["confidence"]
                            target["box"] = cand["box"]
                    # Jika nama makanan beda -> konflik klasifikasi pada area yang sama
                    # Karena daftar sudah disortir confidence desc, target (confidence lebih tinggi) dipertahankan
                    break

            if not matched:
                cand_entry = {
                    "food_name": cand["food_name"],
                    "confidence": round(cand["confidence"], 3),
                    "total_pixels": cand["total_pixels"],
                    "polygon_xyn": cand["polygon_xyn"],
                    "box": cand["box"],
                    "votes": 1,
                    "models": [cand["model_name"]],
                    "best_conf": cand["confidence"]
                }
                fused.append(cand_entry)

        # Format output akhir sesuai standar frontend
        final_predictions = []
        for item in fused:
            print(f"[Vision Ensemble] {item['food_name']} (conf: {item['confidence']}, votes: {item['votes']}, models: {item['models']})")
            final_predictions.append({
                "food_name": item["food_name"],
                "confidence": item["confidence"],
                "total_pixels": item["total_pixels"],
                "polygon_xyn": item["polygon_xyn"]
            })

        return JSONResponse(content=final_predictions)
        
    except Exception as e:
        print(f"[Vision] ❌ Exception in predict_pixels: {str(e)}")
        print(traceback.format_exc())
        raise HTTPException(status_code=500, detail=f"Terjadi kesalahan saat inferensi: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=False)
