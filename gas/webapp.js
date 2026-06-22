/**
 * connec+a GAS Web App
 *
 * 【デプロイ手順】
 * 1. https://script.google.com で新規プロジェクト作成
 * 2. このファイルの内容を貼り付ける
 * 3. CONTACT_EMAIL と NOTE_USERNAME を実際の値に書き換える
 * 4. 「デプロイ」→「新しいデプロイ」→ 種類：ウェブアプリ
 *    実行ユーザー：自分、アクセス：全員 に設定して「デプロイ」
 * 5. 発行されたURLを main.js の GAS_URL に貼り付けてコミット
 */

// ▼ ここを書き換えてください ▼
var CONTACT_EMAIL = 'connecta.official@gmail.com';
var NOTE_USERNAME  = 'connecta2022';

// お問い合わせフォーム受信（POST）
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

// note.com APIプロキシ（GET）
function doGet() {
  try {
    var res  = UrlFetchApp.fetch('https://note.com/api/v2/creators/' + NOTE_USERNAME + '/contents?kind=note&page=1');
    var json = JSON.parse(res.getContentText());
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

function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
