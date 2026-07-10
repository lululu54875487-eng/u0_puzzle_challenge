# 小U0拼圖闖關

薰衣草紫色風格的社群拼圖闖關小遊戲。關主上傳圖片建立拼圖房，設定難易度、限時與破關暗號詞；闖關者輸入房號後會進入自己的拼圖畫面，完成後才會看到暗號詞。

## 功能

- 關主上傳圖片，自動切成拼圖並打散
- 可設定低 2x2、中 3x3、高 4x4 難易度
- 可設定不限時、3 分鐘、5 分鐘、10 分鐘或自訂秒數
- 每個難易度都有步數提示，移動太多步會出現小提示
- 建立後產生房號，關主可複製到社群
- 闖關者輸入房號進入個人拼圖，不會看到其他玩家進度
- 完成拼圖後顯示「恭喜闖關成功」與關主設定的暗號詞

## 難易度與提示步數

| 難易度 | 拼圖大小 | 第一次提示 | 第二次提示 |
| --- | --- | ---: | ---: |
| 低 | 2 x 2 | 超過 8 步 | 超過 14 步 |
| 中 | 3 x 3 | 超過 22 步 | 超過 36 步 |
| 高 | 4 x 4 | 超過 45 步 | 超過 70 步 |

## 操作優化

新版拼圖盤已改成「格子只建立一次，交換時只更新兩格」，避免每移動一次就重建整個拼圖盤。圖片上傳時也會自動壓縮到適合遊戲的尺寸，讓手機和瀏覽器操作更順。

## 社群介紹文

可直接複製貼上的社群介紹文字放在 [`SOCIAL_POST.md`](SOCIAL_POST.md)。

## 本機執行

需要 Node.js 18 以上。

```bash
npm start
```

開啟：

```text
http://localhost:3000
```

## 測試

單元測試：

```bash
npm test
```

完整 3 回合瀏覽器試玩測試：

```bash
node scripts/three-round-playtest.js
```

拼圖移動壓力測試：

```bash
node scripts/movement-stress-test.js
```

瀏覽器試玩與壓力測試需要本機有 Playwright 與 Chrome 或 Edge；一般部署到 Render 不需要 Playwright。

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
