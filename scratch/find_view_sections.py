with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

import re
view_secs = re.findall(r'<([a-zA-Z0-9]+)[^>]*class=["\'][^"\']*view-section[^"\']*["\'][^>]*>', html)
print("Tags with view-section:", len(view_secs))
for vs in view_secs:
    print(' ', vs)

matches = re.findall(r'<([a-zA-Z0-9]+)[^>]*id=["\']([^"\']+)["\'][^>]*class=["\'][^"\']*view-section[^"\']*["\']', html)
for tag, vid in matches:
    print(f'Tag <{tag}> id="{vid}" has class view-section')
matches2 = re.findall(r'<([a-zA-Z0-9]+)[^>]*class=["\'][^"\']*view-section[^"\']*["\'][^>]*id=["\']([^"\']+)["\']', html)
for tag, vid in matches2:
    print(f'Tag <{tag}> id="{vid}" has class view-section')
