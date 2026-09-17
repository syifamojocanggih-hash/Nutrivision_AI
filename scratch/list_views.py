with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
views = re.findall(r'<section[^>]*id=["\']view-([^"\']+)["\']', html)
print('Existing views in index.html:')
for v in views:
    print(' - view-' + v)
