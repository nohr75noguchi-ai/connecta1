/**
 * connec+a GAS Web App
 *
 * 【スプレッドシート構成】
 * シート名「お知らせ」を作成し、1行目をヘッダーにする。
 * A列: 日付     例）2026/06/26  ※Googleスプレッドシートの日付セル可
 * B列: カテゴリ  例）イベント / メディア / 採用 / お知らせ
 * C列: タイトル  例）〇〇イベント開催のお知らせ
 * D列: URL     例）https://... （任意。空欄可）
 *
 * 【デプロイ手順】
 * 1. https://script.google.com で新規プロジェクト作成
 * 2. このファイルの内容を貼り付ける
 * 3. CONTACT_EMAIL / NOTE_USERNAME を書き換える
 * 4. スプレッドシートIDをスクリプトプロパティに登録する（下記参照）
 * 5. 「デプロイ」→「新しいデプロイ」→ 種類：ウェブアプリ
 *    実行ユーザー：自分、アクセス：全員 に設定して「デプロイ」
 * 6. 発行されたURLを main.js の GAS_URL に貼り付けてコミット
 *
 * 【スプレッドシートIDの登録方法】
 * このリポジトリは public のため、IDをコードに直接書かずスクリプトプロパティで管理する。
 * 1. スプレッドシートのURL
 *      https://docs.google.com/spreadsheets/d/【ここがID】/edit
 *    からIDをコピーする。
 * 2. GASエディタ左下の「⚙ プロジェクトの設定」を開く。
 * 3. 「スクリプト プロパティ」→「スクリプト プロパティを追加」で
 *      プロパティ: SPREADSHEET_ID
 *      値        : コピーしたID
 *    を登録して保存する。
 *
 * ※IDは秘密鍵ではないため、これだけでは防御として不十分。
 *   スプレッドシート側の共有設定が「リンクを知っている全員が閲覧可」に
 *   なっていないことを Google Drive 上で必ず確認すること。
 */

// ▼ ここを書き換えてください ▼
var CONTACT_EMAIL = 'connecta.official@gmail.com';
var NOTE_USERNAME = 'connecta2022';

// ─── お問い合わせの制限値 ───────────────────────────────────────────────────
var MAX_LENGTHS = { name: 100, email: 254, subject: 200, message: 5000 };
var HOURLY_SEND_LIMIT = 10; // 1時間あたりの送信上限（Gmailの送信数上限を守るため）

// ─── ルーティング ───────────────────────────────────────────────────────────
function doGet(e) {
  var type = e.parameter.type;
  if (type === 'news') {
    return getNews();
  }
  return getNoteArticles();
}

// ─── お知らせ（スプレッドシートから取得）────────────────────────────────────
function getNews() {
  try {
    var id = PropertiesService.getScriptProperties().getProperty('SPREADSHEET_ID');
    if (!id) return respond([]); // 未設定時は安全に空で返す

    var ss = SpreadsheetApp.openById(id);
    var sheet = ss.getSheetByName('お知らせ');
    if (!sheet) return respond([]);

    var rows = sheet.getDataRange().getValues();
    // 1行目はヘッダーなのでスキップ
    var data = rows.slice(1)
      .filter(function (r) { return r[0] && r[2]; }) // 日付・タイトルが空の行は除外
      .map(function (r) {
        var raw = r[0];
        var dateObj = null;
        if (raw instanceof Date) {
          dateObj = raw;
        } else {
          // 文字列でも日付として解釈できる場合（例: "2026/7/11"）は Date に変換する
          var parsed = new Date(raw);
          if (!isNaN(parsed.getTime())) dateObj = parsed;
        }
        var dateText, sortKey;
        if (dateObj) {
          dateText = Utilities.formatDate(dateObj, 'Asia/Tokyo', 'yyyy年M月d日');
          sortKey  = Utilities.formatDate(dateObj, 'Asia/Tokyo', 'yyyyMMdd'); // 並び替え用（ゼロ埋め）
        } else {
          // 解釈できない文字列（既に「2026年7月11日」のように整形済みなど）はそのまま使用
          dateText = String(raw).trim();
          sortKey  = dateText;
        }
        return {
          date: dateText,
          sortKey: sortKey,
          category: String(r[1] || 'お知らせ').trim(),
          title: String(r[2]).trim(),
          link: String(r[3] || '').trim()
        };
      });

    // 日付の降順（新しい順）に並び替え
    data.sort(function (a, b) { return b.sortKey.localeCompare(a.sortKey); });
    data.forEach(function (d) { delete d.sortKey; });

    return respond(data);
  } catch (err) {
    return respond([]);
  }
}

// ─── note.com 記事（既存）────────────────────────────────────────────────────
function getNoteArticles() {
  try {
    var res = UrlFetchApp.fetch('https://note.com/api/v2/creators/' + NOTE_USERNAME + '/contents?kind=note&page=1');
    var json = JSON.parse(res.getContentText());
    var items = json.data.contents;

    var data = items.slice(0, 6).map(function (item) {
      return {
        title: item.name,
        link: 'https://note.com/' + NOTE_USERNAME + '/n/' + item.key,
        date: item.publishAt,
        thumb: item.eyecatch || ''
      };
    });

    return respond(data);
  } catch (err) {
    return respond([]);
  }
}

// ─── お問い合わせフォーム受信（POST）────────────────────────────────────────
function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return respond({ status: 'error', message: 'リクエストが不正です' });
    }
    var p = JSON.parse(e.postData.contents);

    // ハニーポット: botだけが埋める項目。埋まっていたら送信せず成功を装う
    if (str(p.website)) return respond({ status: 'ok' });

    var name = str(p.name);
    var email = str(p.email);
    var subject = str(p.subject);
    var message = str(p.message);

    if (!name || !email || !subject || !message) {
      return respond({ status: 'error', message: '必須項目が入力されていません' });
    }
    if (name.length > MAX_LENGTHS.name || email.length > MAX_LENGTHS.email ||
        subject.length > MAX_LENGTHS.subject || message.length > MAX_LENGTHS.message) {
      return respond({ status: 'error', message: '入力が長すぎます' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return respond({ status: 'error', message: 'メールアドレスの形式が正しくありません' });
    }
    if (!withinSendLimit()) {
      return respond({ status: 'error', message: '混み合っています。時間をおいて再度お試しください' });
    }

    GmailApp.sendEmail(
      CONTACT_EMAIL,
      // 件名の改行はヘッダインジェクションの経路になるため除去する
      '【connec+a お問い合わせ】' + subject.replace(/[\r\n]+/g, ' '),
      'お名前: ' + name + '\nメール: ' + email + '\n\n' + message
    );
    return respond({ status: 'ok' });
  } catch (err) {
    return respond({ status: 'error', message: String(err) });
  }
}

function str(v) {
  return String(v == null ? '' : v).trim();
}

// 1時間あたりの送信数を制限する。
// GASのdoPostはクライアントIPを取得できないため、IP単位ではなく全体の流量で制限する。
function withinSendLimit() {
  var cache = CacheService.getScriptCache();
  var key = 'contact_' + Utilities.formatDate(new Date(), 'Asia/Tokyo', 'yyyyMMddHH');
  var count = Number(cache.get(key) || 0);
  if (count >= HOURLY_SEND_LIMIT) return false;
  cache.put(key, String(count + 1), 3600);
  return true;
}

// ─── レスポンスヘルパー ───────────────────────────────────────────────────────
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
