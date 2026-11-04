"""Paper-cut shape set (P17) -> public/shapes/<ShapeName>.svg. Flat fills only, 200x200 viewBox."""
import math, random, sys, os
OUT = sys.argv[1]; os.makedirs(OUT, exist_ok=True)
f = lambda v: ('%.1f' % v).rstrip('0').rstrip('.')
def svg(body, name):
    s = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">{body}</svg>\n'
    open(f'{OUT}/{name}.svg', 'w').write(s); return len(s)
def smooth(pts, closed=True, t=0.5):
    """Catmull-Rom -> cubic bezier path through pts."""
    n = len(pts); d = 'M%s %s' % (f(pts[0][0]), f(pts[0][1]))
    rng = range(n) if closed else range(n - 1)
    for i in rng:
        p0 = pts[(i - 1) % n] if (closed or i > 0) else pts[i]; p1 = pts[i]; p2 = pts[(i + 1) % n]
        p3 = pts[(i + 2) % n] if (closed or i + 2 < n) else p2
        c1 = (p1[0] + (p2[0] - p0[0]) * t / 3 * 2 * .5 * 1, p1[1] + (p2[1] - p0[1]) * t / 3 * 2 * .5 * 1)
        c2 = (p2[0] - (p3[0] - p1[0]) * t / 3 * 2 * .5 * 1, p2[1] - (p3[1] - p1[1]) * t / 3 * 2 * .5 * 1)
        d += 'C%s %s %s %s %s %s' % (f(c1[0]), f(c1[1]), f(c2[0]), f(c2[1]), f(p2[0]), f(p2[1]))
    return d + ('Z' if closed else '')
def blob(cx, cy, r, seed, n=9, j=.13, sx=1, sy=1, rot=0):
    rnd = random.Random(seed); pts = []
    for i in range(n):
        a = 2 * math.pi * i / n + rot; rr = r * (1 + rnd.uniform(-j, j))
        pts.append((cx + math.cos(a) * rr * sx, cy + math.sin(a) * rr * sy))
    return smooth(pts)
def poly(*pts): return 'M' + 'L'.join(f'{f(x)} {f(y)}' for x, y in pts) + 'Z'
def P(d, fill, extra=''): return f'<path d="{d}" fill="{fill}"{extra}/>'
sizes = {}

# ---- makhana kernels (popped lotus seed: puffy, irregular, cream, brown speckles)
CREAM, SHADE, SPECK = '#F6E7C8', '#E6CC9C', '#8A5A2B'
for i in range(1, 6):
    rnd = random.Random(100 + i)
    sx, sy = [(1, .94), (.95, 1), (1, 1), (1.04, .9), (.92, .98)][i - 1]
    rot = rnd.uniform(0, 6)
    body = blob(100, 102, 68, 10 + i, n=9 + i % 3, j=.065, sx=sx, sy=sy, rot=rot)
    shade = blob(112, 116, 52, 30 + i, n=8, j=.1, sx=sx, sy=sy, rot=rot)
    # crescent shade: draw darker body, then body-coloured offset blob on top-left
    top = blob(94, 95, 60, 20 + i, n=9, j=.05, sx=sx, sy=sy, rot=rot)
    b = P(body, SHADE) + P(top, CREAM)
    for k in range(7 + i % 3):
        a = rnd.uniform(0, 6.28); r = rnd.uniform(8, 52); x = 100 + math.cos(a) * r * sx; y = 100 + math.sin(a) * r * sy
        w = rnd.uniform(4, 8.5)
        b += P(blob(x, y, w, rnd.randint(0, 999), n=5, j=.3, sx=1.2, sy=.8, rot=rnd.uniform(0, 3)), SPECK)
    sizes[f'makhana-{i}'] = svg(b, f'makhana-{i}')

# ---- chilli
b = P('M52 66C96 46 146 66 166 112C178 140 180 166 176 182C152 172 134 156 116 136C92 110 64 104 40 96C34 82 40 72 52 66Z', '#D61610')
b += P('M40 96C64 104 92 110 116 136C134 156 152 172 176 182C148 182 118 168 96 144C78 124 56 114 40 96Z', '#A60D09')
b += P('M60 78C90 70 120 80 140 104C112 90 86 84 60 78Z', '#EE4A3F')
b += P('M38 68C24 62 18 46 26 30C34 38 46 46 50 58Z', '#2E8B3E')
b += P('M36 70C28 62 34 54 46 56L58 64C58 76 48 86 36 70Z', '#46B055')
sizes['chilli'] = svg(b, 'chilli')

# ---- pudina leaf (serrated oval, lighter vein)
def leaf_outline(cx, cy, L, W, teeth, amp, seed):
    rnd = random.Random(seed); pts = []
    for i in range(teeth * 2):
        t = i / (teeth * 2) * 2 * math.pi
        x = math.cos(t) * L; y = math.sin(t) * W * (1 - .0 * math.cos(t))
        taper = (1 - .15 * math.cos(t)) if math.cos(t) < 0 else (1 - .08 * math.cos(t))
        y *= taper
        r = 1 + (amp if i % 2 else 0) * -1 + rnd.uniform(-.015, .015)
        pts.append((cx + x * r, cy + y * r))
    return poly(*pts)
rot = -35
b = f'<g transform="rotate({rot} 100 100)">' + P(leaf_outline(100, 100, 82, 52, 11, .09, 3), '#49B36B')
b += P('M26 100C60 96 100 96 176 100C100 104 60 104 26 100Z', '#9DE0B0')
for sgn in (-1, 1):
    for x in (62, 92, 122):
        b += P(f'M{x} 100L{x + 24} {100 + sgn * 36}L{x + 30} {100 + sgn * 33}L{x + 6} 100Z', '#9DE0B0')
b += P('M18 100L32 95L32 105Z', '#2E8F52') + '</g>'
sizes['pudina-leaf'] = svg(b, 'pudina-leaf')

# ---- pepper cluster
b = ''
for (x, y, r, s) in [(70, 112, 36, 1), (124, 104, 38, 2), (96, 62, 33, 3), (98, 142, 30, 4), (146, 148, 26, 5)]:
    b += P(blob(x, y, r, s, n=8, j=.07), '#232327')
    b += P(blob(x - r * .1, y - r * .12, r * .82, s + 4, n=7, j=.08), '#303036')
    b += P(blob(x - r * .32, y - r * .34, r * .26, s + 9, n=5, j=.2, sx=1.3, sy=.8, rot=-.6), '#5E5E66')
sizes['pepper'] = svg(b, 'pepper')

# ---- crystals
def crystal(c1, c2, c3, c4):
    b = P(poly((100, 22), (136, 50), (130, 128), (100, 148), (70, 126), (62, 52)), c1)
    b += P(poly((100, 22), (136, 50), (130, 128), (100, 148), (104, 70)), c2)
    b += P(poly((62, 52), (100, 22), (104, 70), (100, 148), (70, 126)), c3)
    b += P(poly((38, 100), (62, 84), (74, 160), (50, 170), (36, 140)), c3)
    b += P(poly((38, 100), (62, 84), (58, 130), (36, 140)), c4)
    b += P(poly((140, 108), (170, 96), (176, 150), (156, 176), (134, 160)), c2)
    b += P(poly((140, 108), (170, 96), (160, 134), (134, 160)), c4)
    b += P(poly((74, 160), (100, 148), (134, 160), (122, 182), (84, 184)), c2)
    return b
sizes['salt'] = svg(crystal('#F4ADA6', '#E4827F', '#F9C8BE', '#D86C74'), 'salt')
sizes['black-salt'] = svg(crystal('#6C4A93', '#4B2D70', '#8668AE', '#3A1F59'), 'black-salt')

# ---- cheese wedge with holes
b = P(poly((22, 112), (150, 58), (182, 82), (56, 150)), '#FFE27A')  # top face
b += P(poly((22, 112), (56, 150), (56, 176), (22, 138)), '#F2B91E')  # left side
b += P(poly((56, 150), (182, 82), (182, 112), (56, 176)), '#FFC93C')  # front face
for (x, y, r) in [(88, 156, 7), (124, 138, 9), (156, 112, 6), (72, 166, 4)]:
    b += P(blob(x, y, r, int(x), n=6, j=.1, sy=.7), '#E0A21B')
for (x, y, r) in [(98, 96, 7), (130, 80, 5)]:
    b += P(blob(x, y, r, int(x), n=6, j=.1, sy=.5, sx=1.3, rot=0), '#F2C94A')
sizes['cheese'] = svg(b, 'cheese')

# ---- herb sprig
def hleaf(x, y, ang, L, W, c1, c2):
    return (f'<g transform="translate({f(x)} {f(y)}) rotate({ang})">' + P(f'M0 0C{f(L*.2)} {f(-W)} {f(L*.8)} {f(-W*.8)} {f(L)} 0C{f(L*.8)} {f(W*.8)} {f(L*.2)} {f(W)} 0 0Z', c1)
            + P(f'M0 0C{f(L*.3)} {f(-W*.2)} {f(L*.7)} {f(-W*.15)} {f(L)} 0C{f(L*.7)} {f(W*.3)} {f(L*.3)} {f(W*.3)} 0 0Z', c2) + '</g>')
b = P('M96 190C100 150 98 100 104 36L109 36C104 100 106 150 102 190Z', '#2F7D45')
for (y, a) in [(150, 1), (120, 1), (92, 1), (66, 1)]:
    L = 56 - (150 - y) * .22; Wd = 24 - (150 - y) * .08
    b += hleaf(101, y, -45 - (150 - y) * .1, L, Wd, '#3FA55C', '#6CCB80')
    b += hleaf(101, y + 10, 180 + 45 + (150 - y) * .1, L, Wd, '#2F8F4E', '#59B96E')
b += hleaf(106, 42, -88, 42, 18, '#3FA55C', '#6CCB80')
sizes['herb-sprig'] = svg(b, 'herb-sprig')

# ---- berry cluster
b = P('M100 52C96 34 104 22 118 16C122 30 114 44 106 54Z', '#2E8B3E') + P('M104 56C120 40 146 40 160 52C146 66 122 66 104 56Z', '#46B055')
for (x, y, r, s) in [(70, 98, 30, 1), (130, 98, 30, 2), (100, 90, 31, 3), (82, 140, 30, 4), (122, 142, 30, 5)]:
    b += P(blob(x, y, r, s, n=8, j=.04), '#9A1865') + P(blob(x - 2, y - 3, r * .86, s + 7, n=8, j=.04), '#C0267F')
    b += P(blob(x - r * .34, y - r * .34, r * .2, s + 3, n=5, j=.1), '#EC74B6')
sizes['berry'] = svg(b, 'berry')

# ---- chaat star (spice burst)
pts = []
for i in range(28):
    a = i / 28 * 2 * math.pi; r = 88 if i % 2 == 0 else 58
    r += random.Random(i).uniform(-6, 6); pts.append((100 + math.cos(a) * r, 100 + math.sin(a) * r))
b = P(poly(*pts), '#F28C1B')
pts2 = [(100 + math.cos(i / 16 * 6.283) * (50 if i % 2 == 0 else 34), 100 + math.sin(i / 16 * 6.283) * (50 if i % 2 == 0 else 34)) for i in range(16)]
b += P(poly(*pts2), '#E5601A') + P(blob(100, 100, 22, 8, n=8, j=.08), '#FFD200')
for (x, y) in [(100, 100), (74, 86), (126, 114)]:
    pass
sizes['chaat-star'] = svg(b, 'chaat-star')

# ---- popcorn kernel
b = ''
lobes = [(70, 118, 34), (130, 118, 34), (100, 84, 38), (66, 72, 28), (136, 72, 28), (100, 138, 30)]
for k, (x, y, r) in enumerate(lobes): b += P(blob(x, y, r, 40 + k, n=7, j=.06), '#E6C88A')
for k, (x, y, r) in enumerate(lobes): b += P(blob(x - 3, y - 4, r * .84, 50 + k, n=7, j=.06), '#FFF4D4')
b += P(blob(84, 96, 14, 7, n=6, j=.2), '#FFE08A') + P(blob(122, 118, 12, 8, n=6, j=.2), '#FFE08A')
b += P(blob(100, 150, 16, 9, n=6, j=.15, sx=1.3, sy=.7), '#E3A53A') + P(blob(96, 60, 10, 2, n=6, j=.2), '#F5D77A')
sizes['popcorn'] = svg(b, 'popcorn')

# ---- butter block
b = P(poly((24, 92), (120, 52), (178, 78), (82, 120)), '#FFF2A8')
b += P(poly((24, 92), (82, 120), (82, 170), (24, 138)), '#F2C230')
b += P(poly((82, 120), (178, 78), (178, 126), (82, 170)), '#FFDB5A')
b += P(poly((82, 120), (110, 108), (110, 156), (82, 170)), '#F6CF45')  # cut-slice edge
b += P(poly((112, 100), (150, 84), (170, 94), (132, 110)), '#FFFBD6')
sizes['butter'] = svg(b, 'butter')

# ---- almond
b = P('M100 18C140 44 168 96 150 150C140 176 112 186 90 178C54 164 42 110 62 66C72 42 88 26 100 18Z', '#B97A3E')
b += P('M100 18C140 44 168 96 150 150C140 176 112 186 90 178C122 160 134 100 100 18Z', '#8F5A2B')
b += P('M96 32C76 56 62 100 74 140C66 112 66 76 96 32Z', '#D9A367') + P('M84 60C98 50 100 70 90 94C80 108 76 80 84 60Z', '#CE9556')
sizes['almond'] = svg(b, 'almond')

# ---- cashew (kidney / crescent)
b = P('M142 34C176 50 182 104 150 146C124 178 74 186 44 164C28 150 34 130 52 134C80 150 112 138 126 110C138 86 124 66 108 64C100 52 120 26 142 34Z', '#EBC688')
b += P('M150 146C124 178 74 186 44 164C28 150 34 130 52 134C80 154 118 150 136 120C146 104 150 126 150 146Z', '#CFA062')
b += P('M132 40C150 54 156 82 148 100C146 76 134 62 118 56C120 48 124 38 132 40Z', '#F7E0B2')
sizes['cashew'] = svg(b, 'cashew')

# ---- olive with leaf
b = P('M52 150C34 128 40 100 64 104C80 118 86 138 70 160Z', '#3F7F2A') + P('M50 148C42 134 44 114 58 110C60 126 62 138 66 154Z', '#5FA43A')
b += P('M100 22C142 22 170 70 162 118C154 164 118 186 88 174C58 162 40 114 56 72C66 44 82 22 100 22Z', '#7E9B2C')
b += P('M100 22C142 22 170 70 162 118C154 164 118 186 88 174C130 164 148 116 132 66C126 42 114 28 100 22Z', '#5F7A20')
b += P(blob(84, 64, 15, 4, n=6, j=.1, sx=.7, sy=1.5, rot=.5), '#B4CC52')
b += P(blob(128, 150, 10, 6, n=5, j=.1), '#D6402A') if False else ''
b += P('M96 24C100 14 112 10 124 14C118 22 108 28 100 28Z', '#3F7F2A')
sizes['olive'] = svg(b, 'olive')

# ---- oil drop (golden)
b = P('M100 14C128 54 160 90 160 124C160 158 134 184 100 184C66 184 40 158 40 124C40 90 72 54 100 14Z', '#F4B400')
b += P('M100 14C128 54 160 90 160 124C160 158 134 184 100 184C140 170 144 120 120 76C112 60 106 32 100 14Z', '#D98E00')
b += P('M74 110C76 90 88 72 98 58C92 82 90 98 92 120C88 134 74 130 74 110Z', '#FFE07A')
sizes['oil-drop'] = svg(b, 'oil-drop')

# ---- tiffin (stacked steel carrier)
S1, S2, S3 = '#CBD1DA', '#EEF1F5', '#9AA4B2'
b = P('M70 34C70 16 130 16 130 34L124 34C124 24 76 24 76 34Z', '#5E6672')
b += P('M98 30h4v18h-4Z', '#5E6672')
for k, y in enumerate((46, 92, 138)):
    b += P(f'M44 {y}C44 {y-6} 156 {y-6} 156 {y}V{y+38}C156 {y+46} 44 {y+46} 44 {y+38}Z', S1)
    b += P(f'M44 {y}C44 {y-6} 156 {y-6} 156 {y}C156 {y+6} 44 {y+6} 44 {y}Z', S2)
    b += P(f'M126 {y+4}C148 {y+2} 156 {y+2} 156 {y}V{y+38}C156 {y+46} 130 {y+46} 124 {y+44}Z', S3)
    b += P(f'M60 {y+14}h14v16h-14Z', S2) if False else ''
b += P('M36 40H46V170H36Z', '#5E6672') + P('M154 40H164V170H154Z', '#5E6672')
b += P('M32 36h18v8H32Z', '#454C57') + P('M150 36h18v8h-18Z', '#454C57')
sizes['tiffin'] = svg(b, 'tiffin')
for k, v in sorted(sizes.items()): print(k, v)
