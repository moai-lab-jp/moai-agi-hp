/**
 * MOAI AGI Suite の LP（suite・AGI4OPT・AGI4SCM）のお問い合わせフォームの受け口（Google Apps Script のウェブアプリ）。
 * 3 ページで同じ受け口を使い、隠し欄 page の値でどのページから来たかを区別する。
 *
 * LP のフォームから application/x-www-form-urlencoded で POST された内容を検証し、
 * sales@moai-lab.jp へメールで転送する。SHEET_ID を入れると、スプレッドシートにも 1 行ずつ残す。
 * 返すのは JSON（{ ok: true } か { ok: false, error: "..." }）。
 *
 * 配備の手順は ../README.md の「フォームの受け口を配備する」を参照。
 */

const TO = 'sales@moai-lab.jp';
const SENDER_NAME = 'MOAI AGI Suite LP フォーム';
const SHEET_ID = '';            // 記録を残すスプレッドシートの ID（空なら残さない）
// page の値 → メールの件名・本文に出す名前
const PAGE_LABELS = { 'agi4scm': 'AGI4SCM', 'agi4opt': 'AGI4OPT', 'moai-agi-suite': 'MOAI AGI Suite' };
const HOURLY_LIMIT = 60;         // 1 時間あたりの受付上限（スパムの洪水よけ）

const TYPE_LABELS = { document: '資料請求', contact: '相談' };
const FIELDS = [
  ['inquiry_type', 'ご用件'],
  ['company', '会社名'],
  ['department', '部署・役職'],
  ['name', 'お名前'],
  ['email', 'メールアドレス'],
  ['area', '関心のある分野'],
  ['message', 'ご質問・ご相談の内容'],
  ['page', 'ページ'],
  ['utm', '参照元'],
];

function doPost(e) {
  try {
    const p = (e && e.parameter) || {};

    // ボット避け: 隠し欄に何か入っていたら、送ったふりをして捨てる。
    if (p.website) return json_({ ok: true });

    const d = {};
    FIELDS.forEach(function (f) { d[f[0]] = clean_(p[f[0]], f[0] === 'message' ? 4000 : 200, f[0] === 'message'); });
    d.consent = clean_(p.consent, 10, false);

    if (!Object.prototype.hasOwnProperty.call(PAGE_LABELS, d.page)) return json_({ ok: false, error: 'invalid' });
    if (!TYPE_LABELS[d.inquiry_type]) return json_({ ok: false, error: 'invalid' });
    if (!d.company || !d.name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return json_({ ok: false, error: 'invalid' });
    if (d.consent !== 'yes') return json_({ ok: false, error: 'consent' });

    // 同じアドレスからの連打と、全体の洪水を止める。
    const cache = CacheService.getScriptCache();
    const emailKey = 'e:' + d.email.toLowerCase();
    if (cache.get(emailKey)) return json_({ ok: false, error: 'too_many' });
    const hourKey = 'h:' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMddHH');
    const count = Number(cache.get(hourKey) || 0);
    if (count >= HOURLY_LIMIT) return json_({ ok: false, error: 'too_many' });
    cache.put(emailKey, '1', 60);
    cache.put(hourKey, String(count + 1), 3600);

    const now = Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyy-MM-dd HH:mm:ss');
    const label = TYPE_LABELS[d.inquiry_type];
    const pageLabel = PAGE_LABELS[d.page];
    const lines = FIELDS.map(function (f) {
      const v = f[0] === 'inquiry_type' ? label : d[f[0]];
      return f[0] === 'message' ? '■ ' + f[1] + '\n' + (v || '（なし）') : '■ ' + f[1] + '：' + (v || '（なし）');
    });
    const body = [
      pageLabel + ' の LP から、お問い合わせが届きました。',
      'このメールに返信すると、お客様（' + d.email + '）に届きます。',
      '',
      '■ 受付日時：' + now,
    ].concat(lines).concat([
      '',
      '個人情報の取り扱いへの同意：あり',
    ]).join('\n');

    MailApp.sendEmail({
      to: TO,
      replyTo: d.email,
      name: SENDER_NAME,
      subject: '[' + pageLabel + ' LP] ' + label + '：' + d.company + ' ' + d.name + ' 様',
      body: body,
    });

    if (SHEET_ID) {
      SpreadsheetApp.openById(SHEET_ID).getSheets()[0].appendRow(
        [now].concat(FIELDS.map(function (f) { return f[0] === 'inquiry_type' ? label : d[f[0]]; }))
      );
    }

    return json_({ ok: true });
  } catch (err) {
    console.error(err);
    return json_({ ok: false, error: 'server' });
  }
}

// 動作確認用: ブラウザでウェブアプリの URL を開くと返る。
function doGet() {
  return json_({ ok: true, service: 'moai-agi-lp-form' });
}

// エディタから実行して、メールが届くかを確かめる（初回は権限の承認が求められる）。
function testSend() {
  const res = doPost({ parameter: {
    inquiry_type: 'contact', company: 'テスト株式会社', department: 'SCM 企画部',
    name: 'テスト 太郎', email: TO, area: '需要予測・在庫',
    message: 'これは受け口の動作確認です。', page: 'agi4scm', utm: '', consent: 'yes',
  } });
  console.log(res.getContent());
}

function clean_(v, max, multiline) {
  let s = String(v == null ? '' : v).trim();
  s = multiline ? s.replace(/\r\n?/g, '\n') : s.replace(/[\r\n\t]+/g, ' ');
  return s.slice(0, max);
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
