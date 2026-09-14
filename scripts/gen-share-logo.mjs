// 生成微信分享默认缩略图 public/share-logo.png
// 零依赖：仅使用 Node 内置 zlib，手写 PNG（IHDR/IDAT/IEND + CRC32）。
// 图案：品牌蓝底 + 白色极简「分享」图形（三点两线）。
// 运行：node scripts/gen-share-logo.mjs
// 老板日后可直接用同名正式 logo 替换 public/share-logo.png。
import { deflateSync } from "node:zlib";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const W = 500;
const H = 500;

// 品牌色（与站点 themeColor / primary 一致）
const BG = [37, 99, 235]; // #2563eb
const FG = [255, 255, 255];

// —— 分享图形几何 ——
const NODES = [
  { x: 340, y: 150, r: 42 }, // 右上
  { x: 150, y: 350, r: 42 }, // 左下
  { x: 340, y: 350, r: 42 }, // 右下
];
// 节点间连线（画成胶囊：到线段的距离 ≤ halfWidth）
const LINKS = [
  { ax: 312, ay: 178, bx: 178, by: 322, half: 13 },
  { ax: 340, ay: 302, bx: 340, by: 198, half: 13 },
];

function distToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  let t = ((px - ax) * dx + (py - ay) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  return Math.hypot(px - cx, py - cy);
}

function isWhite(x, y) {
  for (const n of NODES) {
    if (Math.hypot(x - n.x + 0.5, y - n.y + 0.5) <= n.r) return true;
  }
  for (const l of LINKS) {
    if (distToSegment(x + 0.5, y + 0.5, l.ax, l.ay, l.bx, l.by) <= l.half) {
      return true;
    }
  }
  return false;
}

// —— CRC32 ——
const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuf = Buffer.from(type, "ascii");
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

// —— 像素数据（RGB，每行首字节 filter=0）——
const raw = Buffer.alloc((W * 3 + 1) * H);
let o = 0;
for (let y = 0; y < H; y++) {
  raw[o++] = 0;
  for (let x = 0; x < W; x++) {
    const [r, g, b] = isWhite(x, y) ? FG : BG;
    raw[o++] = r;
    raw[o++] = g;
    raw[o++] = b;
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(W, 0);
ihdr.writeUInt32BE(H, 4);
ihdr[8] = 8; // bit depth
ihdr[9] = 2; // color type: truecolor RGB
ihdr[10] = 0; // compression
ihdr[11] = 0; // filter
ihdr[12] = 0; // interlace

const png = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  chunk("IHDR", ihdr),
  chunk("IDAT", deflateSync(raw, { level: 9 })),
  chunk("IEND", Buffer.alloc(0)),
]);

const out = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "public",
  "share-logo.png",
);
await mkdir(dirname(out), { recursive: true });
await writeFile(out, png);
console.log(`written ${out} (${png.length} bytes, ${W}x${H})`);
