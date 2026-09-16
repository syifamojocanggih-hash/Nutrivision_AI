import re

with open('index.html', 'r', encoding='utf-8') as f:
    html = f.read()

navs = re.findall(r'data-target=["\']([^"\']+)["\']', html)
print('Data targets (views):', set(navs))

# Find buttons and navigation links
buttons = re.findall(r'<button[^>]*id=["\']([^"\']+)["\'][^>]*>(.*?)</button>', html, re.S)
print('\nKey Buttons count:', len(buttons))
for b_id, b_text in buttons[:25]:
    clean_text = re.sub(r'<[^>]+>', '', b_text).strip()
    if clean_text:
        print(f' - {b_id}: {clean_text}')

# Find app header title or view containers
views = re.findall(r'<div[^>]*class=["\'][^"\']*(?:app-view|view-content|main-view)[^"\']*["\'][^>]*id=["\']([^"\']+)["\']', html)
print('\nMain views by class:', views)
