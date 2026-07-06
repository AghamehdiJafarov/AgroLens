import React, { useState, useRef, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, LabelList,
} from "recharts";
import {
  ScanLine, Upload, Play, RotateCcw, Download, Info, Globe,
  ArrowLeft, SlidersHorizontal, Camera, Loader2, Leaf,
} from "lucide-react";
import { useLang, t } from "./lang.jsx";
import { analyzeImage, targetColorShare, gradeFrom } from "./analyze.js";

/* ===== Природная агро-палитра (та же, что на лендинге) ===== */
const BG      = "#f4f1e8";
const CARD    = "#fbfaf4";
const PANEL   = "#f0ecdf";
const INK     = "#2a2e22";
const MUTED   = "#6f7359";
const LEAF    = "#3d6b3a";
const LEAF_D  = "#2f5430";
const RIPE    = "#d99a2b";
const EARTH   = "#a8763e";
const CLAY    = "#c05a3a";
const STEEL   = "#5f7a86";
const LINE    = "rgba(90,80,50,0.16)";

/* Пресеты порогов под культуру. */
const PRESETS = {
  apple:       { hue: "red",    aColor: 65, bColor: 40, aDef: 3, bDef: 8, dark: 0.60 },
  tomato:      { hue: "red",    aColor: 70, bColor: 45, aDef: 3, bDef: 7, dark: 0.60 },
  pomegranate: { hue: "purple", aColor: 60, bColor: 38, aDef: 4, bDef: 9, dark: 0.55 },
  cherry:      { hue: "purple", aColor: 62, bColor: 40, aDef: 3, bDef: 7, dark: 0.55 },
  citrus:      { hue: "orange", aColor: 68, bColor: 45, aDef: 3, bDef: 8, dark: 0.62 },
  other:       { hue: "red",    aColor: 60, bColor: 38, aDef: 4, bDef: 9, dark: 0.62 },
};

const GRADE_COLOR = { A: LEAF, B: RIPE, C: CLAY };

const CSS = `
.tool { font-family: Inter, ui-sans-serif, system-ui, sans-serif; color: ${INK}; background: ${BG}; min-height: 100vh; }
.tool-display { font-family: Sora, Inter, sans-serif; }
.tool-num { font-family: Sora, Inter, sans-serif; font-feature-settings: "tnum"; }
.tool-eyebrow { font-family: Sora, sans-serif; letter-spacing: 0.2em; text-transform: uppercase; font-size: 10px; font-weight: 700; }
.tool-btn { transition: transform .15s ease, background .15s ease, box-shadow .15s ease; }
.tool-btn:hover { transform: translateY(-1px); }
.tool-card { background: ${CARD}; border: 1px solid ${LINE}; border-radius: 16px; box-shadow: 0 8px 26px rgba(61,80,40,0.06); }
.tool-input { background: #fff; border: 1px solid ${LINE}; color: ${INK}; border-radius: 10px; }
.tool-input:focus { outline: none; border-color: ${LEAF}; }
.drop { transition: border-color .2s, background .2s; }
.drop.over { border-color: ${LEAF}; background: rgba(61,107,58,0.08); }
@keyframes scanSweep { 0%{ top: 0; opacity:0 } 6%{opacity:1} 94%{opacity:1} 100%{ top: 100%; opacity:0 } }
.scan-sweep { animation: scanSweep 1.4s linear infinite; }
@keyframes spin { to { transform: rotate(360deg) } }
.spin { animation: spin 1s linear infinite; }
@media (prefers-reduced-motion: reduce) { .scan-sweep, .spin { animation: none !important; } }
`;

function LangSwitch() {
  const { lang, setLang } = useLang();
  return (
    <div className="flex items-center gap-1 rounded-full px-1 py-1"
         style={{ background: PANEL, border: `1px solid ${LINE}` }}>
      <Globe size={13} style={{ color: MUTED, marginLeft: 4 }} />
      {["ru", "en", "az"].map((l) => (
        <button key={l} onClick={() => setLang(l)}
          className="tool-btn rounded-full px-2 py-0.5 text-xs font-semibold uppercase"
          style={{ background: lang === l ? LEAF : "transparent", color: lang === l ? "#fff" : MUTED }}>
          {l}
        </button>
      ))}
    </div>
  );
}

function NumField({ label, value, onChange, min = 0, max = 100, step = 1, suffix = "%" }) {
  return (
    <label className="block">
      <span className="text-xs font-medium" style={{ color: MUTED }}>{label}</span>
      <div className="mt-1 flex items-center gap-2">
        <input type="range" min={min} max={max} step={step} value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1" style={{ accentColor: LEAF }} />
        <div className="tool-input tool-num px-2 py-1 text-sm font-semibold text-right" style={{ width: 62 }}>
          {value}{suffix}
        </div>
      </div>
    </label>
  );
}

export default function App() {
  const { lang } = useLang();
  const T = (k) => t(lang, k);

  const [crop, setCrop] = useState("apple");
  const [hue, setHue] = useState(PRESETS.apple.hue);
  const [aColor, setAColor] = useState(PRESETS.apple.aColor);
  const [bColor, setBColor] = useState(PRESETS.apple.bColor);
  const [aDef, setADef] = useState(PRESETS.apple.aDef);
  const [bDef, setBDef] = useState(PRESETS.apple.bDef);
  const [darkSens, setDarkSens] = useState(PRESETS.apple.dark);

  const [imgUrl, setImgUrl] = useState(null);
  const [imgEl, setImgEl] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [over, setOver] = useState(false);
  const fileRef = useRef(null);

  const applyPreset = (c) => {
    setCrop(c);
    const p = PRESETS[c];
    setHue(p.hue); setAColor(p.aColor); setBColor(p.bColor);
    setADef(p.aDef); setBDef(p.bDef); setDarkSens(p.dark);
    setResult(null);
  };

  const loadImage = (url) => {
    const el = new Image();
    el.crossOrigin = "anonymous";
    el.onload = () => { setImgEl(el); setImgUrl(url); setResult(null); };
    el.src = url;
  };

  const onFile = (file) => {
    if (!file || !file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => loadImage(e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = useCallback((e) => {
    e.preventDefault(); setOver(false);
    const f = e.dataTransfer.files && e.dataTransfer.files[0];
    if (f) onFile(f);
  }, []);

  const loadExample = () => {
    const c = document.createElement("canvas");
    c.width = 480; c.height = 360;
    const g = c.getContext("2d");
    g.fillStyle = "#e9e6df"; g.fillRect(0, 0, 480, 360);
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(0,0,0,${Math.random() * 0.04})`;
      g.fillRect(Math.random() * 480, Math.random() * 360, 2, 2);
    }
    const cx = 240, cy = 185, rw = 135, rh = 125;
    const grad = g.createRadialGradient(cx - 45, cy - 45, 20, cx, cy, 150);
    grad.addColorStop(0, "#ef5140");
    grad.addColorStop(0.55, "#c8412c");
    grad.addColorStop(1, "#7f2a20");
    g.fillStyle = grad;
    g.beginPath(); g.ellipse(cx, cy, rw, rh, 0, 0, Math.PI * 2); g.fill();
    const gg = g.createRadialGradient(cx - 95, cy + 20, 10, cx - 95, cy + 20, 90);
    gg.addColorStop(0, "rgba(120,150,60,0.85)");
    gg.addColorStop(1, "rgba(120,150,60,0)");
    g.fillStyle = gg;
    g.beginPath(); g.ellipse(cx - 60, cy + 10, 70, 80, 0, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#2e120d";
    g.beginPath(); g.ellipse(cx + 55, cy + 22, 20, 15, 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(46,18,13,0.5)";
    g.beginPath(); g.ellipse(cx + 55, cy + 22, 30, 24, 0.3, 0, Math.PI * 2); g.fill();
    g.fillStyle = "rgba(255,255,255,0.22)";
    g.beginPath(); g.ellipse(cx - 45, cy - 55, 26, 38, -0.4, 0, Math.PI * 2); g.fill();
    loadImage(c.toDataURL("image/jpeg", 0.9));
  };

  const runAnalysis = () => {
    if (!imgEl) return;
    setBusy(true);
    setTimeout(() => {
      try {
        const m = analyzeImage(imgEl, { darkSensitivity: darkSens });
        const g = gradeFrom(m, hue, { aColor, bColor, aDef, bDef });
        setResult({ ...m, ...g });
      } catch (err) {
        setResult(null);
      }
      setBusy(false);
    }, 650);
  };

  const reset = () => {
    setImgUrl(null); setImgEl(null); setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const cropLabel = () => T("crop_" + crop);
  const hueLabel = () => T("hue_" + hue);

  const histData = useMemo(() => {
    if (!result) return [];
    const c = result.composition;
    return [
      { key: "red",    name: T("hist_red"),    v: c.red,    color: "#c8492f" },
      { key: "orange", name: T("hist_orange"), v: c.orange, color: "#d9822b" },
      { key: "yellow", name: T("hist_yellow"), v: c.yellow, color: "#c9a52a" },
      { key: "green",  name: T("hist_green"),  v: c.green,  color: "#3d6b3a" },
      { key: "dark",   name: T("hist_dark"),   v: c.dark,   color: "#7a4030" },
      { key: "other",  name: T("hist_other"),  v: c.other,  color: "#8a8a70" },
    ].filter((d) => d.v >= 0.5);
  }, [result, lang]);

  const targetShare = result ? targetColorShare(result.composition, hue) : 0;

  const downloadReport = () => {
    if (!result) return;
    const grade = result.grade;
    const now = new Date().toLocaleString(lang === "ru" ? "ru-RU" : lang === "az" ? "az-AZ" : "en-GB");
    const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${T("report_title")}</title>
<style>
  body{font-family:Inter,Arial,sans-serif;color:#2a2e22;max-width:720px;margin:32px auto;padding:0 20px;background:#fbfaf4}
  h1{font-size:22px;margin:0 0 4px} .sub{color:#6f7359;margin:0 0 20px;font-size:13px}
  .grade{display:inline-block;font-size:40px;font-weight:800;color:#fff;background:${GRADE_COLOR[grade]};
         width:70px;height:70px;line-height:70px;text-align:center;border-radius:14px}
  table{border-collapse:collapse;width:100%;margin:18px 0;font-size:14px}
  td{border:1px solid #e2ddcf;padding:8px 10px} td:first-child{color:#6f7359;width:55%}
  td:last-child{font-weight:600;text-align:right}
  img{max-width:100%;border-radius:10px;border:1px solid #e2ddcf;margin-top:12px}
  .note{font-size:12px;color:#8a8a70;margin-top:18px;line-height:1.5}
</style></head><body>
  <h1>${T("report_title")}</h1>
  <p class="sub">${T("report_date")}: ${now}</p>
  <div style="display:flex;gap:20px;align-items:center;margin:10px 0 20px">
    <div class="grade">${grade}</div>
    <div>
      <div style="font-size:12px;color:#6f7359">${T("res_grade")}</div>
      <div style="font-size:15px;font-weight:600">${T("report_crop")}: ${cropLabel()}</div>
    </div>
  </div>
  <table>
    <tr><td>${T("report_crop")}</td><td>${cropLabel()}</td></tr>
    <tr><td>${T("res_target")} (${hueLabel()})</td><td>${targetShare.toFixed(1)}%</td></tr>
    <tr><td>${T("res_dark")}</td><td>${result.darkPct.toFixed(1)}%</td></tr>
    <tr><td>${T("res_size")}</td><td>${result.fillPct.toFixed(0)}% (${T("res_size_rel")})</td></tr>
    <tr><td>${T("res_uniform")}</td><td>${result.uniformity.toFixed(0)}%</td></tr>
    <tr><td>${T("report_standard")}</td><td>A ≥ ${aColor}% / ≤ ${aDef}% · B ≥ ${bColor}% / ≤ ${bDef}%</td></tr>
  </table>
  <img src="${result.overlayUrl}" alt="analysis"/>
  <p class="note">${T("res_disclaimer")}</p>
</body></html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `agrolens-report-${crop}-${Date.now()}.html`;
    a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="tool">
      <style>{CSS}</style>

      <header className="sticky top-0 z-40 backdrop-blur"
              style={{ background: "rgba(244,241,232,0.85)", borderBottom: `1px solid ${LINE}` }}>
        <div className="mx-auto max-w-6xl px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="tool-btn inline-flex items-center gap-1.5 text-sm" style={{ color: MUTED }}>
              <ArrowLeft size={16} /> {T("nav_home")}
            </Link>
            <div className="h-4 w-px" style={{ background: LINE }} />
            <div className="flex items-center gap-2">
              <div className="grid place-items-center rounded-md" style={{ width: 26, height: 26, background: LEAF }}>
                <Leaf size={15} color="#fff" />
              </div>
              <span className="tool-display font-bold" style={{ color: INK }}>{T("brand")}</span>
            </div>
          </div>
          <LangSwitch />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">
        <div className="tool-eyebrow" style={{ color: LEAF }}>{T("app_title")}</div>
        <h1 className="tool-display mt-2 text-2xl font-extrabold" style={{ color: INK }}>{T("app_sub")}</h1>

        <div className="mt-8 grid lg:grid-cols-[360px_1fr] gap-6 items-start">

          <div className="space-y-6">
            <section className="tool-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <SlidersHorizontal size={16} color={LEAF} />
                <h2 className="tool-display text-sm font-bold uppercase tracking-wide" style={{ color: INK }}>{T("step_standard")}</h2>
              </div>

              <label className="block mb-4">
                <span className="text-xs font-medium" style={{ color: MUTED }}>{T("crop_label")}</span>
                <select value={crop} onChange={(e) => applyPreset(e.target.value)}
                        className="tool-input mt-1 w-full px-3 py-2 text-sm">
                  {["apple","tomato","pomegranate","cherry","citrus","other"].map((c) => (
                    <option key={c} value={c}>{T("crop_" + c)}</option>
                  ))}
                </select>
              </label>

              <label className="block mb-4">
                <span className="text-xs font-medium" style={{ color: MUTED }}>{T("target_hue")}</span>
                <select value={hue} onChange={(e) => { setHue(e.target.value); setResult(null); }}
                        className="tool-input mt-1 w-full px-3 py-2 text-sm">
                  {["red","orange","yellow","green","purple"].map((hk) => (
                    <option key={hk} value={hk}>{T("hue_" + hk)}</option>
                  ))}
                </select>
              </label>

              <div className="space-y-3">
                <NumField label={T("thr_a_color")} value={aColor} onChange={setAColor} />
                <NumField label={T("thr_b_color")} value={bColor} onChange={setBColor} />
                <NumField label={T("thr_a_def")} value={aDef} onChange={setADef} max={30} />
                <NumField label={T("thr_b_def")} value={bDef} onChange={setBDef} max={40} />
                <NumField label={T("thr_dark")} value={darkSens} onChange={setDarkSens}
                          min={0.3} max={0.85} step={0.01} suffix="" />
                <p className="text-[11px] leading-relaxed" style={{ color: MUTED }}>{T("thr_hint")}</p>
              </div>

              <p className="mt-4 text-[11px] leading-relaxed rounded-lg p-2.5"
                 style={{ color: "#4d5340", background: "rgba(61,107,58,0.08)", border: "1px solid rgba(61,107,58,0.25)" }}>
                <Info size={12} className="inline mr-1 -mt-0.5" /> {T("preset_note")}
              </p>
            </section>

            <section className="tool-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Camera size={16} color={LEAF} />
                <h2 className="tool-display text-sm font-bold uppercase tracking-wide" style={{ color: INK }}>{T("step_photo")}</h2>
              </div>

              {!imgUrl ? (
                <div className={`drop grid place-items-center text-center rounded-xl px-4 py-10 cursor-pointer ${over ? "over" : ""}`}
                     style={{ border: `1.5px dashed ${EARTH}88` }}
                     onClick={() => fileRef.current && fileRef.current.click()}
                     onDragOver={(e) => { e.preventDefault(); setOver(true); }}
                     onDragLeave={() => setOver(false)}
                     onDrop={onDrop}>
                  <Upload size={26} color={LEAF} />
                  <p className="mt-3 text-sm font-medium" style={{ color: INK }}>{T("drop_here")}</p>
                  <p className="mt-1 text-xs" style={{ color: MUTED }}>{T("drop_formats")}</p>
                </div>
              ) : (
                <div className="relative rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
                  <img src={imgUrl} alt="sample" className="w-full block" style={{ maxHeight: 260, objectFit: "contain", background: PANEL }} />
                  {busy && (
                    <div className="absolute inset-0" style={{ background: "rgba(244,241,232,0.35)" }}>
                      <div className="scan-sweep absolute left-0 right-0" style={{ height: 3, background: `linear-gradient(90deg,transparent,${LEAF},transparent)`, boxShadow: `0 0 14px ${LEAF}` }} />
                    </div>
                  )}
                </div>
              )}

              <input ref={fileRef} type="file" accept="image/*" className="hidden"
                     onChange={(e) => onFile(e.target.files && e.target.files[0])} />

              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={runAnalysis} disabled={!imgEl || busy}
                        className="tool-btn inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold"
                        style={{ background: imgEl && !busy ? LEAF : "rgba(90,80,50,0.15)", color: imgEl && !busy ? "#fff" : MUTED }}>
                  {busy ? <Loader2 size={15} className="spin" /> : <Play size={15} />}
                  {busy ? T("analyzing") : T("btn_analyze")}
                </button>
                <button onClick={loadExample} disabled={busy}
                        className="tool-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold"
                        style={{ border: `1px solid ${LINE}`, color: INK }}>
                  <Camera size={15} /> {T("btn_example")}
                </button>
                {imgUrl && (
                  <button onClick={reset} disabled={busy}
                          className="tool-btn inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold"
                          style={{ border: `1px solid ${LINE}`, color: INK }}>
                    <RotateCcw size={15} /> {T("btn_reset")}
                  </button>
                )}
              </div>
            </section>
          </div>

          <section className="tool-card p-6 min-h-[420px]">
            <div className="flex items-center gap-2 mb-5">
              <ScanLine size={16} color={LEAF} />
              <h2 className="tool-display text-sm font-bold uppercase tracking-wide" style={{ color: INK }}>{T("step_result")}</h2>
            </div>

            {!result ? (
              <div className="grid place-items-center text-center py-20">
                <ScanLine size={40} color="rgba(90,110,60,0.35)" />
                <p className="mt-4 text-sm" style={{ color: MUTED, maxWidth: 320 }}>{T("res_empty")}</p>
              </div>
            ) : (
              <div>
                <div className="grid sm:grid-cols-[auto_1fr] gap-6 items-center">
                  <div className="grid place-items-center rounded-2xl"
                       style={{ width: 108, height: 108, background: GRADE_COLOR[result.grade] }}>
                    <div className="text-center">
                      <div className="text-[10px] uppercase tracking-widest text-white/85">{T("res_grade")}</div>
                      <div className="tool-num text-6xl font-extrabold text-white leading-none">{result.grade}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Metric label={`${T("res_target")} · ${hueLabel()}`} value={`${targetShare.toFixed(1)}%`} color={LEAF} />
                    <Metric label={T("res_dark")} value={`${result.darkPct.toFixed(1)}%`} color={CLAY} />
                    <Metric label={T("res_size")} value={`${result.fillPct.toFixed(0)}%`} sub={T("res_size_rel")} color={RIPE} />
                    <Metric label={T("res_uniform")} value={`${result.uniformity.toFixed(0)}%`} color={STEEL} />
                  </div>
                </div>

                <div className="mt-5 rounded-xl px-4 py-3 text-sm leading-relaxed"
                     style={{ background: `${GRADE_COLOR[result.grade]}16`, border: `1px solid ${GRADE_COLOR[result.grade]}44`, color: "#3f4433" }}>
                  <span className="font-semibold" style={{ color: GRADE_COLOR[result.grade] }}>{T("res_reason")}: </span>
                  {result.grade === "A" ? T("res_because_a") : result.grade === "B" ? T("res_because_b") : T("res_because_c")}
                </div>

                <div className="mt-6 grid md:grid-cols-2 gap-5">
                  <div>
                    <div className="text-xs font-semibold mb-2" style={{ color: MUTED }}>{T("res_overlay")}</div>
                    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
                      <img src={result.overlayUrl} alt="overlay" className="w-full block" style={{ background: PANEL }} />
                    </div>
                    <p className="mt-2 text-[11px]" style={{ color: MUTED }}>
                      <span className="inline-block w-2.5 h-2.5 rounded-sm align-middle mr-1" style={{ background: CLAY }} />
                      {T("res_overlay_hint")}
                    </p>
                  </div>
                  <div>
                    <div className="text-xs font-semibold mb-2" style={{ color: MUTED }}>{T("res_composition")}</div>
                    <div style={{ height: 210 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={histData} layout="vertical" margin={{ left: 4, right: 30, top: 4, bottom: 4 }}>
                          <XAxis type="number" hide domain={[0, 100]} />
                          <YAxis type="category" dataKey="name" width={78}
                                 tick={{ fill: MUTED, fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Bar dataKey="v" radius={[0, 5, 5, 0]}>
                            {histData.map((d, i) => <Cell key={i} fill={d.color} />)}
                            <LabelList dataKey="v" position="right"
                                       formatter={(v) => `${v.toFixed(0)}%`}
                                       style={{ fill: INK, fontSize: 11, fontWeight: 600 }} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button onClick={downloadReport}
                          className="tool-btn inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold"
                          style={{ background: LEAF, color: "#fff" }}>
                    <Download size={15} /> {T("res_download")}
                  </button>
                </div>
                <p className="mt-4 text-[11px] leading-relaxed rounded-lg p-3"
                   style={{ color: MUTED, background: PANEL, border: `1px solid ${LINE}` }}>
                  <Info size={12} className="inline mr-1 -mt-0.5" /> {T("res_disclaimer")}
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function Metric({ label, value, sub, color }) {
  return (
    <div className="rounded-xl px-3 py-2.5" style={{ background: "#f0ecdf", border: `1px solid ${LINE}` }}>
      <div className="text-[10px] uppercase tracking-wide leading-tight" style={{ color: MUTED }}>{label}</div>
      <div className="tool-num text-xl font-bold mt-0.5" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px]" style={{ color: MUTED }}>{sub}</div>}
    </div>
  );
}
