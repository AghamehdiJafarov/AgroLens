import React, { createContext, useContext, useState, useEffect } from "react";

/* Общий языковой контекст. Хранит выбранный язык, синхронно на лендинге и в инструменте.
   Три языка: ru / en / az. Наследует паттерн переключателя из ChainSenseAI. */

const LangCtx = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem("agrolens_lang");
      if (saved === "ru" || saved === "en" || saved === "az") return saved;
    } catch {}
    return "ru";
  });
  useEffect(() => {
    try { localStorage.setItem("agrolens_lang", lang); } catch {}
    if (typeof document !== "undefined") document.documentElement.lang = lang;
  }, [lang]);
  return <LangCtx.Provider value={{ lang, setLang }}>{children}</LangCtx.Provider>;
}

export function useLang() {
  const ctx = useContext(LangCtx);
  if (!ctx) return { lang: "ru", setLang: () => {} };
  return ctx;
}

/* Переводы. t(lang, key) с безопасным фолбэком на английский, затем на сам ключ. */
export const DICT = {
  /* ---------- общие / навигация ---------- */
  brand:          { ru: "AgroLens",                    en: "AgroLens",                     az: "AgroLens" },
  nav_open:       { ru: "Открыть инструмент",          en: "Open the tool",                az: "Aləti aç" },
  nav_home:       { ru: "На главную",                  en: "Home",                         az: "Ana səhifə" },
  nav_how:        { ru: "Как это работает",            en: "How it works",                 az: "Necə işləyir" },
  nav_what:       { ru: "Что измеряется",              en: "What it measures",             az: "Nə ölçülür" },
  nav_honest:     { ru: "Честно о точности",           en: "Honestly about accuracy",      az: "Dəqiqlik barədə dürüst" },

  /* ---------- HERO ---------- */
  hero_eyebrow:   { ru: "Оценка качества по фото · без оборудования",
                    en: "Photo-based quality grading · no hardware",
                    az: "Şəkil əsasında keyfiyyət qiymətləndirməsi · avadanlıqsız" },
  hero_h:         { ru: "Сфотографируй партию —\nполучи объективный сорт",
                    en: "Photograph a batch —\nget an objective grade",
                    az: "Partiyanı çək —\nobyektiv dərəcə al" },
  hero_p:         { ru: "Камера телефона вместо калибровочного кольца и цветовой палитры. Инструмент читает реальные пиксели снимка — состав цвета, тёмные зоны, оценку калибра — и выставляет сорт A/B/C по стандарту, который ты задаёшь под своего покупателя. Всё считается прямо в браузере, фото никуда не уходит.",
                    en: "Your phone camera instead of a sizing ring and a colour poster. The tool reads the actual pixels of the photo — colour composition, dark zones, a size estimate — and assigns an A/B/C grade against a standard you define per buyer. Everything runs in your browser; the photo never leaves the device.",
                    az: "Kalibrləmə halqası və rəng palitrası əvəzinə telefon kamerası. Alət şəklin real piksellərini oxuyur — rəng tərkibi, tünd zonalar, kalibr qiyməti — və alıcıya görə təyin etdiyin standarta uyğun A/B/C dərəcəsi verir. Hər şey brauzerdə hesablanır, şəkil heç yerə getmir." },
  hero_cta:       { ru: "Открыть инструмент",           en: "Open the tool",                az: "Aləti aç" },
  hero_demo:      { ru: "Смотреть на примере",          en: "See a worked example",         az: "Nümunəyə bax" },
  hero_badge_grade:{ ru: "Сорт",                        en: "Grade",                        az: "Dərəcə" },
  hero_badge_color:{ ru: "Красный",                     en: "Red",                          az: "Qırmızı" },
  hero_badge_def: { ru: "Дефекты",                      en: "Defects",                      az: "Qüsurlar" },
  hero_badge_size:{ ru: "Калибр",                       en: "Size",                         az: "Kalibr" },

  /* ---------- ПРОБЛЕМА ---------- */
  prob_eyebrow:   { ru: "Проблема",                     en: "Problem",                      az: "Problem" },
  prob_h:         { ru: "Качество оценивают на глаз — и теряют на этом деньги",
                    en: "Quality is judged by eye — and money is lost on it",
                    az: "Keyfiyyət gözlə qiymətləndirilir — və buna görə pul itirilir" },
  prob_p:         { ru: "Сегодня приёмщик берёт кольцо, палитру и решает субъективно; покупатель не видит, что именно в партии, и сбивает цену словами «товар слабый». Проверяется около 1% партии, остальное — вслепую. Отсюда споры о цене, отказы на приёмке и потери. Отраслевые оценки: до 45% свежей продукции теряется в цепочке, и главный драйвер — рассогласование по качеству.",
                    en: "Today an inspector grabs a ring and a colour poster and decides subjectively; the buyer can't see what's actually in the batch and drives the price down claiming \"weak produce\". Roughly 1% of a batch gets checked, the rest is blind. Hence price disputes, rejections at intake, and losses. Industry estimates: up to 45% of fresh produce is lost along the chain, and the main driver is quality mismatch.",
                    az: "Bu gün qəbulçu halqa və palitra götürüb subyektiv qərar verir; alıcı partiyada nə olduğunu görmür və \"məhsul zəifdir\" deyib qiyməti aşağı salır. Partiyanın təxminən 1%-i yoxlanılır, qalanı kor-koranə. Buradan qiymət mübahisələri, qəbulda imtinalar və itkilər. Sənaye qiymətləndirmələri: təzə məhsulun 45%-ə qədəri zəncir boyu itir, əsas səbəb isə keyfiyyət uyğunsuzluğudur." },

  /* ---------- ЧТО ИЗМЕРЯЕТСЯ ---------- */
  what_eyebrow:   { ru: "Что измеряется",               en: "What it measures",             az: "Nə ölçülür" },
  what_h:         { ru: "Три величины, которые считаются из самих пикселей",
                    en: "Three quantities computed from the pixels themselves",
                    az: "Piksellərin özündən hesablanan üç kəmiyyət" },
  what_p:         { ru: "Никакой магии и никаких выдуманных процентов. Инструмент делает ровно то, что говорит, и показывает исходные числа.",
                    en: "No magic and no invented percentages. The tool does exactly what it says and shows the raw numbers.",
                    az: "Sehr yoxdur, uydurma faizlər yoxdur. Alət dediyini dəqiq edir və ilkin rəqəmləri göstərir." },
  what1_h:        { ru: "Состав цвета",                  en: "Colour composition",           az: "Rəng tərkibi" },
  what1_p:        { ru: "Доля красного, зелёного, жёлтого и бурого на плоде — по среднему оттенку каждого пикселя. Так определяется зрелость: зелёный томат и красный томат — это разный сорт для покупателя.",
                    en: "The share of red, green, yellow and brown across the fruit — from the average hue of each pixel. This is how ripeness is read: a green tomato and a red tomato are different grades to a buyer.",
                    az: "Meyvədə qırmızı, yaşıl, sarı və qonurun payı — hər pikselin orta çalarına görə. Yetişkənlik belə müəyyən olunur: yaşıl pomidor və qırmızı pomidor alıcı üçün fərqli dərəcədir." },
  what2_h:        { ru: "Тёмные зоны — вероятные дефекты",en: "Dark zones — likely defects",  az: "Tünd zonalar — ehtimal olunan qüsurlar" },
  what2_p:        { ru: "Доля площади плода, которая заметно темнее основного тона: пятна, гниль, механические повреждения, побитость. Это не диагноз болезни, а честный сигнал «здесь есть на что посмотреть».",
                    en: "The share of the fruit's area noticeably darker than the base tone: spots, rot, mechanical damage, bruising. Not a disease diagnosis — an honest flag that \"there's something to look at here\".",
                    az: "Meyvənin əsas tonundan nəzərəçarpacaq dərəcədə tünd olan sahəsinin payı: ləkələr, çürümə, mexaniki zədələr, əzilmə. Bu, xəstəlik diaqnozu deyil, dürüst siqnaldır ki, \"burada baxmalı bir şey var\"." },
  what3_h:        { ru: "Оценка калибра",                en: "Size estimate",                az: "Kalibr qiyməti" },
  what3_p:        { ru: "Насколько плод занимает кадр и насколько он однороден по форме. Абсолютные миллиметры требуют эталона в кадре (например, монеты) — без него это относительная оценка, и инструмент честно об этом говорит.",
                    en: "How much of the frame the fruit occupies and how uniform its shape is. Absolute millimetres require a reference in the frame (a coin, say) — without one this is a relative estimate, and the tool says so plainly.",
                    az: "Meyvənin kadrı nə qədər tutması və formasının nə qədər bircins olması. Mütləq millimetrlər kadrda etalon tələb edir (məsələn, sikkə) — onsuz bu nisbi qiymətdir və alət bunu açıq deyir." },

  /* ---------- КАК РАБОТАЕТ ---------- */
  how_eyebrow:    { ru: "Как это работает",             en: "How it works",                 az: "Necə işləyir" },
  how_h:          { ru: "Четыре шага, ни одного лишнего",en: "Four steps, none of them spare",az: "Dörd addım, heç biri artıq deyil" },
  how1_h:         { ru: "Задай стандарт",               en: "Set the standard",             az: "Standartı təyin et" },
  how1_p:         { ru: "Один раз опиши пороги под покупателя: с какого процента красного плод считается сортом A, сколько тёмных зон допустимо. Это твои правила, не наши.",
                    en: "Describe the thresholds for a buyer once: from what share of red a fruit counts as grade A, how many dark zones are acceptable. These are your rules, not ours.",
                    az: "Alıcı üçün həddləri bir dəfə təsvir et: meyvə hansı qırmızı faizindən A dərəcəsi sayılır, nə qədər tünd zona qəbul edilir. Bunlar sənin qaydalarındır, bizim yox." },
  how2_h:         { ru: "Сфотографируй партию",          en: "Photograph the batch",         az: "Partiyanı çək" },
  how2_p:         { ru: "Один снимок ящика или разложенных плодов. Чем ровнее свет и фон, тем чище измерение — как и у промышленных систем.",
                    en: "One shot of a crate or laid-out fruit. The more even the light and background, the cleaner the measurement — same as with industrial systems.",
                    az: "Qutunun və ya düzülmüş meyvələrin bir şəkli. İşıq və fon nə qədər bərabər olsa, ölçmə bir o qədər təmiz olar — sənaye sistemlərində olduğu kimi." },
  how3_h:         { ru: "Смотри анализ",                en: "Watch the analysis",           az: "Təhlilə bax" },
  how3_p:         { ru: "Инструмент проходит по пикселям и на глазах строит гистограмму цвета и карту тёмных зон. Видно, из чего сложилась оценка.",
                    en: "The tool sweeps the pixels and builds the colour histogram and dark-zone map before your eyes. You can see what the grade was built from.",
                    az: "Alət piksellərdən keçir və gözünün önündə rəng histoqramını və tünd zona xəritəsini qurur. Dərəcənin nədən yarandığı görünür." },
  how4_h:         { ru: "Получи сорт и отчёт",           en: "Get the grade and report",     az: "Dərəcə və hesabat al" },
  how4_p:         { ru: "Итоговый сорт A/B/C по твоему стандарту плюс отчёт с числами и фото. Отчёт можно приложить к партии — покупатель видит то же, что и ты.",
                    en: "A final A/B/C grade against your standard, plus a report with numbers and the photo. Attach the report to the batch — the buyer sees exactly what you see.",
                    az: "Sənin standartına görə yekun A/B/C dərəcəsi, üstəlik rəqəmlər və şəkillə hesabat. Hesabatı partiyaya əlavə et — alıcı sənin gördüyünü görür." },

  /* ---------- ЧЕСТНО О ТОЧНОСТИ ---------- */
  honest_eyebrow: { ru: "Честно о точности",            en: "Honestly about accuracy",      az: "Dəqiqlik barədə dürüst" },
  honest_h:       { ru: "Что этот инструмент умеет и чего пока не умеет",
                    en: "What this tool can and cannot yet do",
                    az: "Bu alət nə bacarır və hələ nə bacarmır" },
  honest_can_h:   { ru: "Умеет уже сейчас",             en: "Can do right now",             az: "İndi bacarır" },
  honest_cant_h:  { ru: "Пока не умеет",                en: "Cannot do yet",                az: "Hələ bacarmır" },
  honest_can_1:   { ru: "Честно измерять состав цвета плода из пикселей — это точная арифметика, а не оценка.",
                    en: "Honestly measure a fruit's colour composition from pixels — this is exact arithmetic, not a guess.",
                    az: "Meyvənin rəng tərkibini piksellərdən dürüst ölçmək — bu təxmin deyil, dəqiq hesabdır." },
  honest_can_2:   { ru: "Находить и считать тёмные зоны как сигнал возможных дефектов и побитости.",
                    en: "Find and count dark zones as a signal of possible defects and bruising.",
                    az: "Tünd zonaları mümkün qüsurların və əzilmənin siqnalı kimi tapmaq və saymaq." },
  honest_can_3:   { ru: "Выставлять сорт A/B/C строго по правилам, которые задал ты, — прозрачно и воспроизводимо.",
                    en: "Assign an A/B/C grade strictly by the rules you set — transparently and reproducibly.",
                    az: "A/B/C dərəcəsini məhz sənin qoyduğun qaydalara görə vermək — şəffaf və təkrarlana bilən şəkildə." },
  honest_can_4:   { ru: "Работать офлайн, в браузере, без сервера, оборудования и отправки фото куда-либо.",
                    en: "Work offline, in the browser, with no server, no hardware, and no photo leaving the device.",
                    az: "Oflayn, brauzerdə, serversiz, avadanlıqsız işləmək və şəkli heç yerə göndərmədən." },
  honest_cant_1:  { ru: "Отличать сорт болезни от сорта болезни по фото — для этого нужна обученная модель на тысячах местных снимков.",
                    en: "Tell one disease apart from another by photo — that needs a model trained on thousands of local images.",
                    az: "Bir xəstəliyi digərindən şəkillə ayırmaq — bunun üçün minlərlə yerli şəkildə öyrədilmiş model lazımdır." },
  honest_cant_2:  { ru: "Давать миллиметры без эталона в кадре — пока это относительная, а не абсолютная величина.",
                    en: "Give millimetres without a reference in the frame — for now this is a relative, not an absolute figure.",
                    az: "Kadrda etalon olmadan millimetr vermək — hələlik bu mütləq deyil, nisbi kəmiyyətdir." },
  honest_cant_3:  { ru: "Заявлять 99% точности, как маркетинг некоторых конкурентов. Реалистичная планка обученной модели в поле — около 90%.",
                    en: "Claim 99% accuracy the way some competitors' marketing does. A realistic bar for a field-trained model is around 90%.",
                    az: "Bəzi rəqiblərin marketinqi kimi 99% dəqiqlik iddia etmək. Sahədə öyrədilmiş modelin real həddi təxminən 90%-dir." },
  honest_cant_4:  { ru: "Заменить собой лабораторию по микотоксинам или внутренней зрелости — это другой класс приборов.",
                    en: "Replace a lab for mycotoxins or internal ripeness — that's a different class of instrument.",
                    az: "Mikotoksinlər və ya daxili yetişkənlik üçün laboratoriyanı əvəz etmək — bu, başqa sinif cihazdır." },
  honest_note:    { ru: "По мере того как через инструмент проходят фото, они складываются в размеченную базу под местные культуры — из неё позже обучается модель, которая добавит распознавание болезней. Так же росли базы у промышленных систем: с каждой инспекцией.",
                    en: "As photos pass through the tool, they accumulate into a labelled base for local crops — from which a model is later trained to add disease recognition. Industrial systems' databases grew the same way: with every inspection.",
                    az: "Şəkillər alətdən keçdikcə yerli məhsullar üçün etiketlənmiş bazada toplanır — sonra ondan xəstəlik tanınmasını əlavə edəcək model öyrədilir. Sənaye sistemlərinin bazaları da belə böyüdü: hər yoxlama ilə." },

  /* ---------- ПРОМО-ВИДЕО ---------- */
  vid_eyebrow:    { ru: "Промо",                        en: "Promo",                        az: "Promo" },
  vid_h:          { ru: "Как это работает",             en: "How it works",                 az: "Necə işləyir" },
  vid_p:          { ru: "Короткий обзор инструмента: от фото партии до готового сорта.",
                    en: "A short walkthrough: from a batch photo to a finished grade.",
                    az: "Qısa icmal: partiya şəklindən hazır dərəcəyə qədər." },
  vid_placeholder_h:{ ru: "Место для промо-ролика",     en: "Promo video placeholder",      az: "Promo video yeri" },
  vid_placeholder_p:{ ru: "Вставь ID ролика с YouTube в переменную YT_ID в начале файла Landing.jsx — и здесь появится видео.",
                    en: "Set your YouTube video ID in the YT_ID variable at the top of Landing.jsx and the video will appear here.",
                    az: "YouTube video ID-ni Landing.jsx faylının əvvəlindəki YT_ID dəyişəninə yaz — və burada video görünəcək." },
  hero_watch:     { ru: "Смотреть промо",               en: "Watch promo",                  az: "Promonu izlə" },

  /* ---------- ПРЕЗЕНТАЦИЯ ---------- */
  nav_deck:       { ru: "Презентация",                  en: "Deck",                         az: "Təqdimat" },
  deck_eyebrow:   { ru: "Презентация",                  en: "Deck",                         az: "Təqdimat" },
  deck_h:         { ru: "Полный обзор в одном файле",   en: "The full overview in one file",az: "Tam icmal bir faylda" },
  deck_p:         { ru: "Проблема, инструмент, границы точности и рынок — в одной PDF-презентации для инвестора или партнёра.",
                    en: "Problem, tool, accuracy limits and market — in one PDF deck for an investor or partner.",
                    az: "Problem, alət, dəqiqlik hüdudları və bazar — investor və ya tərəfdaş üçün bir PDF təqdimatında." },
  deck_btn:       { ru: "Скачать презентацию (PDF)",    en: "Download deck (PDF)",          az: "Təqdimatı yüklə (PDF)" },

  /* ---------- CTA финальный ---------- */
  final_h:        { ru: "Проверь на своей фотографии",  en: "Try it on your own photo",     az: "Öz şəklində yoxla" },
  final_p:        { ru: "Инструмент открыт сразу, без регистрации. Загрузи снимок или запусти готовый пример.",
                    en: "The tool is open immediately, no sign-up. Upload a shot or run the built-in example.",
                    az: "Alət dərhal açıqdır, qeydiyyatsız. Şəkil yüklə və ya hazır nümunəni işə sal." },
  final_btn:      { ru: "Открыть инструмент",           en: "Open the tool",                az: "Aləti aç" },
  foot:           { ru: "Оценка качества плодоовощной продукции по фото · RU / EN / AZ",
                    en: "Photo-based fresh-produce quality grading · RU / EN / AZ",
                    az: "Şəkil əsasında meyvə-tərəvəz keyfiyyəti · RU / EN / AZ" },

  /* ================= ИНСТРУМЕНТ (/app) ================= */
  app_title:      { ru: "Инспекция качества",           en: "Quality inspection",           az: "Keyfiyyət yoxlaması" },
  app_sub:        { ru: "Загрузи фото плода или партии — анализ считается в браузере",
                    en: "Upload a photo of a fruit or batch — analysis runs in the browser",
                    az: "Meyvənin və ya partiyanın şəklini yüklə — təhlil brauzerdə hesablanır" },

  step_standard:  { ru: "1 · Стандарт покупателя",      en: "1 · Buyer standard",           az: "1 · Alıcı standartı" },
  step_photo:     { ru: "2 · Фото партии",              en: "2 · Batch photo",              az: "2 · Partiya şəkli" },
  step_result:    { ru: "3 · Результат",                en: "3 · Result",                   az: "3 · Nəticə" },

  crop_label:     { ru: "Культура",                     en: "Crop",                         az: "Məhsul" },
  crop_apple:     { ru: "Яблоко",                       en: "Apple",                        az: "Alma" },
  crop_tomato:    { ru: "Томат",                        en: "Tomato",                       az: "Pomidor" },
  crop_pomegranate:{ ru: "Гранат",                      en: "Pomegranate",                  az: "Nar" },
  crop_cherry:    { ru: "Черешня",                      en: "Cherry",                       az: "Gilas" },
  crop_citrus:    { ru: "Цитрус",                       en: "Citrus",                       az: "Sitrus" },
  crop_other:     { ru: "Другое",                       en: "Other",                        az: "Digər" },

  target_hue:     { ru: "Целевой цвет спелого плода",   en: "Target ripe colour",           az: "Yetişmiş meyvənin hədəf rəngi" },
  hue_red:        { ru: "Красный",                      en: "Red",                          az: "Qırmızı" },
  hue_orange:     { ru: "Оранжевый",                    en: "Orange",                       az: "Narıncı" },
  hue_yellow:     { ru: "Жёлтый",                       en: "Yellow",                       az: "Sarı" },
  hue_green:      { ru: "Зелёный",                      en: "Green",                        az: "Yaşıl" },
  hue_purple:     { ru: "Тёмно-бордовый",               en: "Deep crimson",                 az: "Tünd bordo" },

  thr_a_color:    { ru: "Сорт A: целевого цвета не менее, %",
                    en: "Grade A: target colour at least, %",
                    az: "A dərəcəsi: hədəf rəngi ən azı, %" },
  thr_b_color:    { ru: "Сорт B: целевого цвета не менее, %",
                    en: "Grade B: target colour at least, %",
                    az: "B dərəcəsi: hədəf rəngi ən azı, %" },
  thr_a_def:      { ru: "Сорт A: тёмных зон не более, %",
                    en: "Grade A: dark zones at most, %",
                    az: "A dərəcəsi: tünd zonalar ən çox, %" },
  thr_b_def:      { ru: "Сорт B: тёмных зон не более, %",
                    en: "Grade B: dark zones at most, %",
                    az: "B dərəcəsi: tünd zonalar ən çox, %" },
  thr_dark:       { ru: "Порог «тёмной зоны» (чувствительность)",
                    en: "\"Dark zone\" threshold (sensitivity)",
                    az: "\"Tünd zona\" həddi (həssaslıq)" },
  thr_hint:       { ru: "Ниже порог — строже к пятнам. Значение — насколько пиксель темнее основного тона.",
                    en: "Lower threshold — stricter on spots. The value is how much darker a pixel is than the base tone.",
                    az: "Aşağı hədd — ləkələrə daha sərt. Dəyər — pikselin əsas tondan nə qədər tünd olması." },
  preset_note:    { ru: "Пресет подставляет разумные значения под культуру. Меняй под своего покупателя.",
                    en: "The preset fills in sensible values for the crop. Adjust for your buyer.",
                    az: "Preset məhsul üçün ağlabatan dəyərləri qoyur. Alıcına uyğun dəyiş." },

  drop_here:      { ru: "Перетащи фото сюда или нажми, чтобы выбрать",
                    en: "Drag a photo here, or click to choose",
                    az: "Şəkli bura sürüklə və ya seçmək üçün klik et" },
  drop_formats:   { ru: "JPG, PNG · фото не покидает устройство",
                    en: "JPG, PNG · the photo never leaves the device",
                    az: "JPG, PNG · şəkil cihazı tərk etmir" },
  btn_example:    { ru: "Загрузить пример",             en: "Load example",                 az: "Nümunə yüklə" },
  btn_analyze:    { ru: "Проанализировать",             en: "Analyze",                      az: "Təhlil et" },
  btn_reset:      { ru: "Сбросить",                     en: "Reset",                        az: "Sıfırla" },
  analyzing:      { ru: "Идёт анализ пикселей…",        en: "Analyzing pixels…",            az: "Piksel təhlili gedir…" },

  res_grade:      { ru: "Итоговый сорт",                en: "Final grade",                  az: "Yekun dərəcə" },
  res_target:     { ru: "Целевого цвета",              en: "Target colour",                az: "Hədəf rəngi" },
  res_dark:       { ru: "Тёмных зон",                  en: "Dark zones",                   az: "Tünd zonalar" },
  res_size:       { ru: "Заполнение кадра",            en: "Frame fill",                   az: "Kadrın dolması" },
  res_uniform:    { ru: "Однородность цвета",          en: "Colour uniformity",            az: "Rəng bircinsliyi" },
  res_composition:{ ru: "Состав цвета",                en: "Colour composition",           az: "Rəng tərkibi" },
  res_reason:     { ru: "Почему такой сорт",           en: "Why this grade",               az: "Niyə bu dərəcə" },
  res_because_a:  { ru: "Целевого цвета достаточно и тёмных зон мало — проходит по порогам сорта A.",
                    en: "Enough target colour and few dark zones — clears the grade A thresholds.",
                    az: "Hədəf rəngi kifayətdir və tünd zonalar azdır — A dərəcəsi həddlərini keçir." },
  res_because_b:  { ru: "Не дотягивает до A по цвету или дефектам, но проходит пороги сорта B.",
                    en: "Falls short of A on colour or defects, but clears the grade B thresholds.",
                    az: "Rəng və ya qüsurlara görə A-ya çatmır, lakin B dərəcəsi həddlərini keçir." },
  res_because_c:  { ru: "Целевого цвета мало или тёмных зон много — ниже порога сорта B.",
                    en: "Too little target colour or too many dark zones — below the grade B threshold.",
                    az: "Hədəf rəngi az və ya tünd zonalar çox — B dərəcəsi həddindən aşağı." },
  res_size_rel:   { ru: "относительно (нужен эталон для мм)",
                    en: "relative (a reference is needed for mm)",
                    az: "nisbi (mm üçün etalon lazımdır)" },
  res_overlay:    { ru: "Карта анализа",               en: "Analysis map",                 az: "Təhlil xəritəsi" },
  res_overlay_hint:{ ru: "Красным подсвечены найденные тёмные зоны",
                    en: "Detected dark zones highlighted in red",
                    az: "Tapılan tünd zonalar qırmızı ilə işıqlandırılıb" },
  res_download:   { ru: "Скачать отчёт",               en: "Download report",              az: "Hesabatı yüklə" },
  res_empty:      { ru: "Загрузи фото и нажми «Проанализировать», чтобы увидеть результат.",
                    en: "Upload a photo and press \"Analyze\" to see the result.",
                    az: "Nəticəni görmək üçün şəkil yüklə və \"Təhlil et\" düyməsini bas." },
  res_disclaimer: { ru: "Оценка построена на анализе цвета и тёмных зон снимка по твоим порогам. Это не диагностика болезней и не лабораторный анализ.",
                    en: "The grade is built on colour and dark-zone analysis of the photo against your thresholds. This is not disease diagnosis or lab analysis.",
                    az: "Dərəcə şəklin rəng və tünd zona təhlilinə, sənin həddlərinə görə qurulub. Bu, xəstəlik diaqnostikası və ya laboratoriya təhlili deyil." },

  hist_red:       { ru: "Красный",                     en: "Red",                          az: "Qırmızı" },
  hist_orange:    { ru: "Оранжевый",                   en: "Orange",                       az: "Narıncı" },
  hist_yellow:    { ru: "Жёлтый",                      en: "Yellow",                       az: "Sarı" },
  hist_green:     { ru: "Зелёный",                     en: "Green",                        az: "Yaşıl" },
  hist_dark:      { ru: "Тёмный/бурый",                en: "Dark/brown",                   az: "Tünd/qonur" },
  hist_other:     { ru: "Прочее",                      en: "Other",                        az: "Digər" },

  report_title:   { ru: "Отчёт об инспекции — AgroLens",en: "Inspection report — AgroLens", az: "Yoxlama hesabatı — AgroLens" },
  report_date:    { ru: "Дата",                        en: "Date",                         az: "Tarix" },
  report_crop:    { ru: "Культура",                    en: "Crop",                         az: "Məhsul" },
  report_standard:{ ru: "Стандарт",                    en: "Standard",                     az: "Standart" },
};

export function t(lang, key) {
  const row = DICT[key];
  if (!row) return key;
  return row[lang] || row.en || key;
}
