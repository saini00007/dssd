"""Logo + favicon set. Usage: python -I make-brand.py <public dir> <src/app dir>"""
import sys, os
from PIL import Image
P, APP = sys.argv[1], sys.argv[2]
SRC = '/home/user/dssd/yunchbite-redesign/research/current-site/assets/images/yunchbite-logo-official.png'
logo = Image.open(SRC).convert('RGBA')
bb = logo.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox(); logo = logo.crop(bb)
os.makedirs(P + '/brand', exist_ok=True)
logo.save(P + '/brand/logo.png', optimize=True); logo.save(P + '/brand/logo.webp', quality=92, method=6, lossless=False)
print('logo', logo.size)
CREAM = (255, 253, 245, 255)
def icon(size, frac=0.9):
    c = Image.new('RGBA', (size, size), CREAM)
    w = round(size * frac); h = round(logo.height * w / logo.width)
    lg = logo.resize((w, h), Image.LANCZOS)
    c.alpha_composite(lg, ((size - w) // 2, (size - h) // 2)); return c
for n, s in (('icon-192.png', 192), ('icon-512.png', 512), ('apple-touch-icon.png', 180)):
    icon(s, 0.84).save(os.path.join(P, n), optimize=True)
big = icon(256, 0.94)
ico = [big.resize((s, s), Image.LANCZOS) for s in (32, 16)]
big.resize((32, 32), Image.LANCZOS).save(P + '/favicon.ico', sizes=[(32, 32), (16, 16)], append_images=[big.resize((16, 16), Image.LANCZOS)])
big.resize((32, 32), Image.LANCZOS).save(APP + '/favicon.ico', sizes=[(32, 32), (16, 16)], append_images=[big.resize((16, 16), Image.LANCZOS)])
