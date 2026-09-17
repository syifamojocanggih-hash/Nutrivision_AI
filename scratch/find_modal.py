s = open('index.html', encoding='utf-8').read().split('\n')
for i in range(4280, 4360):
    if i < len(s):
        print(f"{i+1}: {s[i]}")
