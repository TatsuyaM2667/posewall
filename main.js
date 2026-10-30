// PCアプリ（Electron）の本体。ゲームの index.html を app:// で読み込んで表示する
const { app, BrowserWindow, protocol, session, ipcMain } = require("electron");
const path = require("path");
const fs = require("fs");

const ROOT = __dirname;
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript",
  ".mjs": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".wasm": "application/wasm",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};
// app:// を https と同じ「安全なページ」として扱う（カメラ・WebAssembly・モジュールのため）
protocol.registerSchemesAsPrivileged([
  {
    scheme: "app",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    backgroundColor: "#0b0d17",
    autoHideMenuBar: true,
    title: "ポーズウォール",
    webPreferences: {
      preload: path.join(ROOT, "preload.js"),
      autoplayPolicy: "no-user-gesture-required",
    },
  });
  win.maximize();
  if (!app.isPackaged) {
    win.webContents.on("console-message", (e) =>
      console.log("[game]", e.message),
    );
  }
  win.loadURL("app://game/index.html");
}

app.whenReady().then(() => {
  protocol.handle("app", async (req) => {
    const { pathname } = new URL(req.url);
    const file = path.normalize(
      path.join(
        ROOT,
        decodeURIComponent(pathname === "/" ? "/index.html" : pathname),
      ),
    );
    if (!file.startsWith(ROOT))
      return new Response("Forbidden", { status: 403 });
    try {
      const data = await fs.promises.readFile(file);
      return new Response(data, {
        headers: {
          "Content-Type":
            TYPES[path.extname(file)] || "application/octet-stream",
        },
      });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  });
  // カメラと全画面は聞かずに許可する（ゲーム専用アプリのため）
  const allowed = ["media", "fullscreen"];
  session.defaultSession.setPermissionRequestHandler((wc, perm, cb) =>
    cb(allowed.includes(perm)),
  );
  session.defaultSession.setPermissionCheckHandler((wc, perm) =>
    allowed.includes(perm),
  );

  ipcMain.on("quit", () => app.quit());
  createWindow();
});

app.on("window-all-closed", () => app.quit());
