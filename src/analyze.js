/* Честный движок анализа изображения. Работает на <canvas> в браузере.
   Всё, что возвращается, — результат реальных вычислений над пикселями снимка.
   Здесь НЕТ нейросети и НЕТ выдуманных процентов точности.

   Что делает:
   1) Отделяет плод от фона простым порогом по яркости/насыщенности
      (плод обычно ярче и насыщеннее нейтрального фона).
   2) Для пикселей плода считает состав цвета по оттенку (HSV hue):
      красный / оранжевый / жёлтый / зелёный + отдельно «тёмные/бурые».
   3) Считает долю «тёмных зон» — пикселей плода заметно темнее медианной
      яркости плода (сигнал пятен, гнили, побитости).
   4) Оценивает калибр как долю кадра, занятую плодом (относительная величина),
      и однородность цвета как обратную величину разброса оттенка.
   5) Возвращает маску тёмных зон для наложения поверх фото. */

function rgbToHsv(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const s = max === 0 ? 0 : d / max;
  const v = max;
  return [h, s, v];
}

/* Классификация оттенка в цветовые корзины. h в градусах 0..360. */
function hueBucket(h) {
  if (h < 15 || h >= 345) return "red";
  if (h < 45) return "orange";
  if (h < 70) return "yellow";
  if (h < 170) return "green";
  if (h < 290) return "cyan_blue"; // редко для плодов, уводим в «прочее»
  return "red"; // 290..345 — пурпурно-красные (гранат, тёмная черешня)
}

/* Основная функция. imageEl — загруженный HTMLImageElement.
   darkSensitivity 0..1 — насколько агрессивно считать пиксель «тёмным»
   (доля от медианной яркости плода). Возвращает объект метрик + dataURL оверлея. */
export function analyzeImage(imageEl, opts = {}) {
  const darkSensitivity = typeof opts.darkSensitivity === "number" ? opts.darkSensitivity : 0.62;

  // Ограничиваем размер обработки ради скорости, сохраняя пропорции.
  const MAXW = 520;
  const scale = Math.min(1, MAXW / imageEl.naturalWidth);
  const w = Math.max(1, Math.round(imageEl.naturalWidth * scale));
  const h = Math.max(1, Math.round(imageEl.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(imageEl, 0, 0, w, h);
  const img = ctx.getImageData(0, 0, w, h);
  const px = img.data;
  const N = w * h;

  // --- Шаг 1: маска плода (foreground) ---
  // Пиксель принадлежит плоду, если он достаточно насыщен ИЛИ достаточно ярок,
  // и при этом не выглядит как нейтральный светлый фон (низкая насыщенность + высокая яркость).
  const isFruit = new Uint8Array(N);
  const valArr = new Float32Array(N);
  let fruitCount = 0;
  for (let i = 0; i < N; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    const [, s, v] = rgbToHsv(r, g, b);
    valArr[i] = v;
    const neutralBright = s < 0.14 && v > 0.82;   // белый/серый фон стола
    const tooDark = v < 0.06;                      // абсолютная тень/чёрное
    const fruit = !neutralBright && !tooDark && (s > 0.20 || v < 0.72);
    if (fruit) { isFruit[i] = 1; fruitCount++; }
  }
  // Фолбэк: если маска почти пустая (странный кадр) — считаем весь кадр плодом.
  if (fruitCount < N * 0.04) {
    for (let i = 0; i < N; i++) isFruit[i] = 1;
    fruitCount = N;
  }

  // --- Шаг 2: медианная яркость плода (для порога тёмных зон) ---
  // Гистограмма яркости по 64 корзинам, ищем медиану среди пикселей плода.
  const vhist = new Int32Array(64);
  for (let i = 0; i < N; i++) if (isFruit[i]) vhist[Math.min(63, (valArr[i] * 63) | 0)]++;
  let acc = 0, medBin = 0; const half = fruitCount / 2;
  for (let bqu = 0; bqu < 64; bqu++) { acc += vhist[bqu]; if (acc >= half) { medBin = bqu; break; } }
  const medV = medBin / 63;
  const darkCut = medV * darkSensitivity; // порог: темнее этого — «тёмная зона»

  // --- Шаг 3: состав цвета + тёмные зоны + сбор оттенков для однородности ---
  const buckets = { red: 0, orange: 0, yellow: 0, green: 0, dark: 0, other: 0 };
  let darkCount = 0;
  const overlay = ctx.createImageData(w, h);
  const od = overlay.data;
  // Для однородности собираем средний вектор оттенка (круговое среднее).
  let sumSin = 0, sumCos = 0, hueSamples = 0;

  for (let i = 0; i < N; i++) {
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    if (!isFruit[i]) {
      // фон в оверлее — приглушённый оригинал
      od[i * 4] = r * 0.35; od[i * 4 + 1] = g * 0.35; od[i * 4 + 2] = b * 0.35; od[i * 4 + 3] = 255;
      continue;
    }
    const [hue, s, v] = rgbToHsv(r, g, b);

    if (v < darkCut) {
      // тёмная зона — вероятный дефект
      buckets.dark++;
      darkCount++;
      // подсветим красным в оверлее
      od[i * 4] = 230; od[i * 4 + 1] = 40; od[i * 4 + 2] = 40; od[i * 4 + 3] = 255;
    } else {
      // относим к цветовой корзине по оттенку, если пиксель достаточно цветной
      if (s < 0.16) {
        buckets.other++;
      } else {
        const bkt = hueBucket(hue);
        if (bkt === "cyan_blue") buckets.other++;
        else buckets[bkt]++;
        // копим оттенок для меры однородности
        const rad = (hue * Math.PI) / 180;
        sumSin += Math.sin(rad); sumCos += Math.cos(rad); hueSamples++;
      }
      // оверлей — оригинальный пиксель
      od[i * 4] = r; od[i * 4 + 1] = g; od[i * 4 + 2] = b; od[i * 4 + 3] = 255;
    }
  }

  // --- Шаг 4: производные метрики ---
  const pct = (x) => (fruitCount ? (x / fruitCount) * 100 : 0);
  const composition = {
    red: pct(buckets.red),
    orange: pct(buckets.orange),
    yellow: pct(buckets.yellow),
    green: pct(buckets.green),
    dark: pct(buckets.dark),
    other: pct(buckets.other),
  };
  const darkPct = pct(darkCount);
  const fillPct = (fruitCount / N) * 100; // доля кадра, занятая плодом (калибр, относительно)

  // Однородность: длина среднего кругового вектора оттенка R∈[0,1].
  // R≈1 — цвет плода очень ровный; R≈0 — оттенки размазаны.
  let uniformity = 0;
  if (hueSamples > 0) {
    const R = Math.sqrt(sumSin * sumSin + sumCos * sumCos) / hueSamples;
    uniformity = Math.max(0, Math.min(1, R)) * 100;
  }

  ctx.putImageData(overlay, 0, 0);
  const overlayUrl = canvas.toDataURL("image/jpeg", 0.82);

  return {
    composition,        // % по цветовым корзинам, сумма ~100
    darkPct,            // % тёмных зон (дефекты)
    fillPct,            // % заполнения кадра (относительный калибр)
    uniformity,         // % однородности цвета
    fruitCount,
    totalPixels: N,
    overlayUrl,         // dataURL с подсвеченными тёмными зонами
    width: w, height: h,
  };
}

/* Сколько «целевого цвета» на плоде — для выбранного покупателем целевого оттенка.
   targetHue: 'red'|'orange'|'yellow'|'green'|'purple'. */
export function targetColorShare(composition, targetHue) {
  switch (targetHue) {
    case "red":    return composition.red;
    case "orange": return composition.orange + composition.red * 0.4;
    case "yellow": return composition.yellow + composition.orange * 0.4;
    case "green":  return composition.green;
    case "purple": return composition.red; // тёмно-бордовые уходят в red-корзину
    default:       return composition.red;
  }
}

/* Грейдинг строго по порогам пользователя. Возвращает 'A'|'B'|'C' + причину. */
export function gradeFrom(metrics, targetHue, thresholds) {
  const colour = targetColorShare(metrics.composition, targetHue);
  const dark = metrics.darkPct;
  const { aColor, bColor, aDef, bDef } = thresholds;
  if (colour >= aColor && dark <= aDef) return { grade: "A", colour, dark };
  if (colour >= bColor && dark <= bDef) return { grade: "B", colour, dark };
  return { grade: "C", colour, dark };
}
