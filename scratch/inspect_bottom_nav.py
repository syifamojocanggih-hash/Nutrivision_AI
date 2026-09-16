import re

with open('index.html', 'r', encoding='utf-8') as f:
    text = f.read()

matches = re.findall(r'onclick=["\'](app\.[^"\']+)["\']', text)
print('Unique app onclick handlers:')
for m in sorted(set(matches))[:35]:
    print(' -', m)

# Find bottom nav or tabs
bottom_nav = re.findall(r'<nav[^>]*class=["\'][^"\']*bottom-nav[^"\']*["\'][^>]*>(.*?)</nav>', text, re.S)
if bottom_nav:
    print('\nBottom Nav HTML items:')
    for item in re.findall(r'<button[^>]*>(.*?)</button>', bottom_nav[0], re.S):
        print('  * ', re.sub(r'<[^>]+>', ' ', item).strip())
