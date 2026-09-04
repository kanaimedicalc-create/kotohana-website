# Instagram自動表示の初期設定

このサイトは、GitHub ActionsがInstagram公式APIから最新6件を取得し、`assets/instagram-feed.json`だけを更新します。アクセストークンは公開ファイルやブラウザには出ません。

## Meta側（初回のみ）

1. Meta for Developersでアプリを作成します。
2. `@kotohana.houkan`をプロアカウント（ビジネスまたはクリエイター）にします。
3. Instagram APIを追加し、対象アカウントのメディア読み取り権限を設定します。
4. 運用停止を避けるため、可能ならMeta Business Portfolioのシステムユーザー用トークンを利用します。

## GitHub側（初回のみ）

Repository settings → Secrets and variables → Actions で次を登録します。

- Secret `INSTAGRAM_ACCESS_TOKEN`: Instagram APIのアクセストークン
- Secret `INSTAGRAM_USER_ID`: InstagramプロアカウントのID
- Variable `INSTAGRAM_API_VERSION`: 例 `v25.0`（未設定時も`v25.0`）
- Variable `INSTAGRAM_GRAPH_BASE_URL`: Instagram Loginなら`https://graph.instagram.com`、Facebook Loginなら`https://graph.facebook.com`

登録後、Actions → Update Instagram feed → Run workflow を1回実行します。その後は6時間ごとに確認し、新しい投稿があるときだけサイトデータを更新します。取得失敗時は既存データを保持します。
