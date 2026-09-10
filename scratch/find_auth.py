with open('index.html', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f, 1):
        if 'auth-modal' in l or 'reg-name' in l or 'register' in l.lower():
            print(f'{i}: {l.strip()[:80]}')
