with open('js/app.js', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f, 1):
        if 'ov-card2' in l or 'macro-donut' in l or 'user-condition-placeholder' in l:
            print(f'{i}: {l.strip()[:80]}')
