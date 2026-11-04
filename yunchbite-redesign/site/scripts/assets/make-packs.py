"""Pack cut-outs: background-removed (rembg isnet-general-use / birefnet) PNGs -> trimmed transparent WebP.
Usage: python -I make-packs.py <dir with is-*.png / bf-*.png> <out public/packs dir>
Per-photo cleanups are listed in EDITS (coordinates in the 1024px source photo)."""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage as ndi

SRC = sys.argv[1]; OUT = sys.argv[2]
ORIG = '/home/user/dssd/yunchbite-redesign/research/current-site/assets/images/'
# slug-less names: output file stem -> (rembg png name, original photo)
JOBS = {
  'makhana-zipper-peri-peri':      ('bf-makhana-peri', 'makhana-peri.jpg'),
  'makhana-zipper-cheese-herbs':   ('bf-makhana-cheese', 'makhana-cheese.jpg'),
  'makhana-zipper-pudina':         ('is-makhana-pudina', 'makhana-pudina.jpg'),
  'makhana-zipper-salt-pepper':    ('is-makhana-salt', 'makhana-salt.jpg'),
  'popcorn-salted':                ('is-popcorn-salted-hq', 'popcorn-salted-hq.jpg'),
  'popcorn-butter':                ('is-popcorn-butter-hq', 'popcorn-butter-hq.jpg'),
  'popcorn-pudina':                ('is-popcorn-pudina-hq', 'popcorn-pudina-hq.jpg'),
  'dryfruits-raw-almonds':         ('is-dryfruits-raw-almonds-hq', 'dryfruits-raw-almonds-hq.jpg'),
  'dryfruits-raw-cashews':         ('is-dryfruits-raw-cashews-hq', 'dryfruits-raw-cashews-hq.jpg'),
  'dryfruits-roasted-almonds':     ('is-dryfruits-roasted-almonds-hq', 'dryfruits-roasted-almonds-hq.jpg'),
  'dryfruits-roasted-cashews':     ('is-dryfruits-roasted-cashews-hq', 'dryfruits-roasted-cashews-hq.jpg'),
}
OVERRIDE = {}  # filled from argv[3:] as stem=pngname

def green(rgb):
    import colorsys
    h, s, v = np.vectorize(colorsys.rgb_to_hsv)(rgb[..., 0] / 255, rgb[..., 1] / 255, rgb[..., 2] / 255)
    return (h > 0.17) & (h < 0.48) & (s > 0.25)

def edits(stem, rgba):
    a = rgba[..., 3]; H, W = a.shape
    yy, xx = np.mgrid[0:H, 0:W]
    if stem == 'makhana-zipper-cheese-herbs':
        # drop cheese board + loose kernels, keep the basil garnish
        a[(xx >= 585) & (yy >= 832)] = 0
        a[(xx >= 790) & (yy >= 700) & ~green(rgba[..., :3].astype(float))] = 0
    if stem == 'dryfruits-raw-almonds':
        a[xx >= 682] = 0   # bowl is cut by the photo edge: pack only
    return a

def run(stem, png, orig):
    im = Image.open(os.path.join(SRC, png + '.png')).convert('RGBA')
    rgba = np.array(im)
    a = edits(stem, rgba).astype(float)
    # crisp up soft matte edges slightly (reduces halo), then keep main components
    a = np.clip((a - 24) / (232 - 24), 0, 1) * 255
    lab, n = ndi.label(a > 20)
    if n > 1:
        sizes = ndi.sum(a > 20, lab, range(1, n + 1)); keep = [i + 1 for i, s in enumerate(sizes) if s >= 0.10 * sizes.max()]
        a[~np.isin(lab, keep)] = 0
    rgba[..., 3] = a.astype('uint8')
    out = Image.fromarray(rgba)
    bb = out.getchannel('A').point(lambda v: 255 if v > 8 else 0).getbbox()
    pad = 6
    bb = (max(bb[0] - pad, 0), max(bb[1] - pad, 0), min(bb[2] + pad, out.width), min(bb[3] + pad, out.height))
    out = out.crop(bb)
    if out.height > 1600: out = out.resize((round(out.width * 1600 / out.height), 1600), Image.LANCZOS)
    out.save(os.path.join(OUT, stem + '.webp'), quality=86, method=6)
    ph = Image.open(ORIG + orig).convert('RGB')
    os.makedirs(os.path.join(OUT, 'photos'), exist_ok=True)
    ph.save(os.path.join(OUT, 'photos', orig.rsplit('.', 1)[0].replace('-hq', '') + '.webp'), quality=82, method=6)
    print(stem, out.size)

for arg in sys.argv[3:]:
    k, v = arg.split('='); OVERRIDE[k] = v
for stem, (png, orig) in JOBS.items():
    run(stem, OVERRIDE.get(stem, png), orig)
