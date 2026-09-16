import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

sections = re.findall(r'<section[^>]*id=["\']([^"\']+)["\']', html)
print('SECTIONS:')
for s in sections:
    print(' -', s)

modals = re.findall(r'id=["\']([^"\']*modal[^"\']*)["\']', html, re.I)
print('\nMODALS:')
for m in sorted(set(modals)):
    print(' -', m)

tabs = re.findall(r'id=["\'](tab-[^"\']+)["\']', html)
print('\nTABS / VIEWS:')
for t in sorted(set(tabs)):
    print(' -', t)

# Look for specific keywords
for kw in ['journey', 'roadmap', 'calendar', 'budget', 'quiz', 'history', 'telemetry', 'notification', 'bappenas']:
    matches = re.findall(rf'id=["\']([^"\']*{kw}[^"\']*)["\']', html, re.I)
    print(f'\nIDs with {kw}:', matches[:5])
