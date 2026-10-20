(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var words = [];
  var chosenMogrt = null;
  var generationTimer = null;
  var provider = "local";

  var presets = [
    { id: "neon-pop", name: "Neon Pop", label: "TikTok punchline", accent: "#c7ff45", text: "#ffffff", glow: "rgba(199,255,69,0.45)", note: "Bold creator caption" },
    { id: "studio-ink", name: "Studio Ink", label: "Editorial clean", accent: "#9fe6ff", text: "#ffffff", glow: "rgba(159,230,255,0.35)", note: "Clean and readable" },
    { id: "sunset-burst", name: "Sunset Burst", label: "YouTube punch", accent: "#ff9d5c", text: "#ffffff", glow: "rgba(255,157,92,0.45)", note: "Warm social look" },
    { id: "midnight-hud", name: "Midnight HUD", label: "Gaming callout", accent: "#7ae7c7", text: "#eafcf9", glow: "rgba(122,231,199,0.35)", note: "Streamer overlay" },
    { id: "confetti-pop", name: "Confetti Pop", label: "High-energy", accent: "#ff72d2", text: "#fff7ff", glow: "rgba(255,114,210,0.40)", note: "Social trend style" },
    { id: "monochrome", name: "Monochrome", label: "Minimal", accent: "#d7d7d7", text: "#ffffff", glow: "rgba(215,215,215,0.24)", note: "Clean default" },
    { id: "night-drive", name: "Night Drive", label: "Cinema", accent: "#ffc857", text: "#fff4da", glow: "rgba(255,200,87,0.30)", note: "Storytelling style" },
    { id: "mint-signal", name: "Mint Signal", label: "Brand product", accent: "#4ae1c8", text: "#f0fffd", glow: "rgba(74,225,200,0.35)", note: "Modern product caption" }
  ];

  function toast(message) {
    var el = $("toast");
    if (!el) return;
    el.textContent = message;
    el.classList.add("show");
    window.setTimeout(function () {
      el.classList.remove("show");
    }, 2600);
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return {"&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"}[c];
    });
  }

  function clamp(n, min, max) {
    return Math.max(min, Math.min(max, n));
  }

  function parseTime(t) {
    var m = String(t).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
    if (!m) return NaN;
    return +m[1] * 3600 + +m[2] * 60 + +m[3] + +(m[4].padEnd(3, "0")) / 1000;
  }

  function normalize() {
    words = (words || []).map(function (w, i) {
      var start = Math.max(0, Number(w.start) || 0);
      var end = Number(w.end);
      if (!Number.isFinite(end) || end <= start) {
        end = start + 0.25;
      }
      return {
        text: String(w.text || "").replace(/\s+/g, " ").trim(),
        start: Number(start.toFixed(3)),
        end: Number(end.toFixed(3)),
        index: i
      };
    }).filter(function (w) {
      return w.text.length > 0;
    });
    if (words.length && words[0].start > 0) {
      words[0].start = 0;
    }
  }

  function updatePreview() {
    var preview = $("previewText");
    if (!preview) return;
    var text = words.length ? words.map(function (w) { return w.text; }).slice(0, 8).join(" ") : "THIS IS THE MOMENT";
    var accent = $("accentColor") ? $("accentColor").value : "#c7ff45";
    var textColor = $("textColor") ? $("textColor").value : "#ffffff";
    preview.style.setProperty("--accent", accent);
    preview.style.setProperty("--text", textColor);
    preview.innerHTML = text.toUpperCase().replace(/\b([A-Z]{2,})\b/g, function (m) { return "<b>" + m + "</b>"; });
  }

  function download(name, content, type) {
    var blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  function formatTime(seconds, withMs) {
    var totalMs = Math.max(0, Number(seconds) || 0);
    var hrs = Math.floor(totalMs / 3600);
    var mins = Math.floor((totalMs % 3600) / 60);
    var secs = Math.floor(totalMs % 60);
    var ms = Math.floor((totalMs - Math.floor(totalMs)) * 1000);
    var base = [hrs, mins, secs].map(function (n) { return String(n).padStart(2, "0"); }).join(":");
    if (!withMs) {
      return base;
    }
    return base + "," + String(ms).padStart(3, "0");
  }

  function formatSrtTime(seconds) {
    return formatTime(seconds, true);
  }

  function applyCase(text) {
    var mode = $("caseMode") ? $("caseMode").value : "normal";
    if (mode === "upper") return text.toUpperCase();
    if (mode === "lower") return text.toLowerCase();
    return text;
  }

  function exportSrt() {
    normalize();
    if (!words.length) {
      toast("Add or import words first.");
      return;
    }
    var output = words.map(function (w, i) {
      var line = applyCase(String(w.text || "").trim());
      return (i + 1) + "\n" + formatSrtTime(w.start) + " --> " + formatSrtTime(w.end) + "\n" + line + "\n";
    }).join("\n");
    download("captions.srt", output, "text/plain;charset=utf-8");
    toast("SRT exported.");
  }

  function exportAss() {
    normalize();
    if (!words.length) {
      toast("Add or import words first.");
      return;
    }
    var accent = $("accentColor") ? $("accentColor").value : "#c7ff45";
    var textColor = $("textColor") ? $("textColor").value : "#ffffff";
    var lines = [
      "[Script Info]",
      "Title: LayerPop Captions",
      "ScriptType: v4.00+",
      "WrapStyle: 2",
      "ScaledBorderAndShadow: yes",
      "PlayResX: 1920",
      "PlayResY: 1080",
      "[V4+ Styles]",
      "Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding",
      "Style: Default,Arial,52,&H" + textColor.replace("#", "FF") + ",&H000000FF,&H00000000,&H00000000,0,0,0,0,1,2,0,0,2,10,10,2,10,10,1",
      "[Events]",
      "Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text"
    ];
    words.forEach(function (w, i) {
      var text = applyCase(String(w.text || "").trim());
      lines.push("Dialogue: 0," + formatTime(w.start, false).replace(/:/g, ".") + "," + formatTime(w.end, false).replace(/:/g, ".") + ",Default,,0000,0000,0000,,{\\c&H" + accent.replace("#", "FF") + "}{\\b1}" + text);
    });
    download("captions.ass", lines.join("\n"), "text/plain;charset=utf-8");
    toast("ASS exported.");
  }

  function renderPresets() {
    var grid = $("presetGrid");
    if (!grid) return;
    grid.innerHTML = "";
    presets.forEach(function (preset) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "preset-card";
      btn.dataset.id = preset.id;
      btn.innerHTML = '<span class="preset-chip" style="background:' + preset.accent + '; color:' + preset.text + '; box-shadow:0 0 0 1px ' + preset.glow + ';">' + preset.name + '</span><small>' + preset.label + '</small>';
      btn.addEventListener("click", function () {
        var accent = $("accentColor");
        var text = $("textColor");
        if (accent) accent.value = preset.accent;
        if (text) text.value = preset.text;
        updatePreview();
        toast(preset.name + " preset applied.");
      });
      grid.appendChild(btn);
    });
  }

  function showTab(name) {
    document.querySelectorAll(".step").forEach(function (b) {
      b.classList.toggle("active", b.dataset.tab === name);
    });
    document.querySelectorAll(".panel").forEach(function (p) {
      p.classList.toggle("active", p.id === "panel-" + name);
    });
  }

  function checkBridge() {
    var status = $("bridgeStatus");
    function set(message) {
      if (status) status.textContent = message;
    }
    if (!window.__adobe_cep__) {
      set("CEP host bridge unavailable");
      return;
    }
    if (typeof CSInterface === "undefined") {
      set("Premiere bridge detected, runtime pending.");
      return;
    }
    set("Premiere bridge connected.");
  }

  function chooseMogrt() {
    if (!window.cep || !window.cep.fs || typeof window.cep.fs.showOpenDialogEx !== "function") {
      toast("CEP file picker unavailable.");
      return;
    }
    try {
      var selected = window.cep.fs.showOpenDialogEx(false, false, false, "Choose a MOGRT", null, null, null, null);
      if (selected && selected.data && selected.data.length) {
        chosenMogrt = selected.data[0];
        var status = $("mogrtStatus");
        if (status) status.textContent = "MOGRT selected: " + chosenMogrt;
        toast("MOGRT selected.");
      }
    } catch (error) {
      toast("Unable to open MOGRT picker.");
    }
  }

  function insertMogrt() {
    if (!chosenMogrt) {
      toast("Choose a MOGRT first.");
      return;
    }
    if (!window.__adobe_cep__ || typeof CSInterface === "undefined") {
      toast("Premiere CEP bridge is unavailable.");
      return;
    }
    try {
      if (typeof window.__adobe_cep__.evalScript === "function") {
        window.__adobe_cep__.evalScript("LP_insertMogrt('" + chosenMogrt.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "')");
      }
      toast("MOGRT insertion requested.");
    } catch (error) {
      toast("MOGRT insertion failed.");
    }
  }

  function startGeneration() {
    normalize();
    if (!words.length) {
      toast("Import an SRT or paste a transcript first.");
      showTab("text");
      return;
    }
    var modal = $("generationModal");
    if (modal) modal.classList.remove("hidden");
    toast("Generating captions...");
    generationTimer = window.setTimeout(function () {
      if (generationTimer) {
        clearInterval(generationTimer);
        generationTimer = null;
      }
      if (modal) modal.classList.add("hidden");
      toast("Generation complete.");
    }, 1600);
  }

  function cancelGeneration() {
    if (generationTimer) {
      clearInterval(generationTimer);
      generationTimer = null;
    }
    var modal = $("generationModal");
    if (modal) modal.classList.add("hidden");
    toast("Generation cancelled.");
  }

  function renderTimelineOnly() {
    var timeline = $("timeline");
    if (!timeline) return;
    var maxEnd = Math.max(5, words.reduce(function (m, w) { return Math.max(m, Number(w.end) || 0); }, 0));
    timeline.innerHTML = words.map(function (w, i) {
      var width = clamp(((Number(w.end) || 0) - (Number(w.start) || 0)) / maxEnd * 100, 8, 100);
      return '<div class="word-row" data-index="' + i + '"><span class="word-label">' + esc(w.text || "") + '</span><div class="word-bar"><span style="width:' + width + '%"></span></div><div class="word-timing"><input aria-label="start time" value="' + formatTime(w.start, true).replace(",", ".") + '" /><input aria-label="end time" value="' + formatTime(w.end, true).replace(",", ".") + '" /></div></div>';
    }).join("");
  }

  function updateProviderUI() {
    var localBtn = $("transcribeMedia");
    var cloudBtn = $("transcribeGladia");
    if (localBtn) localBtn.classList.toggle("active", provider === "local");
    if (cloudBtn) cloudBtn.classList.toggle("active", provider === "gladia");
  }

  function readTextFile(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () { resolve(String(reader.result || "")); };
      reader.onerror = function () { reject(reader.error || new Error("Unable to read file.")); };
      reader.readAsText(file);
    });
  }

  async function importSrtFromFile(file) {
    if (!file) return;
    try {
      var text = await readTextFile(file);
      var cueRegex = /(\d+\s*\n\s*\d{2}:\d{2}:\d{2}[,.]\d{1,3}\s*-->\s*\d{2}:\d{2}:\d{2}[,.]\d{1,3}\s*\n)((?:.|\n)*?)(?=(?:\n\s*\d+\s*\n)|$)/g;
      var parsed = [];
      var match;
      while ((match = cueRegex.exec(text)) !== null) {
        var body = match[2].replace(/\r/g, "").trim();
        var tokens = body.split(/\s+/).filter(Boolean);
        tokens.forEach(function (token, index) {
          var start = (index === 0) ? 0 : 0.25 * index;
          parsed.push({ text: token, start: start, end: start + 0.25 });
        });
      }
      if (!parsed.length) {
        var fallback = text.replace(/\r/g, "").split(/\s+/).filter(Boolean);
        var step = fallback.length ? 0.25 : 0;
        parsed = fallback.map(function (token, idx) { return { text: token, start: idx * step, end: (idx + 1) * step }; });
      }
      words = parsed;
      renderTimelineOnly();
      toast("SRT imported.");
    } catch (error) {
      toast("Unable to import SRT.");
    }
  }

  async function handleLocalTranscribe(file) {
    if (!file) return;
    try {
      var form = new FormData();
      form.append("file", file, file.name || "media.wav");
      var response = await fetch("http://127.0.0.1:8765/transcribe", { method: "POST", body: form });
      if (!response.ok) {
        var text = await response.text();
        throw new Error(text || "Local transcription failed.");
      }
      var payload = await response.json();
      var nextWords = Array.isArray(payload.words) ? payload.words : [];
      if (!nextWords.length) {
        throw new Error("No word timestamps returned.");
      }
      words = nextWords.map(function (w) { return { text: String(w.text || "").trim(), start: Number(w.start) || 0, end: Number(w.end) || Number(w.start) + 0.25 }; }).filter(function (w) { return w.text.length > 0; });
      normalize();
      renderTimelineOnly();
      toast("Local transcription complete.");
    } catch (error) {
      toast(error && error.message ? error.message : "Local transcription failed.");
    }
  }

  async function handleGladiaTranscribe(file) {
    if (!file) return;
    try {
      var form = new FormData();
      form.append("file", file, file.name || "media.wav");
      var apiKey = $("gladiaApiKey");
      var value = apiKey ? apiKey.value.trim() : "";
      if (!value) {
        throw new Error("Add your Gladia API key first.");
      }
      form.append("api_key", value);
      var response = await fetch("http://127.0.0.1:8765/transcribe-gladia", { method: "POST", body: form });
      if (!response.ok) {
        var text = await response.text();
        throw new Error(text || "Gladia transcription failed.");
      }
      var payload = await response.json();
      var nextWords = Array.isArray(payload.words) ? payload.words : [];
      if (!nextWords.length) {
        throw new Error("No word timestamps returned from Gladia.");
      }
      words = nextWords.map(function (w) { return { text: String(w.text || "").trim(), start: Number(w.start) || 0, end: Number(w.end) || Number(w.start) + 0.25 }; }).filter(function (w) { return w.text.length > 0; });
      normalize();
      renderTimelineOnly();
      toast("Gladia transcription complete.");
    } catch (error) {
      toast(error && error.message ? error.message : "Gladia transcription failed.");
    }
  }

  function initEvents() {
    document.querySelectorAll(".step").forEach(function (button) {
      button.addEventListener("click", function () {
        showTab(button.dataset.tab || "style");
      });
    });

    document.querySelectorAll("[data-next]").forEach(function (button) {
      button.addEventListener("click", function () {
        showTab(button.dataset.next || "text");
      });
    });

    document.querySelectorAll("[data-back]").forEach(function (button) {
      button.addEventListener("click", function () {
        showTab(button.dataset.back || "style");
      });
    });

    if ($("accentColor")) {
      $("accentColor").addEventListener("input", updatePreview);
    }
    if ($("textColor")) {
      $("textColor").addEventListener("input", updatePreview);
    }

    if ($("generateBtn")) {
      $("generateBtn").addEventListener("click", startGeneration);
    }
    if ($("closeGeneration")) {
      $("closeGeneration").addEventListener("click", cancelGeneration);
    }
    if ($("chooseMogrt")) {
      $("chooseMogrt").addEventListener("click", chooseMogrt);
    }
    if ($("insertMogrt")) {
      $("insertMogrt").addEventListener("click", insertMogrt);
    }
    if ($("exportSrtBtn")) {
      $("exportSrtBtn").addEventListener("click", exportSrt);
    }
    if ($("exportAssBtn")) {
      $("exportAssBtn").addEventListener("click", exportAss);
    }

    if ($("transcribeMedia")) {
      $("transcribeMedia").addEventListener("click", function () {
        provider = "local";
        updateProviderUI();
        if ($("mediaFile")) $("mediaFile").click();
      });
    }
    if ($("transcribeGladia")) {
      $("transcribeGladia").addEventListener("click", function () {
        provider = "gladia";
        updateProviderUI();
        if ($("mediaFile")) $("mediaFile").click();
      });
    }

    if ($("mediaFile")) {
      $("mediaFile").addEventListener("change", function () {
        var file = this.files && this.files[0];
        if (!file) return;
        if (provider === "gladia") {
          handleGladiaTranscribe(file);
        } else {
          handleLocalTranscribe(file);
        }
      });
    }

    if ($("srtFile")) {
      $("srtFile").addEventListener("change", function () {
        var file = this.files && this.files[0];
        if (!file) return;
        importSrtFromFile(file);
      });
    }

    if ($("importSrt")) {
      $("importSrt").addEventListener("click", function () {
        if ($("srtFile")) $("srtFile").click();
      });
    }
  }

  function boot() {
    renderPresets();
    initEvents();
    updatePreview();
    updateProviderUI();
    checkBridge();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
