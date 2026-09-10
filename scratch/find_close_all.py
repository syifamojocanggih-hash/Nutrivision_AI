import glob
for p in glob.glob('js/*.js'):
    with open(p, 'r', encoding='utf-8') as f:
        for i, l in enumerate(f, 1):
            if 'closemodal' in l.lower():
                print(f'{p}:{i}: {l.strip()[:80]}')
