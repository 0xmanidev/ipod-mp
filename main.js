const audio = new Audio();
audio.volume=0.8;

let tracks = [];
let current = 0;
let playing = false;
let shuffled = false;
let repeat = false;
let menuOpen = false;
let menuSel= 0;

const npTrack = document.getElementById('np-track');
const npArtist = document.getElementById('np-artist');
const npFill = document.getElementById('np-fill');
const npCur = document.getElementById('np-cur');
const npDur = document.getElementById('np-dur');
const viewPlayer = document.getElementById('view-player');
const viewMenu = document.getElementById('view-menu');
const menuItems = document.getElementById('view-player');
const btnPlay = document.getElementById('btn-play');
const btnPrev = document.getElementById('btn-prev');
const btnNext = document.getElementById('btn-next');
const btnMenu = document.getElementById('btn-menu');
const btnCenter = document.getElementById('file-input');
const fileInput = document.getElementById('file-input');

const ICON_PAUSE =`<svg width="14" height="14" viewbox="0 0 14 14" fill="currentColor"><rect x="0" y="1" width="4" height="12" rx="1"/><rect x="6" y="1" width="4" height="12" rx="1"/></svg>`;
const ICON_PLAY = `<svg width="14" height="14" viewbox="0 0 14 14" fill="currentColor"><polygon points="2,1 13,7 2,13"/></svg>`;

function fmt(s){
    if(!s|| isNaN(s)) return'0:00';
    s = Math.floor(s);
    return Math.floor(s/60)+':'+String(s%60).padStart(2,'0');
}

function showView(name){
    viewPlayer.classList.toggle('active',name ==='player');
    viewMenu.classList.toggle('active',name === 'menu');
    menuOpen=(name ==='menu');
}
function renderMenu(){
    if(!tracks.length){
        menuItems.innerHTML='<div class="menu-empty">add music</div>';
        return;
    }
}
menuItems.innerHTML = tracks.map((t,i)=>`
    <div class="menu-item ${i===menuSel ? 'selected':''}"data-i="${i}">
        <span class="mi-num">${i+1}</span>
        <span class="mi-name">${t.name}</span>
        <span class="mi-dur">${t.durStr||'--:--'}</span>
`).join('');

const sel = menuItems.querySelector('.selected');
if(sel) sel.scrollIntoView({block:'nearest'});

function loadTrack(idx){
    if(!tracks.length)return;
    current=idx
    menuSel=idx
    const t =tracks[current];
    npTrack.textContent = t.name;
    npArtist.textContent= t.size;
    audio.src = t.url;
    npFill.style.width='0%';
    npCur.textContent='0:00';
    npDur.textContent=t.durStr || '0:00';
    renderMenu();
}
function setPlaying(val){
    playing=val;
    if(val){
        audio.play();
        btnPlay.innerHTML = ICON_PAUSE
    }else{
        audio.pause();
        btnPlay.innerHTML = ICON_PLAY
    }
}
function nextTrack(){
    if(!tracks.length)return;
    const n = shuffled
        ?Math.floor(Math.random()*tracks.length)
        :(current+1)%tracks.length;
    loadTrack(n);
    if(playing) audio.play();
}
function prevTrack(){
    if(!tracks.length)return;
    if (audio.currentTime>3){audio.currentTime=0;return;}
    const n = (current - 1 + tracks.length)% tracks.length;
    loadTrack(n);
    if(playing) audio.play();
}

btnPlay.innerHTML = ICON_PLAY

btnPlay.onclick=()=>{
    if(!tracks.length)return;
    setPlaying(!playing);

}

btnNext.onclick = () =>{
    if(menuOpen){
        menuSel = Math.min(menuSel+1, tracks.length -1);
        renderMenu();
    }else{
        nextTrack();
    }
}
btnPrev.onclick = () =>{
    if(menuOpen){
        menuSel = Math.min(menuSel-1, 0);
        renderMenu();
    }else{
        prevTrack();
    }
}
btnMenu.onclick = ()=>{
    if(menuOpen){
        showView('player');
    }else{
        menuSel = current
        renderMenu()
        showView('menu')
    }
}
btnCenter.onclick=()=>{
    if(menuOpen){
        if(tracks.length){
            loadTrack(menuSel);
            setPlaying(true);
            showView('player')
        }
    }else{
        shuffled = !shuffled
    }
}
let wheelDragging = false;
let wheelStart ={ x:0,y:0,time:0};
const wheel = document.querySelector('.wheel')

wheel.addEventListener('mousesdown',e=>{
    if(e.target.closest('button'))return;
    wheelDragging = true
    wheelStart ={ x:e.clientX, y:e.clientY,time:Date.now()};
}
);
window.addEventListener('mousemove',e=>{
    if(!wheelDragging||!audio.duration)return;
    const dx = e.clientX - wheelStart.x;
    const dt = e.clientY - wheelStart.y;
  const rect = wheel.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const cy = rect.top + rect.height / 2;
  const angle = Math.atan2(e.clientY - cy, e.clientX - cx);
  const prevAngle = Math.atan2(wheelStart.y - cy, wheelStart.x - cx);
  let delta = angle - prevAngle;
  if (delta > Math.PI) delta -= 2 * Math.PI;
  if (delta < -Math.PI) delta += 2 * Math.PI;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.currentTime + delta * 5));
  wheelStart = { x: e.clientX, y: e.clientY };
});

window.addEventListener('mouseup', () => { wheelDragging = false; });


audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  const pct = (audio.currentTime / audio.duration) * 100;
  npFill.style.width = pct + '%';
  npCur.textContent = fmt(audio.currentTime);
});

audio.addEventListener('loadedmetadata', () => {
  npDur.textContent = fmt(audio.duration);
  if (tracks[current]) {
    tracks[current].durStr = fmt(audio.duration);
    renderMenu();
  }
});

audio.addEventListener('ended', () => {
  if (repeat) { audio.currentTime = 0; audio.play(); return; }
  const n = shuffled
    ? Math.floor(Math.random() * tracks.length)
    : (current + 1) % tracks.length;
  if (n === 0 && !shuffled) { setPlaying(false); loadTrack(0); return; }
  loadTrack(n);
  audio.play();
});


fileInput.addEventListener('change', e => {
  const wasEmpty = tracks.length === 0;
  Array.from(e.target.files).forEach(f => {
    tracks.push({
      name: f.name.replace(/\.[^/.]+$/, ''),
      size: (f.size / 1024 / 1024).toFixed(1) + ' MB',
      url: URL.createObjectURL(f),
      durStr: null
    });
  });
  if (wasEmpty) {
    loadTrack(0);
    setPlaying(true);
    showView('player');
  } else {
    renderMenu();
  }
  e.target.value = '';
});


menuItems.addEventListener('click', e => {
  const item = e.target.closest('.menu-item[data-i]');
  if (item) {
    const i = parseInt(item.dataset.i);
    loadTrack(i);
    setPlaying(true);
    showView('player');
  }
});
window.addEventListener('keydown',e =>{
    if(e.code ==='Space'){
        e.preventDefault();if(tracks.length)setPlaying(!playing);
    }
    if (e.code ==='ArrowRight')nextTrack();
    if(e.code ==='ArrowLeft')prevTrack();
    if(e.code ==='Escape'){
        if(menuOpen) showView('player');else{menuSel=current;renderMenu();showView('menu')}
    }
})