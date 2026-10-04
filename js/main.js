/* ---------- truck drawing ---------- */
function truckSVG(cfg, opts={}){
  const c = opts.color || '#f4b400', ink = opts.ink || '#15140f', line = opts.line || '#e8e2d4';
  let x = 6, parts = '', wheels = [];
  const base = 52;
  cfg.forEach(s=>{
    if(s.t==='trailer'){
      parts += `<path d="M${x} ${base-30} h${s.w} v26 h-${s.w} z" fill="${c}" stroke="${ink}" stroke-width="2"/>`;
      parts += `<path d="M${x+6} ${base-30} v26 M${x+s.w/2} ${base-30} v26 M${x+s.w-6} ${base-30} v26" stroke="${ink}" stroke-width="1" opacity=".35"/>`;
      s.axles.forEach(a=>wheels.push(x+a));
      x += s.w + (s.gap||4);
    } else if(s.t==='hitch'){
      parts += `<rect x="${x}" y="${base-8}" width="${s.w}" height="3" fill="${line}"/>`;
      x += s.w;
    } else if(s.t==='truck'){
      parts += `<rect x="${x}" y="${base-6}" width="${s.w}" height="6" fill="${line}"/>`;
      parts += `<path d="M${x+2} ${base-32} h${s.box-2} v28 h-${s.box} z" fill="${c}" stroke="${ink}" stroke-width="2"/>`;
      parts += `<path d="M${x+8} ${base-32} v28 M${x+s.box/2} ${base-32} v28 M${x+s.box-6} ${base-32} v28" stroke="${ink}" stroke-width="1" opacity=".35"/>`;
      const cx = x+s.box+2;
      parts += `<path d="M${cx} ${base-6} v-30 h22 l10 12 v18 z" fill="${line}" stroke="${ink}" stroke-width="2"/>`;
      parts += `<path d="M${cx+15} ${base-32} h6 l7 9 h-13 z" fill="${ink}" opacity=".8"/>`;
      s.axles.forEach(a=>wheels.push(x+a));
      wheels.push(cx+22);
      x = cx+34;
    }
  });
  const ws = wheels.map(a=>`<g transform="translate(${a} ${base+2})"><circle r="8" fill="${ink}"/><g class="wheel"><circle r="4.2" fill="${line}"/><path d="M-4 0h8M0 -4v8" stroke="${ink}" stroke-width="1.4"/></g></g>`).join('');
  return {w:x+6, svg:`${parts}${ws}`};
}
const RIGS = [
  {tag:'Rig 01',name:'Tandem Truck',yd:'12–15',t:'12–14',capYd:12,pct:36,
   cfg:[{t:'truck',w:70,box:56,axles:[16,32]}],
   desc:'Perfect for short-distance jobs and locations that won\'t allow trucks with trailers.',
   access:'<b>Site:</b> tight access OK'},
  {tag:'Rig 02',name:'Tandem & Pony',yd:'28',t:'26',capYd:28,pct:67,
   cfg:[{t:'trailer',w:52,axles:[14,32],gap:0},{t:'hitch',w:8},{t:'truck',w:66,box:52,axles:[14,30]}],
   desc:'Quick to load and dump, carrying almost double the weight of a tandem.',
   access:'<b>Site:</b> drive-through loading, room to jackknife-dump'},
  {tag:'Rig 03',name:'Truck & Transfer',yd:'42',t:'40',capYd:42,pct:100,
   cfg:[{t:'trailer',w:52,axles:[12,26],gap:0},{t:'hitch',w:6},{t:'trailer',w:52,axles:[14,32],gap:0},{t:'hitch',w:8},{t:'truck',w:66,box:52,axles:[14,30]}],
   desc:'Loads about three tandems in one. Drive-through loading or box-in for tighter sites.',
   access:'<b>Site:</b> needs a spot to unhook the trailer — roadside works'},
  {tag:'Rig 04',name:'Truck & Quad Wagon',yd:'42',t:'40',capYd:42,pct:100,
   cfg:[{t:'trailer',w:70,axles:[10,24,38,52],gap:0},{t:'hitch',w:8},{t:'truck',w:66,box:52,axles:[14,30]}],
   desc:'Same haul as a Truck & Transfer, with quicker unloading. Same idea as a Pony, more weight.',
   access:'<b>Site:</b> drive-through loading, room to dump'}
];
(function(){
  const r = truckSVG(RIGS[1].cfg);
  const g = document.getElementById('hero-truck');
  g.innerHTML = r.svg;
  g.parentNode.setAttribute('viewBox',`0 0 ${r.w} 70`);
  g.parentNode.style.width = (r.w*1.9)+'px';
})();
const rigsEl = document.getElementById('rigs');
RIGS.forEach(r=>{
  const m = truckSVG(r.cfg), W = Math.max(m.w,200);
  const d = document.createElement('article');
  d.className='rig reveal';
  d.innerHTML = `<span class="tag">${r.tag}</span><h3>${r.name}</h3>
   <svg viewBox="0 0 ${W} 66" aria-hidden="true">${m.svg}<path d="M0 63H${W}" stroke="#e8e2d4" stroke-width="1.5" stroke-dasharray="4 4" opacity=".5"/></svg>
   <p>${r.desc}</p><p class="access">${r.access}</p>
   <div class="cap"><div class="v">${r.yd}</div><div class="u">cu. yards<br>${r.t} tonnes</div><div class="bar"><i style="--w:${r.pct}%"></i></div></div>`;
  rigsEl.appendChild(d);
});

/* ---------- load calculator ---------- */
const st = {mat:0, site:0, yards:120};
const MATS = ['Sand & gravel','Washed aggregate','Fill delivery','Dirt / fill disposal'];
const SITES = ['Tight access','Room to unhook','Drive-through + room to dump'];
const tk = document.getElementById('tk'), yEl = document.getElementById('yards'), yv = document.getElementById('yv');
const pick = ()=>[RIGS[0], RIGS[2], RIGS[3]][st.site];
const tno = ()=>String(Math.abs((st.mat*7+st.site*13+st.yards*31)%9000)+1000);
function render(){
  const r = pick();
  const loads = Math.max(1, Math.ceil(st.yards / r.capYd));
  tk.innerHTML = `<svg class="tk-mark" viewBox="0 0 200 172"><use href="#logo"/></svg><h4>Load Ticket</h4><div class="mono" style="margin-bottom:10px">Est. No. ${tno()}</div>
   <div class="row"><span>Material</span><b>${MATS[st.mat]}</b></div>
   <div class="row"><span>Site</span><b>${SITES[st.site]}</b></div>
   <div class="row"><span>Volume</span><b>${st.yards} yd³</b></div>
   <div class="row"><span>Rig</span><b>${r.name}</b></div>
   <div class="big">${loads} ${loads===1?'LOAD':'LOADS'}</div>
   <div class="mono">at ${r.capYd}${r.capYd<15?'+':''} yd per load</div>
   <div class="btnrow" style="margin-top:18px"><a class="btn solid" id="mk" style="padding:12px 16px;font-size:12px" href="#">Send to Barrow →</a></div>`;
  const body = encodeURIComponent(`Hi Barrow Trucking,\n\nQuote request:\nMaterial: ${MATS[st.mat]}\nSite: ${SITES[st.site]}\nVolume: ${st.yards} cubic yards\nSuggested rig: ${r.name} (~${loads} loads)\n\nSite address / dates:\n\nPhone:\n`);
  tk.querySelector('#mk').href = `mailto:Barrowtruckingltd@gmail.com?subject=${encodeURIComponent('Quote request — '+MATS[st.mat])}&body=${body}`;
}
document.querySelectorAll('.chips').forEach(g=>{
  g.addEventListener('click',e=>{
    const b=e.target.closest('.chip'); if(!b) return;
    [...g.children].forEach(c=>c.setAttribute('aria-pressed','false'));
    b.setAttribute('aria-pressed','true');
    st[g.dataset.key] = [...g.children].indexOf(b); render();
  });
});
yEl.addEventListener('input',()=>{st.yards=+yEl.value; yv.textContent=st.yards; render();});
render();

/* ---------- contact form (opens visitor's email app) ---------- */
document.getElementById('cf').addEventListener('submit',e=>{
  e.preventDefault();
  const f=new FormData(e.target);
  const body=`Name: ${f.get('fn')} ${f.get('ln')}\nPhone: ${f.get('ph')}\nEmail: ${f.get('em')}\n\n${f.get('msg')}`;
  location.href=`mailto:Barrowtruckingltd@gmail.com?subject=${encodeURIComponent('Website inquiry from '+f.get('fn'))}&body=${encodeURIComponent(body)}`;
});

/* ---------- reveal + stat count-up ---------- */
const io = new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
const sio = new IntersectionObserver(es=>es.forEach(x=>{
  if(!x.isIntersecting) return; sio.unobserve(x.target);
  x.target.querySelectorAll('b[data-n]').forEach(b=>{
    const n=+b.dataset.n, t0=performance.now();
    (function f(t){const p=Math.min(1,(t-t0)/1100);b.textContent=Math.round(n*(1-Math.pow(1-p,3)));if(p<1)requestAnimationFrame(f)})(t0);
  });
}),{threshold:.4});
sio.observe(document.getElementById('stats'));

/* ---------- ledger: photo follows cursor ---------- */
const peek = document.getElementById('peek');
document.getElementById('ledger').addEventListener('mousemove',e=>{
  const li = e.target.closest('li'); if(!li){peek.classList.remove('on');return}
  peek.style.backgroundImage = `url(img/${li.dataset.img}.jpg)`;
  peek.style.left = Math.min(e.clientX+24, innerWidth-300)+'px';
  peek.style.top = Math.min(e.clientY-70, innerHeight-220)+'px';
  peek.classList.add('on');
});
document.getElementById('ledger').addEventListener('mouseleave',()=>peek.classList.remove('on'));

/* ---------- parallax band ---------- */
const band = document.getElementById('band'), bandbg = document.getElementById('bandbg');
if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
  addEventListener('scroll',()=>{
    const r = band.getBoundingClientRect();
    if(r.bottom<0||r.top>innerHeight) return;
    bandbg.style.transform = `translateY(${(r.top/innerHeight)*-8}%)`;
  },{passive:true});
}

/* ---------- lightbox ---------- */
const lb = document.getElementById('lb'), lbi = lb.querySelector('img'), lbp = lb.querySelector('p');
document.getElementById('gallery').addEventListener('click',e=>{
  const f = e.target.closest('figure'); if(!f) return;
  const i = f.querySelector('img'); lbi.src=i.src; lbi.alt=i.alt; lbp.textContent=f.querySelector('figcaption').textContent;
  lb.classList.add('on'); lb.setAttribute('aria-hidden','false');
});
const closeLb=()=>{lb.classList.remove('on');lb.setAttribute('aria-hidden','true')};
lb.addEventListener('click',closeLb);
addEventListener('keydown',e=>{if(e.key==='Escape')closeLb()});
