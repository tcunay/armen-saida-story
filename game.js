'use strict';
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const app = document.getElementById('app');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let cleanup = () => {};
let toastTimer;
let confettiFrame;
// Заранее загружаем иллюстрации, чтобы смена кадров не оставляла пустой экран.
const preloadImages = ['assets/cafe.jpg', 'assets/letter.jpg'].map(src => {
  const img = new Image(); img.src = src; return img;
});
function toast(text) {
  clearTimeout(toastTimer);
  const el = document.getElementById('toast');
  el.textContent = text;
  el.classList.add('visible');
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2400);
}
function mount(html, focus = true) {
  cleanup(); cleanup = () => {};
  app.innerHTML = html;
  if (focus) {
    app.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'auto' });
  }
}
function intro() {
  document.body.classList.remove('revealed');
  cancelAnimationFrame(confettiFrame);
  const c = document.getElementById('confetti'); c.getContext('2d').clearRect(0, 0, c.width, c.height);
  mount(`<section class="hero" aria-labelledby="intro-title">
    <div class="hero-copy"><p class="eyebrow">Маленькая история Армена и Саиды</p>
      <h1 id="intro-title">Обычный вечер.<br><em>Необычная новость.</em></h1>
      <p class="body-copy">У Армена — любимый кофе. У Саиды — конверт,<br>который изменит их привычные вечера.</p>
      <button class="primary" id="start">Начать историю <span class="arrow" aria-hidden="true">→</span></button>
      <div class="under-button"><span>◷ около 20 секунд</span><span>♡ для всех наших</span></div>
    </div>
    <div class="hero-art"><span class="art-star" aria-hidden="true">✳</span><span class="art-star small" aria-hidden="true">✧</span>
      <img class="couple-art" src="assets/couple.png" alt="Рисованные Армен с кофе и стетоскопом и Саида рядом с ним" fetchpriority="high">
      <div class="shipping-tag"><div class="tag-top"><span>Главные герои</span><span>Одна история на двоих</span></div><div class="tag-names">Армен &amp; Саида</div><div class="tag-bottom">У каждого хорошего вечера есть продолжение ♡</div></div>
    </div>
  </section>`);
  document.getElementById('start').onclick = story;
}
function story() {
  mount(`<section class="novella" aria-labelledby="story-title">
    <p class="eyebrow story-eyebrow">Армен &amp; Саида · один особенный вечер</p>
    <div class="story-frame">
      <img class="story-image active" id="cafe-image" src="assets/cafe.jpg" alt="Армен и Саида сидят вместе за столиком">
      <img class="story-image" id="letter-image" src="assets/letter.jpg" alt="Армен и Саида вместе открывают конверт с золотой открыткой">
      <div class="story-shade" aria-hidden="true"></div>
      <div class="story-top"><div class="story-progress" aria-label="Ход истории"><span><i></i></span><span><i></i></span><span><i></i></span></div><button id="pause-story" aria-label="Приостановить историю">Ⅱ</button></div>
      <div class="story-caption" id="story-caption" aria-live="polite"><span class="scene-number" id="scene-number">01 / 03</span><h2 id="story-title">Днём у каждого —<br>свои пациенты.</h2><p id="story-subtitle">Вечером — наконец-то время друг для друга.</p></div>
    </div>
    <div class="story-controls"><span>Чуть-чуть времени для одной большой новости.</span><button class="text-btn" id="open-letter">Открыть конверт <span aria-hidden="true">→</span></button></div>
  </section>`);
  const captions = [
    ['Днём у каждого —<br>свои пациенты.', 'Вечером — наконец-то время друг для друга.'],
    ['Но сегодня кофе<br>успеет остыть.', 'Перед ними — конверт. Открыть его хочется только вместе.'],
    ['Саида открывает его.<br>Армен придвигается ближе.', 'Этой новостью хочется поделиться со всеми своими.'],
  ];
  let elapsed = 0, last = 0, scene = 0, frame, stopped = false, paused = reduceMotion;
  const pause = document.getElementById('pause-story');
  pause.textContent = paused ? '▶' : 'Ⅱ';
  pause.setAttribute('aria-label', paused ? 'Продолжить историю' : 'Приостановить историю');
  pause.onclick = () => {
    paused = !paused;
    pause.textContent = paused ? '▶' : 'Ⅱ';
    pause.setAttribute('aria-label', paused ? 'Продолжить историю' : 'Приостановить историю');
  };
  function show(index) {
    scene = index;
    const caption = document.getElementById('story-caption');
    caption.classList.remove('caption-in'); void caption.offsetWidth;
    document.getElementById('story-title').innerHTML = captions[index][0];
    document.getElementById('story-subtitle').textContent = captions[index][1];
    document.getElementById('scene-number').textContent = `0${index + 1} / 03`;
    document.getElementById('cafe-image').classList.toggle('active', index < 2);
    document.getElementById('letter-image').classList.toggle('active', index === 2);
    caption.classList.add('caption-in');
  }
  function tick(now) {
    if (stopped) return;
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now;
    if (!paused && !document.hidden && preloadImages.every(img => img.complete)) elapsed += dt;
    if (elapsed >= 15) { scratch(); return; }
    const index = Math.min(2, Math.floor(elapsed / 5));
    if (index !== scene) show(index);
    const bars = app.querySelectorAll('.story-progress i');
    bars.forEach((bar, i) => bar.style.width = `${i < index ? 100 : i === index ? (elapsed % 5) / 5 * 100 : 0}%`);
    frame = requestAnimationFrame(tick);
  }
  document.getElementById('open-letter').onclick = scratch;
  frame = requestAnimationFrame(tick);
  cleanup = () => { stopped = true; cancelAnimationFrame(frame); };
}
function scratch() {
  mount(`<section class="stage-wrap" aria-labelledby="scratch-title">
    <div class="stage-heading"><p class="eyebrow">Осталась одна маленькая тайна</p><h2 id="scratch-title">Они открыли конверт.<br><em>Теперь твоя очередь.</em></h2><p class="subtitle">Сотри золотистую пломбу пальцем или мышью.<br>Под ней — их самая важная новость.</p></div>
    <div class="parcel-card"><div class="parcel-top"><div class="recipient">Для вас двоих<b>Армен и Саида</b></div><div class="stamp"><span>♡</span>с любовью<br>для вас</div></div>
      <div class="scratch-surface" id="scratch-surface"><div class="scratch-message" id="secret" aria-hidden="true" inert><span class="reveal-small">Армен и Саида,</span><span class="reveal-main">у вас будет мальчик!</span><span class="reveal-heart" aria-hidden="true">♡</span></div>
        <canvas id="scratch" class="scratch-canvas" role="img" aria-label="Стираемая пломба с секретом. Для раскрытия с клавиатуры используй кнопку под открыткой."></canvas>
      </div><div class="scratch-label"><span id="scratch-hint">Потри пломбу. Здесь кое-что важное.</span><span class="scratch-meter" aria-hidden="true"><span id="scratch-fill"></span></span></div>
    </div><div class="reveal-actions" id="reveal-actions"><button class="text-btn" id="scratch-accessible">Раскрыть секрет без стирания</button></div>
  </section>`);
  const canvas = document.getElementById('scratch'), ctx = canvas.getContext('2d', { willReadFrequently: true });
  const strokes = [];
  let erased = false, drawing = false, point = null, activePointer = null, checkAt = 0;
  function stroke(a, b) {
    ctx.globalCompositeOperation = 'destination-out'; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = canvas.width * .15;
    ctx.beginPath(); ctx.moveTo(a.x * canvas.width, a.y * canvas.height); ctx.lineTo(b.x * canvas.width, b.y * canvas.height); ctx.stroke();
    // A tap is a tiny round scratch, never a whole-card reveal.
    ctx.beginPath(); ctx.arc(b.x * canvas.width, b.y * canvas.height, canvas.width * .075, 0, Math.PI * 2); ctx.fill();
  }
  function resize() {
    if (erased) return;
    const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr); canvas.height = Math.round(rect.height * dpr);
    ctx.globalCompositeOperation = 'source-over';
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#debc73'); gradient.addColorStop(.45, '#edd39a'); gradient.addColorStop(1, '#c6a263');
    ctx.fillStyle = gradient; ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.save(); ctx.scale(dpr, dpr);
    const w = rect.width, h = rect.height;
    ctx.strokeStyle = '#a5803c25'; ctx.lineWidth = 1;
    for (let y = 16; y < h; y += 30) for (let x = 15; x < w; x += 35) {
      ctx.beginPath(); ctx.moveTo(x - 3, y); ctx.lineTo(x + 3, y); ctx.moveTo(x, y - 3); ctx.lineTo(x, y + 3); ctx.stroke();
    }
    ctx.fillStyle = '#554722'; ctx.textAlign = 'center'; ctx.font = '28px Georgia'; ctx.fillText('Самая важная новость', w / 2, h / 2 - 5, w - 35);
    ctx.font = '11px sans-serif'; ctx.fillText('СОТРИ, ЧТОБЫ УЗНАТЬ', w / 2, h / 2 + 24);
    ctx.restore(); strokes.forEach(s => stroke(s.a, s.b));
  }
  function reveal() {
    if (erased) return;
    erased = true; drawing = false;
    canvas.classList.add('clear'); canvas.setAttribute('aria-hidden', 'true');
    const secret = document.getElementById('secret'); secret.removeAttribute('aria-hidden'); secret.removeAttribute('inert');
    document.getElementById('scratch-hint').textContent = 'Теперь начинается новая история ♡';
    document.getElementById('scratch-fill').style.width = '100%';
    const actions = document.getElementById('reveal-actions');
    actions.innerHTML = '<p class="sr-only" role="status">У Армена и Саиды будет мальчик!</p><button class="primary reveal-next" id="final-next">Продолжение их истории <span class="arrow" aria-hidden="true">→</span></button>';
    document.getElementById('final-next').onclick = final;
    document.getElementById('final-next').focus({ preventScroll: true });
    confetti();
  }
  function check() {
    if (erased) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let blank = 0, total = 0;
    for (let y = 4; y < canvas.height; y += 9) for (let x = 4; x < canvas.width; x += 9) {
      total++; if (data[(y * canvas.width + x) * 4 + 3] < 90) blank++;
    }
    const ratio = blank / total;
    document.getElementById('scratch-fill').style.width = `${Math.min(100, ratio / .46 * 100)}%`;
    if (ratio > .46) reveal();
  }
  function coords(event) { const rect = canvas.getBoundingClientRect(); return { x: (event.clientX - rect.left) / rect.width, y: (event.clientY - rect.top) / rect.height }; }
  canvas.addEventListener('pointerdown', event => {
    if (erased || drawing) return; event.preventDefault(); drawing = true; activePointer = event.pointerId;
    point = coords(event); canvas.setPointerCapture(event.pointerId); stroke(point, point); strokes.push({ a: point, b: point }); check();
  });
  canvas.addEventListener('pointermove', event => {
    if (!drawing || erased || event.pointerId !== activePointer) return; event.preventDefault();
    const next = coords(event); stroke(point, next); strokes.push({ a: point, b: next }); point = next;
    if (performance.now() - checkAt > 100) { checkAt = performance.now(); check(); }
  });
  const end = event => { if (event.pointerId !== activePointer) return; drawing = false; point = null; activePointer = null; check(); };
  canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end); canvas.addEventListener('lostpointercapture', end);
  document.getElementById('scratch-accessible').onclick = reveal;
  const observer = new ResizeObserver(resize); observer.observe(canvas); resize();
  cleanup = () => observer.disconnect();
}
function final() {
  document.body.classList.add('revealed');
  mount(`<section class="final" aria-labelledby="final-title"><p class="eyebrow">Теперь ты тоже знаешь ♡</p><h1 id="final-title">Армен и Саида,<br><em style="color:inherit">у вас будет мальчик!</em></h1>
    <p class="body-copy">На кого он будет похож, пока неизвестно.<br>Кто будет его любить — уже понятно.</p>
    <div class="final-art-wrap"><img src="assets/couple.png" alt="Счастливые Армен и Саида, нарисованные по их фотографиям"><div class="welcome-label"><span>Скоро в компании</span>+1 маленький<br>человек ♡</div></div>
    <p class="final-message">Кофе для папы — из «Гандза».<br>А любовь для малыша — от всех нас.</p>
    <div class="final-actions"><button class="primary" id="share">Поделиться историей <span aria-hidden="true">↗</span></button><button class="text-btn" id="again">Посмотреть ещё раз</button></div><p class="final-caption">Армен + Саида + один маленький человек.</p>
  </section>`);
  document.getElementById('again').onclick = intro;
  document.getElementById('share').onclick = share;
  confetti();
}
async function share() {
  const url = location.href.split('#')[0];
  const text = 'Армен и Саида приготовили для нас маленькую историю 💌 В конце — важная новость.';
  try {
    if (navigator.share) await navigator.share({ title: 'Маленькая история Армена и Саиды 💌', text, url });
    else if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(`${text}\n${url}`); toast('Ссылка скопирована. Передай её друзьям 💌'); }
    else { window.prompt('Скопируй ссылку и передай друзьям:', url); }
  } catch (error) {
    if (error.name !== 'AbortError') { window.prompt('Скопируй ссылку и передай друзьям:', url); }
  }
}
function confetti() {
  if (reduceMotion) return;
  cancelAnimationFrame(confettiFrame);
  const canvas = document.getElementById('confetti'), ctx = canvas.getContext('2d');
  canvas.width = innerWidth; canvas.height = innerHeight;
  const colors = ['#d79461', '#8aa59d', '#e3bc66', '#769db0', '#c5d5c8'];
  const pieces = Array.from({ length: 85 }, () => ({ x: Math.random() * canvas.width, y: -Math.random() * canvas.height, w: 4 + Math.random() * 5, h: 4 + Math.random() * 7, vy: 80 + Math.random() * 110, vx: (Math.random() - .5) * 35, r: Math.random() * 6, color: colors[Math.floor(Math.random() * colors.length)] }));
  let last = 0, elapsed = 0;
  function tick(now) {
    const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now; elapsed += dt;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(p => {
      p.y += p.vy * dt; p.x += p.vx * dt; p.r += dt * 2;
      ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.fillStyle = p.color; ctx.globalAlpha = Math.min(1, 5 - elapsed); ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
    });
    if (elapsed < 5) confettiFrame = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
  confettiFrame = requestAnimationFrame(tick);
}
intro();
