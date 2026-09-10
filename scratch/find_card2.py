with open('index.html', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f, 1):
        if 'card 2' in l.lower() or 'recovery-target-card' in l.lower():
            print(f'{i}: {l.strip()[:80]}')
