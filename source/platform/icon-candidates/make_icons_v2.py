# -*- coding: utf-8 -*-
"""平台 icon v2 候選：三磚案（黃獨／綠橋／橘雷），沿用 make_icons.py 的磚格語言。
產出：icon-row.png（橫排）/ icon-tri.png（三角排）/ preview 驗收圖（48/96）。"""
from PIL import Image, ImageDraw, ImageFont
import os

SS = 4
W = 1024 * SS
FONT_PATH = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
FONT_INDEX = 3
YELLOW = (255, 204, 0)
GREEN = (74, 222, 128)
ORANGE = (249, 115, 22)
SLATE = (30, 41, 59)
CREAM = (255, 251, 235)
OUT = os.path.dirname(os.path.abspath(__file__))

def font(size):
    return ImageFont.truetype(FONT_PATH, int(size * SS), index=FONT_INDEX)

def text_size(dr, s, f):
    b = dr.textbbox((0, 0), s, font=f)
    return b[2] - b[0], b[3] - b[1], b[0], b[1]

def fit_font(dr, s, target_w):
    lo, hi = 10, 900
    for _ in range(24):
        mid = (lo + hi) / 2
        w, _, _, _ = text_size(dr, s, font(mid))
        if w < target_w * SS:
            lo = mid
        else:
            hi = mid
    return font(lo)

def draw_center(dr, cx, cy, s, f, fill):
    w, h, ox, oy = text_size(dr, s, f)
    dr.text((cx * SS - w / 2 - ox, cy * SS - h / 2 - oy), s, font=f, fill=fill)

def rrect(dr, box, rad, **kw):
    dr.rounded_rectangle([v * SS for v in box], radius=rad * SS, **kw)

def make_tile(size, fill, rad=64, border=26, shadow=(16, 16)):
    pad = 60
    lw = int((size + pad * 2) * SS)
    layer = Image.new('RGBA', (lw, lw), (0, 0, 0, 0))
    dr = ImageDraw.Draw(layer)
    x0 = y0 = pad
    if shadow:
        rrect(dr, (x0 + shadow[0], y0 + shadow[1], x0 + size + shadow[0], y0 + size + shadow[1]), rad, fill=SLATE)
    rrect(dr, (x0, y0, x0 + size, y0 + size), rad, fill=fill, outline=SLATE, width=int(border * SS))
    return layer, dr, pad

def paste_rot(base, layer, cx, cy, angle):
    rot = layer.rotate(angle, resample=Image.BICUBIC, expand=True)
    base.alpha_composite(rot, (int(cx * SS - rot.width / 2), int(cy * SS - rot.height / 2)))

def put_tile(img, ch, col, size, cx, cy, ang):
    layer, ldr, pad = make_tile(size, col)
    f = fit_font(ldr, ch, size * 0.60)
    draw_center(ldr, pad + size / 2, pad + size / 2, ch, f, SLATE)
    paste_rot(img, layer, cx, cy, ang)

def icon_row():
    img = Image.new('RGBA', (W, W), CREAM + (255,))
    size, gap = 280, 34
    x0 = (1024 - size * 3 - gap * 2) / 2
    for i, (ch, col, ang) in enumerate([('獨', YELLOW, 3), ('橋', GREEN, -2.5), ('雷', ORANGE, 2.5)]):
        put_tile(img, ch, col, size, x0 + size / 2 + i * (size + gap), 512, ang)
    img.convert('RGBA').resize((1024, 1024), Image.LANCZOS).save(os.path.join(OUT, 'icon-row.png'))
    print('icon-row ok')

def icon_tri():
    img = Image.new('RGBA', (W, W), CREAM + (255,))
    size = 336
    put_tile(img, '獨', YELLOW, size, 330, 322, 3)
    put_tile(img, '橋', GREEN, size, 694, 322, -2.5)
    put_tile(img, '雷', ORANGE, size, 512, 690, 2)
    img.convert('RGBA').resize((1024, 1024), Image.LANCZOS).save(os.path.join(OUT, 'icon-tri.png'))
    print('icon-tri ok')

def previews():
    # 驗收圖：每案 96px 與 48px，並排放在白底與深底上看辨識度
    for name in ('icon-row', 'icon-tri'):
        src = Image.open(os.path.join(OUT, name + '.png')).convert('RGBA')
        sheet = Image.new('RGBA', (420, 200), (255, 255, 255, 255))
        dr = ImageDraw.Draw(sheet)
        dr.rectangle([210, 0, 420, 200], fill=SLATE + (255,))
        for bg_x, sizes in ((0, None), (210, None)):
            pass
        i96 = src.resize((96, 96), Image.LANCZOS)
        i48 = src.resize((48, 48), Image.LANCZOS)
        sheet.alpha_composite(i96, (30, 20)); sheet.alpha_composite(i48, (150, 44))
        sheet.alpha_composite(i96, (240, 20)); sheet.alpha_composite(i48, (360, 44))
        sheet.convert('RGB').save(os.path.join(OUT, 'preview-v2-' + name + '.png'))
        # 單獨 48 / 96（比照舊流程）
        i48.convert('RGB').save(os.path.join(OUT, 'preview-v2-' + name + '-48.png'))
        i96.convert('RGB').save(os.path.join(OUT, 'preview-v2-' + name + '-96.png'))
    print('previews ok')

if __name__ == '__main__':
    icon_row()
    icon_tri()
    previews()
