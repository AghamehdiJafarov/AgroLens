import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ScanLine, Palette, AlertTriangle, Ruler, Camera, SlidersHorizontal,
  FileCheck, ArrowRight, Globe, Check, X, Leaf, CircleDot, Play, Download,
} from "lucide-react";
import { useLang, t } from "./lang.jsx";

/* ===== Природная агро-палитра ===== */
const BG      = "#f4f1e8";  // тёплый кремово-бумажный фон
const BG_ALT  = "#ebe6d6";  // чуть темнее для чередующихся секций
const CARD    = "#fbfaf4";  // карточки — почти белые, тёплые
const INK     = "#2a2e22";  // тёмный текст: коричнево-зелёный, не чёрный
const MUTED   = "#6f7359";  // приглушённый текст — оливковый
const LEAF    = "#3d6b3a";  // листовой зелёный — основной акцент
const LEAF_D  = "#2f5430";  // тёмный лист для контраста
const RIPE    = "#d99a2b";  // спелый золотисто-янтарный
const EARTH   = "#a8763e";  // земля/дерево — тёплая охра
const CLAY    = "#c05a3a";  // терракота дефектов (спелый помидор / брак)
const LINE    = "rgba(90,80,50,0.16)"; // тёплые разделители

// ↓ ВСТАВЬ СЮДА ID своего YouTube-ролика (часть после watch?v= или youtu.be/).
// Пример: из https://www.youtube.com/watch?v=dQw4w9WgXcQ  →  YT_ID = "dQw4w9WgXcQ"
// Пока стоит REPLACE — на сайте показывается аккуратная заглушка вместо ролика.
const YT_ID = "REPLACE_WITH_YOUTUBE_ID";

// Имя файла презентации. Положи PDF с этим именем в папку public/ — кнопка его скачает.
const DECK_FILE = "/AgroLens.pdf";

const CSS = `
.lp { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: ${INK}; background: ${BG}; overflow-x: hidden; }
.lp-display { font-family: Sora, Inter, sans-serif; }
.lp-num { font-family: Sora, Inter, sans-serif; font-feature-settings: "tnum"; }
.lp-eyebrow { font-family: Sora, sans-serif; letter-spacing: 0.2em; text-transform: uppercase; font-size: 11px; font-weight: 700; }

@keyframes lpGrad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
.lp-hero-bg {
  background: radial-gradient(1100px 640px at 14% 6%, rgba(61,107,58,0.14), transparent 60%),
              radial-gradient(900px 560px at 88% 22%, rgba(217,154,43,0.16), transparent 55%),
              linear-gradient(160deg, #f6f3ea, ${BG} 45%, #efe9d8);
  background-size: 180% 180%; animation: lpGrad 24s ease-in-out infinite;
}

/* сканирующая линия по образцу — «сигнатура» страницы */
@keyframes lpScan { 0%{ transform: translateY(0); opacity:0 } 8%{opacity:1} 92%{opacity:1} 100%{ transform: translateY(210px); opacity:0 } }
.lp-scanline { animation: lpScan 3.2s cubic-bezier(.5,.1,.5,.9) infinite; }
@keyframes lpTick { 0%,100%{ opacity:.3 } 50%{ opacity:1 } }
.lp-tick { animation: lpTick 1.6s ease-in-out infinite; }

.reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
.reveal.in { opacity: 1; transform: none; }

.lp-btn { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
.lp-btn:hover { transform: translateY(-2px); }
.lp-card { transition: transform .3s cubic-bezier(.2,.7,.2,1), border-color .3s, box-shadow .3s; }
.lp-card:hover { transform: translateY(-6px); border-color: rgba(61,107,58,0.5); box-shadow: 0 16px 40px rgba(61,80,40,0.12); }

@media (prefers-reduced-motion: reduce) {
  .lp-hero-bg, .lp-scanline, .lp-tick { animation: none !important; }
  .reveal { opacity: 1; transform: none; transition: none; }
}
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add("in"); }),
      { threshold: 0.14 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

/* Живой макет «образец под сканером» — сигнатурный элемент hero. */
function ScanSample({ T }) {
  return (
    <div className="relative w-full" style={{ maxWidth: 460 }}>
      <div className="relative rounded-2xl overflow-hidden"
           style={{ border: `1px solid ${LINE}`, background: "#eef0e2", height: 300, boxShadow: "0 20px 50px rgba(61,80,40,0.14)" }}>
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.6 }}>
          <defs>
            <pattern id="g" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0H0V26" fill="none" stroke="rgba(90,110,60,0.14)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>

        <svg viewBox="0 0 200 200" className="absolute" style={{ left: 44, top: 44, width: 150, height: 150 }}>
          <defs>
            <radialGradient id="apple" cx="40%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#e0563e" />
              <stop offset="55%" stopColor="#c04a30" />
              <stop offset="100%" stopColor="#7f2f20" />
            </radialGradient>
          </defs>
          <path d="M100 44 C130 20 172 34 168 78 C196 120 150 186 100 176 C50 186 4 120 32 78 C28 34 70 20 100 44 Z" fill="url(#apple)" />
          {/* зелёный недозрелый бок */}
          <path d="M100 44 C70 20 28 34 32 78 C20 118 44 168 84 176 C64 150 58 96 74 60 C82 46 92 44 100 44 Z" fill="#5c8a3a" opacity="0.5" />
          {/* тёмная зона-дефект */}
          <ellipse cx="128" cy="112" rx="15" ry="11" fill="#3a140f" opacity="0.85" />
          <ellipse cx="128" cy="112" rx="20" ry="16" fill="none" stroke={CLAY} strokeWidth="2" className="lp-tick" />
          <ellipse cx="74" cy="70" rx="16" ry="22" fill="#fff" opacity="0.22" />
          <path d="M100 46 C104 30 112 24 120 22" fill="none" stroke="#6b4a1a" strokeWidth="4" strokeLinecap="round" />
          {/* листок */}
          <path d="M112 26 C126 18 140 22 138 34 C128 40 116 36 112 26 Z" fill="#4c8a3a" />
        </svg>

        <div className="lp-scanline absolute left-3 right-3" style={{ top: 40, height: 2,
          background: `linear-gradient(90deg, transparent, ${LEAF}, transparent)`,
          boxShadow: `0 0 12px ${LEAF}` }} />
        <div className="lp-scanline absolute left-3 right-3" style={{ top: 40, height: 30,
          background: `linear-gradient(180deg, ${LEAF}26, transparent)` }} />
      </div>

      <div className="lp-card absolute -right-3 top-6 rounded-xl px-3 py-2"
           style={{ background: CARD, border: `1px solid rgba(61,107,58,0.4)`, boxShadow: "0 8px 20px rgba(61,80,40,0.12)" }}>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>{T("hero_badge_grade")}</div>
        <div className="lp-num text-lg font-bold flex items-center gap-1" style={{ color: LEAF }}>
          <Check size={15} /> A
        </div>
      </div>
      <div className="lp-card absolute -left-4 bottom-14 rounded-xl px-3 py-2"
           style={{ background: CARD, border: `1px solid rgba(217,154,43,0.45)`, boxShadow: "0 8px 20px rgba(61,80,40,0.12)" }}>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>{T("hero_badge_color")}</div>
        <div className="lp-num text-base font-bold" style={{ color: RIPE }}>81%</div>
      </div>
      <div className="lp-card absolute right-6 -bottom-3 rounded-xl px-3 py-2"
           style={{ background: CARD, border: `1px solid rgba(192,90,58,0.45)`, boxShadow: "0 8px 20px rgba(61,80,40,0.12)" }}>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: MUTED }}>{T("hero_badge_def")}</div>
        <div className="lp-num text-base font-bold" style={{ color: CLAY }}>4%</div>
      </div>
    </div>
  );
}

function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 rounded-full px-1 py-1"
         style={{ background: "#eef0e2", border: `1px solid ${LINE}` }}>
      <Globe size={14} style={{ color: MUTED, marginLeft: 4 }} />
      {["ru", "en", "az"].map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className="lp-btn rounded-full px-2.5 py-1 text-xs font-semibold uppercase"
          style={{ background: lang === l ? LEAF : "transparent", color: lang === l ? "#fff" : MUTED }}>
          {l}
        </button>
      ))}
    </div>
  );
}

function Eyebrow({ children, color = LEAF }) {
  return <div className="lp-eyebrow reveal" style={{ color }}>{children}</div>;
}

export default function Landing() {
  useReveal();
  const { lang } = useLang();
  const T = (k) => t(lang, k);

  const measures = [
    { ic: Palette,        color: LEAF,  h: T("what1_h"), p: T("what1_p") },
    { ic: AlertTriangle,  color: CLAY,  h: T("what2_h"), p: T("what2_p") },
    { ic: Ruler,          color: RIPE,  h: T("what3_h"), p: T("what3_p") },
  ];

  const steps = [
    { ic: SlidersHorizontal, h: T("how1_h"), p: T("how1_p") },
    { ic: Camera,            h: T("how2_h"), p: T("how2_p") },
    { ic: ScanLine,          h: T("how3_h"), p: T("how3_p") },
    { ic: FileCheck,         h: T("how4_h"), p: T("how4_p") },
  ];

  const cans = [T("honest_can_1"), T("honest_can_2"), T("honest_can_3"), T("honest_can_4")];
  const cants = [T("honest_cant_1"), T("honest_cant_2"), T("honest_cant_3"), T("honest_cant_4")];

  const deckMissing = DECK_FILE === "/AgroLens.pdf"; // подсказка: файл может ещё не быть загружен

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur"
              style={{ background: "rgba(244,241,232,0.82)", borderBottom: `1px solid ${LINE}` }}>
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center rounded-lg" style={{ width: 32, height: 32, background: LEAF }}>
              <Leaf size={18} color="#fff" />
            </div>
            <span className="lp-display text-lg font-extrabold tracking-tight">{T("brand")}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: MUTED }}>
            <a href="#what" className="hover:text-[#2a2e22] transition">{T("nav_what")}</a>
            <a href="#how" className="hover:text-[#2a2e22] transition">{T("nav_how")}</a>
            <a href="#promo" className="hover:text-[#2a2e22] transition">{T("vid_eyebrow")}</a>
            <a href="#honest" className="hover:text-[#2a2e22] transition">{T("nav_honest")}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LangSwitch />
            <a href={DECK_FILE} download
               className="lp-btn hidden lg:inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold"
               style={{ border: `1px solid ${LINE}`, color: INK }} title={T("nav_deck")}>
              <Download size={15} /> <span className="hidden xl:inline">{T("nav_deck")}</span>
            </a>
            <Link to="/app" className="lp-btn hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ background: LEAF, color: "#fff" }}>
              {T("nav_open")} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="lp-hero-bg">
        <div className="mx-auto max-w-6xl px-5 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <Eyebrow>{T("hero_eyebrow")}</Eyebrow>
            <h1 className="lp-display mt-4 font-extrabold leading-[1.08] reveal"
                style={{ fontSize: "clamp(30px, 4.4vw, 52px)", whiteSpace: "pre-line", color: INK }}>
              {T("hero_h")}
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed reveal" style={{ color: "#4d5340", maxWidth: 560 }}>
              {T("hero_p")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 reveal">
              <Link to="/app" className="lp-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
                    style={{ background: LEAF, color: "#fff", boxShadow: "0 10px 30px rgba(61,107,58,0.32)" }}>
                {T("hero_cta")} <ArrowRight size={17} />
              </Link>
              <a href="#promo" className="lp-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                    style={{ border: `1px solid ${EARTH}`, color: EARTH }}>
                <Play size={16} /> {T("hero_watch")}
              </a>
            </div>
          </div>
          <div className="flex justify-center md:justify-end reveal">
            <ScanSample T={T} />
          </div>
        </div>
      </section>

      {/* ПРОБЛЕМА */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid md:grid-cols-[0.9fr_1.1fr] gap-10 items-start">
          <div>
            <Eyebrow color={CLAY}>{T("prob_eyebrow")}</Eyebrow>
            <h2 className="lp-display mt-4 text-3xl md:text-[34px] font-extrabold leading-tight reveal" style={{ color: INK }}>
              {T("prob_h")}
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed reveal" style={{ color: "#4d5340" }}>
            {T("prob_p")}
          </p>
        </div>
      </section>

      {/* ЧТО ИЗМЕРЯЕТСЯ */}
      <section id="what" className="border-y" style={{ borderColor: LINE, background: BG_ALT }}>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Eyebrow>{T("what_eyebrow")}</Eyebrow>
          <h2 className="lp-display mt-4 text-3xl md:text-[34px] font-extrabold leading-tight reveal" style={{ maxWidth: 640, color: INK }}>
            {T("what_h")}
          </h2>
          <p className="mt-4 text-[15px] reveal" style={{ color: MUTED, maxWidth: 620 }}>{T("what_p")}</p>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {measures.map((m, i) => {
              const Ic = m.ic;
              return (
                <div key={i} className="lp-card reveal rounded-2xl p-6"
                     style={{ background: CARD, border: `1px solid ${LINE}` }}>
                  <div className="grid place-items-center rounded-xl mb-4" style={{ width: 44, height: 44, background: `${m.color}1c`, border: `1px solid ${m.color}55` }}>
                    <Ic size={22} color={m.color} />
                  </div>
                  <h3 className="lp-display text-lg font-bold" style={{ color: INK }}>{m.h}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "#575c46" }}>{m.p}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* КАК РАБОТАЕТ */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <Eyebrow>{T("how_eyebrow")}</Eyebrow>
        <h2 className="lp-display mt-4 text-3xl md:text-[34px] font-extrabold leading-tight reveal" style={{ maxWidth: 620, color: INK }}>
          {T("how_h")}
        </h2>
        <div className="mt-12 grid md:grid-cols-4 gap-5">
          {steps.map((s, i) => {
            const Ic = s.ic;
            return (
              <div key={i} className="reveal relative">
                <div className="lp-num text-5xl font-extrabold" style={{ color: "rgba(61,107,58,0.24)" }}>
                  {i + 1}
                </div>
                <div className="grid place-items-center rounded-xl -mt-4 mb-3" style={{ width: 42, height: 42, background: "rgba(61,107,58,0.12)", border: "1px solid rgba(61,107,58,0.4)" }}>
                  <Ic size={20} color={LEAF} />
                </div>
                <h3 className="lp-display text-base font-bold" style={{ color: INK }}>{s.h}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "#575c46" }}>{s.p}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ПРОМО-ВИДЕО */}
      <section id="promo" className="border-y" style={{ borderColor: LINE, background: BG_ALT }}>
        <div className="mx-auto max-w-4xl px-5 py-20">
          <div className="reveal mb-10 text-center">
            <div className="lp-eyebrow mb-3" style={{ color: RIPE }}>{T("vid_eyebrow")}</div>
            <h2 className="lp-display font-extrabold mb-3" style={{ fontSize: "clamp(1.6rem,3.4vw,2.4rem)", color: INK }}>{T("vid_h")}</h2>
            <p style={{ color: MUTED }}>{T("vid_p")}</p>
          </div>
          <div className="reveal rounded-3xl overflow-hidden" style={{ border: `1px solid ${LINE}`, boxShadow: "0 24px 60px rgba(61,80,40,0.16)", transitionDelay: ".1s" }}>
            <div style={{ position: "relative", paddingTop: "56.25%", background: "#eef0e2" }}>
              {YT_ID === "REPLACE_WITH_YOUTUBE_ID" ? (
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column",
                              alignItems: "center", justifyContent: "center", gap: 12, textAlign: "center", padding: 24 }}>
                  <div className="grid place-items-center rounded-full" style={{ width: 64, height: 64, background: `${RIPE}22`, border: `1px solid ${RIPE}66` }}>
                    <Play size={30} color={RIPE} />
                  </div>
                  <div className="lp-display font-semibold" style={{ color: INK }}>
                    {T("vid_placeholder_h")}
                  </div>
                  <div className="text-sm" style={{ color: MUTED, maxWidth: 380 }}>
                    {T("vid_placeholder_p")}
                  </div>
                </div>
              ) : (
                <iframe
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0 }}
                  src={"https://www.youtube-nocookie.com/embed/" + YT_ID}
                  title="AgroLens promo"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ЧЕСТНО О ТОЧНОСТИ */}
      <section id="honest" className="mx-auto max-w-6xl px-5 py-20">
        <Eyebrow color={EARTH}>{T("honest_eyebrow")}</Eyebrow>
        <h2 className="lp-display mt-4 text-3xl md:text-[34px] font-extrabold leading-tight reveal" style={{ maxWidth: 680, color: INK }}>
          {T("honest_h")}
        </h2>
        <div className="mt-12 grid md:grid-cols-2 gap-5">
          <div className="lp-card reveal rounded-2xl p-6" style={{ background: "rgba(61,107,58,0.08)", border: "1px solid rgba(61,107,58,0.4)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="grid place-items-center rounded-lg" style={{ width: 32, height: 32, background: `${LEAF}20` }}>
                <Check size={18} color={LEAF} />
              </div>
              <h3 className="lp-display text-lg font-bold" style={{ color: LEAF_D }}>{T("honest_can_h")}</h3>
            </div>
            <ul className="space-y-3">
              {cans.map((c, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: "#3f4433" }}>
                  <Check size={16} color={LEAF} className="mt-0.5 shrink-0" /> <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lp-card reveal rounded-2xl p-6" style={{ background: "rgba(192,90,58,0.07)", border: "1px solid rgba(192,90,58,0.35)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="grid place-items-center rounded-lg" style={{ width: 32, height: 32, background: `${CLAY}20` }}>
                <X size={18} color={CLAY} />
              </div>
              <h3 className="lp-display text-lg font-bold" style={{ color: "#9e4527" }}>{T("honest_cant_h")}</h3>
            </div>
            <ul className="space-y-3">
              {cants.map((c, i) => (
                <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: "#5a4238" }}>
                  <X size={16} color={CLAY} className="mt-0.5 shrink-0" /> <span>{c}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-6 text-sm leading-relaxed reveal rounded-xl p-4"
           style={{ color: "#575c46", background: CARD, border: `1px solid ${LINE}` }}>
          <Leaf size={15} color={LEAF} className="inline mr-2 -mt-0.5" />
          {T("honest_note")}
        </p>
      </section>

      {/* ПРЕЗЕНТАЦИЯ */}
      <section className="border-y" style={{ borderColor: LINE, background: BG_ALT }}>
        <div className="mx-auto max-w-4xl px-5 py-16">
          <div className="lp-card reveal rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
               style={{ background: CARD, border: `1px solid ${LINE}` }}>
            <div className="flex items-start gap-4">
              <div className="grid place-items-center rounded-xl shrink-0" style={{ width: 48, height: 48, background: `${EARTH}1c`, border: `1px solid ${EARTH}55` }}>
                <FileCheck size={24} color={EARTH} />
              </div>
              <div>
                <div className="lp-eyebrow mb-2" style={{ color: EARTH }}>{T("deck_eyebrow")}</div>
                <h2 className="lp-display font-bold text-xl mb-1.5" style={{ color: INK }}>{T("deck_h")}</h2>
                <p className="text-sm" style={{ color: "#575c46" }}>{T("deck_p")}</p>
              </div>
            </div>
            <a href={DECK_FILE} download
               className="lp-btn inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shrink-0"
               style={{ background: EARTH, color: "#fff", boxShadow: "0 10px 26px rgba(168,118,62,0.3)" }}>
              <Download size={16} /> {T("deck_btn")}
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h2 className="lp-display text-3xl md:text-4xl font-extrabold reveal" style={{ color: INK }}>{T("final_h")}</h2>
        <p className="mt-4 text-[15px] reveal mx-auto" style={{ color: "#575c46", maxWidth: 520 }}>{T("final_p")}</p>
        <div className="mt-8 reveal">
          <Link to="/app" className="lp-btn inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold"
                style={{ background: LEAF, color: "#fff", boxShadow: "0 12px 34px rgba(61,107,58,0.36)" }}>
            {T("final_btn")} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: LINE }}>
        <div className="mx-auto max-w-6xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center rounded-md" style={{ width: 24, height: 24, background: LEAF }}>
              <Leaf size={14} color="#fff" />
            </div>
            <span className="lp-display font-bold" style={{ color: INK }}>{T("brand")}</span>
          </div>
          <p className="text-xs" style={{ color: MUTED }}>{T("foot")}</p>
        </div>
      </footer>
    </div>
  );
}
