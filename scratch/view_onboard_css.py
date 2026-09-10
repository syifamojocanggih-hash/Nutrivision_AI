with open('css/modals.css', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f, 1):
        if 'onboarding-modal' in l or 'quiz-modal' in l or 'modal-overlay' in l:
            print(f'{i}: {l.strip()[:80]}')
