# AGI4SCM の LP（宣伝用ページ）

AGI4SCM（サプライチェーンのための汎用人工知能）を紹介するページです。
文言は講演資料「MOAI Lab 紹介 @東京海洋大発ベンチャー講演会」（agi4opt-海洋大講演.pdf）と `agi4scm-manual/` から取りました。
ダッシュボードの画像は `agi4scm-manual/figures/` の画像で、どれも例題データから作ったものです。
HTML・CSS・JS だけの静的なページなので、ビルドは要りません。

| ファイル | 中身 |
|---|---|
| `index.html` | ページ本体 |
| `style.css` | 見た目。依頼文は明朝体（Shippori Mincho B1）、本文は BIZ UDPGothic |
| `main.js` | ヒーローで依頼文を打ち込む動き、依頼文ギャラリーのタブ、問い合わせフォームの送信 |
| `privacy.html` | 個人情報の取り扱い（フォームの同意欄とフッターから開く） |
| `form-backend/Code.gs` | フォームの受け口（Google Apps Script）。内容を sales@moai-lab.jp へメールで転送する |
| `form-backend/appsscript.json` | 受け口の設定（タイムゾーン・権限・ウェブアプリの公開範囲） |
| `assets/*.jpg` | MCP サーバー 11 本分のダッシュボード画像（`dynamic-vrp.jpg` は今は使っていない） |

## 構成

ヒーロー（依頼文を打ち込むと、そのダッシュボードに切り替わる）→ 対応分野 → 使い方の 4 ステップ →
汎用 AI との比較 → 依頼文と返ってきたページ（11 例）→ 提供形態（アシスタント／クラウド）→
安全性（MOAI クラウド）→ Skills on MCP → 問い合わせフォーム。

- 幅 375px（スマホ）と 1280px で表示を確かめました。
- `prefers-reduced-motion` が有効なときは、打ち込みの動きとカーソルの点滅を止めます。
- 実装の名前（ソルバー名・ライブラリ名）はページに出していません。

## フォームの受け口を配備する

この受け口は、MOAI AGI Suite のページ（`../index.html`）と AGI4OPT のページ（`../agi4opt/index.html`）のフォームでも共用します。
3 ページとも `<form id="lead-form" data-endpoint="">` に同じ URL を入れてください。件名の `[AGI4SCM LP]` の部分は、送信元のページに合わせて `[AGI4OPT LP]`・`[MOAI AGI Suite LP]` に変わります。

フォームの内容は、Google Apps Script のウェブアプリが受け取り、**sales@moai-lab.jp** へメールで転送します
（moai-lab.jp のメールは Google Workspace なので、同じアカウントで動かせます）。
受け口は内容を検証し、隠し欄によるボット避け、同じアドレスからの 1 分以内の連投、1 時間 60 件を超える受付を断ります。

1. moai-lab.jp の Google アカウントで <https://script.google.com/> を開き、「新しいプロジェクト」を作る（名前は「AGI4SCM LP フォーム」など）。
2. `コード.gs` の中身を `form-backend/Code.gs` で置き換える。
   「プロジェクトの設定」で「appsscript.json マニフェスト ファイルをエディタで表示する」をオンにし、`appsscript.json` も置き換える。
3. エディタで関数 `testSend` を選んで実行する。初回は権限の承認を求められるので許可する。sales@moai-lab.jp にテストのメールが届けば成功。
4. 「デプロイ」→「新しいデプロイ」→ 種類「ウェブアプリ」。**次のユーザーとして実行**は「自分」、**アクセスできるユーザー**は「全員」にしてデプロイする。
5. 表示されたウェブアプリの URL（`https://script.google.com/macros/s/…/exec`）を、`index.html` の `<form id="lead-form" data-endpoint="">` に入れる。
6. 公開したページからフォームを 1 回送り、sales@moai-lab.jp に届くことを確かめる。

- 届くメールの件名は `[AGI4SCM LP] 資料請求：会社名 お名前 様` の形です。返信すると、お客様のアドレスに届きます。
- 記録をスプレッドシートにも残すなら、`Code.gs` の `SHEET_ID` にスプレッドシートの ID を入れて、もう一度デプロイしてください。
- `Code.gs` を直したら、「デプロイを管理」→ 編集 →「新しいバージョン」で更新してください。URL は変わりません。
- `data-endpoint` が空のあいだは、送信ボタンを押すと sales@moai-lab.jp へメールで問い合わせるよう案内が出ます。

## 公開の前にすること

1. **フォームの受け口を配備する**（上の手順）。
2. **置き場所**は `https://agi.moai-lab.jp/agi4scm/` を前提にしています（リポジトリの直下が `https://agi.moai-lab.jp/`）。別の場所に置くなら、`index.html` と `privacy.html` の `canonical`、`index.html` の `og:url`・`og:image` を直してください。suite（`../index.html`・`../privacy.html`）と AGI4OPT（`../agi4opt/`）も同じです。
3. **個人情報の取り扱い（`privacy.html`）を確かめる。** 全社の[プライバシーポリシー](https://www.moai-lab.jp/about/privacy-policy)と会社概要（所在地・代表者）をもとに書き、
   このフォームで実際に起きること（Google Workspace での保管、Cookie を使わないこと）を足しました。
   「取り扱いの委託」と「安全管理」は当社の約束になる部分なので、社内で確認してください。
4. **確かめてほしい文言**（講演資料から読み取ったもので、裏づけは取れていません）
   - 「数百品目・数百拠点の実務規模でも解を返す」
   - 資料請求の PDF が実際にあるか

## 手元で見る

```bash
python3 -m http.server 8313 --directory agi4scm
```
