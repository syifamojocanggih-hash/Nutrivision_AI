with open('index.html', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f, 1):
        if 'onboarding-modal' in l or 'quiz-step' in l:
            print(f'{i}: {l.strip()[:80]}')
