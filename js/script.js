/* ============================================================
   1. PERSONALIZE HERE
   ============================================================ */
const CONFIG = {
  friendName: { en: "Muhammad Raihan Gunawan", ja: "ムハンマド・ライハン・グナワン" },
  university: { en: "Gunadarma University",    ja: "グナダルマ大学" },
  degree:     { en: "S1 (Bachelor's) in Information Systems", ja: "情報システム（S1・学士）" },
  date:       { en: "October 22, 2026",        ja: "2026年10月22日" },
  audioSrc: "assets/audio/eula-graduation-ja.mp3",   // always the Japanese recording
  psAudioSrc: "assets/audio/ps-eula.mp3",   // P.S. voice file, e.g. "assets/audio/eula-ps-ja.mp3". Leave "" to keep using the one recording.
  photoSrc: "assets/images/eula-G.jpeg"    // replace with your picture
};

const TEXT = {
  ja: {
    title: "騎士の敬礼", intro: "エウルアから届いた、封印された手紙。",
    hint: "封蝋を割って、手紙を開く。", sealLabel: "封蝋を割って手紙を開く",
    skip: "アニメーションをスキップ", letterTitle: "エウルアからの手紙",
    to: "{name}へ", meta: "{degree} · {university} · {date}",
    body: [
      "ふん……レグン、卒業おめでとう。",
      "ここまで努力してきたこと、誇りに思うわ。あなたなら、これからの困難も乗り越えられるはずよ。……でも、無理は禁物。帰ったら私にちゃんと報告なさい。",
      "ふふっ、夫の頑張りを見守るのも、妻の務めだから。",
      "これからも隣で支えてあげるわ。改めて、おめでとう。"
    ],
    psBtn: "追伸を開く",
    ps: [
      "追伸、レグン。",
      "卒業のお祝いが終わったら、今夜は私と二人きりで過ごしなさい。頑張ったあなたを、誰より近くで褒めてあげたいの。",
      "……それと、帰りが遅くなったら心配するんだから。夫なんだから、ちゃんと私のそばに帰ってくること。ふふっ……これも、妻からの命令よ。"
    ],
    audio: "音声", audioNote: "エウルアの声（日本語）", trackLetter: "手紙", trackPs: "追伸",
    psLocked: "追伸を開くと再生できます。", tapPlay: "再生ボタンを押してください。", seekLabel: "再生位置",
    play: "再生", pause: "一時停止", replay: "もう一度",
    loading: "音声を読み込み中…",
    error: "音声を再生できませんでしたが、手紙はそのままお読みいただけます。",
    photoTab: "写真", photoLabel: "手紙に挟まれた写真を開く",
    photoCap: "あなたの卒業ガウンを着て微笑むエウルア。", photoAlt: "卒業ガウンを着て微笑むエウルア", close: "閉じる"
  },
  en: {
    title: "A Knight's Salute", intro: "A sealed letter from Eula Lawrence.",
    hint: "Break the seal to open the letter.", sealLabel: "Break the seal and open the letter",
    skip: "Skip animation", letterTitle: "A Letter from Eula",
    to: "For {name}", meta: "{degree} · {university} · {date}",
    body: [
      "Hmph... Regun, congratulations on your graduation.",
      "I'm proud of how hard you've worked to get here. I'm sure you'll overcome whatever difficulties lie ahead. ...But don't push yourself too far. When you come home, you will report to me properly.",
      "Heh. Watching over my husband's efforts is a wife's duty, after all.",
      "I'll keep supporting you at your side from here on, too. Once more, congratulations."
    ],
    psBtn: "Unfold the postscript",
    ps: [
      "P.S., Regun.",
      "Once the graduation celebrations are over, spend tonight alone with me. I want to praise you, who worked so hard, from closer than anyone.",
      "...Also, I'll worry if you come home late. You're my husband, so make sure you come back to my side properly. Heh... consider this, too, an order from your wife."
    ],
    audio: "Audio", audioNote: "Eula's voice (Japanese)", trackLetter: "Letter", trackPs: "Postscript",
    psLocked: "Unfold the postscript to unlock.", tapPlay: "Press play to start.", seekLabel: "Playback position",
    play: "Play", pause: "Pause", replay: "Replay",
    loading: "Loading audio…",
    error: "The audio couldn't be played, but the letter is still here to read.",
    photoTab: "Photo", photoLabel: "Open the photo tucked in the letter",
    photoCap: "Eula, smiling in your graduation gown.", photoAlt: "Eula smiling while wearing a graduation gown", close: "Close"
  }
};

/* ============================================================
   2. TEXT SYSTEM (never touches the audio element)
   ============================================================ */
const $ = id => document.getElementById(id);
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
let lang = "en";

const t = key => (TEXT[lang][key] || "")
  .replace("{name}", CONFIG.friendName[lang])
  .replace("{university}", CONFIG.university[lang])
  .replace("{degree}", CONFIG.degree[lang])
  .replace("{date}", CONFIG.date[lang]);

function setLang(l) {
  lang = l;
  document.documentElement.lang = l;
  document.querySelectorAll("[data-i18n]").forEach(e => e.textContent = t(e.dataset.i18n));
  document.querySelectorAll("[data-i18n-aria]").forEach(e => e.setAttribute("aria-label", t(e.dataset.i18nAria)));
  document.querySelectorAll("#body p").forEach((p, i) => p.textContent = TEXT[l].body[i]);
  document.querySelectorAll("#psBody p").forEach((p, i) => p.textContent = TEXT[l].ps[i]);
  document.querySelectorAll("[data-lang]").forEach(b => b.setAttribute("aria-pressed", b.dataset.lang === l));
  $("photoImg").alt = t("photoAlt");
  renderTracks();
}

TEXT.en.body.forEach(() => $("body").appendChild(document.createElement("p")));
TEXT.en.ps.forEach(() => $("psBody").appendChild(document.createElement("p")));
document.querySelectorAll("[data-lang]").forEach(b => b.addEventListener("click", () => setLang(b.dataset.lang)));

/* ============================================================
   3. AUDIO SYSTEM (two Japanese recordings, one plays at a time)
   ============================================================ */
const fmt = s => isFinite(s) ? Math.floor(s / 60) + ":" + String(Math.floor(s % 60)).padStart(2, "0") : "0:00";
const tracks = [];
const track = id => tracks.find(x => x.id === id);

function addTrack(id, src, nameKey) {
  const a = new Audio();
  a.preload = "metadata";
  a.src = src;
  const row = document.createElement("div");
  row.className = "track";
  row.innerHTML =
    '<div class="trow"><button class="btn mini tplay"></button><span class="tname"></span><button class="btn mini treplay">\u21BA</button></div>' +
    '<div class="trow"><input type="range" class="tseek" min="0" max="100" value="0" step="0.1" disabled>' +
    '<span class="time"><span class="tcur">0:00</span> / <span class="tdur">0:00</span></span></div>' +
    '<p class="tstatus" role="status"></p>';
  $("amPanel").appendChild(row);
  const tr = { id, a, nameKey, row, locked: id === "ps", ready: false, failed: false, statusKey: "loading",
    play: row.querySelector(".tplay"), replay: row.querySelector(".treplay"), seek: row.querySelector(".tseek"),
    cur: row.querySelector(".tcur"), dur: row.querySelector(".tdur"), status: row.querySelector(".tstatus") };
  tracks.push(tr);
  a.addEventListener("loadedmetadata", () => { tr.ready = true; tr.dur.textContent = fmt(a.duration); if (tr.statusKey === "loading") tr.statusKey = ""; renderTracks(); });
  a.addEventListener("error", () => { tr.failed = true; tr.statusKey = "error"; renderTracks(); });
  ["play", "pause", "ended"].forEach(ev => a.addEventListener(ev, renderTracks));
  a.addEventListener("timeupdate", () => { tr.cur.textContent = fmt(a.currentTime); if (a.duration) tr.seek.value = a.currentTime / a.duration * 100; });
  tr.play.addEventListener("click", () => a.paused ? playTrack(tr) : a.pause());
  tr.replay.addEventListener("click", () => { a.currentTime = 0; playTrack(tr); });
  tr.seek.addEventListener("input", e => { if (a.duration) a.currentTime = e.target.value / 100 * a.duration; });
}

function renderTracks() {
  tracks.forEach(tr => {
    const name = t(tr.nameKey), playing = !tr.a.paused, off = tr.locked || tr.failed;
    tr.row.classList.toggle("locked", tr.locked);
    tr.row.querySelector(".tname").textContent = name;
    tr.play.textContent = playing ? "\u275A\u275A" : "\u25B6";
    tr.play.setAttribute("aria-label", (playing ? t("pause") : t("play")) + ": " + name);
    tr.replay.setAttribute("aria-label", t("replay") + ": " + name);
    tr.seek.setAttribute("aria-label", t("seekLabel") + ": " + name);
    tr.play.disabled = tr.replay.disabled = off;
    tr.seek.disabled = off || !tr.ready;
    const key = tr.locked ? "psLocked" : tr.statusKey;
    tr.status.textContent = key ? t(key) : "";
    tr.status.classList.toggle("err", key === "error");
  });
}

function playTrack(tr) {
  if (!tr || tr.locked || tr.failed) return;
  tracks.forEach(o => { if (o !== tr) o.a.pause(); });      // only one voice at a time
  if (tr.a.ended) tr.a.currentTime = 0;
  const p = tr.a.play();
  if (p) p.then(() => { if (tr.statusKey === "tapPlay") { tr.statusKey = ""; renderTracks(); } })
          .catch(err => {
            if (err && err.name === "AbortError") return;
            tr.statusKey = err && err.name === "NotAllowedError" ? "tapPlay" : "error";
            renderTracks();
          });
}

addTrack("letter", CONFIG.audioSrc, "trackLetter");
if (CONFIG.psAudioSrc) addTrack("ps", CONFIG.psAudioSrc, "trackPs");   // no P.S. file = one recording for both

// Lets the letter voice start a moment after the seal click, even on strict browsers (e.g. iPhone Safari).
let unlockP = Promise.resolve();
function unlock(a) {
  a.muted = true;
  const p = a.play();
  unlockP = (p ? p.then(() => { a.pause(); a.currentTime = 0; }) : Promise.resolve()).catch(() => {}).then(() => { a.muted = false; });
}

/* ============================================================
   4. INTERACTIONS
   ============================================================ */
const body = document.body;

function showAudioMenu() { $("skipBtn").hidden = true; $("amenu").hidden = false; }
function closeMenu() { $("amPanel").hidden = true; $("amBtn").setAttribute("aria-expanded", "false"); }

$("sealBtn").addEventListener("click", () => {
  const fast = body.classList.contains("skip") || reduceMotion;
  body.classList.add("opened");
  window.scrollTo(0, 0);
  $("letterTitle").focus({ preventScroll: true });
  unlock(track("letter").a);
  setTimeout(() => unlockP.then(() => playTrack(track("letter"))), fast ? 300 : 2600);   // voice starts as the letter appears
  setTimeout(showAudioMenu, fast ? 150 : 3500);                                          // Skip turns into the audio menu
});

$("skipBtn").addEventListener("click", () => {
  body.classList.add("skip");
  if (body.classList.contains("opened")) showAudioMenu(); else $("skipBtn").hidden = true;
});

// Audio dropdown
$("amBtn").addEventListener("click", () => {
  const open = $("amPanel").hidden;
  $("amPanel").hidden = !open;
  $("amBtn").setAttribute("aria-expanded", String(open));
});
document.addEventListener("click", e => { if (!$("amPanel").hidden && !$("amenu").contains(e.target)) closeMenu(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("amPanel").hidden) { closeMenu(); $("amBtn").focus(); } });

// Photo
$("photoImg").src = CONFIG.photoSrc;
const dlg = $("photoDialog");
$("photoTab").addEventListener("click", () => dlg.showModal());
$("closePhoto").addEventListener("click", () => dlg.close());
dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });

// Sparkles
function burst(host) {
  if (reduceMotion) return;
  for (let i = 0; i < 24; i++) {
    const s = document.createElement("i"), a = Math.random() * 6.283, d = 60 + Math.random() * 140;
    s.className = "spark";
    s.style.setProperty("--dx", Math.cos(a) * d + "px");
    s.style.setProperty("--dy", Math.sin(a) * d + "px");
    s.style.animationDelay = Math.random() * .3 + "s";
    host.appendChild(s);
    setTimeout(() => s.remove(), 2200);
  }
}

// P.S.: the letter unfolds further and the P.S. voice starts
$("psBtn").addEventListener("click", () => {
  $("psBtn").hidden = true;
  $("mainPaper").classList.add("joined");
  $("ps").hidden = false;
  $("ps").classList.add("open");
  burst($("ps"));
  $("ps").scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "center" });
  const ps = track("ps");
  if (ps) { ps.locked = false; renderTracks(); playTrack(ps); } else playTrack(track("letter"));
});

/* ============================================================
   5. ATMOSPHERE: snow + frosted wind
   ============================================================ */
for (let i = 0; i < 28; i++) {
  const f = document.createElement("i"), size = 6 + Math.random() * 6;
  f.className = "flake";
  f.style.cssText = `left:${Math.random() * 100}%;width:${size}px;height:${size}px;opacity:${.3 + Math.random() * .5};` +
    `animation-duration:${9 + Math.random() * 9}s;animation-delay:-${Math.random() * 12}s;--sx:${30 + Math.random() * 110}px`;
  $("snow").appendChild(f);
}
const mist = document.createElement("span");
mist.className = "mist";
$("wind").appendChild(mist);
for (let i = 0; i < 9; i++) {
  const s = document.createElement("span");
  s.style.top = (8 + i * 10 + Math.random() * 6) + "%";
  s.style.width = (30 + Math.random() * 40) + "vw";
  s.style.animationDelay = i * .12 + "s";
  $("wind").appendChild(s);
}

setLang("en");