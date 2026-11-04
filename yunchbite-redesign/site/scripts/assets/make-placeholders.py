"""Stand-up pouch placeholder SVGs per flavour key -> public/packs/placeholder/<key>.svg  (reads colours from src/data/pack-colors.ts)"""
import re, sys, os
OUT = sys.argv[1]; TS = sys.argv[2]
NAMES = {  # key: (category line, name lines)
 'peri-peri': ('ROASTED MAKHANA', ['PERI-PERI', 'PARADISE']), 'chatpata': ('ROASTED MAKHANA', ['CHATPATA', 'MASALA']),
 'salt-pepper': ('ROASTED MAKHANA', ['HIMALAYAN', 'SALT & PEPPER']), 'pudina': ('ROASTED MAKHANA', ['PUDINA', 'MASALA']),
 'cheese-herbs': ('ROASTED MAKHANA', ['TANGY CHEESE', '& HERBS']), 'black-salt': ('ROASTED MAKHANA', ['BLACK', 'SALT']),
 'berry-berry': ('ROASTED MAKHANA', ['BERRY BERRY', 'PARADISE']), 'raw-makhana': ('MAKHANA', ['RAW', 'MAKHANA']),
 'popcorn-salted': ('GOURMET POPCORN', ['SALTED', 'POPCORN']), 'popcorn-butter': ('GOURMET POPCORN', ['BUTTER', 'POPCORN']),
 'popcorn-pudina': ('GOURMET POPCORN', ['PUDINA MASALA', 'POPCORN']), 'raw-almonds': ('DRY FRUITS', ['RAW', 'ALMONDS']),
 'raw-cashews': ('DRY FRUITS', ['RAW', 'CASHEWS']), 'roasted-almonds': ('DRY FRUITS', ['ROASTED', 'ALMONDS']),
 'roasted-cashews': ('DRY FRUITS', ['ROASTED', 'CASHEWS']),
}
_m = re.findall(r'"([\w-]+)": \{ color: "(#\w+)", ink: "(#\w+)"', open(TS).read())
cols = {k: c for k, c, i in _m}; inks = {k: i for k, c, i in _m}
def shade(h, f):  # f<1 darken, >1 lighten toward white
    r, g, b = [int(h[i:i+2], 16) for i in (1, 3, 5)]
    if f <= 1: r, g, b = [round(v * f) for v in (r, g, b)]
    else: r, g, b = [round(v + (255 - v) * (f - 1)) for v in (r, g, b)]
    return '#%02X%02X%02X' % (r, g, b)
os.makedirs(OUT, exist_ok=True)
for k, (cat, lines) in NAMES.items():
    c = cols[k]; dk = shade(c, .82); lt = shade(c, 1.18)
    body = 'M96 64 H504 Q520 64 520 80 L528 676 Q528 700 506 712 Q300 760 94 712 Q72 700 72 676 L80 80 Q80 64 96 64 Z'
    fs = 44 if max(len(l) for l in lines) <= 11 else 36
    name = ''.join(f'<text x="300" y="{432 + i * (fs + 6)}" font-size="{fs}" font-weight="800" text-anchor="middle" fill="#2A1210" font-family="Arial Black,Arial,Helvetica,sans-serif">{l.replace("&", "&amp;")}</text>' for i, l in enumerate(lines))
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="600" height="800" role="img" aria-label="Yunch Bite pack placeholder: {" ".join(lines).title().replace("&", "and")}">
<ellipse cx="300" cy="768" rx="236" ry="16" fill="#2A1210" opacity=".14"/>
<clipPath id="p"><path d="{body}"/></clipPath>
<path d="{body}" fill="{c}"/>
<g clip-path="url(#p)">
<rect x="60" y="60" width="480" height="48" fill="{lt}"/>
<rect x="60" y="108" width="480" height="5" fill="{dk}"/>
<rect x="60" y="150" width="480" height="3" fill="{dk}" opacity=".7"/>
<rect x="60" y="156" width="480" height="2" fill="{lt}" opacity=".7"/>
<path d="M72 60 H132 L118 660 Q112 700 72 700 Z" fill="#000" opacity=".1"/>
<path d="M528 60 H476 L486 660 Q490 704 528 704 Z" fill="#000" opacity=".14"/>
<path d="M60 676 Q300 736 540 676 V780 H60 Z" fill="#000" opacity=".14"/>
<path d="M60 676 Q300 736 540 676" fill="none" stroke="{lt}" stroke-width="3" opacity=".5"/>
<path d="M150 170 L150 640" stroke="#fff" stroke-width="10" opacity=".08"/>
</g>
<circle cx="300" cy="86" r="9" fill="{dk}"/>
<rect x="134" y="206" width="332" height="404" rx="22" fill="#FFFDF5"/>
<text x="300" y="262" font-size="30" font-weight="800" text-anchor="middle" fill="#D61610" font-family="Arial Black,Arial,Helvetica,sans-serif" letter-spacing="1">YUNCH BITE</text>
<text x="300" y="304" font-size="17" font-weight="700" text-anchor="middle" fill="#2A1210" font-family="Arial,Helvetica,sans-serif" letter-spacing="2.5">{cat}</text>
<rect x="258" y="326" width="84" height="5" rx="2.5" fill="{c}"/>
{name}
<rect x="170" y="520" width="260" height="46" rx="23" fill="{c}"/>
<text x="300" y="548" font-size="13.5" font-weight="700" text-anchor="middle" fill="{inks[k]}" font-family="Arial,Helvetica,sans-serif" letter-spacing="1.6">PACK PHOTO COMING SOON</text>
</svg>
'''
    open(f'{OUT}/{k}.svg', 'w').write(svg)
print(len(NAMES), 'placeholders')
