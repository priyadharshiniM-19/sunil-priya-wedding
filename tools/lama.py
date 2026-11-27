"""LaMa inpainting helper: fill masked areas of an RGB image, one bbox at a time at max usable resolution."""
import numpy as np, onnxruntime as ort, cv2

_sess = None
def _s():
    global _sess
    if _sess is None:
        _sess = ort.InferenceSession('/Users/macbookpro/.cache/lama/lama_fp32.onnx')
    return _sess

def inpaint_box(img, mask, box, pad=0.35):
    """img: HxWx3 uint8, mask: HxW uint8 (255=fill). box: x0,y0,x1,y1 of the hole. Returns new img."""
    H, W = mask.shape
    x0, y0, x1, y1 = box
    side = int(max(x1 - x0, y1 - y0) * (1 + pad * 2))
    side = max(side, 512)
    cx, cy = (x0 + x1) // 2, (y0 + y1) // 2
    sx0 = int(np.clip(cx - side // 2, 0, max(0, W - side))); sy0 = int(np.clip(cy - side // 2, 0, max(0, H - side)))
    sx1 = min(W, sx0 + side); sy1 = min(H, sy0 + side)
    tile = img[sy0:sy1, sx0:sx1]; tm = mask[sy0:sy1, sx0:sx1]
    th, tw = tm.shape
    t = cv2.resize(tile, (512, 512), interpolation=cv2.INTER_AREA).astype(np.float32) / 255.
    m = (cv2.resize(tm, (512, 512), interpolation=cv2.INTER_NEAREST) > 127).astype(np.float32)
    m = cv2.dilate(m, np.ones((3, 3), np.uint8))
    out = _s().run(None, {'image': t.transpose(2, 0, 1)[None], 'mask': m[None, None]})[0][0].transpose(1, 2, 0)
    if out.max() <= 1.5: out = out * 255.
    out = np.clip(out, 0, 255).astype(np.uint8)
    out = cv2.resize(out, (tw, th), interpolation=cv2.INTER_CUBIC)
    # feathered composite only inside the mask
    a = cv2.GaussianBlur((tm > 127).astype(np.float32), (0, 0), 2.0)
    a = np.maximum(a, (tm > 127).astype(np.float32))[..., None]
    res = img.copy()
    res[sy0:sy1, sx0:sx1] = (tile * (1 - a) + out * a).astype(np.uint8)
    return res
