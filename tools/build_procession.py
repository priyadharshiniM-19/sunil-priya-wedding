"""Procession scene: cut figures into animatable pieces + LaMa background plate.
Coordinates are in the cleaned screenshot space (original screenshot shifted by OX)."""
import sys, json, numpy as np, cv2
from PIL import Image, ImageDraw
sys.path.insert(0, sys.argv[1]); from lama import inpaint_box
SRC, CUT, OUT = sys.argv[2], sys.argv[3], sys.argv[4]
OX = 7
full = np.array(Image.open(SRC).convert('RGB'))[0:946, OX:1909].copy()
H, W = full.shape[:2]
meta = {'W': W, 'H': H, 'parts': {}}

def rgba(path):
    return np.array(Image.open(path).convert('RGBA'))

def poly_mask(shape, pts):
    m = Image.new('L', (shape[1], shape[0]), 0); ImageDraw.Draw(m).polygon(pts, fill=255); return np.array(m)

def save_piece(name, arr, ox, oy, pivot=None, z=0):
    a = arr[..., 3]
    ys, xs = np.where(a > 8)
    x0, x1, y0, y1 = xs.min(), xs.max() + 1, ys.min(), ys.max() + 1
    Image.fromarray(arr[y0:y1, x0:x1]).save(f'{OUT}/{name}.webp', 'WEBP', quality=92, method=6)
    Image.fromarray(arr[y0:y1, x0:x1]).save(f'{OUT}/{name}.png')
    meta['parts'][name] = {'x': int(ox + x0), 'y': int(oy + y0), 'w': int(x1 - x0), 'h': int(y1 - y0), 'z': z,
                           'pivot': None if pivot is None else [int(ox + pivot[0]), int(oy + pivot[1])]}

# ---------- elephant ----------
BG = np.array([251, 244, 229], np.float32)
def defringe(arr, erode=1):
    """Recover true edge colour from pixels blended with the cream envelope, then pull the edge in a hair."""
    a = arr[..., 3].astype(np.float32) / 255.
    c = arr[..., :3].astype(np.float32)
    aa = np.clip(a, 0.18, 1)[..., None]
    fixed = np.clip((c - (1 - aa) * BG) / aa, 0, 255)
    w = ((a > 0) & (a < 0.98))[..., None]
    arr[..., :3] = np.where(w, fixed, c).astype(np.uint8)
    al = arr[..., 3]
    if erode: al = cv2.erode(al, np.ones((3, 3), np.uint8), iterations=erode)
    al = cv2.GaussianBlur(al, (3, 3), 0.6)
    arr[..., 3] = al
    return arr

E = rgba(f'{CUT}/elephant_isnet-general-use.png'); EX, EY = 700 - OX, 285
E[..., 3] = np.clip((E[..., 3].astype(int) - 10) * 1.08, 0, 255).astype(np.uint8)
E = defringe(E)
hh, ww = E.shape[:2]
yy, xx = np.mgrid[0:hh, 0:ww]
KNEE, FEATHER = 556, 26
b = (E[..., 3] > 60).astype(np.uint8); b[:KNEE] = 0
n, lab, st, cen = cv2.connectedComponentsWithStats(b, 8)
def comp_at(x, y):
    l = lab[y, x]; assert l > 0, (x, y); return lab == l
legs = {  # seed on each foot, pivot at the knee
    'leg_rl': ((45, 600), (62, KNEE - 8)),
    'leg_rr': ((155, 600), (155, KNEE - 8)),
    'leg_fl': ((305, 600), (306, KNEE - 8)),
    'leg_fr': ((420, 600), (422, KNEE - 8)),
}
body = E.copy()
ramp = np.clip((yy - (KNEE - FEATHER)) / FEATHER, 0, 1)
for name, (seed, piv) in legs.items():
    c = comp_at(*seed)
    x0, x1 = np.where(c.any(0))[0][[0, -1]]
    region = cv2.dilate(c.astype(np.uint8), np.ones((7, 7), np.uint8)).astype(bool) & (yy >= KNEE) & (xx > 24)
    # thigh above the knee (inside this leg's columns) blends in over the static stub
    up = (yy >= KNEE - FEATHER) & (yy < KNEE) & (xx >= x0 + 2) & (xx <= x1 - 2)
    piece = E.copy()
    al = np.where(region, E[..., 3], 0).astype(np.float32)
    al = np.maximum(al, np.where(up, E[..., 3] * ramp, 0))
    piece[..., 3] = al.astype(np.uint8)
    body[..., 3] = np.where(region, 0, body[..., 3])
    save_piece(f'el_{name}', piece, EX, EY, piv, z=2)
# trunk: everything right of the front leg below the tusks
TR = 482
trunk_reg = (yy >= TR) & (xx >= 463)
tramp = np.clip((yy - TR) / 22, 0, 1)
piece = E.copy(); piece[..., 3] = np.where(trunk_reg, E[..., 3] * tramp, 0).astype(np.uint8)
body[..., 3] = np.where(trunk_reg & (yy >= TR + 22), 0, body[..., 3])
body[..., 3] = np.where(trunk_reg & (yy < TR + 22), (body[..., 3] * (1 - tramp)).astype(np.uint8), body[..., 3])
save_piece('el_trunk', piece, EX, EY, (488, TR), z=2)
save_piece('el_body', body, EX, EY, z=1)
# ---------- walkers ----------
Wk = rgba(f'{CUT}/walkers_union.png'); WX, WY = 420 - OX, 520
hh, ww = Wk.shape[:2]
yy, xx = np.mgrid[0:hh, 0:ww]
Wk[..., 3] = np.where((xx >= 282) & (yy > 100), 0, Wk[..., 3])
Wk[..., 3] = np.clip((Wk[..., 3].astype(int) - 14) * 1.1, 0, 255).astype(np.uint8); Wk = defringe(Wk)
dr = Wk.copy(); dr[..., 3] = np.where(xx < 188, dr[..., 3], 0)
um = Wk.copy(); um[..., 3] = np.where(xx >= 188, um[..., 3], 0)
save_piece('drummers', dr, WX, WY, z=2)
save_piece('umbrella', um, WX, WY, z=2)

# ---------- leader ----------
L = rgba(f'{CUT}/leader_isnet-general-use.png'); LX, LY = 1235 - OX, 625
L[..., 3] = np.clip((L[..., 3].astype(int) - 10) * 1.08, 0, 255).astype(np.uint8); L = defringe(L)
save_piece('leader', L, LX, LY, z=2)

# ---------- background plate ----------
mask = np.zeros((H, W), np.uint8)
def stamp(arr, ox, oy):
    a = (arr[..., 3] > 2).astype(np.uint8) * 255
    h, w = a.shape; mask[oy:oy + h, ox:ox + w] = np.maximum(mask[oy:oy + h, ox:ox + w], a[:H - oy, :W - ox])
E0 = rgba(f'{CUT}/elephant_isnet-general-use.png'); stamp(E0, EX, EY)
W0 = rgba(f'{CUT}/walkers_union.png'); W0[..., 3] = np.where((xx >= 282) & (yy > 100), 0, W0[..., 3]); stamp(W0, WX, WY)
stamp(rgba(f'{CUT}/leader_isnet-general-use.png'), LX, LY)
mask = cv2.dilate(mask, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (19, 19)))
Image.fromarray(mask).save(f'{OUT}/_mask.png')
import os
if os.path.exists(f'{OUT}/procession_plate.png'):
    json.dump(meta, open(f'{OUT}/procession.json', 'w'), indent=1); print(json.dumps(meta)); raise SystemExit
plate = full.copy()
# address line on the envelope: flat cream, a classic inpaint is cleanest
tm = np.zeros_like(mask); tm[22:82, 485:675] = 255
plate = cv2.inpaint(plate, tm, 9, cv2.INPAINT_TELEA)
def region(b):
    r = np.zeros_like(mask); r[b[1]:b[3], b[0]:b[2]] = mask[b[1]:b[3], b[0]:b[2]]; return r
eb = (EX - 20, EY - 20, EX + 580, EY + 655)
wb = (WX - 15, WY - 20, WX + 380, WY + 400)
lb = (LX - 15, LY - 15, LX + 165, LY + 310)
# pass 1: everything (so no figure pixels leak in as context), framed on the elephant
plate = inpaint_box(plate, mask, eb, pad=0.25)
# pass 2/3: smaller holes again at higher resolution
plate = inpaint_box(plate, region(wb), wb, pad=0.3)
plate = inpaint_box(plate, region(lb), lb, pad=0.6)
Image.fromarray(plate).save(f'{OUT}/procession_plate.png')
Image.fromarray(plate).save(f'{OUT}/procession_plate.jpg', quality=90)
json.dump(meta, open(f'{OUT}/procession.json', 'w'), indent=1)
print(json.dumps(meta))
