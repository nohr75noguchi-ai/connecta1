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

// note.com RSSプロキシ（GET）
function doGet() {
  try {
    var res  = UrlFetchApp.fetch('https://note.com/' + NOTE_USERNAME + '/rss');
    var doc  = XmlService.parse(res.getContentText());
    var ns   = XmlService.getNamespace('media', 'http://search.yahoo.com/mrss/');
    var items = doc.getRootElement().getChild('channel').getChildren('item');

    var data = items.slice(0, 6).map(function(item) {
      var thumb = '';
      var candidates = [
        item.getChild('thumbnail', ns),
        item.getChild('content', ns),
        item.getChild('enclosure')
      ];
      for (var i = 0; i < candidates.length; i++) {
        if (candidates[i]) {
          var attr = candidates[i].getAttribute('url');
          if (attr) { thumb = attr.getValue(); break; }
        }
      }
      return {
        title: item.getChildText('title'),
        link:  item.getChildText('link'),
        date:  item.getChildText('pubDate'),
        thumb: thumb
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
