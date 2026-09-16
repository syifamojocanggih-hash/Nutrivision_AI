import re

with open('js/app.js', 'r', encoding='utf-8') as f:
    code = f.read()

tabs = re.findall(r'switchTab\([\'"]([^\'"]+)[\'"]\)', code)
print('Tabs passed to switchTab:', sorted(set(tabs)))

methods = re.findall(r'^\s*([a-zA-Z0-9_]+)\s*\([^)]*\)\s*\{', code, re.M)
print('\nKey App methods related to features:')
for m in sorted(set(methods)):
    if any(k in m.lower() for k in ['journey', 'calendar', 'budget', 'admin', 'notif', 'scan', 'history', 'quiz', 'report', 'card']):
        print(' -', m)

# Let's search for bottom navigation items or sidebar
navs = re.findall(r'data-nav=["\']([^"\']+)["\']', code)
print('\nNav items:', sorted(set(navs)))
