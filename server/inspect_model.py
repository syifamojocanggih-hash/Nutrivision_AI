import struct
import json

with open('../model.safetensors', 'rb') as f:
    header_len = struct.unpack('<Q', f.read(8))[0]
    header_bytes = f.read(header_len)
    header = json.loads(header_bytes.decode('utf-8'))

print("=== SAFETENSORS HEADER INFO ===")
print("Metadata:", header.get('__metadata__', 'No metadata'))
tensors = [k for k in header.keys() if k != '__metadata__']
print(f"Total Tensors: {len(tensors)}")
print("\nFirst 20 tensor names & shapes:")
for k in tensors[:20]:
    info = header[k]
    print(f"  {k}: {info.get('shape')} ({info.get('dtype')})")

print("\nLast 10 tensor names:")
for k in tensors[-10:]:
    info = header[k]
    print(f"  {k}: {info.get('shape')} ({info.get('dtype')})")
