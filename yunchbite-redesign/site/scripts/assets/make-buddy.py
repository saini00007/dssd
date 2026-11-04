"""Makhana Buddy cut-outs. Usage: python -I make-buddy.py <work dir with buddy-point-bf.png (rembg birefnet of the 4x upscale) + buddy-sit-key.png> <public/brand/buddy>"""
import sys, os
from PIL import Image
import numpy as np
W, OUT = sys.argv[1:3]; os.makedirs(OUT, exist_ok=True)
def trim(im, pad=4):
    bb = im.getchannel('A').point(lambda v: 255 if v > 10 else 0).getbbox()
    return im.crop((max(bb[0] - pad, 0), max(bb[1] - pad, 0), min(bb[2] + pad, im.width), min(bb[3] + pad, im.height)))
# point: source is only 260x195 px; upscaled 4x (Lanczos + unsharp) then matted -> max ~700 px
p = trim(Image.open(W + '/buddy-point-bf.png').convert('RGBA'))
p.save(OUT + '/buddy-point.webp', quality=90, method=6); print('point', p.size)
# sit: chroma-keyed from flat yellow, with yellow de-spill on the soft edge
s = Image.open(W + '/buddy-sit-key.png').convert('RGBA'); a = np.array(s).astype(float)
al = a[..., 3:4] / 255; bg = np.array([255, 210, 0.])
edge = (al > 0.02) & (al < 0.98)
a[..., :3] = np.where(edge, np.clip((a[..., :3] - (1 - al) * bg) / np.maximum(al, .05), 0, 255), a[..., :3])
s = Image.fromarray(a.astype('uint8'))
s = s.crop((3, 3, s.width - 3, s.height - 3))
s = trim(s, 2); s.save(OUT + '/buddy-sit.webp', quality=90, method=6); print('sit', s.size)
