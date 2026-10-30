// Cloudflare Pages 用に public/ へ配信ファイルをまとめる（node_modules は Pages にアップロードされないため vendor/ へコピー）
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const OUT = path.join(ROOT, "public");
const MP = path.join(ROOT, "node_modules/@mediapipe/tasks-vision");

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const copy = (from, to) => {
  fs.mkdirSync(path.dirname(path.join(OUT, to)), { recursive: true });
  fs.cpSync(path.join(ROOT, from), path.join(OUT, to), { recursive: true });
};

copy("index.html", "index.html");
copy("models/pose_landmarker_lite.task", "models/pose_landmarker_lite.task");
copy(
  path.relative(ROOT, path.join(MP, "vision_bundle.mjs")),
  "vendor/tasks-vision/vision_bundle.mjs",
);
copy(path.relative(ROOT, path.join(MP, "wasm")), "vendor/tasks-vision/wasm");

fs.writeFileSync(
  path.join(OUT, "_headers"),
  `/*
  Permissions-Policy: camera=(self), fullscreen=(self)
  X-Content-Type-Options: nosniff

/vendor/*
  Cache-Control: public, max-age=31536000, immutable

/models/*
  Cache-Control: public, max-age=31536000, immutable
`,
);

console.log("public/ を作成しました");
