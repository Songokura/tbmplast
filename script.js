/* TBM Plast Service - ремонт пластиковых окон, Астана. Ванильный JS: плиты, створка, меню, якоря, языки, форма. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement, W = window;
  root.classList.add("js");
  var ASSET_V = ((doc.currentScript && doc.currentScript.src.match(/[?&]v=([^&]+)/)) || [])[1] || "";
  var REDUCED = W.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var TOUCH = W.matchMedia("(pointer:coarse)").matches;
  var clamp = function (v, a, b) { return Math.max(a === undefined ? 0 : a, Math.min(b === undefined ? 1 : b, v)); };
  var smooth = function (x) { x = clamp(x); return x * x * (3 - 2 * x); };
  var easeOut = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
  /* закрытие створки с коротким «прижимом» в конце */
  var shut = function (x) { x = clamp(x); return x < 0.85 ? easeOut(x / 0.85) * 1.03 : 1.03 - 0.03 * ((x - 0.85) / 0.15); };
  var VW = W.innerWidth, VH = W.innerHeight;
  var MOB = function () { return VW <= 900; };
  var LANG = "ru";
  var WA_NUM = "77004040187";

  /* ---------- WhatsApp: текст собирается в момент клика (фаза захвата на window, совместимо с LeadBot) ---------- */
  var HI = "Здравствуйте! Пишу с сайта TBM Plast Service. ";
  var WA = { ru: {
    "default": HI + "Нужен ремонт пластикового окна. Подскажите, когда может приехать мастер?",
    hero: HI + "Нужен ремонт пластикового окна. Могу отправить фото.",
    menu: HI + "Нужен ремонт пластикового окна.",
    sticky: HI + "Нужен ремонт пластикового окна.",
    regulirovka: HI + "Нужна регулировка окна (створка провисла или плохо закрывается). Отправляю фото.",
    uplotniteli: HI + "Нужна замена уплотнителя, из окна дует. Отправляю фото.",
    steklopakety: HI + "Нужна замена стеклопакета. Отправляю фото окна.",
    "moskitnye-setki": HI + "Нужна москитная сетка на окно. Отправляю фото проёма.",
    germetizaciya: HI + "Нужна герметизация шва у окна. Отправляю фото.",
    otkosy: HI + "Нужны откосы или подоконник. Отправляю фото.",
    furnitura: HI + "Нужен ремонт фурнитуры окна (ручка, петли, запор). Отправляю фото.",
    dveri: HI + "Нужен ремонт пластиковой двери. Отправляю фото.",
    "o-nas": HI + "Нужен ремонт пластикового окна. Когда может приехать мастер?",
    voprosy: HI + "Есть вопрос по ремонту окна:",
    zayavka: HI + "Нужен ремонт пластикового окна.",
    kontakty: HI + "Нужен ремонт пластикового окна. Когда может приехать мастер?"
  } };
  W.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest("a[data-wa]") : null;
    if (!a) return;
    var key = a.getAttribute("data-wa") || "default";
    var d = WA[LANG] || WA.ru;
    var text = d[key] || WA.ru[key] || WA.ru["default"];
    a.setAttribute("href", "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(text));
  }, true);

  /* ---------- fitText для заголовка героя: ни одно слово не шире контейнера ---------- */
  var h1 = doc.getElementById("h1");
  function fitText() {
    if (!h1) return;
    h1.style.removeProperty("font-size");
    var avail = h1.clientWidth; if (!avail) return;
    var fs = parseFloat(getComputedStyle(h1).fontSize), guard = 0;
    var big = h1.querySelector(".big");
    var nowrap = big && getComputedStyle(big).whiteSpace === "nowrap";
    /* на десктопе ключевая строка в одну строку целиком, на мобиле - самое длинное слово */
    var words = nowrap ? big.textContent.trim() : (h1.textContent.split(/\s+/).sort(function (x, y) { return y.length - x.length; })[0] || "");
    var probe = doc.createElement("span"); probe.style.cssText = "position:absolute;visibility:hidden;white-space:nowrap;font:inherit";
    probe.textContent = words; (big || h1).appendChild(probe);
    while (guard++ < 30 && probe.getBoundingClientRect().width > avail && fs > 22) { fs *= 0.95; h1.style.fontSize = fs + "px"; }
    probe.parentNode.removeChild(probe);
  }

  /* ---------- Меню ---------- */
  var burger = doc.querySelector(".burger"), menu = doc.getElementById("menu");
  var behind = [doc.getElementById("main"), doc.getElementById("sticky")];
  function setMenu(open, returnFocus) {
    if (!menu || !burger) return;
    var was = doc.body.classList.contains("menu-open");
    if (open === was) return;
    doc.body.classList.toggle("menu-open", open);
    behind.forEach(function (el) { if (el) { if (open) el.setAttribute("inert", ""); else el.removeAttribute("inert"); } });
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(function () { requestAnimationFrame(function () { menu.classList.add("open"); }); });
      setTimeout(function () { try { menu.focus({ preventScroll: true }); } catch (e) {} }, 60);
    } else {
      menu.classList.remove("open");
      setTimeout(function () { if (!doc.body.classList.contains("menu-open")) menu.hidden = true; }, 380);
      if (returnFocus) burger.focus({ preventScroll: true });
    }
  }
  if (burger) burger.addEventListener("click", function () { var o = doc.body.classList.contains("menu-open"); setMenu(!o, o); });
  doc.addEventListener("keydown", function (e) { if (e.key === "Escape" && doc.body.classList.contains("menu-open")) setMenu(false, true); });

  /* ---------- Якоря ---------- */
  var HDR = function () { return parseFloat(getComputedStyle(root).getPropertyValue("--hdr")) || 72; };
  function isSticky(el) { return el.classList.contains("pw") && getComputedStyle(el.firstElementChild).position === "sticky"; }
  function targetTop(el) {
    var r = el.getBoundingClientRect().top + W.pageYOffset;
    if (el.id === "top") return 0;
    if (isSticky(el)) return r;
    if (el.classList.contains("sec") || el.classList.contains("pw")) return r - HDR() + 1;
    return r - HDR() - 14;
  }
  function goTo(id, instant) {
    var el = doc.getElementById(id);
    if (!el) return false;
    setMenu(false);
    var top = Math.max(0, targetTop(el));
    if (instant || REDUCED) { root.style.scrollBehavior = "auto"; W.scrollTo(0, top); root.style.scrollBehavior = ""; }
    else W.scrollTo({ top: top, behavior: "smooth" });
    return true;
  }
  doc.addEventListener("click", function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!a) return;
    var id = a.getAttribute("href").slice(1);
    if (!id) return;
    if (goTo(id)) {
      e.preventDefault();
      try { history.pushState(null, "", "#" + id); } catch (err) {}
    }
  });

  /* ---------- Плиты и створки ---------- */
  var pws = [].slice.call(doc.querySelectorAll(".pw"));
  var sticky = doc.getElementById("sticky"), kont = doc.getElementById("kontakty");
  var hdr = doc.getElementById("hdr");
  var heroPw = doc.getElementById("top"), hero = heroPw ? heroPw.firstElementChild : null, heroSash = doc.getElementById("hero-sash");
  var INTRO = (location.hash.length > 1 || W.pageYOffset > 80 || REDUCED) ? 1 : 0;
  var introStart = 0, ticking = false;
  var st = pws.map(function (pw) { return { out: {}, txts: pw.querySelectorAll(".txt"), on: null, hasSash: !!pw.querySelector(".sash") }; });
  function put(el, s, k, v) { if (s.out[k] !== v) { s.out[k] = v; el.style.setProperty(k, v); } }

  /* створка героя: куда и насколько вырасти, чтобы закрыть экран (считается при смене ширины) */
  function measureHero() {
    if (!heroSash || !hero || MOB()) return;
    root.classList.add("measuring");
    var pr = hero.getBoundingClientRect(), sr = heroSash.getBoundingClientRect();
    root.classList.remove("measuring");
    if (!sr.width || !sr.height) return;
    var cx = sr.left - pr.left + sr.width / 2, cy = sr.top - pr.top + sr.height / 2;
    var fr = parseFloat(getComputedStyle(root).getPropertyValue("--frame")) || 12;
    /* растём так, чтобы экран закрыл сам кадр, а рама ушла за края */
    var sc = Math.max(VW / (sr.width - 2 * fr), VH / (sr.height - 2 * fr)) * 1.04;
    heroSash.style.setProperty("--tx", (VW / 2 - cx).toFixed(1) + "px");
    heroSash.style.setProperty("--ty", (VH / 2 - cy).toFixed(1) + "px");
    heroSash.style.setProperty("--sc", sc.toFixed(3));
  }
  function update() {
    ticking = false;
    var H = VH, pageY = W.pageYOffset, i;
    var kontTop = kont ? kont.getBoundingClientRect().top : null;
    var rects = [], nxt = [];
    for (i = 0; i < pws.length; i++) {
      rects.push(pws[i].getBoundingClientRect());
      var nx = pws[i].nextElementSibling;
      nxt.push(nx ? nx.getBoundingClientRect().top : null);
    }
    for (i = 0; i < pws.length; i++) {
      var pw = pws[i], r = rects[i], s = st[i];
      var near = r.bottom > -H * 0.3 && r.top < H * 1.3;
      var isHero = pw === heroPw;
      if (!near && s.wasFar) continue;
      s.wasFar = !near;
      var enter = clamp(1 - r.top / H);
      var stay = r.height > H * 1.1 ? clamp(-r.top / (r.height - H)) : clamp(-r.top / (r.height * 0.7));
      var exit = nxt[i] !== null ? clamp(1 - nxt[i] / H) : 0;
      if (MOB()) exit = 0;
      put(pw, s, "--enter", enter.toFixed(4));
      put(pw, s, "--stay", (isHero && MOB() ? 0 : stay).toFixed(4));
      put(pw, s, "--exit", exit.toFixed(4));
      if (isHero) {
        put(pw, s, "--intro", (REDUCED ? 1 : shut(INTRO)).toFixed(4));
      } else if (s.hasSash) {
        var open = REDUCED ? 1 : shut((enter - (MOB() ? 0.2 : 0.42)) / 0.52);
        put(pw, s, "--open", open.toFixed(4));
      }
      var plate = pw.firstElementChild;
      if (plate) plate.classList.toggle("gone", exit >= 1);
      var on = isHero ? INTRO > 0.25 : enter > (MOB() ? 0.3 : 0.55);
      if (s.on !== on) { s.on = on; for (var t = 0; t < s.txts.length; t++) s.txts[t].classList.toggle("on", on); }
    }
    if (sticky) {
      var show = pageY > H * 0.55;
      if (kontTop !== null && kontTop < H * 0.6) show = false;
      sticky.classList.toggle("show", show);
    }
    if (hdr) hdr.classList.toggle("scrolled", pageY > 12);
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  W.addEventListener("scroll", onScroll, { passive: true });
  W.addEventListener("resize", function () {
    if (W.innerWidth !== VW) { VW = W.innerWidth; VH = W.innerHeight; fitText(); measureHero(); }
    else if (!TOUCH) { VH = W.innerHeight; measureHero(); }
    onScroll();
  });
  function runIntro(ts) {
    if (!introStart) introStart = ts;
    INTRO = clamp((ts - introStart - 200) / 1400);
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }

  /* ---------- Бегущая лента: копии, шаг цикла - одна копия ---------- */
  [].forEach.call(doc.querySelectorAll(".ribbon-track"), function (tr) {
    var n = tr.children.length;
    for (var k = 0; k < n; k++) tr.appendChild(tr.children[k].cloneNode(true));
  });

  /* ---------- Язык: RU в разметке, KZ подгружается отдельным файлом ---------- */
  var I18N = { ru: {} };
  var RU = I18N.ru;
  var iEls = function () { return [].slice.call(doc.querySelectorAll("[data-i]")); };
  var phEls = [].slice.call(doc.querySelectorAll("[data-i-ph]"));
  var ariaEls = [].slice.call(doc.querySelectorAll("[data-i-aria]"));
  var altEls = [].slice.call(doc.querySelectorAll("[data-i-alt]"));
  var metaDesc = doc.querySelector('meta[name="description"]');
  iEls().forEach(function (el) { if (RU[el.getAttribute("data-i")] == null) RU[el.getAttribute("data-i")] = el.textContent; });
  phEls.forEach(function (el) { RU[el.getAttribute("data-i-ph")] = el.getAttribute("placeholder"); });
  ariaEls.forEach(function (el) { RU[el.getAttribute("data-i-aria")] = el.getAttribute("aria-label"); });
  altEls.forEach(function (el) { RU[el.getAttribute("data-i-alt")] = el.getAttribute("alt"); });
  RU["meta.title"] = doc.title;
  RU["meta.desc"] = metaDesc ? metaDesc.getAttribute("content") : "";
  var FORM_L = { ru: { head: "Заявка с сайта TBM Plast Service.", name: "Имя", phone: "Телефон", msg: "Что с окном" } };
  function t(key) { var d = I18N[LANG] || RU; return d[key] != null ? d[key] : RU[key]; }
  function applyLang(lang) {
    if (!I18N[lang]) lang = "ru";
    LANG = lang;
    iEls().forEach(function (el) { var v = t(el.getAttribute("data-i")); if (v != null) el.textContent = v; });
    phEls.forEach(function (el) { var v = t(el.getAttribute("data-i-ph")); if (v != null) el.setAttribute("placeholder", v); });
    ariaEls.forEach(function (el) { var v = t(el.getAttribute("data-i-aria")); if (v != null) el.setAttribute("aria-label", v); });
    altEls.forEach(function (el) { var v = t(el.getAttribute("data-i-alt")); if (v != null) el.setAttribute("alt", v); });
    doc.title = t("meta.title");
    if (metaDesc) metaDesc.setAttribute("content", t("meta.desc"));
    root.setAttribute("lang", lang);
    [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on); b.setAttribute("aria-pressed", on ? "true" : "false");
    });
    try { localStorage.setItem("tbm-lang", lang); } catch (e) {}
    fitText();
    measureHero();
  }
  function loadLang(lang, done) {
    if (I18N[lang] || lang !== "kk") return done();
    var s = doc.createElement("script");
    s.src = "assets/lang/kk.js" + (ASSET_V ? "?v=" + ASSET_V : "");
    s.onload = function () {
      if (W.SITE_KK) {
        I18N.kk = W.SITE_KK;
        if (W.SITE_KK_WA) WA.kk = W.SITE_KK_WA;
        if (W.SITE_KK_FORM) FORM_L.kk = W.SITE_KK_FORM;
      }
      done();
    };
    s.onerror = function () { done(); };
    doc.head.appendChild(s);
  }
  function setLang(lang) { loadLang(lang, function () { applyLang(lang); }); }
  [].forEach.call(doc.querySelectorAll(".lang button"), function (b) {
    b.addEventListener("click", function () { setLang(b.getAttribute("data-lang")); });
  });
  (function initLang() {
    var forced = (location.search.match(/[?&]lang=(ru|kk)/) || [])[1];
    var saved = null; try { saved = localStorage.getItem("tbm-lang"); } catch (e) {}
    var lang = forced || saved || "ru";
    if (lang !== "ru") setLang(lang);
  })();

  /* ---------- Проявление секций ---------- */
  var rv = [].slice.call(doc.querySelectorAll(".rv"));
  if ("IntersectionObserver" in W && !REDUCED) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add("in"); io.unobserve(x.target); } });
    }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 });
    rv.forEach(function (el) { io.observe(el); });
    setTimeout(function () { rv.forEach(function (el) { if (!el.classList.contains("in") && el.getBoundingClientRect().top < W.innerHeight) el.classList.add("in"); }); }, 1500);
  } else rv.forEach(function (el) { el.classList.add("in"); });

  /* ---------- Форма -> WhatsApp ---------- */
  var form = doc.getElementById("form"), thanks = doc.getElementById("thanks"), ferr = doc.getElementById("ferr");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var f = form.elements;
      if (f.website && f.website.value) { form.hidden = true; if (thanks) thanks.hidden = false; return; }
      var name = f.name.value.trim(), phone = f.phone.value.trim();
      var badName = !name, badPhone = phone.replace(/\D/g, "").length < 10;
      f.name.classList.toggle("bad", badName); f.phone.classList.toggle("bad", badPhone);
      f.name.setAttribute("aria-invalid", badName ? "true" : "false"); f.phone.setAttribute("aria-invalid", badPhone ? "true" : "false");
      if (badName || badPhone) { if (ferr) ferr.hidden = false; (badName ? f.name : f.phone).focus(); return; }
      if (ferr) ferr.hidden = true;
      var L = FORM_L[LANG] || FORM_L.ru;
      var lines = [L.head, L.name + ": " + name, L.phone + ": " + phone];
      if (f.message.value.trim()) lines.push(L.msg + ": " + f.message.value.trim());
      var url = "https://wa.me/" + WA_NUM + "?text=" + encodeURIComponent(lines.join("\n"));
      W.open(url, "_blank", "noopener");
      form.hidden = true;
      if (thanks) { thanks.hidden = false; try { thanks.focus({ preventScroll: true }); } catch (err) {} }
      form.reset();
    });
  }

  var year = doc.getElementById("year"); if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Старт ---------- */
  function start() {
    fitText();
    measureHero();
    if (location.hash.length > 1) {
      var id = location.hash.slice(1);
      goTo(id, true);
      setTimeout(function () { goTo(id, true); update(); }, 80);
      setTimeout(function () { goTo(id, true); update(); }, 600);
    }
    update();
    if (INTRO < 1) requestAnimationFrame(runIntro);
  }
  if (doc.fonts && doc.fonts.ready) doc.fonts.ready.then(function () { fitText(); measureHero(); update(); });
  if (doc.readyState === "complete") start(); else W.addEventListener("load", start);
  measureHero();
  update();
})();
