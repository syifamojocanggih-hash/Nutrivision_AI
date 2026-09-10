with open('js/planner.js', 'r', encoding='utf-8') as f:
    for i, l in enumerate(f, 1):
        if 'userprofile' in l.lower() or 'condition' in l.lower() or 'rendersymptomfilter' in l.lower():
            print(f'{i}: {l.strip()[:80]}')
