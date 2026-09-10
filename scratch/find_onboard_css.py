import glob
for p in glob.glob('css/*.css'):
    with open(p, 'r', encoding='utf-8') as f:
        c = f.read()
        if 'onboarding-modal' in c or 'quiz-modal' in c:
            print('Found in', p)
