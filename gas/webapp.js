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
 * 3. CONTACT_EMAIL / NOTE_USERNAME / SPREADSHEET_ID を書き換える
 * 4. 「デプロイ」→「新しいデプロイ」→ 種類：ウェブアプリ
 *    実行ユーザー：自分、アクセス：全員 に設定して「デプロイ」
 * 5. 発行されたURLを main.js の GAS_URL に貼り付けてコミット
 *
 * 【スプレッドシートIDの確認方法】
 * スプレッドシートのURLが
 *   https://docs.google.com/spreadsheets/d/【ここがID】/edit
 * の形式なので、その部分をコピーして SPREADSHEET_ID に貼り付ける。
 */

// ▼ ここを書き換えてください ▼
var CONTACT_EMAIL  = 'connecta.official@gmail.com';
var NOTE_USERNAME  = 'connecta2022';
var SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // スプレッドシートのIDを貼り付け

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
    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName('お知らせ');
    if (!sheet) return respond([]);

    var rows = sheet.getDataRange().getValues();
    // 1行目はヘッダーなのでスキップ
    var data = rows.slice(1)
      .filter(function(r) { return r[0] && r[2]; }) // 日付・タイトルが空の行は除外
      .map(function(r) {
        var date = r[0];
        // セルが Date 型の場合は整形、文字列の場合はそのまま使用
        if (date instanceof Date) {
          date = Utilities.formatDate(date, 'Asia/Tokyo', 'yyyy/MM/dd');
        } else {
          date = String(date).trim();
        }
        return {
          date:     date,
          category: String(r[1] || 'お知らせ').trim(),
          title:    String(r[2]).trim(),
          link:     String(r[3] || '').trim()
        };
      });

    // 日付の降順（新しい順）に並び替え
    data.sort(function(a, b) { return b.date.localeCompare(a.date); });

    return respond(data);
  } catch (err) {
    return respond([]);
  }
}

// ─── note.com 記事（既存）────────────────────────────────────────────────────
function getNoteArticles() {
  try {
    var res   = UrlFetchApp.fetch('https://note.com/api/v2/creators/' + NOTE_USERNAME + '/contents?kind=note&page=1');
    var json  = JSON.parse(res.getContentText());
    var items = json.data.contents;

    var data = items.slice(0, 6).map(function(item) {
      return {
        title: item.name,
        link:  'https://note.com/' + NOTE_USERNAME + '/n/' + item.key,
        date:  item.publishAt,
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
    var p = JSON.parse(e.postData.contents);
    GmailApp.sendEmail(
      CONTACT_EMAIL,
      '【connec+a お問い合わせ】' + p.subject,
      'お名前: ' + p.name + '\nメール: ' + p.email + '\n\n' + p.message
    );
    return respond({ status: 'ok' });
  } catch (err) {
    return respond({ status: 'error', message: String(err) });
  }
}

// ─── レスポンスヘルパー ───────────────────────────────────────────────────────
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
