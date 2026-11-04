# ことはな訪問看護ステーション 正式公開版 v2

パンフレットの正式情報・ロゴ・医師写真・LINE QR・ブランドカラーを反映した公開用静的サイトです。

## 公開URL

https://kanaimedicalc-create.github.io/kotohana-website/

## 反映済み
- TEL 098-995-7448 / FAX 098-995-7045
- 電話対応 9:00-17:00
- メール kotohanahoukan7448@yahoo.co.jp
- 〒901-0417 八重瀬町外間153-3 102号
- 訪問エリア: 那覇市 / 南風原町 / 八重瀬町 / 豊見城市 / 糸満市
- 介護保険事業所番号 4761390840
- 24時間365日対応
- 医師連携、WOC認定看護師、特定行為、退院支援、認知症、指定難病、ターミナル、リハビリ
- LINE QRとリンク
- Instagramリンク
- note最新記事の自動表示（いろのわ@千葉）
- 運営規程・重要事項説明書のダウンロード
- 個人情報保護方針

## 公開前に確認推奨
- 独自ドメイン
- OGP画像の絶対URL化
- Google Search Console / Google Business Profile
- Instagram API自動表示（Meta認証が必要）

## 2026-09-04 更新
- スタッフ集合写真をトップビジュアルへ追加
- 医療DXを「ことはなの違い」の5番目として追加
- オンライン資格確認・診療情報/薬剤情報活用の説明を追加
- `medical-dx.html`（訪問看護医療DX情報活用加算に係る正式掲示）を追加
- 個人情報保護方針に医療DX・オンライン資格確認の項目を追加
- 訪問看護医療DX情報活用加算 50円/月を掲載

## 2026-11-04 更新
- noteへの導線をトップ・資料欄・フッターに追加
- 「情報・資料」セクションを追加
- `downloads/kotohana-operating-regulations.docx`（運営規程）を掲載
- `downloads/kotohana-important-information.docx`（重要事項説明書）を掲載
- noteの最新記事を画像・公開日・タイトル・概要付きで表示
- GitHub Actionsでnote RSSを6時間ごとに確認し、新しい記事があれば自動更新

### 資料の更新方法
更新したWordファイルを、上記と同じファイル名で `downloads/` フォルダへ差し替えると、ホームページのリンクを変更せずに最新版へ更新できます。

### noteの自動更新
`scripts/fetch-note.mjs` が `https://note.com/dementiacom/rss` を読み込み、`assets/note-feed.json` を更新します。GitHub Actionsの `Update note feed` は6時間ごとに実行されます。ログイン情報やAPIキーの登録は不要です。
