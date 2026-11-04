"""Lifestyle photos, blog images and brand files -> public/. Usage: python -I make-photos.py <public dir>"""
import sys, os
from PIL import Image
P = sys.argv[1]; SRC = '/home/user/dssd/yunchbite-redesign/research/current-site/assets/images/'
def save(src, dst, maxw=2000, q=82, alpha=False):
    im = Image.open(SRC + src); im = im.convert('RGBA' if alpha else 'RGB')
    if im.width > maxw: im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    os.makedirs(os.path.dirname(os.path.join(P, dst)), exist_ok=True)
    im.save(os.path.join(P, dst), quality=q, method=6); print(dst, im.size)
save('factory-photo-hq.png', 'photos/factory.webp')
save('banner-slide-2.png', 'photos/family-lifestyle.webp')
save('banner-slide-3.png', 'photos/banner-peri-vs-everyday.webp')
save('promotional-collage.png', 'photos/promotional-collage.webp')
save('about-hero-banner.png', 'photos/about-hero.webp')
save('info-pages-makhana-bowl.png', 'photos/makhana-bowl.webp', alpha=True)
save('avatar-female-hq.jpg', 'photos/avatar-female.webp', q=80)
save('products-hero-banner.png', 'photos/products-hero.webp', alpha=True)
BLOG = {'family': 'healthy-snacking-habits-for-the-whole-family', 'makhana': 'why-makhana-is-the-perfect-smart-snack',
        'nuts': 'the-power-of-nuts-small-bite-big-benefits', 'popcorn': 'popcorn-the-crunchy-snack-you-can-feel-good-about',
        'products': 'discover-our-range-of-healthy-snacks'}
for n, slug in BLOG.items():
    save(f'blog-{n}-hq.jpg', f'photos/blog/{slug}.webp')
