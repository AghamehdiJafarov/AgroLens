import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  ScanLine, Palette, AlertTriangle, Ruler, Camera, SlidersHorizontal,
  FileCheck, ArrowRight, Globe, Check, X, Leaf, CircleDot,
} from "lucide-react";
import { useLang, t } from "./lang.jsx";

const ACCENT = "#0d7a68";
const AMBER = "#d98e2b";
const RED = "#c2452f";

const CSS = `
.lp { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: #dfe6ee; background: #0a1420; overflow-x: hidden; }
.lp-display { font-family: Sora, Inter, sans-serif; }
.lp-num { font-family: Sora, Inter, sans-serif; font-feature-settings: "tnum"; }
.lp-eyebrow { font-family: Sora, sans-serif; letter-spacing: 0.22em; text-transform: uppercase; font-size: 11px; font-weight: 700; }

@keyframes lpGrad { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
.lp-hero-bg {
  background: radial-gradient(1200px 700px at 12% 8%, rgba(13,122,104,0.18), transparent 60%),
              radial-gradient(1000px 600px at 88% 24%, rgba(217,142,43,0.10), transparent 55%),
              linear-gradient(135deg, #081019, #0a1420 40%, #0d1826);
  background-size: 180% 180%; animation: lpGrad 22s ease-in-out infinite;
}

/* сканирующая линия по образцу — «сигнатура» страницы */
@keyframes lpScan { 0%{ transform: translateY(0); opacity:0 } 8%{opacity:1} 92%{opacity:1} 100%{ transform: translateY(210px); opacity:0 } }
.lp-scanline { animation: lpScan 3.2s cubic-bezier(.5,.1,.5,.9) infinite; }
@keyframes lpTick { 0%,100%{ opacity:.25 } 50%{ opacity:1 } }
.lp-tick { animation: lpTick 1.6s ease-in-out infinite; }

.reveal { opacity: 0; transform: translateY(26px); transition: opacity .7s cubic-bezier(.2,.7,.2,1), transform .7s cubic-bezier(.2,.7,.2,1); }
.reveal.in { opacity: 1; transform: none; }

.lp-btn { transition: transform .18s ease, box-shadow .18s ease, background .18s ease; }
.lp-btn:hover { transform: translateY(-2px); }
.lp-card { transition: transform .3s cubic-bezier(.2,.7,.2,1), border-color .3s, background .3s; }
.lp-card:hover { transform: translateY(-6px); border-color: rgba(13,122,104,0.55); background: rgba(16,26,40,0.9); }

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

/* Живой макет «образец под сканером» — сигнатурный элемент hero.
   Плод, по нему сверху вниз идёт сканирующая линия, сбоку — измеряемые бары. */
function ScanSample({ T }) {
  return (
    <div className="relative w-full" style={{ maxWidth: 460 }}>
      <div className="relative rounded-2xl overflow-hidden"
           style={{ border: "1px solid rgba(120,150,170,0.22)", background: "#0d1826", height: 300 }}>
        {/* сетка-фон */}
        <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.5 }}>
          <defs>
            <pattern id="g" width="26" height="26" patternUnits="userSpaceOnUse">
              <path d="M26 0H0V26" fill="none" stroke="rgba(120,150,170,0.10)" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>

        {/* «плод» — стилизованное яблоко из SVG-градиента */}
        <svg viewBox="0 0 200 200" className="absolute" style={{ left: 44, top: 44, width: 150, height: 150 }}>
          <defs>
            <radialGradient id="apple" cx="40%" cy="35%" r="75%">
              <stop offset="0%" stopColor="#e64b3c" />
              <stop offset="55%" stopColor="#c2452f" />
              <stop offset="100%" stopColor="#7d2b21" />
            </radialGradient>
          </defs>
          <path d="M100 44 C130 20 172 34 168 78 C196 120 150 186 100 176 C50 186 4 120 32 78 C28 34 70 20 100 44 Z" fill="url(#apple)" />
          {/* тёмная зона-дефект */}
          <ellipse cx="128" cy="112" rx="15" ry="11" fill="#3a140f" opacity="0.85" />
          <ellipse cx="128" cy="112" rx="20" ry="16" fill="none" stroke={RED} strokeWidth="2" className="lp-tick" />
          {/* блик */}
          <ellipse cx="74" cy="70" rx="16" ry="22" fill="#fff" opacity="0.18" />
          {/* черенок */}
          <path d="M100 46 C104 30 112 24 120 22" fill="none" stroke="#5a3a1a" strokeWidth="4" strokeLinecap="round" />
        </svg>

        {/* сканирующая линия */}
        <div className="lp-scanline absolute left-3 right-3" style={{ top: 40, height: 2,
          background: `linear-gradient(90deg, transparent, ${ACCENT}, transparent)`,
          boxShadow: `0 0 12px ${ACCENT}` }} />
        <div className="lp-scanline absolute left-3 right-3" style={{ top: 40, height: 30,
          background: `linear-gradient(180deg, ${ACCENT}22, transparent)` }} />
      </div>

      {/* плавающие «показания» */}
      <div className="lp-card absolute -right-3 top-6 rounded-xl px-3 py-2"
           style={{ background: "#0f1a28", border: "1px solid rgba(13,122,104,0.45)" }}>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8aa0b2" }}>{T("hero_badge_grade")}</div>
        <div className="lp-num text-lg font-bold flex items-center gap-1" style={{ color: ACCENT }}>
          <Check size={15} /> A
        </div>
      </div>
      <div className="lp-card absolute -left-4 bottom-14 rounded-xl px-3 py-2"
           style={{ background: "#0f1a28", border: "1px solid rgba(217,142,43,0.4)" }}>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8aa0b2" }}>{T("hero_badge_color")}</div>
        <div className="lp-num text-base font-bold" style={{ color: AMBER }}>81%</div>
      </div>
      <div className="lp-card absolute right-6 -bottom-3 rounded-xl px-3 py-2"
           style={{ background: "#0f1a28", border: "1px solid rgba(194,69,47,0.4)" }}>
        <div className="text-[10px] uppercase tracking-wider" style={{ color: "#8aa0b2" }}>{T("hero_badge_def")}</div>
        <div className="lp-num text-base font-bold" style={{ color: RED }}>4%</div>
      </div>
    </div>
  );
}

function LangSwitch() {
  const { lang, setLang } = useLang();
  const langs = ["ru", "en", "az"];
  return (
    <div className="flex items-center gap-1 rounded-full px-1 py-1"
         style={{ background: "rgba(16,26,40,0.7)", border: "1px solid rgba(120,150,170,0.2)" }}>
      <Globe size={14} style={{ color: "#8aa0b2", marginLeft: 4 }} />
      {langs.map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className="lp-btn rounded-full px-2.5 py-1 text-xs font-semibold uppercase"
          style={{
            background: lang === l ? ACCENT : "transparent",
            color: lang === l ? "#fff" : "#9fb2c2",
          }}>
          {l}
        </button>
      ))}
    </div>
  );
}

function Eyebrow({ children, color = ACCENT }) {
  return <div className="lp-eyebrow reveal" style={{ color }}>{children}</div>;
}

export default function Landing() {
  useReveal();
  const { lang } = useLang();
  const T = (k) => t(lang, k);

  const measures = [
    { ic: Palette,        color: ACCENT, h: T("what1_h"), p: T("what1_p") },
    { ic: AlertTriangle,  color: RED,    h: T("what2_h"), p: T("what2_p") },
    { ic: Ruler,          color: AMBER,  h: T("what3_h"), p: T("what3_p") },
  ];

  const steps = [
    { ic: SlidersHorizontal, h: T("how1_h"), p: T("how1_p") },
    { ic: Camera,            h: T("how2_h"), p: T("how2_p") },
    { ic: ScanLine,          h: T("how3_h"), p: T("how3_p") },
    { ic: FileCheck,         h: T("how4_h"), p: T("how4_p") },
  ];

  const cans = [T("honest_can_1"), T("honest_can_2"), T("honest_can_3"), T("honest_can_4")];
  const cants = [T("honest_cant_1"), T("honest_cant_2"), T("honest_cant_3"), T("honest_cant_4")];

  return (
    <div className="lp">
      <style>{CSS}</style>

      {/* NAV */}
      <header className="sticky top-0 z-40 backdrop-blur"
              style={{ background: "rgba(10,20,32,0.72)", borderBottom: "1px solid rgba(120,150,170,0.12)" }}>
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center rounded-lg" style={{ width: 32, height: 32, background: ACCENT }}>
              <ScanLine size={18} color="#fff" />
            </div>
            <span className="lp-display text-lg font-extrabold tracking-tight">{T("brand")}</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm" style={{ color: "#9fb2c2" }}>
            <a href="#what" className="hover:text-white transition">{T("nav_what")}</a>
            <a href="#how" className="hover:text-white transition">{T("nav_how")}</a>
            <a href="#honest" className="hover:text-white transition">{T("nav_honest")}</a>
          </nav>
          <div className="flex items-center gap-3">
            <LangSwitch />
            <Link to="/app" className="lp-btn hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold"
                  style={{ background: ACCENT, color: "#fff" }}>
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
                style={{ fontSize: "clamp(30px, 4.4vw, 52px)", whiteSpace: "pre-line" }}>
              {T("hero_h")}
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed reveal" style={{ color: "#b7c6d3", maxWidth: 560 }}>
              {T("hero_p")}
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3 reveal">
              <Link to="/app" className="lp-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold"
                    style={{ background: ACCENT, color: "#fff", boxShadow: "0 10px 30px rgba(13,122,104,0.35)" }}>
                {T("hero_cta")} <ArrowRight size={17} />
              </Link>
              <Link to="/app" className="lp-btn inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                    style={{ border: "1px solid rgba(120,150,170,0.35)", color: "#dfe6ee" }}>
                <CircleDot size={16} /> {T("hero_demo")}
              </Link>
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
            <Eyebrow color={RED}>{T("prob_eyebrow")}</Eyebrow>
            <h2 className="lp-display mt-4 text-3xl md:text-[34px] font-extrabold leading-tight reveal">
              {T("prob_h")}
            </h2>
          </div>
          <p className="text-[15px] leading-relaxed reveal" style={{ color: "#aebecb" }}>
            {T("prob_p")}
          </p>
        </div>
      </section>

      {/* ЧТО ИЗМЕРЯЕТСЯ */}
      <section id="what" className="border-y" style={{ borderColor: "rgba(120,150,170,0.12)", background: "#081019" }}>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Eyebrow>{T("what_eyebrow")}</Eyebrow>
          <h2 className="lp-display mt-4 text-3xl md:text-[34px] font-extrabold leading-tight reveal" style={{ maxWidth: 640 }}>
            {T("what_h")}
          </h2>
          <p className="mt-4 text-[15px] reveal" style={{ color: "#9fb2c2", maxWidth: 620 }}>{T("what_p")}</p>
          <div className="mt-12 grid md:grid-cols-3 gap-5">
            {measures.map((m, i) => {
              const Ic = m.ic;
              return (
                <div key={i} className="lp-card reveal rounded-2xl p-6"
                     style={{ background: "rgba(16,26,40,0.6)", border: "1px solid rgba(120,150,170,0.18)" }}>
                  <div className="grid place-items-center rounded-xl mb-4" style={{ width: 44, height: 44, background: `${m.color}1f`, border: `1px solid ${m.color}55` }}>
                    <Ic size={22} color={m.color} />
                  </div>
                  <h3 className="lp-display text-lg font-bold">{m.h}</h3>
                  <p className="mt-2 text-sm leading-relaxed" style={{ color: "#a8b8c5" }}>{m.p}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* КАК РАБОТАЕТ */}
      <section id="how" className="mx-auto max-w-6xl px-5 py-20">
        <Eyebrow>{T("how_eyebrow")}</Eyebrow>
        <h2 className="lp-display mt-4 text-3xl md:text-[34px] font-extrabold leading-tight reveal" style={{ maxWidth: 620 }}>
          {T("how_h")}
        </h2>
        <div className="mt-12 grid md:grid-cols-4 gap-5">
          {steps.map((s, i) => {
            const Ic = s.ic;
            return (
              <div key={i} className="reveal relative">
                <div className="lp-num text-5xl font-extrabold" style={{ color: "rgba(13,122,104,0.28)" }}>
                  {i + 1}
                </div>
                <div className="grid place-items-center rounded-xl -mt-4 mb-3" style={{ width: 42, height: 42, background: "rgba(13,122,104,0.14)", border: "1px solid rgba(13,122,104,0.4)" }}>
                  <Ic size={20} color={ACCENT} />
                </div>
                <h3 className="lp-display text-base font-bold">{s.h}</h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "#a3b4c1" }}>{s.p}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ЧЕСТНО О ТОЧНОСТИ */}
      <section id="honest" className="border-y" style={{ borderColor: "rgba(120,150,170,0.12)", background: "#081019" }}>
        <div className="mx-auto max-w-6xl px-5 py-20">
          <Eyebrow color={AMBER}>{T("honest_eyebrow")}</Eyebrow>
          <h2 className="lp-display mt-4 text-3xl md:text-[34px] font-extrabold leading-tight reveal" style={{ maxWidth: 680 }}>
            {T("honest_h")}
          </h2>
          <div className="mt-12 grid md:grid-cols-2 gap-5">
            {/* умеет */}
            <div className="lp-card reveal rounded-2xl p-6" style={{ background: "rgba(13,122,104,0.08)", border: "1px solid rgba(13,122,104,0.4)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="grid place-items-center rounded-lg" style={{ width: 32, height: 32, background: `${ACCENT}22` }}>
                  <Check size={18} color={ACCENT} />
                </div>
                <h3 className="lp-display text-lg font-bold" style={{ color: ACCENT }}>{T("honest_can_h")}</h3>
              </div>
              <ul className="space-y-3">
                {cans.map((c, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: "#c3d0da" }}>
                    <Check size={16} color={ACCENT} className="mt-0.5 shrink-0" /> <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* не умеет */}
            <div className="lp-card reveal rounded-2xl p-6" style={{ background: "rgba(194,69,47,0.06)", border: "1px solid rgba(194,69,47,0.35)" }}>
              <div className="flex items-center gap-2 mb-4">
                <div className="grid place-items-center rounded-lg" style={{ width: 32, height: 32, background: `${RED}22` }}>
                  <X size={18} color={RED} />
                </div>
                <h3 className="lp-display text-lg font-bold" style={{ color: "#e0715e" }}>{T("honest_cant_h")}</h3>
              </div>
              <ul className="space-y-3">
                {cants.map((c, i) => (
                  <li key={i} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: "#c9c0bd" }}>
                    <X size={16} color={RED} className="mt-0.5 shrink-0" /> <span>{c}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <p className="mt-6 text-sm leading-relaxed reveal rounded-xl p-4"
             style={{ color: "#9fb2c2", background: "rgba(16,26,40,0.6)", border: "1px solid rgba(120,150,170,0.15)" }}>
            <Leaf size={15} color={ACCENT} className="inline mr-2 -mt-0.5" />
            {T("honest_note")}
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-5 py-24 text-center">
        <h2 className="lp-display text-3xl md:text-4xl font-extrabold reveal">{T("final_h")}</h2>
        <p className="mt-4 text-[15px] reveal mx-auto" style={{ color: "#a8b8c5", maxWidth: 520 }}>{T("final_p")}</p>
        <div className="mt-8 reveal">
          <Link to="/app" className="lp-btn inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold"
                style={{ background: ACCENT, color: "#fff", boxShadow: "0 12px 34px rgba(13,122,104,0.4)" }}>
            {T("final_btn")} <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t" style={{ borderColor: "rgba(120,150,170,0.12)" }}>
        <div className="mx-auto max-w-6xl px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="grid place-items-center rounded-md" style={{ width: 24, height: 24, background: ACCENT }}>
              <ScanLine size={14} color="#fff" />
            </div>
            <span className="lp-display font-bold">{T("brand")}</span>
          </div>
          <p className="text-xs" style={{ color: "#7d90a0" }}>{T("foot")}</p>
        </div>
      </footer>
    </div>
  );
}
