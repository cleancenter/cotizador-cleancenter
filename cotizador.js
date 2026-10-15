(function(){
'use strict';
var CFG=Object.assign({
  EMAIL_ENDPOINT:'',        // URL del Web App de Google Apps Script (ver LEEME)
  SHOW_HEADER_FOOTER:true,  // false en Webflow si el sitio ya trae header/footer
  LOAD_FONTS:true,          // carga Barlow Condensed + Inter desde Google Fonts
  LOGOS:[],                 // URLs de logos de clientes (franja animada). Vacío = no se muestra
  IMAGES:{},                // fotos: {'cat-aspiradoras':'url', 'sub-aspiradoras-verticales':'url'}
  MOUNT:'#cc-mount'
},window.CC_CONFIG||{});

var cs=document.currentScript,BASE='';
if(cs&&cs.src)BASE=cs.src.replace(/[^\/]*$/,'');
var A={logo:BASE+'assets/logo.png',logoW:BASE+'assets/logo-blanco.png',diagram:BASE+'assets/solucion-total.png',video:BASE+'assets/hero.mp4',poster:BASE+'assets/poster.jpg'};
Object.assign(A,CFG.ASSETS||{});
var IMG_DEFAULT={"cat-aspiradoras":"cat-aspiradoras.jpg","cat-lava":"cat-lava.jpg","cat-restregadoras":"cat-restregadoras.jpg","cat-rotativos":"cat-rotativos.jpg","cat-barredoras":"cat-barredoras.jpg","cat-control":"cat-control.jpg","sub-aspiradoras-verticales":"sub-aspiradoras-verticales.webp","sub-aspiradoras-h-medo-seco":"sub-aspiradoras-h-medo-seco.webp","sub-aspiradoras-canasta":"sub-aspiradoras-canasta.webp","sub-aspiradoras-mochila":"sub-aspiradoras-mochila.webp","sub-aspiradoras-hombre-atr-s":"sub-aspiradoras-hombre-atr-s.webp","sub-aspiradoras-hombre-a-bordo":"sub-aspiradoras-hombre-a-bordo.webp","sub-lava-desmanchado":"sub-lava-desmanchado.webp","sub-lava-encapsulado":"sub-lava-encapsulado.webp","sub-lava-extractor-mediano":"sub-lava-extractor-mediano.webp","sub-lava-extractor-grande":"sub-lava-extractor-grande.webp","sub-lava-hombre-atr-s":"sub-lava-hombre-atr-s.webp","sub-lava-hombre-a-bordo":"sub-lava-hombre-a-bordo.webp","sub-restregadoras-vertical":"sub-restregadoras-vertical.webp","sub-restregadoras--reas-reducidas":"sub-restregadoras--reas-reducidas.webp","sub-restregadoras-hombre-a-bordo":"sub-restregadoras-hombre-a-bordo.webp","sub-restregadoras-hombre-atr-s":"sub-restregadoras-hombre-atr-s.webp","sub-restregadoras-industriales":"sub-restregadoras-industriales.webp","sub-rotativos-pulidoras":"sub-rotativos-pulidoras.webp","sub-rotativos-burnisher":"sub-rotativos-burnisher.webp","sub-rotativos-orbitales":"sub-rotativos-orbitales.webp","sub-barredoras-mec-nicas":"sub-barredoras-mec-nicas.webp","sub-barredoras-hombre-atr-s":"sub-barredoras-hombre-atr-s.webp","sub-barredoras-hombre-a-bordo":"sub-barredoras-hombre-a-bordo.webp","sub-barredoras-industriales":"sub-barredoras-industriales.webp","sub-control-ctrl-de-humedad":"sub-control-ctrl-de-humedad.webp","sub-control-ctrl-de-olores":"sub-control-ctrl-de-olores.webp","sub-control-ctrl-de-chicles":"sub-control-ctrl-de-chicles.webp"};
function imgUrl(id){var u=(CFG.IMAGES||{})[id];if(u)return u;var f=IMG_DEFAULT[id];return f?BASE+'assets/img/'+f:''}

var CATS=[
 {id:'aspiradoras',name:'Aspiradoras',desc:'Para polvo y líquidos, en uso ligero o industrial.',subs:['Verticales','Húmedo / seco','Canasta','Mochila','Hombre atrás','Hombre a bordo']},
 {id:'lava',name:'Lava Alfombras',desc:'Extracción y lavado profundo de alfombras y tapicería.',subs:['Desmanchado','Encapsulado','Extractor mediano','Extractor grande','Hombre atrás','Hombre a bordo']},
 {id:'restregadoras',name:'Restregadoras',desc:'Lavan y secan pisos duros en una sola pasada.',subs:['Vertical','Áreas reducidas','Hombre a bordo','Hombre atrás','Industriales']},
 {id:'rotativos',name:'Rotativos',desc:'Pulido, abrillantado y mantenimiento de pisos.',subs:['Pulidoras','Burnisher','Orbitales']},
 {id:'barredoras',name:'Barredoras',desc:'Barrido de áreas amplias, interiores y exteriores.',subs:['Mecánicas','Hombre atrás','Hombre a bordo','Industriales']},
 {id:'control',name:'Control',desc:'Equipos de control para tu operación de limpieza.',subs:['Ctrl. de Humedad','Ctrl. de Olores','Ctrl. de Chicles']}
];
var sel={},sent=false,sending=false,sentCats='',sentName='',sentFolio='';

function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
function subId(c,s){return 'sub-'+c+'-'+s.toLowerCase().replace(/[^a-z]+/g,'-')}
function find(id){return CATS.filter(function(c){return c.id===id})[0]}
function count(){return Object.keys(sel).reduce(function(t,k){return t+sel[k].length},0)}
function ids(){return CATS.filter(function(c){return sel[c.id]}).map(function(c){return c.id})}

var ICON='<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>';
function slot(id,label,style){
  var u=imgUrl(id);
  if(u)return '<div class="cc-slot cc-has'+(id.indexOf('cat-')===0?' cc-cover':'')+'" style="'+style+'"><img src="'+esc(u)+'" alt="'+esc(label)+'" loading="lazy"></div>';
  return '<div class="cc-slot" style="'+style+'">'+ICON+'<span>'+esc(label)+'</span></div>';
}

var L={
 lbl:'font-size:13px;letter-spacing:.16em;text-transform:uppercase;font-weight:600;',
 field:'display:flex;flex-direction:column;gap:6px;font-size:14px;font-weight:600;color:var(--cc-ink-2)',
 inp:'font:inherit;font-weight:400;font-size:16px;padding:14px 16px;border:1px solid var(--cc-line);border-radius:12px;outline:none;color:var(--cc-ink)'
};

function logosHTML(){
  var l=CFG.LOGOS||[];if(!l.length)return '';
  var item=function(u){return '<img src="'+esc(u)+'" alt="" style="flex:none;height:72px;width:auto;max-width:180px;object-fit:contain">'};
  var row=l.map(item).join('');
  return '<section style="padding:48px 0;background:#fff;border-bottom:1px solid var(--cc-line-soft);overflow:hidden"><div style="text-align:center;'+L.lbl+'color:var(--cc-ink-3);margin:0 20px 28px">Empresas que confían en Clean Center · 30 años en el mercado</div><div style="display:flex;width:max-content;gap:24px;animation:ccmarquee 40s linear infinite;padding-left:24px">'+row+row+'</div></section>';
}

function shell(){
 var hdr=CFG.SHOW_HEADER_FOOTER?'<header style="position:sticky;top:0;z-index:20;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px clamp(14px,5vw,64px);background:#fff;border-bottom:1px solid var(--cc-line-soft)"><img src="'+A.logo+'" alt="Clean Center" style="height:clamp(32px,8vw,44px);width:auto;flex:none"><nav style="display:flex;align-items:center;gap:clamp(12px,3vw,28px);font-size:14px;font-weight:500"><a href="#solucion360" style="color:var(--cc-ink-2);text-decoration:none">Somos</a><a href="#catalogo" style="color:var(--cc-ink-2);text-decoration:none">Equipos</a><a href="#cotizar" style="display:inline-flex;align-items:center;gap:8px;background:var(--cc-orange);color:#fff;text-decoration:none;padding:10px 16px;border-radius:999px;font-weight:700;white-space:nowrap">Cotizar <span id="cc-count"></span></a></nav></header>':'';
 var ftr=CFG.SHOW_HEADER_FOOTER?'<footer style="background:var(--cc-black);color:#fff;padding:32px clamp(20px,5vw,64px);display:flex;flex-wrap:wrap;gap:16px;justify-content:space-between;align-items:center"><img src="'+A.logoW+'" alt="Clean Center" style="height:40px;width:auto"><span style="font-family:var(--cc-font-condensed);font-weight:700;letter-spacing:.06em;font-size:18px">WWW.CLEANCENTER.COM.MX</span></footer>':'';
 return '<div style="background:#fff;min-height:100vh;font-family:var(--cc-font-sans);color:var(--cc-ink)">'+hdr+
 '<section style="background:var(--cc-black);color:#fff;padding:clamp(56px,9vw,120px) clamp(20px,5vw,64px);position:relative;overflow:hidden"><div style="position:absolute;inset:0;background:repeating-linear-gradient(115deg,transparent 0 46px,rgba(239,118,34,.07) 46px 47px)"></div><div style="position:relative;max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr));gap:48px;align-items:center"><div><div style="'+L.lbl+'color:var(--cc-orange);margin-bottom:20px">Equipos · Catálogo 2026</div><h1 style="margin:0;font-family:var(--cc-font-condensed);font-weight:800;text-transform:uppercase;font-size:clamp(52px,8vw,112px);line-height:.92;letter-spacing:-.02em;color:#fff">El equipo <span style="color:var(--cc-orange)">correcto</span> para tu limpieza</h1><p style="margin:28px 0 0;font-size:19px;line-height:1.5;max-width:520px;color:#E8EDF9">Elige los equipos que necesitas, déjanos tus datos y te enviamos tu cotización.</p><div style="display:flex;gap:14px;margin-top:36px;flex-wrap:wrap"><a href="#catalogo" style="background:var(--cc-orange);color:#fff;text-decoration:none;padding:16px 32px;border-radius:999px;font-weight:700;font-size:16px">Elegir equipos</a></div></div><div style="position:relative;aspect-ratio:4/3;border-radius:16px;overflow:hidden;background:repeating-linear-gradient(135deg,#15181f 0 14px,#101319 14px 28px);border:1px solid #2a3142"><video src="'+A.video+'" poster="'+A.poster+'" autoplay muted loop playsinline preload="metadata" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover"></video></div></div></section>'+
 logosHTML()+
 '<section id="solucion360" style="padding:clamp(36px,5vw,64px) clamp(20px,5vw,64px);background:#fff"><div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:40px;align-items:center"><div><div style="'+L.lbl+'color:var(--cc-orange)">Solución 360</div><h2 style="margin:10px 0 16px;font-family:var(--cc-font-condensed);font-weight:800;text-transform:uppercase;font-size:clamp(36px,4.5vw,56px);line-height:.92;letter-spacing:-.02em;color:var(--cc-blue-900)">Mi solución <span style="color:var(--cc-orange)">total</span> de limpieza</h2><p style="margin:0 0 12px;font-size:17px;line-height:1.5;color:var(--cc-ink-2);max-width:520px;text-align:justify;hyphens:auto">Un solo proveedor para todo el ciclo de limpieza. Además de equipos, te acompañamos con productos, accesorios, refacciones, garantías, servicio técnico, post venta, asesoría y capacitación.</p><p style="margin:0 0 24px;font-size:17px;line-height:1.5;color:var(--cc-ink-2);max-width:520px;text-align:justify;hyphens:auto">Tú eliges el equipo; nosotros respaldamos tu operación.</p><a href="#catalogo" style="display:inline-block;background:var(--cc-blue);color:#fff;text-decoration:none;padding:15px 30px;border-radius:999px;font-weight:700;font-size:16px">Ver equipos</a></div><img src="'+A.diagram+'" alt="Solución Total: equipos, productos, accesorios, garantías, post venta, refacciones, servicio técnico, capacitación, capacitación virtual y asesoría" style="width:100%;max-width:475px;justify-self:center;height:auto;margin:-30px 0"></div></section>'+
 '<section id="catalogo" style="padding:clamp(56px,8vw,112px) clamp(20px,5vw,64px);background:var(--cc-blue-10)"><div style="max-width:1280px;margin:0 auto"><div style="'+L.lbl+'color:var(--cc-blue)">Paso 1</div><h2 style="margin:10px 0 12px;font-family:var(--cc-font-condensed);font-weight:800;text-transform:uppercase;font-size:clamp(36px,5vw,64px);line-height:.95;color:var(--cc-blue-900)">Selecciona tus equipos</h2><p style="margin:0 0 44px;font-size:17px;color:var(--cc-ink-3);max-width:620px;line-height:1.5">Marca uno o varios equipos de cualquier categoría.</p><div id="cc-cards" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(min(340px,100%),1fr));gap:24px"></div></div></section>'+
 '<section id="cotizar" style="padding:clamp(56px,8vw,112px) clamp(20px,5vw,64px);background:#fff"><div style="max-width:1280px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(320px,100%),1fr));gap:48px"><div><div style="'+L.lbl+'color:var(--cc-blue)">Paso 2</div><h2 style="margin:10px 0 24px;font-family:var(--cc-font-condensed);font-weight:800;text-transform:uppercase;font-size:clamp(36px,5vw,64px);line-height:.95;color:var(--cc-blue-900)">Solicita tu cotización</h2><div style="background:var(--cc-blue-10);border-radius:16px;padding:24px"><div style="'+L.lbl+'color:var(--cc-ink-3);margin-bottom:14px">Tu selección</div><p id="cc-empty" style="margin:0;font-size:15px;color:var(--cc-ink-3);line-height:1.5">Aún no has elegido equipos. <a href="#catalogo">Volver al catálogo</a></p><div id="cc-sum" style="display:flex;flex-direction:column;gap:12px"></div></div></div>'+
 '<div><div id="cc-ok" hidden style="background:var(--cc-blue);color:#fff;border-radius:16px;padding:40px;flex-direction:column;gap:14px"><div style="'+L.lbl+'color:var(--cc-orange-300)">Solicitud enviada</div><h3 id="cc-okh" style="margin:0;font-family:var(--cc-font-condensed);font-weight:800;text-transform:uppercase;font-size:44px;line-height:.95;color:#fff"></h3><p id="cc-okp" style="margin:0;font-size:17px;line-height:1.5"></p><button type="button" id="cc-reset" style="align-self:flex-start;margin-top:10px;cursor:pointer;font:inherit;font-weight:700;padding:12px 24px;border-radius:999px;border:2px solid #fff;background:transparent;color:#fff">Nueva cotización</button></div>'+
 '<form id="cc-form" novalidate style="display:flex;flex-direction:column;gap:18px"><label style="'+L.field+'">Nombre<input name="nombre" autocomplete="name" placeholder="Tu nombre completo" style="'+L.inp+'"></label><label style="'+L.field+'">Empresa<input name="empresa" autocomplete="organization" placeholder="Nombre de tu empresa" style="'+L.inp+'"></label><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(200px,100%),1fr));gap:18px"><label style="'+L.field+'">Correo<input name="correo" type="email" autocomplete="email" placeholder="correo@empresa.com" style="'+L.inp+'"></label><label style="'+L.field+'">Teléfono<input name="telefono" type="tel" autocomplete="tel" placeholder="55 0000 0000" style="'+L.inp+'"></label></div><label style="'+L.field+'">Comentarios (opcional)<textarea name="mensaje" rows="3" placeholder="Cantidad, superficie a limpiar, uso…" style="'+L.inp+';resize:vertical"></textarea></label><div class="cc-hp" aria-hidden="true"><label>No llenar<input name="website" tabindex="-1" autocomplete="off"></label></div><div id="cc-err" role="alert" hidden style="font-size:14px;color:var(--cc-red-700);font-weight:500"></div><button type="submit" id="cc-submit" class="cc-hover-o" style="cursor:pointer;font:inherit;font-weight:700;font-size:17px;padding:17px 32px;border-radius:999px;border:0;background:var(--cc-orange);color:#fff;align-self:flex-start">Solicitar cotización</button></form></div></div></section>'+
 ftr+
 '<div id="cc-bar" hidden style="position:fixed;left:0;right:0;margin:0 auto;width:fit-content;bottom:20px;z-index:30;align-items:center;gap:20px;background:var(--cc-blue-900);color:#fff;padding:12px 12px 12px 26px;border-radius:999px;box-shadow:0 12px 32px rgba(0,0,0,.28);max-width:calc(100vw - 24px)"><span id="cc-bartxt" style="font-size:15px;font-weight:500"></span><a href="#cotizar" style="background:var(--cc-orange);color:#fff;text-decoration:none;padding:12px 24px;border-radius:999px;font-weight:700;font-size:15px;white-space:nowrap">Cotizar</a></div></div>';
}

var root,$=function(s){return root.querySelector(s)};

function renderCards(){
 var focus=document.activeElement&&document.activeElement.getAttribute&&document.activeElement.getAttribute('data-k');
 $('#cc-cards').innerHTML=CATS.map(function(c){
  var on=!!sel[c.id];
  var subs=c.subs.map(function(s){
   var sOn=(sel[c.id]||[]).indexOf(s)>-1,id=subId(c.id,s);
   return '<div style="display:flex;flex-direction:column;border-radius:12px;overflow:hidden;border:2px solid '+(sOn?'#0047BA':'#DCE0EA')+';background:#fff"><div style="position:relative;aspect-ratio:4/3;background:#F6F8FC">'+slot(id,s,'')+'</div><button type="button" class="cc-sub-btn" data-c="'+c.id+'" data-s="'+esc(s)+'" data-k="'+c.id+'|'+esc(s)+'" aria-pressed="'+sOn+'" style="cursor:pointer;font:inherit;font-size:13px;font-weight:600;display:flex;align-items:center;justify-content:space-between;gap:6px;padding:9px 10px;border:0;background:'+(sOn?'#E8EDF9':'#fff')+';color:'+(sOn?'#002B70':'#2A3142')+';text-align:left"><span>'+esc(s)+'</span><span style="flex:none;width:18px;height:18px;border-radius:999px;border:2px solid '+(sOn?'#0047BA':'#DCE0EA')+';background:'+(sOn?'#0047BA':'transparent')+';color:#fff;font-size:11px;line-height:14px;text-align:center">'+(sOn?'✓':'')+'</span></button></div>';
  }).join('');
  return '<article style="background:#fff;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;box-shadow:'+(on?'0 8px 28px rgba(0,71,186,.18)':'0 2px 12px rgba(14,19,32,.06)')+';outline:'+(on?'3px solid #0047BA':'3px solid transparent')+';transition:box-shadow .22s,outline-color .22s"><div style="aspect-ratio:16/9;background:repeating-linear-gradient(135deg,#F6F8FC 0 14px,#EEF1F8 14px 28px);position:relative;display:flex;align-items:flex-end;padding:14px 16px;font-family:var(--cc-font-mono);font-size:11px;color:var(--cc-ink-4)">'+slot('cat-'+c.id,'Foto: '+c.name,'')+'</div><div style="padding:22px 22px 24px;display:flex;flex-direction:column;gap:14px;flex:1"><div><h3 style="margin:0;font-size:24px;font-weight:700;color:var(--cc-blue-900)">'+esc(c.name)+'</h3><p style="margin:6px 0 0;font-size:15px;line-height:1.45;color:var(--cc-ink-3)">'+esc(c.desc)+'</p></div><div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:12px">'+subs+'</div></div></article>';
 }).join('');
 if(focus){var el=$('[data-k="'+focus.replace(/"/g,'\\"')+'"]');if(el)el.focus({preventScroll:true})}
}
function renderSummary(){
 var n=count(),list=ids();
 $('#cc-empty').hidden=n>0;
 $('#cc-sum').innerHTML=list.map(function(id){var c=find(id);return '<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding-bottom:12px;border-bottom:1px solid var(--cc-line)"><div><div style="font-weight:700;font-size:17px;color:var(--cc-blue-900)">'+esc(c.name)+'</div><div style="font-size:14px;color:var(--cc-ink-3);margin-top:2px">'+esc(sel[id].join(' · '))+'</div></div><button type="button" class="cc-x" data-rm="'+id+'" aria-label="Quitar" style="cursor:pointer;border:0;background:none;font-size:22px;line-height:1;color:var(--cc-ink-4)">×</button></div>'}).join('');
 var ct=root.querySelector('#cc-count');if(ct)ct.textContent=n?'('+n+')':'';
 var bar=$('#cc-bar');bar.hidden=!(n>0&&!sent&&barOn);bar.style.display=bar.hidden?'none':'flex';
 $('#cc-bartxt').textContent=n+(n===1?' equipo seleccionado':' equipos seleccionados');
}
function render(){renderCards();renderSummary()}
var barOn=true;

function toggleSub(id,label){var cur=sel[id]||[];var nx=cur.indexOf(label)>-1?cur.filter(function(x){return x!==label}):cur.concat(label);if(nx.length)sel[id]=nx;else delete sel[id];track('cotizacion_equipo_agregado',{categoria:id,subtipo:label,total:count()});render()}

function track(ev,d){try{window.dataLayer=window.dataLayer||[];window.dataLayer.push(Object.assign({event:ev},d||{}))}catch(e){}}
function utm(){var o={};try{var p=new URLSearchParams(location.search);['utm_source','utm_medium','utm_campaign','utm_term','utm_content','gclid','fbclid'].forEach(function(k){if(p.get(k)){o[k]=p.get(k);try{sessionStorage.setItem('cc_'+k,o[k])}catch(e){}}else{try{var v=sessionStorage.getItem('cc_'+k);if(v)o[k]=v}catch(e){}}})}catch(e){}return o}
function folio(){var d=new Date(),p=function(n){return String(n).padStart(2,'0')};return 'CC-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase()}
function showErr(m){var e=$('#cc-err');e.textContent=m||'';e.hidden=!m}

function submit(ev){
 ev.preventDefault();if(sending)return;
 var f=$('#cc-form'),v=function(n){return f.elements[n].value.trim()};
 if(!count())return showErr('Selecciona al menos un equipo.');
 if(!v('nombre')||!v('correo')||!v('telefono'))return showErr('Completa nombre, correo y teléfono.');
 if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(v('correo')))return showErr('Revisa que tu correo sea válido.');
 showErr('');
 var list=ids(),fol=folio();
 var payload=Object.assign({
  folio:fol,nombre:v('nombre'),empresa:v('empresa'),correo:v('correo'),telefono:v('telefono'),mensaje:v('mensaje'),
  website:v('website'),
  equipos:list.map(function(id){return{categoria:find(id).name,subtipos:sel[id].slice()}}),
  pagina:location.href.split('#')[0],fecha:new Date().toISOString()
 },utm());
 var btn=$('#cc-submit');sending=true;btn.disabled=true;btn.textContent='Enviando…';
 var done=function(){
  sending=false;btn.disabled=false;btn.textContent='Solicitar cotización';
  sent=true;sentName=payload.nombre;sentFolio=fol;
  sentCats=list.map(function(id){return find(id).name+' ('+sel[id].join(', ')+')'}).join('; ');
  $('#cc-okh').textContent='Gracias, '+sentName;
  $('#cc-okp').textContent='Un asesor te contactará con tu cotización de '+sentCats+'.';
  f.hidden=true;f.style.display='none';var ok=$('#cc-ok');ok.hidden=false;ok.style.display='flex';
  track('cotizacion_enviada',{folio:fol,equipos:count()});track('generate_lead',{folio:fol});
  renderSummary();
 };
 var fail=function(){sending=false;btn.disabled=false;btn.textContent='Solicitar cotización';showErr('No pudimos enviar tu solicitud. Intenta de nuevo en un momento.')};
 if(!CFG.EMAIL_ENDPOINT){console.warn('[Cotizador] Falta CC_CONFIG.EMAIL_ENDPOINT: la solicitud no se envió por correo.');return done()}
 var body=JSON.stringify(payload);
 fetch(CFG.EMAIL_ENDPOINT,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:body})
  .then(function(r){return r.json()})
  .then(function(j){j&&j.ok?done():fail()})
  .catch(function(){
    // respuesta ilegible (CORS): reintenta en modo opaco; el correo sí sale
    fetch(CFG.EMAIL_ENDPOINT,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'},body:body}).then(done,fail);
  });
}
function reset(){
 sel={};sent=false;sentCats='';var f=$('#cc-form');f.reset();f.hidden=false;f.style.display='flex';var ok=$('#cc-ok');ok.hidden=true;ok.style.display='none';showErr('');render();
}

function init(){
 var m=document.querySelector(CFG.MOUNT);
 if(!m){console.warn('[Cotizador] No existe '+CFG.MOUNT);return}
 if(CFG.LOAD_FONTS&&!document.getElementById('cc-fonts')){var l=document.createElement('link');l.id='cc-fonts';l.rel='stylesheet';l.href='https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap';document.head.appendChild(l)}
 m.innerHTML='<div id="cc-app">'+shell()+'</div>';
 root=m.firstChild;
 $('#cc-ok').style.display='none';$('#cc-bar').style.display='none';
 root.addEventListener('click',function(e){
  var t=e.target.closest('[data-s]');if(t)return toggleSub(t.getAttribute('data-c'),t.getAttribute('data-s'));
  t=e.target.closest('[data-rm]');if(t){delete sel[t.getAttribute('data-rm')];return render()}
  t=e.target.closest('#cc-reset');if(t)return reset();
  t=e.target.closest('a[href^="#"]');
  if(t){var id=t.getAttribute('href').slice(1),el=id&&root.querySelector('#'+id);if(el){e.preventDefault();el.scrollIntoView({behavior:'smooth',block:'start'})}}
 });
 $('#cc-form').addEventListener('submit',submit);
  var v=root.querySelector('video');if(v){v.muted=true;v.play&&v.play().catch(function(){})}
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
