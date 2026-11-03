# -*- coding: utf-8 -*-
"""數獨 × 數橋 平台 icon 候選（程式化合成，Noto Sans CJK TC Bold）。
設計語言對齊平台首頁：黃 #ffcc00 / 綠 #4ade80 / slate-800 邊框 / 微旋轉 / 硬陰影。
以 4x 超取樣繪製後縮回 1024，確保邊緣與文字銳利。"""
from PIL import Image, ImageDraw, ImageFont
import math, os

SS = 4                      # supersample
W = 1024 * SS
FONT_PATH = '/usr/share/fonts/opentype/noto/NotoSansCJK-Bold.ttc'
FONT_INDEX = 3              # TC Bold
YELLOW = (255, 204, 0)
GREEN = (74, 222, 128)
SLATE = (30, 41, 59)        # slate-800
SLATE_D = (15, 23, 42)      # slate-900
CREAM = (255, 251, 235)
WHITE = (255, 255, 255)

OUT = os.path.dirname(os.path.abspath(__file__))

def font(size):
    return ImageFont.truetype(FONT_PATH, int(size * SS), index=FONT_INDEX)

def text_size(dr, s, f):
    b = dr.textbbox((0, 0), s, font=f)
    return b[2] - b[0], b[3] - b[1], b[0], b[1]

def fit_font(dr, s, target_w):
    """找讓字串寬度 ≈ target_w（1024 空間單位）的字級"""
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

def make_tile(size_w, size_h, fill, rad=64, border=26, shadow=(16, 16), border_col=SLATE, shadow_col=SLATE):
    """一張帶硬陰影的方塊字磚（透明底圖層），回傳 (layer, draw) 座標以 1024 空間計"""
    pad = 60
    lw, lh = int((size_w + pad * 2) * SS), int((size_h + pad * 2) * SS)
    layer = Image.new('RGBA', (lw, lh), (0, 0, 0, 0))
    dr = ImageDraw.Draw(layer)
    x0, y0 = pad, pad
    if shadow:
        rrect(dr, (x0 + shadow[0], y0 + shadow[1], x0 + size_w + shadow[0], y0 + size_h + shadow[1]), rad, fill=shadow_col)
    rrect(dr, (x0, y0, x0 + size_w, y0 + size_h), rad, fill=fill, outline=border_col, width=int(border * SS))
    return layer, dr, pad

def paste_rot(base, layer, cx, cy, angle):
    rot = layer.rotate(angle, resample=Image.BICUBIC, expand=True)
    base.alpha_composite(rot, (int(cx * SS - rot.width / 2), int(cy * SS - rot.height / 2)))

def finish(img, name):
    img = img.convert('RGBA').resize((1024, 1024), Image.LANCZOS)
    img.save(os.path.join(OUT, name))
    print(name, 'ok')

# ---------------- A：四字磚 2x2（首頁 logo 直接成 icon） ----------------
def icon_a():
    img = Image.new('RGBA', (W, W), CREAM + (255,))
    dr = ImageDraw.Draw(img)
    tile, gap = 396, 40
    x0 = (1024 - tile * 2 - gap) / 2
    y0 = x0
    cells = [('數', YELLOW, 3), ('獨', YELLOW, -2.5), ('數', GREEN, -2.5), ('橋', GREEN, 3)]
    pos = [(x0, y0), (x0 + tile + gap, y0), (x0, y0 + tile + gap), (x0 + tile + gap, y0 + tile + gap)]
    for (ch, col, ang), (x, y) in zip(cells, pos):
        layer, ldr, pad = make_tile(tile, tile, col)
        f = fit_font(ldr, ch, tile * 0.58)
        draw_center(ldr, pad + tile / 2, pad + tile / 2, ch, f, SLATE)
        paste_rot(img, layer, x + tile / 2, y + tile / 2, ang)
    finish(img, 'icon-a.png')

# ---------------- B：左右對半（九宮格 vs 島橋） ----------------
def icon_b():
    img = Image.new('RGBA', (W, W), YELLOW + (255,))
    dr = ImageDraw.Draw(img)
    dr.rectangle([512 * SS, 0, W, W], fill=GREEN + (255,))
    # 左：數獨九宮格線條
    gx, gy, gs = 76, 84, 360
    for i in range(4):
        wdt = 20 if i in (0, 3) else 9
        p = (gx + gs * i / 3) * SS
        dr.line([p, gy * SS, p, (gy + gs) * SS], fill=SLATE, width=int(wdt * SS))
        p = (gy + gs * i / 3) * SS
        dr.line([gx * SS, p, (gx + gs) * SS, p], fill=SLATE, width=int(wdt * SS))
    # 右：島 + 橋（雙線）
    isl = [(640, 150, '3'), (880, 150, '1'), (760, 372, '2')]
    def bridge(p, q):
        (x1, y1), (x2, y2) = p, q
        dx, dy = x2 - x1, y2 - y1
        L = math.hypot(dx, dy)
        nx, ny = -dy / L * 13, dx / L * 13
        for sgn in (1, -1):
            dr.line([(x1 + nx * sgn) * SS, (y1 + ny * sgn) * SS,
                     (x2 + nx * sgn) * SS, (y2 + ny * sgn) * SS], fill=SLATE, width=int(11 * SS))
    bridge(isl[0][:2], isl[1][:2])
    bridge(isl[0][:2], isl[2][:2])
    for x, y, n in isl:
        r = 58
        dr.ellipse([(x - r) * SS, (y - r) * SS, (x + r) * SS, (y + r) * SS], fill=WHITE, outline=SLATE, width=int(15 * SS))
        f = fit_font(dr, n, 52)
        draw_center(dr, x, y, n, f, SLATE)
    # 中央分隔線
    dr.rectangle([502 * SS, 0, 522 * SS, W], fill=SLATE)
    # 下方字：數獨 / 數橋
    f = fit_font(dr, '數獨', 300)
    draw_center(dr, 256, 742, '數獨', f, SLATE)
    draw_center(dr, 768, 742, '數橋', f, SLATE)
    # 外框
    rrect(dr, (0, 0, 1023, 1023), 150, outline=SLATE, width=int(30 * SS))
    finish(img, 'icon-b.png')

# ---------------- C：深底雙磚直式（小尺寸優先） ----------------
def icon_c():
    img = Image.new('RGBA', (W, W), SLATE + (255,))
    tw, th = 396, 620
    for (word, col, cx, ang) in [('數獨', YELLOW, 272, -5), ('數橋', GREEN, 752, 5)]:
        layer, ldr, pad = make_tile(tw, th, col, rad=64, border=16, shadow=(22, 22), border_col=WHITE, shadow_col=(0, 0, 0))
        f = fit_font(ldr, word[0], tw * 0.56)
        draw_center(ldr, pad + tw / 2, pad + th * 0.27, word[0], f, SLATE_D)
        draw_center(ldr, pad + tw / 2, pad + th * 0.73, word[1], f, SLATE_D)
        paste_rot(img, layer, cx, 512, ang)
    finish(img, 'icon-c.png')

icon_a()
icon_b()
icon_c()
