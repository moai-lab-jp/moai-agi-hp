// AGI4SCM landing page: hero request typing + request gallery tabs.
(function () {
  "use strict";

  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Hero: one orchestrated moment ---------- */
  var heroItems = [
    { text: "この需要データを分析して。データは添付したよ。", img: "inventory-classification.jpg", title: "在庫分類ダッシュボード", alt: "在庫分類のダッシュボード。ABC 分析と需要変動の分類結果。" },
    { text: "物流ネットワークの最適化をして。データは添付したよ。", img: "logistics-network.jpg", title: "物流ネットワーク設計", alt: "物流ネットワーク設計のダッシュボード。開設する DC の地図と費用の内訳。" },
    { text: "来週の生産スケジュールを組んで。", img: "optseq-scheduler.jpg", title: "生産スケジュール", alt: "生産スケジュールのダッシュボード。資源別のガントチャートと検算結果。" },
    { text: "サプライチェーンリスクの評価をして。データは添付したよ。", img: "disruption-risk.jpg", title: "調達途絶リスク", alt: "調達途絶リスクのダッシュボード。多段の部品表とリスクの水準。" },
    { text: "この需要データを予測して。データは添付したよ。", img: "timeseries-forecasting.jpg", title: "需要予測", alt: "需要予測のダッシュボード。実績と予測の推移、検証の誤差率。" }
  ];

  var textEl = document.getElementById("heroRequest");
  var imgEl = document.getElementById("heroShot");
  var titleEl = document.getElementById("heroShotTitle");

  // Preload hero images so the swap does not flash.
  heroItems.forEach(function (it) { var i = new Image(); i.src = "assets/" + it.img; });

  function wait(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function swapShot(it) {
    imgEl.classList.add("is-fading");
    setTimeout(function () {
      imgEl.src = "assets/" + it.img;
      imgEl.alt = it.alt;
      titleEl.textContent = it.title;
      imgEl.classList.remove("is-fading");
    }, 350);
  }

  async function typeLoop() {
    var idx = 0;
    // First request is already rendered; hold it, then cycle.
    await wait(4200);
    while (true) {
      if (document.hidden) { await wait(1000); continue; }
      // erase
      var cur = textEl.textContent;
      for (var n = cur.length; n >= 0; n--) {
        textEl.textContent = cur.slice(0, n);
        await wait(18);
      }
      idx = (idx + 1) % heroItems.length;
      var it = heroItems[idx];
      await wait(250);
      for (var k = 1; k <= it.text.length; k++) {
        textEl.textContent = it.text.slice(0, k);
        await wait(70);
      }
      await wait(450);
      swapShot(it);
      await wait(4600);
    }
  }

  if (textEl && imgEl && !reduceMotion) { typeLoop(); }

  /* ---------- Gallery tabs ---------- */
  var tabs = Array.prototype.slice.call(document.querySelectorAll('.requests [role="tab"]'));
  var panel = document.getElementById("p-shot");
  var pTitle = document.getElementById("panelTitle");
  var pDesc = document.getElementById("panelDesc");
  var pImg = document.getElementById("panelImg");
  var pLink = document.getElementById("panelLink");

  function select(tab, focus) {
    tabs.forEach(function (t) {
      var on = t === tab;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
    });
    var src = "assets/" + tab.dataset.img;
    pTitle.textContent = tab.dataset.title;
    pDesc.textContent = tab.dataset.desc;
    pImg.src = src;
    pImg.alt = tab.dataset.title + "のダッシュボード";
    pLink.href = src;
    panel.setAttribute("aria-labelledby", tab.id);
    if (focus) { tab.focus(); }
    if (window.matchMedia("(max-width: 640px)").matches) {
      tab.scrollIntoView({ block: "nearest", inline: "start", behavior: reduceMotion ? "auto" : "smooth" });
    }
  }

  tabs.forEach(function (tab, i) {
    tab.addEventListener("click", function () { select(tab, false); });
    tab.addEventListener("keydown", function (e) {
      var next = null;
      if (e.key === "ArrowDown" || e.key === "ArrowRight") next = tabs[(i + 1) % tabs.length];
      else if (e.key === "ArrowUp" || e.key === "ArrowLeft") next = tabs[(i - 1 + tabs.length) % tabs.length];
      else if (e.key === "Home") next = tabs[0];
      else if (e.key === "End") next = tabs[tabs.length - 1];
      if (next) { e.preventDefault(); select(next, true); }
    });
  });
})();

// Contact form (same contract as the other MOAI Lab. LPs).
(function () {
  "use strict";
  var form = document.getElementById("lead-form");
  if (!form) return;
  var statusEl = document.getElementById("form-status");
  var submitBtn = document.getElementById("submit-btn");
  var labels = { document: "資料を請求する", contact: "相談する" };

  // utm_* from the URL, so we know where the lead came from.
  var q = new URLSearchParams(location.search), utm = [];
  q.forEach(function (v, k) { if (k.indexOf("utm_") === 0) utm.push(k + "=" + v); });
  form.elements.utm.value = utm.join("&");

  // #contact-document / #contact-contact preselect the type.
  function setType(t) {
    if (!labels[t]) return;
    form.querySelector('input[name="inquiry_type"][value="' + t + '"]').checked = true;
    submitBtn.textContent = labels[t];
  }
  form.addEventListener("change", function (e) { if (e.target.name === "inquiry_type") setType(e.target.value); });
  var m = location.hash.match(/^#contact-(document|contact)$/);
  if (m) { setType(m[1]); document.getElementById("contact").scrollIntoView(); }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    statusEl.textContent = ""; statusEl.className = "form-status";
    var bad = null;
    ["company", "name", "email"].forEach(function (n) {
      var el = form.elements[n], v = el.value.trim();
      var ok = v !== "" && (n !== "email" || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v));
      el.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok && !bad) bad = el;
    });
    if (bad) { statusEl.textContent = "会社名・お名前・メールアドレスを確かめてください。"; statusEl.className = "form-status error"; bad.focus(); return; }
    if (!form.elements.consent.checked) { statusEl.textContent = "個人情報の取り扱いへの同意が必要です。"; statusEl.className = "form-status error"; return; }
    if (form.elements.website.value) return; // bot

    var endpoint = form.getAttribute("data-endpoint");
    if (!endpoint) {
      statusEl.innerHTML = 'ただいまフォームから送信できません。お手数ですが <a href="mailto:sales@moai-lab.jp">sales@moai-lab.jp</a> へメールでお問い合わせください。';
      statusEl.className = "form-status error";
      return;
    }
    var messages = {
      invalid: "入力内容を確かめてください。",
      consent: "個人情報の取り扱いへの同意が必要です。",
      too_many: "続けて送信されました。1 分ほどおいてから、もう一度お試しください。"
    };
    submitBtn.disabled = true; statusEl.textContent = "送信しています…";
    // URL エンコードで送る（Apps Script の e.parameter で受け取れ、事前確認の通信も起きない）。
    fetch(endpoint, { method: "POST", body: new URLSearchParams(new FormData(form)) })
      .then(function (res) {
        if (!res.ok) throw new Error(res.status);
        return res.json();
      })
      .then(function (data) {
        if (!data || !data.ok) {
          submitBtn.disabled = false;
          statusEl.textContent = (data && messages[data.error]) || "送信できませんでした。時間をおいてもう一度お試しください。";
          statusEl.className = "form-status error";
          return;
        }
        document.getElementById("form-card").classList.add("done");
        document.getElementById("thanks").focus();
      })
      .catch(function () {
        submitBtn.disabled = false;
        statusEl.innerHTML = '送信できませんでした。時間をおいてもう一度お試しいただくか、<a href="mailto:sales@moai-lab.jp">sales@moai-lab.jp</a> へメールでお問い合わせください。';
        statusEl.className = "form-status error";
      });
  });
})();
