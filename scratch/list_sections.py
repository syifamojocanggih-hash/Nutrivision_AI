with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
sections = re.findall(r'<section[^>]*id=["\']([^"\']+)["\'][^>]*>', html)
for sid in sections:
    print('Section id:', sid)
