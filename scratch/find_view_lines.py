with open('index.html', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for idx, line in enumerate(lines):
    if 'id="view-' in line or "id='view-" in line:
        print(f"Line {idx+1}: {line.strip()[:80]}")
