"""Generate the jains.es wordmark and favicon as SVG.

Letterforms are Space Grotesk (SIL OFL) outlines, redrawn as a logotype:
custom tracking, the three dots unified as identical circles, and the
domain suffix dropped to a lighter weight so the mark reads as one voice.
"""
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.boundsPen import BoundsPen
from fontTools.misc.transform import Transform

TRACK_BOLD, TRACK_LIGHT = -38, -28
GAP_DOT, DOT_R, TITTLE_Y = 20, 88, 634
BOLD, LIGHT = 700, 400

_c = {}
def font(w):
    if w not in _c:
        f = TTFont('sg.ttf')
        instancer.instantiateVariableFont(f, {"wght": w}, inplace=True)
        _c[w] = f
    return _c[w]

def glyph_path(gn, w, dx):
    gs = font(w).getGlyphSet()
    pen = SVGPathPen(gs, ntos=lambda v: f"{v:.1f}")
    gs[gn].draw(TransformPen(pen, Transform(1, 0, 0, -1, dx, 0)))
    return pen.getCommands()

def glyph_bounds(gn, w, dx):
    gs = font(w).getGlyphSet()
    bp = BoundsPen(gs)
    gs[gn].draw(bp)
    if bp.bounds is None:
        return None
    x0, y0, x1, y1 = bp.bounds
    return (x0 + dx, y0, x1 + dx, y1)

def adv(gn, w):
    return font(w)['hmtx'][gn][0]

def circle(cx, cy, r):
    return (f'M{cx - r:.1f} {-cy:.1f}a{r} {r} 0 1 0 {2 * r} 0'
            f'a{r} {r} 0 1 0 {-2 * r} 0Z')

def layout():
    """Returns (paths, ink_bounds, stem_x) in font units, y-up."""
    paths, boxes, x = [], [], 0.0
    dots = []
    for gn in ('uni0237', 'a', 'dotlessi', 'n', 's'):
        paths.append(glyph_path(gn, BOLD, x))
        b = glyph_bounds(gn, BOLD, x)
        if b: boxes.append(b)
        if gn == 'uni0237':
            dots.append(x + 14 + 81)
            stem_x = x + 70          # left edge of the j stem, for optical alignment
        if gn == 'dotlessi':
            dots.append(x + 12 + 121)
        x += adv(gn, BOLD) + TRACK_BOLD
    x += GAP_DOT
    period_cx = x + DOT_R
    x += DOT_R * 2 + GAP_DOT
    for gn in ('e', 's'):
        paths.append(glyph_path(gn, LIGHT, x))
        b = glyph_bounds(gn, LIGHT, x)
        if b: boxes.append(b)
        x += adv(gn, LIGHT) + TRACK_LIGHT
    for cx in dots:
        paths.append(circle(cx, TITTLE_Y, DOT_R))
        boxes.append((cx - DOT_R, TITTLE_Y - DOT_R, cx + DOT_R, TITTLE_Y + DOT_R))
    paths.append(circle(period_cx, DOT_R, DOT_R))
    boxes.append((period_cx - DOT_R, 0, period_cx + DOT_R, DOT_R * 2))
    ink = (min(b[0] for b in boxes), min(b[1] for b in boxes),
           max(b[2] for b in boxes), max(b[3] for b in boxes))
    return paths, ink, stem_x

def wordmark_svg():
    paths, ink, stem_x = layout()
    x0, y0, x1, y1 = ink
    w, h = x1 - x0, y1 - y0
    body = "".join(f'<path d="{p}"/>' for p in paths)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x0:.1f} {-y1:.1f} '
            f'{w:.1f} {h:.1f}" fill="currentColor" role="img" '
            f'aria-label="jains.es"><g>{body}</g></svg>'), ink, stem_x

def favicon_svg(bg="#0a0a0a", fg="#c6f24e", box=64, fill_ratio=0.56):
    """The j and its dot alone, in a rounded square.

    Paths are already y-down (glyph_path and circle both flip), so the ink box
    is x0..x1 horizontally and -y1..-y0 vertically. Keeping one coordinate
    convention here is the whole trick; mixing them puts the dot off-canvas.
    """
    jp = glyph_path('uni0237', BOLD, 0)
    bx0, by0, bx1, by1 = glyph_bounds('uni0237', BOLD, 0)
    dot_cx = 14 + 81
    x0 = min(bx0, dot_cx - DOT_R)
    x1 = max(bx1, dot_cx + DOT_R)
    y0, y1 = by0, TITTLE_Y + DOT_R
    w, h = x1 - x0, y1 - y0
    s = box * fill_ratio / max(w, h)
    tx = box / 2 - s * (x0 + x1) / 2
    ty = box / 2 + s * (y0 + y1) / 2      # y-down: +s*mid maps the flipped centre
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {box} {box}">'
            f'<rect width="{box}" height="{box}" rx="{box*0.22:.0f}" fill="{bg}"/>'
            f'<g transform="translate({tx:.2f} {ty:.2f}) scale({s:.4f})" fill="{fg}">'
            f'<path d="{jp}"/><path d="{circle(dot_cx, TITTLE_Y, DOT_R)}"/></g></svg>')


def wordmark_inline(cls="logo"):
    """Inline-able SVG: currentColor works only when the SVG is in the document,
    not when it is loaded through <img>, which is an isolated document."""
    svg, ink, _ = wordmark_svg()
    return svg.replace('<svg ', f'<svg class="{cls}" ')


def wordmark_standalone(fill="#f4f4f0"):
    svg, _, _ = wordmark_svg()
    return svg.replace('fill="currentColor"', f'fill="{fill}"')


if __name__ == "__main__":
    svg, ink, stem = wordmark_svg()
    open('logo.svg', 'w').write(svg)
    open('logo-light.svg', 'w').write(wordmark_standalone())
    open('logo-dark.svg', 'w').write(wordmark_standalone('#101010'))
    open('favicon.svg', 'w').write(favicon_svg())
    print('ink bounds', [round(v) for v in ink])
    print('j stem x', round(stem), ' -> optical left inset =', round(stem - ink[0]), 'units')
    print('aspect', round((ink[2]-ink[0])/(ink[3]-ink[1]), 3))
