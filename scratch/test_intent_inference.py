import json
import numpy as np
import safetensors.numpy
from tokenizers import Tokenizer

with open('intent_map.json', 'r') as f:
    intent_map = json.load(f)

weights = safetensors.numpy.load_file('model.safetensors')
tok = Tokenizer.from_file('tokenizer.json')

def relu(x):
    return np.maximum(0, x)

def softmax(x):
    e_x = np.exp(x - np.max(x))
    return e_x / e_x.sum(axis=-1, keepdims=True)

test_sentences = [
    "jadwal makan dan menu sarapan diet pemulihan",
    "analisis kandungan protein dan kalori pada ikan gabus",
    "latihan fisik fisioterapi dan peregangan otot pasca bedah"
]

for s in test_sentences:
    tokens = tok.encode(s).ids
    valid_tokens = [t for t in tokens if t != 0]
    if not valid_tokens:
        valid_tokens = tokens[:10]
    emb = weights['distilbert.embeddings.word_embeddings.weight'][valid_tokens]
    cls_rep = np.mean(emb, axis=0)
    h = relu(np.dot(cls_rep, weights['pre_classifier.weight'].T) + weights['pre_classifier.bias'])
    logits = np.dot(h, weights['classifier.weight'].T) + weights['classifier.bias']
    probs = softmax(logits)
    pred_idx = str(int(np.argmax(probs)))
    intent = intent_map.get(pred_idx, 'unknown')
    print(f"Text: '{s}'")
    print(f" -> Predicted: {pred_idx} ({intent}) | Probs: {probs}")
