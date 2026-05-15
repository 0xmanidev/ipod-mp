const audio = new Audio();
audio.volume=0.8;

let tracks = [];
let current = 0;
let playing = false;
let shuffled = false;
let repeat = false;
let menuOpean = false;
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
const ICON_PLAY = `<svg width="14" height="14" viewbox="0 0 14 14" fill="currentColor"><polygon points="2,1 13,7 2,13"/></svg>`