with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
items = re.findall(r'<button[^>]*class="[^"]*nav-item[^"]*"[^>]*>', html)
print(f"Total nav-item buttons: {len(items)}")
for it in items[:15]:
    print(it)
