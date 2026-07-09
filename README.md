# 小U0拼圖闖關

薰衣草紫色風格的社群拼圖闖關小遊戲。關主上傳圖片建立拼圖房，設定難度、限時與破關暗號詞；闖關者輸入房號後會進入自己的拼圖畫面，完成後才會看到暗號詞。

## 功能

- 關主上傳圖片，自動切成拼圖並打散
- 可設定 3x3、4x4、5x5、6x6、8x8 難度
- 可設定不限時、3 分鐘、5 分鐘、10 分鐘或自訂秒數
- 建立後產生房號，關主可複製到社群
- 闖關者輸入房號進入個人拼圖，不會看到其他玩家進度
- 完成拼圖後顯示關主設定的暗號詞

## 本機執行

需要 Node.js 18 以上。

```bash
npm start
```

開啟：

```text
http://localhost:3000
```

## Render 部署

1. 把這個資料夾上傳到 GitHub。
2. 在 Render 建立 Web Service。
3. 選擇該 GitHub repo。
4. Render 會讀取 `render.yaml`，或手動設定：
   - Environment: `Node`
   - Build Command: 留空
   - Start Command: `npm start`

## 注意

目前版本使用檔案 `data/rooms.json` 儲存房間。Render 免費方案的磁碟可能會在服務重啟後清空資料；如果之後需要長期保存房間，可以再接 PostgreSQL、Redis 或外部物件儲存。
