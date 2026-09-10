with open('index.html', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f, 1):
        if 'openquizmodal' in l.lower():
            print(f'{i}: {l.strip()[:80]}')
