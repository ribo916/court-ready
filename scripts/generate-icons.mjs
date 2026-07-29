/**
 * Rasterizes the Court Ready mark (public/icon.svg) into the PNG sizes that
 * platforms actually require. iOS ignores the web manifest and will not use an
 * SVG for the home-screen icon, so a real PNG has to exist.
 *
 * Run with: npm run icons
 */

import { deflateSync } from "node:zlib"
import { writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

const cream = [0xf7, 0xf5, 0xef]
const green = [0x2f, 0x6f, 0x56]
const gold = [0xf4, 0xd0, 0x6f]

// --- PNG encoding ------------------------------------------------------------

const crcTable = (() => {
  const table = new Int32Array(256)

  for (let n = 0; n < 256; n += 1) {
    let c = n

    for (let k = 0; k < 8; k += 1) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }

    table[n] = c
  }

  return table
})()

function crc32(buffer) {
  let c = 0xffffffff

  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8)
  }

  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)

  const typeAndData = Buffer.concat([Buffer.from(type, "ascii"), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(typeAndData))

  return Buffer.concat([length, typeAndData, crc])
}

function encodePng(width, height, rgba) {
  const stride = width * 4
  const raw = Buffer.alloc((stride + 1) * height)

  for (let y = 0; y < height; y += 1) {
    raw[y * (stride + 1)] = 0 // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }

  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // truecolour with alpha
  ihdr[10] = 0
  ihdr[11] = 0
  ihdr[12] = 0

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(raw, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ])
}

// --- Geometry, in the SVG's 512x512 user space -------------------------------

function distanceToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax
  const dy = by - ay
  const lengthSquared = dx * dx + dy * dy
  const t =
    lengthSquared === 0
      ? 0
      : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lengthSquared))

  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function cubicPoints(p0, p1, p2, p3, steps = 48) {
  const points = []

  for (let i = 0; i <= steps; i += 1) {
    const t = i / steps
    const u = 1 - t
    points.push([
      u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0],
      u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1],
    ])
  }

  return points
}

const smilePoints = cubicPoints([150, 276], [218, 261], [294, 261], [362, 276])

function distanceToPolyline(x, y, points) {
  let best = Infinity

  for (let i = 0; i < points.length - 1; i += 1) {
    best = Math.min(
      best,
      distanceToSegment(x, y, points[i][0], points[i][1], points[i + 1][0], points[i + 1][1])
    )
  }

  return best
}

function insideRoundedRect(x, y, size, radius) {
  const cx = Math.min(Math.max(x, radius), size - radius)
  const cy = Math.min(Math.max(y, radius), size - radius)
  const dx = x - cx
  const dy = y - cy

  if (dx === 0 && dy === 0) {
    return x >= 0 && y >= 0 && x <= size && y <= size
  }

  return Math.hypot(dx, dy) <= radius
}

/**
 * The background plate is sampled in unscaled space so a maskable icon stays
 * full bleed while only its artwork moves into the safe zone.
 */
function sampleBackground(x, y, rounded) {
  const covered = rounded
    ? insideRoundedRect(x, y, 512, 96)
    : x >= 0 && y >= 0 && x <= 512 && y <= 512

  return covered ? [...cream, 1] : null
}

/** Artwork layers, painted back to front. */
function sampleContent(x, y) {
  const layers = []

  if (Math.hypot(x - 256, y - 256) <= 152) {
    layers.push([...green, 1])
  }

  if (distanceToSegment(x, y, 256, 104, 256, 408) <= 9) {
    layers.push([...cream, 0.75])
  }

  if (distanceToPolyline(x, y, smilePoints) <= 12) {
    layers.push([...cream, 1])
  }

  if (Math.hypot(x - 256, y - 256) <= 46) {
    layers.push([...gold, 1])
  }

  return layers
}

function composite(layers) {
  let r = 0
  let g = 0
  let b = 0
  let a = 0

  for (const [lr, lg, lb, la] of layers) {
    r = lr * la + r * (1 - la)
    g = lg * la + g * (1 - la)
    b = lb * la + b * (1 - la)
    a = la + a * (1 - la)
  }

  return [r, g, b, a]
}

/**
 * @param size      output pixel size
 * @param rounded   draw the rounded-square plate (false = full bleed, for
 *                  platform masks that apply their own shape)
 * @param contentScale  shrink the artwork to sit inside a maskable safe zone
 */
function render(size, { rounded, contentScale = 1 }) {
  const rgba = Buffer.alloc(size * size * 4)
  const samplesPerAxis = 4
  const step = 1 / samplesPerAxis
  const total = samplesPerAxis * samplesPerAxis

  for (let py = 0; py < size; py += 1) {
    for (let px = 0; px < size; px += 1) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0

      for (let sy = 0; sy < samplesPerAxis; sy += 1) {
        for (let sx = 0; sx < samplesPerAxis; sx += 1) {
          // Pixel centre -> SVG user space, with optional inward scaling.
          const ux = ((px + (sx + 0.5) * step) / size) * 512
          const uy = ((py + (sy + 0.5) * step) / size) * 512
          const cx = 256 + (ux - 256) / contentScale
          const cy = 256 + (uy - 256) / contentScale

          const background = sampleBackground(ux, uy, rounded)
          const [sr, sg, sb, sa] = composite([
            ...(background ? [background] : []),
            ...sampleContent(cx, cy),
          ])
          r += sr * sa
          g += sg * sa
          b += sb * sa
          a += sa
        }
      }

      const alpha = a / total
      const offset = (py * size + px) * 4

      rgba[offset] = a > 0 ? Math.round(r / a) : 0
      rgba[offset + 1] = a > 0 ? Math.round(g / a) : 0
      rgba[offset + 2] = a > 0 ? Math.round(b / a) : 0
      rgba[offset + 3] = Math.round(alpha * 255)
    }
  }

  return encodePng(size, size, rgba)
}

const targets = [
  // iOS home screen. Square and full bleed: iOS applies its own mask.
  { path: "app/apple-icon.png", size: 180, rounded: false },
  { path: "public/icon-192.png", size: 192, rounded: true },
  { path: "public/icon-512.png", size: 512, rounded: true },
  // Android adaptive icons crop to a circle inside the centre 80%.
  {
    path: "public/icon-maskable-512.png",
    size: 512,
    rounded: false,
    contentScale: 0.72,
  },
]

for (const target of targets) {
  const png = render(target.size, {
    rounded: target.rounded,
    contentScale: target.contentScale,
  })

  writeFileSync(join(root, target.path), png)
  console.log(`${target.path} (${target.size}x${target.size}, ${png.length} bytes)`)
}
