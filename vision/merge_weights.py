"""
NutriVision AI - Model Checkpoint Merger (Model Soup / SWA)
Menggabungkan bobot neural network dari beberapa checkpoint YOLOv8 segmentation
yang berasal dari lineage training yang sama menjadi satu model tunggal (best_merged.pt).

Teknik ini dikenal sebagai "Model Soup" (Wortsman et al., 2022) / Stochastic Weight Averaging (SWA).
Mengurangi varians, meningkatkan generalisasi pada foto makanan baru, dan tidak menambah beban inferensi.
"""

import os
import sys
import argparse
import hashlib

def get_unique_model_files(directory):
    """
    Temukan semua file .pt di direktori, abaikan duplikat identik (MD5 sama) dan model merged sebelumnya.
    """
    candidates = []
    seen_hashes = {}
    for f in sorted(os.listdir(directory)):
        if f.endswith(".pt") and not f.startswith("temp_") and f != "best_merged.pt":
            p = os.path.join(directory, f)
            size = os.path.getsize(p)
            with open(p, "rb") as fp:
                head = fp.read(1024 * 1024)
            h = hashlib.md5(f"{size}".encode() + head).hexdigest()
            if h in seen_hashes:
                print(f"[Merge] ⏩ Melewati file duplikat: {f} (sama dengan {seen_hashes[h]})")
                continue
            seen_hashes[h] = f
            candidates.append(p)
    return candidates

def merge_checkpoints(model_paths, output_path="best_merged.pt", weights=None):
    """
    Melakukan averaging parameter state_dict dari beberapa checkpoint PyTorch YOLOv8.
    """
    try:
        import torch
    except ImportError:
        print("[Merge] ❌ PyTorch belum terinstall di environment ini. Jalankan di environment dengan PyTorch.")
        return False

    if not model_paths:
        print("[Merge] ❌ Tidak ada model yang ditemukan untuk digabung.")
        return False

    print(f"\n[Merge] 🚀 Memulai penggabungan {len(model_paths)} model checkpoint:")
    for i, p in enumerate(model_paths):
        print(f"  [{i+1}] {os.path.basename(p)} ({os.path.getsize(p) / (1024*1024):.1f} MB)")

    # Hitung bobot per model (default: rata merata / uniform)
    num_models = len(model_paths)
    if weights is None:
        weights = [1.0 / num_models] * num_models
    else:
        total_w = sum(weights)
        weights = [w / total_w for w in weights]

    print(f"[Merge] Bobot per model: {[round(w, 4) for w in weights]}")

    # Muat model dasar sebagai template struktur
    base_path = model_paths[0]
    print(f"[Merge] Memuat template dasar dari: {os.path.basename(base_path)}")
    base_ckpt = torch.load(base_path, map_location="cpu", weights_only=False)

    base_model = base_ckpt.get("ema") or base_ckpt.get("model")
    if base_model is None:
        print(f"[Merge] ❌ Tidak dapat menemukan model/ema di {base_path}")
        return False

    # Ekstrak state_dict float32 untuk presisi averaging
    if hasattr(base_model, "state_dict"):
        merged_state = {k: v.clone().float() * weights[0] for k, v in base_model.state_dict().items()}
    elif isinstance(base_model, dict):
        merged_state = {k: v.clone().float() * weights[0] for k, v in base_model.items()}
    else:
        print(f"[Merge] ❌ Format model tidak didukung: {type(base_model)}")
        return False

    # Akumulasikan bobot dari model-model lainnya
    for idx in range(1, num_models):
        curr_path = model_paths[idx]
        w = weights[idx]
        print(f"[Merge] Mengakumulasikan bobot [{idx+1}/{num_models}]: {os.path.basename(curr_path)} (w={w:.3f})...")
        ckpt = torch.load(curr_path, map_location="cpu", weights_only=False)
        curr_model = ckpt.get("ema") or ckpt.get("model")
        if curr_model is None:
            print(f"[Merge] ⚠️ Model {curr_path} tidak valid, dilewati.")
            continue
        
        curr_state = curr_model.state_dict() if hasattr(curr_model, "state_dict") else curr_model
        for k in merged_state.keys():
            if k in curr_state:
                merged_state[k] += curr_state[k].float() * w
            else:
                print(f"[Merge] ⚠️ Key {k} tidak ditemukan di {curr_path}")

    # Pasang kembali state_dict hasil merger ke base_model
    if hasattr(base_model, "load_state_dict"):
        # Convert parameter kembali ke half atau float asli
        base_model.load_state_dict({k: v.to(dtype=torch.float32) for k, v in merged_state.items()})
        merged_model_obj = base_model
    else:
        merged_model_obj = merged_state

    # Siapkan checkpoint stripped bersih tanpa optimizer cache (agar ukuran file kecil ~6.5MB)
    output_ckpt = {
        "model": merged_model_obj,
        "date": "NutriVision-Model-Soup-Merged",
        "train_args": base_ckpt.get("train_args", {}),
        "names": getattr(merged_model_obj, "names", base_ckpt.get("names", {}))
    }

    # Simpan checkpoint baru
    torch.save(output_ckpt, output_path)
    print(f"\n[Merge] ✅ Berhasil membuat model gabungan: {output_path}")
    print(f"[Merge] Ukuran file hasil gabungan: {os.path.getsize(output_path) / (1024*1024):.2f} MB")
    
    # Coba verifikasi dengan Ultralytics jika tersedia
    try:
        from ultralytics import YOLO
        test_yolo = YOLO(output_path)
        print(f"[Merge] ✅ Verifikasi Ultralytics YOLO sukses! Total kelas terdaftar: {len(test_yolo.names)}")
    except Exception as e:
        print(f"[Merge] ℹ️ Verifikasi Ultralytics: {e}")

    return True

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Merge multiple YOLOv8 checkpoints into a single unified model.")
    parser.add_argument("--dir", default=os.path.dirname(__file__) or ".", help="Direktori yang berisi file .pt")
    parser.add_argument("--output", default=None, help="Nama file hasil merge (default: best_merged.pt)")
    parser.add_argument("--models", nargs="*", default=None, help="Daftar spesifik file model yang ingin digabung")
    args = parser.parse_args()

    target_dir = args.dir
    output_file = args.output or os.path.join(target_dir, "best_merged.pt")

    if args.models:
        model_files = [os.path.join(target_dir, m) if not os.path.isabs(m) else m for m in args.models]
    else:
        model_files = get_unique_model_files(target_dir)

    if len(model_files) < 2:
        print(f"[Merge] Ditemukan kurang dari 2 model unik ({len(model_files)} ditemukan). Tidak ada yang perlu digabung.")
        sys.exit(0)

    success = merge_checkpoints(model_files, output_file)
    sys.exit(0 if success else 1)
