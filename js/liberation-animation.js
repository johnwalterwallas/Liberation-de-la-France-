const START = new Date('1944-06-06T00:00:00Z');
const END   = new Date('1945-05-08T00:00:00Z');
const SPAN  = END - START;

// Full animation duration in ms (~22 seconds)
const ANIM_DURATION = 22000;

const slider  = document.getElementById('timeline');
const btn     = document.getElementById('animateBtn');
const dateEl  = document.getElementById('animDate');
const titleEl = document.getElementById('animTitle');
const textEl  = document.getElementById('animText');
const status  = document.getElementById('timelineStatus');
const list    = document.getElementById('eventList');

const TYPE_LABELS = {
  landing: 'Débarquement',
  battle: 'Bataille',
  resistance: 'Résistance',
  pocket: 'Poche'
};

function fmt(d) {
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC'
  });
}

// Build event list
list.innerHTML = BATTLES.map((b, i) => {
  const color = {landing:'#2878d0',battle:'#c43b35',resistance:'#3c9b62',pocket:'#d27b22'}[b[5]];
  return `
    <article class="event-card" data-index="${i}" role="listitem" tabindex="0">
      <time datetime="${b[1]}">${fmt(new Date(b[1] + 'T00:00:00Z'))}</time>
      <div>
        <h3><span class="type-dot" style="background:${color}"></span>${b[2]}</h3>
        <p>${b[6]}</p>
      </div>
    </article>`;
}).join('');

// Click / keyboard on event cards → jump timeline
list.querySelectorAll('.event-card').forEach(card => {
  const jump = () => {
    const i = +card.dataset.index;
    const t = new Date(BATTLES[i][1] + 'T00:00:00Z').getTime();
    const ratio = (t - START.getTime()) / SPAN;
    slider.value = Math.round(ratio * 1000);
    playing = false;
    btn.textContent = '▶ ANIMER LA LIBÉRATION';
    btn.classList.remove('playing');
    status.textContent = 'Lecture arrêtée';
    update();
    // Center map on the event
    map.setView([BATTLES[i][3], BATTLES[i][4]], 7, { animate: true });
    markers[BATTLES[i][0]].openPopup();
  };
  card.addEventListener('click', jump);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); jump(); }
  });
});

function update() {
  const ratio = slider.value / 1000;
  const d = new Date(START.getTime() + ratio * SPAN);
  const visible = BATTLES.filter(b => new Date(b[1] + 'T00:00:00Z') <= d);
  const cur = visible[visible.length - 1] || BATTLES[0];

  dateEl.textContent = fmt(d);
  titleEl.textContent = cur[2];
  textEl.textContent = cur[6];

  BATTLES.forEach((b, i) => {
    const active = new Date(b[1] + 'T00:00:00Z') <= d;
    const m = markers[b[0]];
    m.setStyle({
      opacity: active ? 1 : 0.2,
      fillOpacity: active ? 0.9 : 0.15,
      radius: active ? 8 : 6
    });
    // Highlight corresponding card
    const card = list.children[i];
    if (card) card.classList.toggle('active', active && b[0] === cur[0]);
  });
}

let playing = false;
let last = 0;
let startRatio = 0;
let startTime = 0;

function loop(t) {
  if (!playing) return;
  const elapsed = t - startTime;
  const progress = Math.min(1, elapsed / ANIM_DURATION);
  // Ease out slightly
  const eased = 1 - Math.pow(1 - progress, 1.4);
  slider.value = Math.min(1000, startRatio + eased * (1000 - startRatio));
  update();
  if (progress >= 1) {
    playing = false;
    btn.textContent = '▶ REJOUER LA LIBÉRATION';
    btn.classList.remove('playing');
    status.textContent = 'Animation terminée';
  } else {
    requestAnimationFrame(loop);
  }
}

btn.addEventListener('click', () => {
  if (playing) {
    // Pause
    playing = false;
    btn.textContent = '▶ REPRENDRE';
    btn.classList.remove('playing');
    status.textContent = 'Animation en pause';
  } else {
    // Play / resume
    if (+slider.value >= 1000) {
      slider.value = 0; // restart
    }
    playing = true;
    startRatio = +slider.value;
    startTime = performance.now();
    btn.textContent = '⏸ PAUSE';
    btn.classList.add('playing');
    status.textContent = 'Animation en cours';
    requestAnimationFrame(loop);
  }
});

slider.addEventListener('input', () => {
  playing = false;
  btn.textContent = '▶ ANIMER LA LIBÉRATION';
  btn.classList.remove('playing');
  status.textContent = 'Lecture arrêtée';
  update();
});

// Initial state
update();
