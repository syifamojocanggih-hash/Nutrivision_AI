import os
import base64
from PIL import Image
import numpy as np

src = r'C:/Users/ASUS/.gemini/antigravity-ide/brain/239ab4d3-c403-4d95-b434-8a03a757eac4/.user_uploaded/media_1789646785406.png'
im = Image.open(src).convert('RGBA')
arr = np.array(im)

cy, cx = 203.5, 325.0
y, x = np.ogrid[:arr.shape[0], :arr.shape[1]]
dist = np.sqrt((x - cx)**2 + (y - cy)**2)

# Restore solid white interior for bowl
arr_clean = arr.copy()
inner_mask = dist <= 47.5
inner_rgb = arr[inner_mask, :3].astype(float)
inner_a = arr[inner_mask, 3:4].astype(float) / 255.0
blended_inner = (inner_rgb * inner_a + 255.0 * (1.0 - inner_a)).clip(0, 255).astype(np.uint8)
arr_clean[inner_mask, :3] = blended_inner
arr_clean[inner_mask, 3] = 255

# Ensure exterior transparency outside radius 105.5
outer_icon_mask = (dist >= 105.5) & (y < 315)
arr_clean[outer_icon_mask, 3] = 0

img_clean = Image.fromarray(arr_clean)

# 1. Base Icon Crop (radius 105)
pad = 105.5
icon_crop = img_clean.crop((int(cx - pad), int(cy - pad), int(cx + pad), int(cy + pad)))
print('Base icon size:', icon_crop.size)

# High-res 512x512 icon
icon_512 = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
# Resize icon_crop with Lanczos to 460x460 (giving nice 26px padding on each side)
icon_resized_512 = icon_crop.resize((460, 460), Image.Resampling.LANCZOS)
icon_512.paste(icon_resized_512, ((512 - 460)//2, (512 - 460)//2), icon_resized_512)
icon_512.save('icons/icon-512.png', optimize=True)
icon_512.save('icons/nutrivision-icon.png', optimize=True)

# 192x192 icon
icon_192 = Image.new('RGBA', (192, 192), (0, 0, 0, 0))
icon_resized_192 = icon_crop.resize((172, 172), Image.Resampling.LANCZOS)
icon_192.paste(icon_resized_192, ((192 - 172)//2, (192 - 172)//2), icon_resized_192)
icon_192.save('icons/icon-192.png', optimize=True)

# 48x48 Favicon PNG
icon_48 = icon_crop.resize((48, 48), Image.Resampling.LANCZOS)
icon_48.save('icons/favicon.png', optimize=True)

# Full Vertical Logo
# Active bbox of full logo
full_crop = img_clean.crop((80, int(cy - pad), 574, 424))
# Add 20px padding around
full_w, full_h = full_crop.size
full_logo = Image.new('RGBA', (full_w + 30, full_h + 30), (0, 0, 0, 0))
full_logo.paste(full_crop, (15, 15), full_crop)
full_logo.save('icons/nutrivision-logo.png', optimize=True)

# Text crop
text_crop = img_clean.crop((80, 335, 574, 424))

# Horizontal Lockup (Light theme: dark tagline)
h_icon_size = 140
h_icon = icon_crop.resize((h_icon_size, h_icon_size), Image.Resampling.LANCZOS)
h_text_h = 74
h_text_w = int(h_text_h * (text_crop.width / text_crop.height))
h_text = text_crop.resize((h_text_w, h_text_h), Image.Resampling.LANCZOS)

h_canvas_w = h_icon_size + 20 + h_text_w + 20
h_canvas_h = h_icon_size + 10
h_lockup = Image.new('RGBA', (h_canvas_w, h_canvas_h), (0, 0, 0, 0))
h_lockup.paste(h_icon, (10, 5), h_icon)
text_y = 5 + (h_icon_size - h_text_h) // 2
h_lockup.paste(h_text, (h_icon_size + 24, text_y), h_text)
h_lockup.save('icons/nutrivision-logo-horizontal.png', optimize=True)

# Horizontal Lockup (Dark theme: tagline in light mint #E8EFD2, text in bright moss #93BA55)
arr_text = np.array(text_crop).copy()
arr_text_dark = arr_text.copy()
tag_mask = np.zeros(arr_text.shape[:2], dtype=bool)
tag_mask[65:, :] = True
tag_active = tag_mask & (arr_text[:, :, 3] > 40)
arr_text_dark[tag_active, 0] = 232 # R
arr_text_dark[tag_active, 1] = 239 # G
arr_text_dark[tag_active, 2] = 210 # B

title_mask = np.zeros(arr_text.shape[:2], dtype=bool)
title_mask[:65, :] = True
title_active = title_mask & (arr_text[:, :, 3] > 40)
arr_text_dark[title_active, :3] = np.clip(arr_text[title_active, :3].astype(float) * 1.25, 0, 255).astype(np.uint8)

text_crop_dark = Image.fromarray(arr_text_dark)
h_text_dark = text_crop_dark.resize((h_text_w, h_text_h), Image.Resampling.LANCZOS)

h_lockup_dark = Image.new('RGBA', (h_canvas_w, h_canvas_h), (0, 0, 0, 0))
h_lockup_dark.paste(h_icon, (10, 5), h_icon)
h_lockup_dark.paste(h_text_dark, (h_icon_size + 24, text_y), h_text_dark)
h_lockup_dark.save('icons/nutrivision-logo-horizontal-dark.png', optimize=True)

# Update icon.svg with crisp SVG embedding of icon_512
with open('icons/icon-512.png', 'rb') as f:
    b64_icon = base64.b64encode(f.read()).decode('utf-8')

svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <filter id="soft-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="6" stdDeviation="10" flood-color="#1C200E" flood-opacity="0.2"/>
    </filter>
  </defs>
  <image href="data:image/png;base64,{b64_icon}" x="0" y="0" width="512" height="512" filter="url(#soft-shadow)"/>
</svg>
'''
with open('icons/icon.svg', 'w', encoding='utf-8') as f:
    f.write(svg_content)

print('All assets created successfully in icons/!')
