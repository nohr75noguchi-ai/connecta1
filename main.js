let currentPage=0;
function goPage(n){document.querySelectorAll('.page').forEach((p,i)=>p.classList.toggle('active',i===n));currentPage=n;window.scrollTo(0,0);document.querySelectorAll('.nav-links a,.nav-mobile a').forEach(a=>a.classList.toggle('active',parseInt(a.dataset.page)===n));document.getElementById('navMobile').classList.remove('open');updateNav();setTimeout(()=>{initFadeIn();drawPentaLines()},50)}
function toggleMobile(){document.getElementById('navMobile').classList.toggle('open')}
window.addEventListener('scroll',updateNav);
function updateNav(){document.getElementById('mainNav').classList.toggle('scrolled',currentPage!==0||window.scrollY>40)}
function initFadeIn(){const obs=new IntersectionObserver(es=>{es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')})},{threshold:.12});document.querySelectorAll('.page.active .fade-in:not(.visible)').forEach(el=>obs.observe(el))}
document.addEventListener('DOMContentLoaded',initFadeIn);
function svgIcon(id,sz){return '<span class="ico"><svg width="'+sz+'" height="'+sz+'"><use href="#'+id+'"/></svg></span>'}
const issueData=[
  {icoId:'ico-people',color:'#3b82f6',title:'「交流」の課題',subtitle:'個人同士が出会い協働する“場”が設計不十分',desc:'在留外国人と日本人の間には、継続的な交流を妨げる3つの壁が存在。「イベントに行っても写真だけで終わる」「連絡先を交換しても関係が続かない」という状態を生んでいる。',
   walls:[{icoId:'ico-speech',name:'言語の壁',desc:'授業以外での会話量が不足し、実践経験が積めない。'},{icoId:'ico-ticket',name:'機会の壁',desc:'継続的な交流機会が少なく接点がない。単発イベントでは深い関係が築けない。'},{icoId:'ico-heart',name:'心の壁',desc:'互いに心理的負担があり深い関係に踏み込めない。'}]},
  {icoId:'ico-doc',color:'#22c55e',title:'「情報」の課題',subtitle:'情報の取得〜行動までの流れが不十分',desc:'在留外国人が日本で生活する上で必要な情報へのアクセスが、4つの段階で途切れている。',
   walls:[{icoId:'ico-search',name:'情報取得',desc:'分散した情報源のなかで一次情報を見つけられない。'},{icoId:'ico-book',name:'情報理解',desc:'難解な行政用語や長文で判断分岐が不明。'},{icoId:'ico-bolt',name:'情報活用',desc:'手続きが複雑でパーソナライズされず行動に繋がらない。'},{icoId:'ico-megaphone',name:'情報発信',desc:'発信側のフォーマットが不統一で利用者の声が反映されない。'}]},
  {icoId:'ico-pillars',color:'#a855f7',title:'「環境」の課題',subtitle:'鎖国的コミュニティ拡大と対立の激化',desc:'在留外国人の急増に対して、受け入れ側の体制整備が追いついていない。その結果、外国人コミュニティの孤立化と既住民との摩擦が深刻化。',
   walls:[{icoId:'ico-office',name:'自治体の受け入れ態勢未整備',desc:'在留外国人の急増に制度・運用・人材整備が追いつかない。'},{icoId:'ico-lock',name:'コミュニティの孤立化',desc:'交流不足で鎖国的コミュニティとなり既住民との対立を招く。'}]}
];
function openIssue(i){const d=issueData[i];
  document.getElementById('issueModalHeader').innerHTML='<div class="modal-icon" style="background:'+d.color+'14;color:'+d.color+'">'+svgIcon(d.icoId,24)+'</div><div><h3 style="color:'+d.color+'">'+d.title+'</h3><div class="subtitle">'+d.subtitle+'</div></div>';
  document.getElementById('issueModalBody').innerHTML='<p>'+d.desc+'</p><div class="modal-walls">'+d.walls.map(w=>'<div class="modal-wall"><span class="ico" style="color:'+d.color+'"><svg width="18" height="18"><use href="#'+w.icoId+'"/></svg></span><div><div class="wall-name">'+w.name+'</div><div class="wall-desc">'+w.desc+'</div></div></div>').join('')+'</div>';
  document.getElementById('issueModal').classList.add('open');document.body.style.overflow='hidden'}
function closeIssue(e){if(e&&e.target!==document.getElementById('issueModal'))return;document.getElementById('issueModal').classList.remove('open');document.body.style.overflow=''}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeIssue()});

// ─── Pentagon business detail ───
const bizData=[
  {name:'International Friendship Tour',color:'#3b82f6',seg:'交流推進事業',segBg:'rgba(59,130,246,.1)',desc:'日本人と在留外国人の二日間型交流イベント。行動経済学に基づき開催日を2日に分け、参加費500円の低価格で深い関係構築を実現。1日目は座談会「connec+aトーク」、2日目は日帰り観光。'},
  {name:'Ordermade',color:'#475569',seg:'交流推進事業',segBg:'rgba(71,85,105,.1)',desc:'日本語学校向けにカスタマイズした交流プランを企画設計から実行まで一貫提供。OM Culture（文化）・OM Education（教育）・OM Sports（スポーツ）の3パッケージ。非営利のため低価格。'},
  {name:'connec+a community',color:'#0ea5e9',seg:'交流推進事業',segBg:'rgba(14,165,233,.1)',desc:'イベント終了後も継続的な交流の場を提供。Discordベースのオンラインプラットフォームでチャット・オンラインイベント・サークル活動を助成し、"熱量の蒸発"を阻止。'},
  {name:'connec+a hub',color:'#22c55e',seg:'情報PF事業',segBg:'rgba(34,197,94,.1)',desc:'生活情報からイベント情報まで掲載する包括的デジタルプラットフォーム。多層タグ横断検索、3層言語表示（原文・やさしい日本語・多言語）、AIエージェント伴走による申請ナビ機能を搭載。'},
  {name:'Public Affairs',color:'#e8912e',seg:'公共コンサル事業',segBg:'rgba(232,145,46,.1)',desc:'自治体向けコンサルティングサービス。Hub行動ログ×住民インサイトで地域課題マップを作成し、IF/CC/OM/hubと連動した小規模実証→学習→展開の循環を確立。'}
];
let activeBiz=-1;
function showBiz(i){
  const d=bizData[i];const el=document.getElementById('bizDetail');
  if(activeBiz===i){el.classList.remove('active');activeBiz=-1;return}
  activeBiz=i;
  el.innerHTML='<h4 style="color:'+d.color+'">'+d.name+'</h4><span class="seg-tag" style="background:'+d.segBg+';color:'+d.color+'">'+d.seg+'</span><p>'+d.desc+'</p>';
  el.classList.add('active');
  el.scrollIntoView({behavior:'smooth',block:'nearest'});
}
// Draw lines from center to each node
function drawPentaLines(){
  const w=document.getElementById('pentaWrap');if(!w||w.offsetWidth<100)return;
  w.querySelectorAll('.penta-line').forEach(l=>l.remove());
  const nodes=Array.from(w.querySelectorAll('.penta-node'));
  if(nodes.length<2)return;
  for(let i=0;i<nodes.length;i++){
    const j=(i+1)%nodes.length;
    const ax=nodes[i].offsetLeft,ay=nodes[i].offsetTop;
    const bx=nodes[j].offsetLeft,by=nodes[j].offsetTop;
    const dx=bx-ax,dy=by-ay,len=Math.sqrt(dx*dx+dy*dy),ang=Math.atan2(dy,dx)*180/Math.PI;
    const line=document.createElement('div');line.className='penta-line';
    line.style.width=len+'px';
    line.style.left=ax+'px';line.style.top=ay+'px';
    line.style.transform='rotate('+ang+'deg)';
    w.appendChild(line);
  }
}
window.addEventListener('load',drawPentaLines);
window.addEventListener('resize',drawPentaLines);

// ─── GAS endpoint ───────────────────────────────────────────────────────────
// GASをデプロイしたら下記のURLを差し替えてください
const GAS_URL='https://script.google.com/macros/s/AKfycbzohYTHmvQ2t3wx1CwU8geHGqzEhNQ5VljXEYZzits51X3ewJIiWj02VBwMNxC_zQZs/exec';

// ─── お知らせ（GAS スプレッドシート連携）────────────────────────────────────
async function loadNews(){
  const list=document.getElementById('newsList');
  if(!list)return;
  if(!GAS_URL||GAS_URL==='YOUR_GAS_DEPLOY_URL'){
    list.innerHTML='<p style="color:var(--text-muted);font-size:15px;padding:16px 0">お知らせはありません</p>';
    return;
  }
  try{
    const items=await fetch(GAS_URL+'?type=news').then(r=>r.json());
    if(!items.length){list.innerHTML='<p style="color:var(--text-muted);font-size:15px;padding:16px 0">お知らせはありません</p>';return;}
    list.innerHTML=items.map(n=>`
      <div class="news-item">
        <span class="news-date">${n.date}</span>
        <span class="news-cat cat-${n.category}">${n.category}</span>
        ${n.link?`<a href="${n.link}" target="_blank" rel="noopener">${n.title}</a>`:`<span>${n.title}</span>`}
      </div>`).join('');
  }catch(e){list.innerHTML='<p style="color:var(--text-muted);font-size:15px;padding:16px 0">お知らせを読み込めませんでした</p>';}
}
document.addEventListener('DOMContentLoaded',loadNews);

// ─── note記事 ────────────────────────────────────────────────────────────────
async function loadNoteArticles(){
  if(!GAS_URL||GAS_URL==='YOUR_GAS_DEPLOY_URL')return;
  const sec=document.getElementById('noteSection');
  const grid=document.getElementById('noteGrid');
  if(!sec||!grid)return;
  try{
    const articles=await fetch(GAS_URL).then(r=>r.json());
    if(!articles.length)return;
    sec.style.display='';
    grid.innerHTML=articles.map(a=>`
      <div class="note-card fade-in visible">
        <a href="${a.link}" target="_blank" rel="noopener">
          <div class="note-thumb"${a.thumb?` style="background-image:url('${a.thumb}')"`:''}></div>
          <div class="note-body">
            <p class="note-title">${a.title}</p>
            <span class="note-date">${new Date(a.date).toLocaleDateString('ja-JP')}</span>
          </div>
        </a>
      </div>`).join('');
  }catch(e){}
}
document.addEventListener('DOMContentLoaded',loadNoteArticles);

// ─── お問い合わせフォーム ────────────────────────────────────────────────────
async function submitContact(e){
  e.preventDefault();
  if(!GAS_URL||GAS_URL==='YOUR_GAS_DEPLOY_URL'){
    showContactMsg('GAS_URLが未設定です。main.jsのGAS_URLを設定してください。','error');
    return;
  }
  const btn=document.getElementById('cfSubmitBtn');
  const form=e.target;
  btn.disabled=true;btn.textContent='送信中...';
  const body={
    name:form.name.value.trim(),
    email:form.email.value.trim(),
    subject:form.subject.value.trim(),
    message:form.message.value.trim()
  };
  try{
    const res=await fetch(GAS_URL,{method:'POST',body:JSON.stringify(body)});
    const data=await res.json();
    if(data.status==='ok'){
      form.reset();
      showContactMsg('お問い合わせを受け付けました。ありがとうございます。','success');
    }else{throw new Error();}
  }catch(err){
    showContactMsg('送信に失敗しました。しばらく経ってから再度お試しください。','error');
  }finally{
    btn.disabled=false;btn.textContent='送信する';
  }
}
function showContactMsg(text,type){
  const el=document.getElementById('contactMsg');
  el.textContent=text;
  el.className=type==='success'?'contact-success':'contact-error';
  el.style.display='block';
}
