// ゲーム画面から使える最小限のアプリ機能（「終了」ボタン用）
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("app", {
  quit: () => ipcRenderer.send("quit"),
});
