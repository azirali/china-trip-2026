import { createGeoMap } from './geo-map.js';

// A geographic sketch of the itinerary. Coordinates are illustrative, not a navigation map.
const places = {
  astana: { x: 103, y: 73, name: 'Астана', label: [-6, -20] },
  urc: { x: 313, y: 162, name: 'Урумчи', label: [-23, -19] },
  beijing: { x: 788, y: 173, name: 'Пекин', label: [16, 5] },
  mutianyu: { x: 766, y: 141, name: 'Мутяньюй' },
  xian: { x: 638, y: 251, name: 'Сиань', label: [-16, -18] },
  luoyang: { x: 702, y: 265, name: 'Лоян', label: [14, -12] },
  shaolin: { x: 730, y: 300, name: 'Шаолинь' },
  yiyang: { x: 701, y: 336, name: 'Иян' },
  zjj: { x: 664, y: 365, name: 'Чжанцзяцзе', label: [17, -9] },
  avatar: { x: 634, y: 337, name: 'Горы «Аватара»' },
  tianmen: { x: 645, y: 393, name: 'Тяньмэнь' },
  furong: { x: 615, y: 390, name: 'Фужун', label: [-58, 13] },
  chongqing: { x: 563, y: 325, name: 'Чунцин', label: [-100, 4] },
  chengdu: { x: 519, y: 299, name: 'Чэнду', label: [-54, -15] },
  pandas: { x: 516, y: 266, name: 'Панды' }
};
// WGS84 coordinates for the real map; animated connections indicate order, not exact tracks.
const coordinates = {
  astana: [51.1694, 71.4491], urc: [43.8256, 87.6168], beijing: [39.9042, 116.4074],
  mutianyu: [40.43204, 116.57054], xian: [34.3416, 108.9398], luoyang: [34.6836, 112.4536],
  shaolin: [34.508, 112.935], yiyang: [28.5539, 112.3552], zjj: [29.1294, 110.4783],
  avatar: [29.34, 110.43], tianmen: [29.05, 110.48], furong: [28.68, 109.96],
  chongqing: [29.563, 106.5516], chengdu: [30.5728, 104.0668], pandas: [30.7432, 104.1357]
};

const leg = (date, mode, title, detail, points) => ({ date, mode, title, detail, points });
const first = leg(11, 'plane', 'Астана → Урумчи', '19:30 — вылет. В Урумчи прилетим уже 12-го в 01:00 по местному времени.', ['astana', 'urc']);
const last = leg(20, 'plane', 'Урумчи → Астана', '02:00 — обратный вылет. Из-за часовых поясов в Астане будет 01:50 того же дня.', ['urc', 'astana']);
const returnToUrumqi = leg(19, 'plane', 'Чунцин → Урумчи', '15:15–19:15, затем самостоятельная пересадка на рейс домой. Запас — 6 ч 45 мин.', ['chongqing', 'urc']);
const shaolin = leg(14, 'road', 'Лоян → Шаолинь → Лоян', 'Выезд к храму и Лесу пагод, затем возвращение в Лоян. Дорога около 1,5–2 часов в сторону.', ['luoyang', 'shaolin', 'luoyang']);
const sleeper = leg(15, 'train', 'Лоян → Иян', 'Вечером — ночной K538. Здесь спальная полка одновременно заменяет гостиницу.', ['luoyang', 'yiyang']);
const toAvatar = leg(16, 'train', 'Иян → Чжанцзяцзе', 'Такси на другой вокзал Иян-Южный, затем поезд G2430 к горам «Аватара».', ['yiyang', 'zjj']);
const avatar = leg(17, 'walk', 'День среди летающих гор', 'Юаньцзяцзе, Байлун и Тяньцзы. Вечером — переезд в центр Чжанцзяцзе.', ['zjj', 'avatar', 'zjj']);
const toChongqing = { ...leg(18, 'train', 'Тяньмэнь → Чунцин', 'Ранний Тяньмэнь, затем G3376 в Чунцин. В A/B приезд поздний, огни города зависят от времени.', ['zjj', 'tianmen', 'zjj', 'chongqing']), segmentModes: ['road', 'road', 'train'] };

const itineraries = {
  A: [first,
    leg(12, 'plane', 'Урумчи → Сиань', 'Утренний прямой рейс 08:40–12:05. Вечером — древний город и еда.', ['urc', 'xian']),
    leg(13, 'train', 'Сиань → Лоян', 'Терракотовая армия утром. Вечером — поезд до Лояна.', ['xian', 'luoyang']),
    shaolin, sleeper, toAvatar, avatar, toChongqing, returnToUrumqi, last],
  B: [first,
    leg(12, 'plane', 'Урумчи → Пекин', 'Утренний рейс даёт прогулку по Пекину. Вечерний экономит деньги, но почти забирает день.', ['urc', 'beijing']),
    { ...leg(13, 'mixed', 'Великая стена → ночной поезд', 'Мутяньюй днём. Вечером — спальный поезд K269 из Пекина в Лоян.', ['beijing', 'mutianyu', 'beijing', 'luoyang']), segmentModes: ['road', 'road', 'train'] },
    shaolin, sleeper, toAvatar, avatar, toChongqing, returnToUrumqi, last],
  C: [first,
    leg(12, 'plane', 'Урумчи → Чэнду', 'Прямой рейс в Чэнду, затем чайные и сычуаньская кухня.', ['urc', 'chengdu']),
    leg(13, 'walk', 'Утро у панд', 'Рано в базу разведения панд, потом свободное время в Чэнду.', ['chengdu', 'pandas', 'chengdu']),
    leg(14, 'train', 'Чэнду → Чунцин', 'Утренний поезд, полный день и полноценный неоновый вечер в Чунцине.', ['chengdu', 'chongqing']),
    leg(15, 'train', 'Чунцин → Чжанцзяцзе', 'Ранний скоростной поезд. После заселения — первая прогулка у гор.', ['chongqing', 'zjj']),
    leg(16, 'walk', 'Горы «Аватара»', 'Полный день на тропах, смотровых и подъёмниках лесного парка.', ['zjj', 'avatar', 'zjj']),
    leg(17, 'walk', 'Небесные врата Тяньмэнь', 'Отдельный день на высоте. Схему канаток нужно проверить ближе к поездке.', ['zjj', 'tianmen', 'zjj']),
    leg(18, 'train', 'Фужун → Чунцин', 'Выезд к водопаду Фужуна и обратно через Чжанцзяцзе, затем поезд в Чунцин. Этот участок зависит от ноябрьского расписания.', ['zjj', 'furong', 'zjj', 'chongqing']),
    returnToUrumqi, last]
};

const modes = {
  plane: { glyph: '✈', label: 'САМОЛЁТ', color: '#d6ef83' },
  train: { glyph: '▰', label: 'ПОЕЗД', color: '#96d9f3' },
  road: { glyph: '▰', label: 'АВТОБУС / ТАКСИ', color: '#f6bb85' },
  walk: { glyph: '↟', label: 'ПЕШКОМ И ПО МЕСТУ', color: '#d8baf3' }
};
const ns = 'http://www.w3.org/2000/svg';
const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function pathFor(scene) {
  const { points, mode } = scene;
  const start = places[points[0]];
  if (mode === 'plane' && points.length === 2) {
    const end = places[points[1]];
    const bend = Math.min(60, Math.max(24, Math.hypot(end.x - start.x, end.y - start.y) * .13));
    return `M ${start.x} ${start.y} Q ${(start.x + end.x) / 2} ${(start.y + end.y) / 2 - bend} ${end.x} ${end.y}`;
  }
  return points.slice(1).reduce((d, key) => {
    const p = places[key];
    return d + ` L ${p.x} ${p.y}`;
  }, `M ${start.x} ${start.y}`);
}

let session;
let preferredMap = 'sketch';
export function mountJourneyAnimation({ route, fast, late, onDay }) {
  session?.destroy();
  const root = document.querySelector('#trip-animation');
  const scenes = itineraries[route].map(scene => ({ ...scene }));
  if (route === 'A' && fast) scenes[2].detail = 'Терракотовая армия утром. Быстрый G2022 идёт с Xi’an North до Luoyang Longmen — другие вокзалы.';
  if (route === 'B' && late) scenes[1].detail = 'Вечерний рейс 16:55–20:45 экономит 9 663 ₸, но убирает дневную прогулку по Пекину.';
  const used = [...new Set(scenes.flatMap(scene => scene.points))];
  const labelled = used.filter(key => places[key].label);
  root.innerHTML = `
    <div class="movie-head"><span>МАРШРУТ ${route} · 11–20 НОЯБРЯ</span><div><button type="button" id="movie-play-top">▶ Запустить</button><span id="movie-counter">01 / 10</span></div></div>
    <div class="movie-view-bar"><div class="movie-view-switch" role="group" aria-label="Вид карты"><button type="button" id="movie-sketch" aria-pressed="true">✦ Кино-схема</button><button type="button" id="movie-geography" aria-pressed="false">◎ Точная карта</button></div><span>Переключайте вид во время движения</span></div>
    <div class="movie-map-viewport" id="movie-map-viewport" tabindex="0" aria-label="Схема маршрута; на узком экране прокручивается в стороны">
      <svg id="movie-map" viewBox="0 0 900 445" role="img" aria-label="Схема перемещений от Астаны через Китай и обратно">
        <defs>
          <pattern id="map-grid" width="32" height="32" patternUnits="userSpaceOnUse"><circle cx="1" cy="1" r="1" fill="#5b746a" opacity=".45"/></pattern>
          <radialGradient id="map-glow"><stop stop-color="#385c53" stop-opacity=".65"/><stop offset="1" stop-color="#22342e" stop-opacity="0"/></radialGradient>
          <symbol id="vehicle-plane" viewBox="-40 -25 80 50"><path d="M-36-3H-6L12-22 19-20 9-3 34-2Q40 0 34 2L9 3 19 20 12 22-6 3H-36L-40 9-44 8-39 0-44-8-40-9Z" fill="currentColor" stroke="#effbd6" stroke-width="1.5" stroke-linejoin="round"/><path d="M-27 0H23" stroke="#254036" stroke-width="1.5" opacity=".6"/></symbol>
          <symbol id="vehicle-train" viewBox="-36 -28 72 56"><rect x="-31" y="-18" width="62" height="33" rx="9" fill="currentColor" stroke="#e4f6fa" stroke-width="1.4"/><path d="M-21-8H15M-21 1H15" stroke="#183c46" stroke-width="4.5" stroke-linecap="round" stroke-dasharray="10 5"/><rect x="19" y="-9" width="6" height="13" rx="2" fill="#183c46"/><path d="M-24 15L-30 23M24 15L30 23M-28 23H28" stroke="#ccebf2" stroke-width="2.5" stroke-linecap="round"/><circle cx="-18" cy="17" r="4" fill="#12262b"/><circle cx="18" cy="17" r="4" fill="#12262b"/></symbol>
          <symbol id="vehicle-road" viewBox="-36 -28 72 56"><path d="M-29-14H13Q19-14 22-8L30 1V15H-31V-8Q-31-14-29-14Z" fill="currentColor" stroke="#fff1dd" stroke-width="1.5" stroke-linejoin="round"/><path d="M-22-8H9V2H-22ZM15-7Q18-7 20-3L23 2H15Z" fill="#293b37"/><path d="M-31 6H29" stroke="#d78355" stroke-width="2"/><circle cx="-18" cy="16" r="5" fill="#172a2b" stroke="#fff1dd" stroke-width="1.3"/><circle cx="19" cy="16" r="5" fill="#172a2b" stroke="#fff1dd" stroke-width="1.3"/></symbol>
          <symbol id="vehicle-walk" viewBox="-26 -28 52 56"><circle cy="-17" r="6" fill="currentColor"/><path d="M0-10L-5 3 7 9M-3-5L-14 2M-2 3L-11 21M7 9L16 22" fill="none" stroke="currentColor" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M-17 22H-8M14 23H21" stroke="#f2e7fa" stroke-width="2" stroke-linecap="round"/></symbol>
        </defs>
        <rect width="900" height="445" fill="url(#map-grid)"/>
        <ellipse cx="664" cy="310" rx="355" ry="230" fill="url(#map-glow)"/>
        <path class="map-terrain" d="M24 142 Q124 76 239 133 T456 132 T685 112 T902 129 M18 262 Q160 215 286 252 T544 211 T900 245 M50 409 Q203 361 370 392 T699 382 T900 413"/>
        <g class="map-clouds" aria-hidden="true"><path d="M75 214c12-14 34-13 43 2 10-5 23 1 27 10H63c2-7 6-10 12-12ZM423 94c9-12 26-12 36 0 11-6 25-1 29 9h-78c1-5 6-8 13-9ZM785 344c10-11 27-10 34 3 10-5 22 0 26 9h-73c1-5 6-10 13-12Z"/></g>
        <text x="70" y="344" class="map-region">КАЗАХСТАН</text><text x="481" y="91" class="map-region">КИТАЙ</text>
        <g id="movie-tracks"></g><g id="movie-nodes"></g>
        <path id="movie-active-track" class="movie-active-track"/>
        <path id="movie-contrail-glow" class="movie-contrail-glow"/><path id="movie-contrail" class="movie-contrail"/>
        <g id="movie-arrival" class="movie-arrival"><circle r="7"/><circle r="17"/></g>
        <g id="movie-traveler"><circle r="29" class="vehicle-halo"/><circle r="23" class="vehicle-orbit"/><g id="movie-bearing"><use id="movie-vehicle" href="#vehicle-plane" x="-34" y="-27" width="68" height="54"/></g></g>
      </svg>
    </div>
    <div id="movie-geo-wrap" class="movie-geo-wrap" hidden><div id="movie-geo-map" role="img" aria-label="Интерактивная карта с географическим положением городов маршрута"></div><button id="movie-fit" type="button">◎ Весь маршрут</button></div>
    <div class="movie-caption"><span id="movie-map-note">Схема по расположению городов; расстояния и длительность анимации условные.</span><span>✈ самолёт · ▰ поезд · ▰ автобус · ↟ пешком</span></div>
    <div class="movie-lower"><div class="movie-current"><span id="movie-mode" class="movie-mode"></span><div><span id="movie-date" class="movie-date"></span><h4 id="movie-title"></h4><p id="movie-detail"></p></div></div>
      <div class="movie-controls"><button type="button" id="movie-prev" aria-label="Предыдущий этап">‹</button><button type="button" id="movie-play" class="movie-play">▶ Смотреть путь</button><button type="button" id="movie-next" aria-label="Следующий этап">›</button></div></div>
    <div class="movie-timeline"><label for="movie-range">Выбрать день маршрута</label><input id="movie-range" type="range" min="0" max="9" value="0" step="1"><div class="movie-days" id="movie-days"></div></div>
    <span id="movie-announcement" class="sr-only" aria-live="polite"></span>`;

  const tracks = root.querySelector('#movie-tracks');
  const nodes = root.querySelector('#movie-nodes');
  const paths = scenes.map((scene, i) => {
    const path = document.createElementNS(ns, 'path');
    path.setAttribute('d', pathFor(scene));
    path.setAttribute('class', 'movie-track');
    path.setAttribute('data-index', i);
    path.style.setProperty('--leg-color', modes[scene.mode === 'mixed' ? 'train' : scene.mode].color);
    tracks.append(path);
    return path;
  });
  used.forEach(key => {
    const place = places[key];
    const circle = document.createElementNS(ns, 'circle');
    circle.setAttribute('cx', place.x);
    circle.setAttribute('cy', place.y);
    circle.setAttribute('r', place.label ? '6' : '3');
    circle.setAttribute('class', place.label ? 'movie-node' : 'movie-node minor');
    nodes.append(circle);
  });
  labelled.forEach(key => {
    const place = places[key];
    const label = document.createElementNS(ns, 'text');
    label.setAttribute('x', place.x + place.label[0]);
    label.setAttribute('y', place.y + place.label[1]);
    label.setAttribute('class', 'movie-place-label');
    label.textContent = place.name;
    nodes.append(label);
  });
  root.querySelector('#movie-days').innerHTML = scenes.map((scene, i) => `<button type="button" data-movie-day="${i}" aria-label="День ${i+1}, ${scene.date} ноября">${scene.date}</button>`).join('');

  let index = 0;
  let progress = reducedMotion() ? 1 : 0;
  let playing = false;
  let raf = 0;
  let previousFrame = 0;
  let dwell = 0;
  let destroyed = false;
  const controller = new AbortController();
  const active = root.querySelector('#movie-active-track');
  const traveler = root.querySelector('#movie-traveler');
  const bearing = root.querySelector('#movie-bearing');
  const vehicle = root.querySelector('#movie-vehicle');
  const contrail = root.querySelector('#movie-contrail');
  const contrailGlow = root.querySelector('#movie-contrail-glow');
  const arrival = root.querySelector('#movie-arrival');
  const viewport = root.querySelector('#movie-map-viewport');
  const geoWrap = root.querySelector('#movie-geo-wrap');
  const sketchButton = root.querySelector('#movie-sketch');
  const geographyButton = root.querySelector('#movie-geography');
  const play = root.querySelector('#movie-play');
  const playTop = root.querySelector('#movie-play-top');
  const range = root.querySelector('#movie-range');
  let shownMode = '';
  let geoMap;

  function modeAt(scene, distance) {
    if (!scene.segmentModes) return scene.mode;
    const keys = scene.points;
    let traversed = 0;
    for (let i = 0; i < keys.length - 1; i++) {
      const a = places[keys[i]];
      const b = places[keys[i + 1]];
      traversed += Math.hypot(b.x - a.x, b.y - a.y);
      if (distance < traversed || i === keys.length - 2) return scene.segmentModes[i];
    }
    return 'train';
  }

  function setMode(mode) {
    if (shownMode === mode) return;
    shownMode = mode;
    const config = modes[mode];
    root.dataset.mode = mode;
    root.style.setProperty('--stage-accent', config.color);
    vehicle.setAttribute('href', `#vehicle-${mode}`);
    root.querySelector('#movie-mode').textContent = `${config.glyph} ${config.label}`;
  }

  function paint(follow = false) {
    const path = paths[index];
    const length = path.getTotalLength();
    active.setAttribute('d', path.getAttribute('d'));
    active.style.strokeDasharray = String(length);
    active.style.strokeDashoffset = String(length * (1 - progress));
    paths.forEach((p, i) => p.classList.toggle('done', i < index));
    const scene = scenes[index];
    const distance = length * progress;
    const point = path.getPointAtLength(distance);
    const mode = modeAt(scene, distance);
    setMode(mode);
    traveler.setAttribute('transform', `translate(${point.x} ${point.y})`);
    const before = path.getPointAtLength(Math.max(0, distance - 4));
    const after = path.getPointAtLength(Math.min(length, distance + 4));
    const angle = mode === 'walk' ? 0 : Math.atan2(after.y - before.y, after.x - before.x) * 180 / Math.PI;
    bearing.setAttribute('transform', `rotate(${angle})`);
    for (const trail of [contrail, contrailGlow]) {
      trail.setAttribute('d', path.getAttribute('d'));
      trail.style.strokeDasharray = `72 ${length + 72}`;
      trail.style.strokeDashoffset = String(72 - distance);
    }
    arrival.setAttribute('transform', `translate(${path.getPointAtLength(length).x} ${path.getPointAtLength(length).y})`);
    arrival.style.opacity = progress > .985 ? '1' : '0';
    geoMap?.paint(index, progress, mode);
    if (follow && viewport.scrollWidth > viewport.clientWidth) {
      const x = point.x / 900 * root.querySelector('#movie-map').clientWidth;
      viewport.scrollLeft = Math.max(0, x - viewport.clientWidth / 2);
    }
  }

  function show(indexToShow, { announce = true, arrived = false } = {}) {
    index = Math.max(0, Math.min(scenes.length - 1, indexToShow));
    progress = reducedMotion() || arrived ? 1 : 0;
    dwell = 0;
    const scene = scenes[index];
    shownMode = '';
    root.querySelector('#movie-counter').textContent = `${String(index+1).padStart(2, '0')} / ${scenes.length}`;
    root.querySelector('#movie-date').textContent = `ДЕНЬ ${index+1} · ${scene.date} НОЯБРЯ`;
    root.querySelector('#movie-title').textContent = scene.title;
    root.querySelector('#movie-detail').textContent = scene.detail;
    range.value = String(index);
    root.querySelectorAll('[data-movie-day]').forEach((button, i) => {
      button.classList.toggle('active', i === index);
      button.setAttribute('aria-current', i === index ? 'step' : 'false');
    });
    root.querySelector('#movie-prev').disabled = index === 0;
    root.querySelector('#movie-next').disabled = index === scenes.length - 1;
    if (announce) {
      root.querySelector('#movie-announcement').textContent = `День ${index+1}, ${scene.date} ноября. ${scene.title}.`;
      onDay?.(scene.date);
    }
    paint(true);
  }

  function setMapView(view) {
    preferredMap = view;
    const real = view === 'geo';
    viewport.hidden = real;
    geoWrap.hidden = !real;
    sketchButton.setAttribute('aria-pressed', String(!real));
    geographyButton.setAttribute('aria-pressed', String(real));
    root.querySelector('#movie-map-note').textContent = real
      ? 'Города стоят на географической карте. Цветные линии показывают порядок поездки, а не точную трассу поезда, автобуса или самолёта.'
      : 'Схема по расположению городов; расстояния и длительность анимации условные.';
    if (real) {
      try {
        if (!geoMap) geoMap = createGeoMap(root.querySelector('#movie-geo-map'), scenes, coordinates, places, modes);
        geoMap.resize();
        geoMap.paint(index, progress, shownMode);
      } catch (error) {
        console.error('Interactive map unavailable:', error);
        preferredMap = 'sketch';
        viewport.hidden = false;
        geoWrap.hidden = true;
        sketchButton.setAttribute('aria-pressed', 'true');
        geographyButton.setAttribute('aria-pressed', 'false');
        root.querySelector('#movie-map-note').textContent = 'Карта не загрузилась. Анимированная схема остаётся доступной.';
      }
    }
  }

  function refreshPlay() {
    play.textContent = reducedMotion() ? 'Следующий этап →' : playing ? 'Ⅱ Пауза' : index === scenes.length - 1 && progress === 1 ? '↻ Повторить путь' : progress === 1 ? '▶ Продолжить' : '▶ Смотреть путь';
    play.setAttribute('aria-label', play.textContent);
    playTop.textContent = reducedMotion() ? 'Следующий этап →' : playing ? 'Ⅱ Пауза' : index === scenes.length - 1 && progress === 1 ? '↻ Повторить' : progress === 1 ? '▶ Продолжить' : '▶ Запустить';
    playTop.setAttribute('aria-label', playTop.textContent);
  }

  function pause() {
    playing = false;
    cancelAnimationFrame(raf);
    previousFrame = 0;
    refreshPlay();
  }

  function tick(time) {
    if (!playing || destroyed) return;
    const delta = previousFrame ? Math.min(80, time - previousFrame) : 0;
    previousFrame = time;
    if (progress < 1) progress = Math.min(1, progress + delta / 1550);
    else dwell += delta;
    paint(true);
    if (progress === 1 && dwell >= 630) {
      if (index === scenes.length - 1) { pause(); return; }
      show(index + 1);
    }
    raf = requestAnimationFrame(tick);
  }

  play.addEventListener('click', () => {
    if (reducedMotion()) { show((index + 1) % scenes.length); refreshPlay(); return; }
    if (playing) { pause(); return; }
    if (index === scenes.length - 1 && progress === 1) show(0);
    playing = true;
    onDay?.(scenes[index].date);
    previousFrame = 0;
    refreshPlay();
    raf = requestAnimationFrame(tick);
  });
  playTop.addEventListener('click', () => play.click());
  sketchButton.addEventListener('click', () => setMapView('sketch'));
  geographyButton.addEventListener('click', () => setMapView('geo'));
  root.querySelector('#movie-fit').addEventListener('click', () => geoMap?.fit());
  root.querySelector('#movie-prev').addEventListener('click', () => { pause(); show(index - 1, { arrived: true }); refreshPlay(); });
  root.querySelector('#movie-next').addEventListener('click', () => { pause(); show(index + 1, { arrived: true }); refreshPlay(); });
  range.addEventListener('input', () => { pause(); show(Number(range.value), { arrived: true }); refreshPlay(); });
  root.querySelectorAll('[data-movie-day]').forEach(button => button.addEventListener('click', () => {
    pause(); show(Number(button.dataset.movieDay), { arrived: true }); refreshPlay();
  }));
  document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); }, { signal: controller.signal });
  show(0, { announce: false });
  setMapView(preferredMap);
  refreshPlay();
  session = { destroy() { destroyed = true; pause(); controller.abort(); geoMap?.destroy(); } };
}
