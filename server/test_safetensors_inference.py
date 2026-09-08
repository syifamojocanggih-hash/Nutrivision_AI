import os
import numpy as np
import safetensors.numpy
from tokenizers import Tokenizer

model_path = 'ai_model/model.safetensors' if os.path.exists('ai_model/model.safetensors') else '../model.safetensors'
weights = safetensors.numpy.load_file(model_path)
tok = Tokenizer.from_pretrained('distilbert-base-multilingual-cased')

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=-1, keepdims=True)

def classify(text):
    tokens = tok.encode(text).ids
    # Embeddings lookup
    emb = weights['distilbert.embeddings.word_embeddings.weight'][tokens]
    # Sentence representation
    cls_rep = np.mean(emb, axis=0)
    # Pre-classifier & ReLU
    h = relu(np.dot(cls_rep, weights['pre_classifier.weight'].T) + weights['pre_classifier.bias'])
    # Classification head
    logits = np.dot(h, weights['classifier.weight'].T) + weights['classifier.bias']
    probs = softmax(logits)
    pred_idx = int(np.argmax(probs))
    return pred_idx, probs

print("Testing direct inference on safetensors weights:")
for sample in [
    "Bubur ikan gabus kukus kaya albumin untuk penyembuhan luka",
    "Tumis kangkung dengan nasi putih dan tempe",
    "Gorengan pedas berminyak cabe rawit dan jeroan"
]:
    pred, probs = classify(sample)
    print(f"\nText: '{sample}'")
    print(f"Predicted Class: {pred} | Probabilities: {probs}")
