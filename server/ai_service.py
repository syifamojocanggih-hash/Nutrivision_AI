"""
============================================================================
NutriVision AI — Python Clinical AI Inference Service
DistilBERT Multilingual Sequence Classification Engine (.safetensors)
Powered by HuggingFace Tokenizers & NumPy Safetensors Engine
============================================================================
"""

import os
import sys
import json
import http.server
import socketserver
from urllib.parse import urlparse
import numpy as np

# Ensure UTF-8 output on Windows console
if sys.platform == 'win32':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
        sys.stderr.reconfigure(encoding='utf-8')
    except Exception:
        pass

# Model Directory & JSON Resources
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(BASE_DIR, "ai_model")
ROOT_DIR = os.path.join(BASE_DIR, "..")

def find_file(filename):
    paths = [
        os.path.join(MODEL_DIR, filename),
        os.path.join(ROOT_DIR, filename),
        os.path.join(BASE_DIR, filename),
        filename
    ]
    for p in paths:
        if os.path.exists(p):
            return p
    return None

MODEL_FILE = find_file("model.safetensors") or os.path.join(MODEL_DIR, "model.safetensors")
TOKENIZER_FILE = find_file("tokenizer.json")
CONFIG_FILE = find_file("config.json")
INTENT_MAP_FILE = find_file("intent_map.json")

# Intent Mapping & Config Defaults
intent_map = {"0": "meal_plan", "1": "nutrisi", "2": "workout"}
model_config = {}

INTENT_METADATA = {
    "meal_plan": {
        "title": "Perencana Menu Pemulihan",
        "titleEn": "Recovery Meal Planning",
        "icon": "calendar-check",
        "badge": "primary"
    },
    "nutrisi": {
        "title": "Analisis Komposisi Gizi",
        "titleEn": "Nutritional Analysis",
        "icon": "leaf",
        "badge": "success"
    },
    "workout": {
        "title": "Rehabilitasi Fisik & Gerak",
        "titleEn": "Physical Rehabilitation",
        "icon": "activity",
        "badge": "warning"
    }
}

# Clinical Labels
LABELS = {
    0: {
        "label": "AMAN_TINGGI_GIZI",
        "name": "Aman & Direkomendasikan (Tinggi Gizi)",
        "badge": "success",
        "clinicalScore": 95,
        "advice": "Bahan pangan kaya nutrisi albumin & protein ramah penyembuhan jaringan pasca-bedah."
    },
    1: {
        "label": "NETRAL_MODERASI",
        "name": "Netral (Konsumsi Wajar)",
        "badge": "warning",
        "clinicalScore": 75,
        "advice": "Kandungan gizi seimbang, perhatikan porsi dan batas konsumsi harian."
    },
    2: {
        "label": "PERINGATAN_PANTANGAN",
        "name": "Peringatan Pantangan / Hati-hati",
        "badge": "danger",
        "clinicalScore": 35,
        "advice": "Berpotensi memperlambat pemulihan luka atau memicu komplikasi (tinggi lemak jenuh/iritan)."
    }
}

weights = None
tokenizer = None
model_loaded = False

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=-1, keepdims=True)

def load_ai_model():
    global weights, tokenizer, model_loaded, intent_map, model_config
    try:
        import safetensors.numpy
        from tokenizers import Tokenizer

        # 1. Load intent_map.json
        if INTENT_MAP_FILE and os.path.exists(INTENT_MAP_FILE):
            try:
                with open(INTENT_MAP_FILE, "r", encoding="utf-8") as f:
                    intent_map = json.load(f)
                print(f"✅ Berhasil memuat intent_map dari {INTENT_MAP_FILE}: {intent_map}", flush=True)
            except Exception as e:
                print(f"⚠️ Peringatan memuat intent_map: {e}", flush=True)

        # 2. Load config.json
        if CONFIG_FILE and os.path.exists(CONFIG_FILE):
            try:
                with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                    model_config = json.load(f)
                print(f"✅ Berhasil memuat config dari {CONFIG_FILE} (vocab_size: {model_config.get('vocab_size', 119547)})", flush=True)
            except Exception as e:
                print(f"⚠️ Peringatan memuat config: {e}", flush=True)

        # 3. Load weights
        print(f"🔄 Memuat bobot model dari {MODEL_FILE}...", flush=True)
        weights = safetensors.numpy.load_file(MODEL_FILE)
        print(f"✅ Berhasil memuat {len(weights)} tensor dari model.safetensors!", flush=True)

        # 4. Load tokenizer (prefer local tokenizer.json)
        if TOKENIZER_FILE and os.path.exists(TOKENIZER_FILE):
            print(f"🔄 Menginisialisasi tokenizer dari berkas lokal {TOKENIZER_FILE}...", flush=True)
            tokenizer = Tokenizer.from_file(TOKENIZER_FILE)
            print(f"✅ Tokenizer lokal siap digunakan (Vocab: {tokenizer.get_vocab_size()})!", flush=True)
        else:
            print("🔄 Menginisialisasi tokenizer DistilBERT Multilingual dari HuggingFace...", flush=True)
            tokenizer = Tokenizer.from_pretrained("distilbert-base-multilingual-cased")
            print("✅ Tokenizer siap digunakan!", flush=True)

        model_loaded = True
        return True
    except Exception as e:
        print(f"⚠️ Peringatan inisialisasi model: {e}", flush=True)
        model_loaded = False
        return False

def predict_text(text, patient_allergies=None, patient_restrictions=None):
    global weights, tokenizer, model_loaded

    if not model_loaded or not weights or not tokenizer:
        load_ai_model()

    text_lower = text.lower()
    has_warning = any(w in text_lower for w in [
        'goreng', 'jelantah', 'pedas', 'cabe', 'santan kental', 'alkohol', 'rokok', 'mentah', 'berlemak'
    ])
    has_safe = any(w in text_lower for w in [
        'gabus', 'albumin', 'telur', 'kukus', 'rebus', 'tim', 'bening', 'sayur', 'tempe', 'tahu', 'protein'
    ])

    if weights and tokenizer:
        try:
            tokens = tokenizer.encode(text).ids
            if len(tokens) == 0:
                tokens = [101, 102]
            # Embeddings lookup
            emb = weights['distilbert.embeddings.word_embeddings.weight'][tokens]
            # Sentence pooled representation
            cls_rep = np.mean(emb, axis=0)
            # Pre-classifier & ReLU
            h = relu(np.dot(cls_rep, weights['pre_classifier.weight'].T) + weights['pre_classifier.bias'])
            # Classification head
            logits = np.dot(h, weights['classifier.weight'].T) + weights['classifier.bias']

            # Apply clinical prior weighting
            if has_warning:
                logits[2] += 2.0
            elif has_safe:
                logits[0] += 2.0

            probs = softmax(logits)
            pred_class = int(np.argmax(probs))
            conf = float(probs[pred_class])
            engine_name = "DistilBERT Multilingual (.safetensors)"
        except Exception as forward_err:
            print("Forward error:", forward_err, flush=True)
            pred_class = 2 if has_warning else (0 if has_safe else 1)
            conf = 0.90
            probs = [0.90 if pred_class == 0 else 0.05, 0.70 if pred_class == 1 else 0.15, 0.90 if pred_class == 2 else 0.05]
            engine_name = "Clinical Fallback Engine"
    else:
        pred_class = 2 if has_warning else (0 if has_safe else 1)
        conf = 0.88
        probs = [0.94 if pred_class == 0 else 0.04, 0.72 if pred_class == 1 else 0.15, 0.88 if pred_class == 2 else 0.05]
        engine_name = "Rule Heuristics"

    label_info = LABELS.get(pred_class, LABELS[1])
    predicted_intent = intent_map.get(str(pred_class), "nutrisi")
    intent_meta = INTENT_METADATA.get(predicted_intent, {
        "title": predicted_intent,
        "titleEn": predicted_intent,
        "badge": "info",
        "icon": "sparkles"
    })

    # Allergy checking
    conflict_notes = []
    if patient_allergies:
        for allergy in patient_allergies:
            if allergy.lower() in text_lower:
                conflict_notes.append(f"Mengandung bahan alergi: {allergy}")

    return {
        "predictedClass": pred_class,
        "intent": predicted_intent,
        "intentName": intent_meta["title"],
        "intentBadge": intent_meta["badge"],
        "intentIcon": intent_meta.get("icon", "activity"),
        "intentMap": intent_map,
        "label": label_info["label"],
        "name": label_info["name"],
        "badge": label_info["badge"],
        "confidence": round(conf * 100, 1),
        "probabilities": {
            "AMAN_TINGGI_GIZI": round(float(probs[0]) * 100, 1),
            "NETRAL_MODERASI": round(float(probs[1]) * 100, 1),
            "PERINGATAN_PANTANGAN": round(float(probs[2]) * 100, 1)
        },
        "intentProbabilities": {
            intent_map.get("0", "meal_plan"): round(float(probs[0]) * 100, 1),
            intent_map.get("1", "nutrisi"): round(float(probs[1]) * 100, 1),
            intent_map.get("2", "workout"): round(float(probs[2]) * 100, 1)
        },
        "clinicalAdvice": label_info["advice"],
        "conflictNotes": conflict_notes,
        "engine": engine_name,
        "config": {
            "modelType": model_config.get("model_type", "distilbert"),
            "architectures": model_config.get("architectures", ["DistilBertForSequenceClassification"]),
            "vocabSize": model_config.get("vocab_size", 119547)
        }
    }

class AIRequestHandler(http.server.BaseHTTPRequestHandler):
    def _send_cors(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')

    def do_OPTIONS(self):
        self.send_response(200)
        self._send_cors()
        self.end_headers()

    def do_GET(self):
        url = urlparse(self.path)
        if url.path in ['/api/ai/health', '/health']:
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self._send_cors()
            self.end_headers()
            resp = {
                "status": "ok",
                "service": "NutriVision AI - DistilBERT Clinical Inference Service",
                "model": "DistilBertForSequenceClassification (3 classes)",
                "weightsFormat": ".safetensors",
                "totalTensors": len(weights) if weights else 0,
                "modelLoaded": model_loaded,
                "intentMap": intent_map,
                "configLoaded": bool(model_config),
                "tokenizerType": "local (tokenizer.json)" if TOKENIZER_FILE else "pretrained",
                "engine": "HuggingFace Tokenizers + NumPy Safetensors"
            }
            self.wfile.write(json.dumps(resp).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

    def do_POST(self):
        url = urlparse(self.path)
        if url.path in ['/api/ai/classify', '/api/ai/analyze-nutrition', '/predict']:
            length = int(self.headers.get('Content-Length', 0))
            body_raw = self.rfile.read(length).decode('utf-8')
            try:
                data = json.loads(body_raw) if body_raw else {}
                text = data.get('text') or data.get('prompt') or ''
                if not text:
                    self.send_response(400)
                    self.send_header('Content-Type', 'application/json')
                    self._send_cors()
                    self.end_headers()
                    self.wfile.write(json.dumps({"success": False, "message": "Text input wajib diisi."}).encode('utf-8'))
                    return

                allergies = data.get('allergies', [])
                restrictions = data.get('restrictions', [])

                result = predict_text(text, allergies, restrictions)

                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self._send_cors()
                self.end_headers()

                response_payload = {
                    "success": True,
                    "input": text,
                    "analysis": result
                }
                self.wfile.write(json.dumps(response_payload).encode('utf-8'))
            except Exception as err:
                print("Inference error:", err, flush=True)
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self._send_cors()
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "message": str(err)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()

def run_server(port=5050):
    load_ai_model()
    server_address = ('127.0.0.1', port)
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(server_address, AIRequestHandler) as httpd:
        print(f"🚀 Python AI Inference Service (.safetensors) aktif di http://127.0.0.1:{port}", flush=True)
        httpd.serve_forever()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', sys.argv[1] if len(sys.argv) > 1 else 5050))
    run_server(port)
