(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var words = [], selectedPreset = "punchline", chosenMogrt = "", generationTimer = null, generationValue = 0;
  var selectedProvider = localStorage.getItem("layerpop-provider") || "local";
  var presets = [
    {id:"punchline",name:"Punchline Pop",desc:"Lime power words",accent:"#c7ff45",treatment:"outline"},
    {id:"beast",name:"Beast Energy",desc:"Red, heavy and loud",accent:"#ff414d",treatment:"outline"},
    {id:"neon",name:"Neon Focus",desc:"Electric cyan glow",accent:"#48e7ff",treatment:"glow"},
    {id:"clean",name:"Clean Creator",desc:"Minimal and readable",accent:"#7bf0c2",treatment:"soft"},
    {id:"creatorbox",name:"Creator Box",desc:"High contrast backing",accent:"#c7ff45",treatment:"box"},
    {id:"golden",name:"Golden Take",desc:"Warm yellow emphasis",accent:"#ffd65a",treatment:"outline"},
    {id:"purple",name:"Purple Punch",desc:"Purple energy glow",accent:"#b69aff",treatment:"glow"},
    {id:"podcast",name:"Podcast Clean",desc:"Compact interview text",accent:"#ffffff",treatment:"soft"},
    {id:"pink",name:"Pink Pop",desc:"Hot pink emphasis",accent:"#ff6ac8",treatment:"glow"},
    {id:"orange",name:"Orange Spark",desc:"Warm punchline highlight",accent:"#ff9b42",treatment:"outline"},
    {id:"blue",name:"Blue Signal",desc:"Cool blue contrast",accent:"#63a8ff",treatment:"outline"},
    {id:"mint",name:"Mint Motion",desc:"Mint kinetic accent",accent:"#76ffd1",treatment:"glow"},
    {id:"impact",name:"Impact Stack",desc:"Heavy stacked words",accent:"#ffde59",treatment:"outline"},
    {id:"rapid",name:"Rapid Fire",desc:"Fast high-energy captions",accent:"#ff6b6b",treatment:"outline"},
    {id:"mono",name:"Mono Editorial",desc:"Editorial minimal style",accent:"#e5e7eb",treatment:"soft"},
    {id:"softsub",name:"Soft Subtitle",desc:"Quiet readable subtitles",accent:"#ffffff",treatment:"soft"},
    {id:"lime",name:"Lime Minimal",desc:"Minimal lime highlight",accent:"#c7ff45",treatment:"soft"},
    {id:"deep",name:"Deep Contrast",desc:"High contrast backing",accent:"#ffffff",treatment:"box"},
    {id:"streamer",name:"Streamer Callout",desc:"Gaming creator energy",accent:"#ffe45c",treatment:"outline"},
    {id:"story",name:"Story Mode",desc:"Storytelling sentence case",accent:"#9be7ff",treatment:"soft"},
    {id:"studio",name:"Studio Caption",desc:"Balanced interview captions",accent:"#d6f6ff",treatment:"soft"},
    {id:"word",name:"Word-by-Word",desc:"Focused active-word style",accent:"#c7ff45",treatment:"outline"},
    {id:"retro",name:"Retro Arcade",desc:"Retro bright accent",accent:"#ff5df0",treatment:"glow"},
    {id:"ice",name:"Arctic Ice",desc:"Cold crisp cyan",accent:"#9cecff",treatment:"glow"},
    {id:"fire",name:"Firestorm",desc:"Flame orange emphasis",accent:"#ff6038",treatment:"glow"},
    {id:"royal",name:"Royal Violet",desc:"Rich violet glow",accent:"#a78bfa",treatment:"glow"},
    {id:"toxic",name:"Toxic Green",desc:"High energy green",accent:"#a3ff12",treatment:"outline"},
    {id:"silver",name:"Silver Screen",desc:"Neutral cinematic text",accent:"#d1d5db",treatment:"soft"},
    {id:"comic",name:"Comic Burst",desc:"Playful yellow punch",accent:"#ffdf35",treatment:"outline"},
    {id:"minimal",name:"Pure Minimal",desc:"Simple clean white",accent:"#ffffff",treatment:"soft"},
    {id:"underline",name:"Underline Pop",desc:"Underline key phrase",accent:"#4ade80",treatment:"soft"},
    {id:"coral",name:"Coral Wave",desc:"Warm coral highlight",accent:"#ff7f73",treatment:"glow"},
    {id:"sunset",name:"Sunset Glow",desc:"Pink-orange glow",accent:"#ff8b65",treatment:"glow"},
    {id:"terminal",name:"Terminal",desc:"Monospace tech style",accent:"#65ffb7",treatment:"soft"},
    {id:"lavender",name:"Lavender Dream",desc:"Soft lavender accent",accent:"#d8b4fe",treatment:"glow"},
    {id:"gold",name:"Gold Standard",desc:"Premium gold emphasis",accent:"#fbbf24",treatment:"outline"}
  ];

  function toast(message) { var el = $("toast"); if (!el) return; el.textContent = message; el.classList.add("show"); window.setTimeout(function(){ el.classList.remove("show"); }, 2600); }
  function esc(value) { return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function getHostBridge(){
    if (window.__adobe_cep__ && typeof window.__adobe_cep__.evalScript === "function") return window.__adobe_cep__;
    if (typeof CSInterface !== "undefined") {
      window.__adobe_cep__ = new CSInterface();
      return window.__adobe_cep__;
    }
    return null;
  }
  function getDefaultMogrtRoot(){
    var candidates = [
      "C:/",
      "D:/",
      "E:/",
      "C:/Users/",
      "C:/Program Files/Adobe/Adobe Premiere Pro/",
      "C:/Users/Default/Documents/Adobe/Premiere Pro/",
      "C:/Users/Shared/Documents/Adobe/Premiere Pro/"
    ];
    return candidates[0];
  }
  function setProviderFromSelection(provider){
    selectedProvider = provider || "local";
    try { localStorage.setItem("layerpop-provider", selectedProvider); } catch (err) { console.warn("Storage unavailable", err); }
    updateProviderUI();
  }
  function validateGladiaKey(value){
    var key = (value || "").trim();
    if (!key) return "Enter your Gladia API key.";
    if (key.length < 10) return "Gladia API key looks too short.";
    return "";
  }
  function updateProviderUI(){
    var providerSelect = $("providerSelect"); if (providerSelect) providerSelect.value = selectedProvider;
    var keyRow = $("gladiaKeyRow"); var keyInput = $("gladiaKey");
    if (keyRow) keyRow.style.display = selectedProvider === "gladia" ? "flex" : "none";
    if (keyInput) {
      keyInput.title = selectedProvider === "gladia" ? "Gladia API key for cloud transcription" : "Select Gladia Cloud to enable cloud transcription";
      keyInput.placeholder = selectedProvider === "gladia" ? "Enter Gladia API key" : "Cloud provider selected";
    }
    var actionLabel = $("transcribeActionLabel");
    if (actionLabel) actionLabel.textContent = selectedProvider === "gladia" ? "Transcribe with Gladia" : "Transcribe locally";
  }
  function renderPresets(){
    var grid = $("presetGrid"); if (!grid) return;
    grid.innerHTML = presets.map(function(p){
      var sample = p.id === "creatorbox" ? "background:"+p.accent+";color:#111;padding:4px 6px;border-radius:3px;" : "color:#fff;text-shadow:2px 2px #000,-2px 2px #000,0 0 8px "+p.accent+";";
      return '<button class="preset '+(selectedPreset===p.id?'selected':'')+'" data-preset="'+p.id+'"><div class="preset-sample" style="'+sample+'">WORD <span style="color:'+p.accent+'">POP</span></div><div class="preset-meta"><strong>'+esc(p.name)+'</strong><span>'+esc(p.desc)+'</span></div></button>';
    }).join("");
    var p = presets.find(function(x){return x.id===selectedPreset;}) || presets[0];
    var accentColor = $("accentColor"); if (accentColor) accentColor.value = p.accent;
    updatePreview();
  }
  function updatePreview(){
    var accentNode = $("accentColor"); var textNode = $("textColor"); var fontNode = $("fontSize"); var preview = $("previewText");
    if (!accentNode || !textNode || !fontNode || !preview) return;
    var p = presets.find(function(x){return x.id===selectedPreset;}) || presets[0], accent = accentNode.value, textColor = textNode.value;
    var sample = words.length ? words[0].text : "THIS IS THE MOMENT", parts = sample.split(/\s+/), split = Math.max(1,Math.floor(parts.length*.6));
    var first = parts.slice(0,split).join(" "), second = parts.slice(split).join(" ");
    preview.innerHTML = esc(first)+(second?' <b>'+esc(second)+'</b>':'');
    preview.style.color = textColor; preview.style.fontSize = fontNode.value + "px"; preview.style.textShadow = p.treatment==="glow" ? "0 0 8px "+accent+",0 3px 4px #000" : "2px 2px #000,-2px 2px #000,0 3px 4px #000";
    var b = preview.querySelector("b"); if (b) b.style.color = accent;
    if (p.treatment === "box") { preview.style.background = accent; preview.style.color = "#111"; preview.style.padding = "8px 12px"; if (b) b.style.color = "#111"; } else { preview.style.background = "transparent"; preview.style.padding = "0"; }
    var fontOut = $("fontSizeOut"); if (fontOut) fontOut.textContent = fontNode.value + " px";
  }
  function formatTime(seconds, comma) {
    var ms = Math.max(0, Math.round((Number(seconds) || 0) * 1000)), h = Math.floor(ms / 3600000); ms %= 3600000; var m = Math.floor(ms / 60000); ms %= 60000; var s = Math.floor(ms / 1000); ms %= 1000;
    return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0") + (comma ? "," : ".") + String(ms).padStart(3, "0");
  }
  function parseTime(t){
    var m = String(t).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);
    if (!m) return NaN;
    return +m[1] * 3600 + +m[2] * 60 + +m[3] + +(m[4].padEnd(3, "0")) / 1000;
  }
  function normalize(){
    words = words.map(function(w){
      var start = Math.max(0, Number(w.start) || 0), end = Number(w.end);
      if (!Number.isFinite(end) || end <= start) end = start + 0.25;
      return { text: String(w.text || "").trim() || "word", start: start, end: end };
    }).filter(function(w){ return w.text; });
  }
  function renderWords(){
    normalize();
    var wordCount = $("wordCount"); if (wordCount) wordCount.textContent = words.length + " WORDS";
    var wordRows = $("wordRows"); var timeline = $("timeline"); var ruler = $("timelineRuler");
    if (!wordRows || !timeline || !ruler) return;
    if (!words.length) {
      wordRows.innerHTML = '<div class="empty">Import an SRT or paste a transcript to start.</div>';
      timeline.innerHTML = '<div class="empty">Your timed words will appear here.</div>';
      ruler.innerHTML = '<span>00.0s</span>';
      updatePreview();
      return;
    }
    wordRows.innerHTML = words.map(function(w, i){
      return '<div class="word-row"><span class="word-index">'+String(i+1).padStart(2,"0")+'</span><input class="word-text" data-word-text="'+i+'" aria-label="Word '+(i+1)+'" value="'+esc(w.text)+'"><input class="time-field" data-word-start="'+i+'" value="'+w.start.toFixed(3)+'"><input class="time-field" data-word-end="'+i+'" value="'+w.end.toFixed(3)+'"></div>';
    }).join("");
    var maxEnd = Math.max(5, words.reduce(function(m, w){ return Math.max(m, w.end); }, 0));
    ruler.innerHTML = [0, 0.2, 0.4, 0.6, 0.8, 1].map(function(f){ return '<span>' + (maxEnd * f).toFixed(1) + 's</span>'; }).join("");
    timeline.innerHTML = words.map(function(w){
      var width = clamp(((w.end - w.start) / maxEnd) * 100, 1.3, 100);
      return '<div class="timeline-word" title="'+esc(w.text) + ': ' + w.start.toFixed(2) + '–' + w.end.toFixed(2) + 's" style="width:'+width+'%;left:'+((w.start/maxEnd)*100)+'%;"><span>'+esc(w.text)+'</span></div>';
    }).join("");
    updatePreview();
  }
  function splitTranscript(text, duration){
    var tokens = String(text || "").trim().split(/\s+/).filter(Boolean); if (!tokens.length) { toast("Paste a transcript first."); return false; }
    var total = Math.max(1, Number(duration) || Math.max(2, tokens.length * 0.35)), unit = total / tokens.length;
    words = tokens.map(function(token, i){ return { text: token.replace(/^\s+|\s+$/g, ""), start: i * unit, end: (i + 1) * unit }; });
    renderWords(); return true;
  }
  function parseSrt(text){
    var blocks = String(text).replace(/\r/g, "").trim().split(/\n\s*\n/), parsed = [];
    blocks.forEach(function(block){
      var rows = block.split("\n"), idx = rows.findIndex(function(r){ return r.indexOf("-->") >= 0; });
      if (idx < 0) return;
      var pair = rows[idx].split("-->");
      var start = parseTime(pair[0]); var end = parseTime(pair[1]);
      if (!Number.isFinite(start) || !Number.isFinite(end)) return;
      var textValue = rows.slice(idx + 1).join(" ").replace(/<[^>]+>/g, "").trim();
      if (!textValue) return;
      textValue.split(/\s+/).forEach(function(token){
        if (!token) return;
        parsed.push({ text: token.replace(/[.,!?;:]+$/, ""), start: start, end: end });
      });
    });
    return parsed;
  }
  function download(name, content, type){
    var blob = new Blob([content], { type: type || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a"); a.href = url; a.download = name; a.style.display = "none"; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function(){ URL.revokeObjectURL(url); }, 1000);
  }
  function exportSrt(){
    normalize(); if (!words.length) { toast("Add or import words first."); return; }
    var output = words.map(function(w, i){ return (i + 1) + "\n" + formatTime(w.start, true) + " --> " + formatTime(w.end, true) + "\n" + w.text + "\n"; }).join("\n");
    download("layerpop-captions.srt", output, "text/plain;charset=utf-8"); toast("SRT exported with current word timings.");
  }
  function applyCase(text){
    var mode = $("caseMode") ? $("caseMode").value : "normal";
    return mode === "upper" ? text.toUpperCase() : mode === "lower" ? text.toLowerCase() : text;
  }
  function exportAss(){
    normalize(); if (!words.length) { toast("Add or import words first."); return; }
    var accentColor = $("accentColor"); if (!accentColor) return;
    var rgb = accentColor.value, rr = rgb.slice(1, 3), gg = rgb.slice(3, 5), bb = rgb.slice(5, 7), color = "&H00" + bb + gg + rr;
    var pos = $("captionPosition") ? $("captionPosition").value : "bottom", align = pos === "top" ? 8 : (pos === "center" ? 5 : 2), marginV = pos === "top" ? 120 : (pos === "center" ? 0 : 190);
    var animation = $("animationStyle") ? $("animationStyle").value : "pop";
    var header = "[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: Default,Arial,56," + color + ",&H80000000,&H80000000,&H80000000,0,0,0,0,100,100,0,1,2,0,2," + align + "," + marginV + ",0,1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n";
    var body = words.map(function(w){
      var text = applyCase(w.text);
      var tags = "\\c" + color;
      if (animation === "fade") tags += "\\fad(90,60)"; else if (animation === "pop") tags += "\\fscx65\\fscy65\\t(0,120,\\fscx100\\fscy100)"; else if (animation === "scale") tags += "\\fscx110\\fscy110\\t(0,140,\\fscx100\\fscy100)";
      return "Dialogue: 0," + formatTime(w.start, true) + "," + formatTime(w.end, true) + ",Default,," + marginV + "," + marginV + "," + marginV + "," + tags + "," + text;
    }).join("\n");
    download("layerpop-animated-word-captions.ass", header + body + "\n", "text/plain;charset=utf-8");
    toast("ASS captions exported with selected placement and supported animation tags.");
  }
  function transcribeLocal(file){
    if (!file) { toast("Choose a video or audio file first."); return; }
    var status = $("transcriptionStatus"); var btn = $("transcribeMedia");
    if (status) status.textContent = "Connecting to local transcription engine…"; if (btn) btn.disabled = true;
    var form = new FormData(); form.append("file", file, file.name);
    fetch("http://127.0.0.1:8765/transcribe", { method: "POST", body: form })
      .then(function(r){ if (!r.ok) return r.text().then(function(t){ throw new Error(t || ("HTTP " + r.status)); }); return r.json(); })
      .then(function(data){
        if (!data.words || !data.words.length) throw new Error("No speech words were detected.");
        words = data.words.map(function(w){ return { text: String(w.text || w.word || "").trim(), start: Number(w.start), end: Number(w.end) }; });
        renderWords(); if (status) status.textContent = "Transcribed " + words.length + " words locally.";
        toast("Local transcription complete: " + words.length + " words.");
      }).catch(function(err){
        if (status) status.textContent = "Local engine unavailable: " + err.message;
        toast("Start the LayerPop local transcription server; see LOCAL-TRANSCRIPTION.md.");
        console.error("LayerPop local transcription:", err);
      }).finally(function(){ if (btn) btn.disabled = false; });
  }
  function showTab(name){
    document.querySelectorAll(".step").forEach(function(b){ b.classList.toggle("active", b.dataset.tab === name); });
    document.querySelectorAll(".panel").forEach(function(p){ p.classList.toggle("active", p.id === "panel-" + name); });
  }
  function checkBridge(){
    var status = $("bridgeStatus");
    var bridge = getHostBridge();
    function set(t){ if (status) status.textContent = t; }
    if (!bridge) { set("CEP host bridge unavailable"); return; }
    bridge.evalScript("LP_ping()", function(result){
      if (!result || result.indexOf("LAYERPOP_READY") === -1) { set("Premiere bridge unavailable"); return; }
      set("Premiere bridge connected.");
      bridge.evalScript("LP_getSequenceInfo()", function(seqInfo){
        if (seqInfo && seqInfo !== "NO_ACTIVE_SEQUENCE" && seqInfo !== "NO_PROJECT") {
          if (status) status.textContent = "Premiere bridge connected — " + seqInfo.split("|")[0];
        }
      });
    });
  }
  function transcribeGladia(file){
    if (!file) { toast("Choose an audio or video file first."); return; }
    var keyEl = $("gladiaKey"), key = keyEl ? keyEl.value.trim() : "";
    var keyError = validateGladiaKey(key);
    if (keyError) {
      toast(keyError); if (keyEl) keyEl.focus(); return;
    }
    var status = $("transcriptionStatus"), btn = $("transcribeGladia");
    if (status) status.textContent = "Uploading selected media to Gladia…"; if (btn) btn.disabled = true;
    var form = new FormData(); form.append("file", file, file.name); form.append("api_key", key);
    fetch("http://127.0.0.1:8765/transcribe-gladia", { method: "POST", body: form })
      .then(function(r){ return r.json().then(function(data){ if (!r.ok) throw new Error(data.detail || data.error || ("HTTP " + r.status)); return data; }); })
      .then(function(data){
        if (!data.words || !data.words.length) throw new Error("Gladia returned no word timestamps. Check the selected media and API response.");
        words = data.words.map(function(w){ return { text: String(w.text || w.word || "").trim(), start: Number(w.start), end: Number(w.end) }; });
        renderWords(); if (status) status.textContent = "Gladia transcription complete: " + words.length + " words."; toast("Gladia transcription complete: " + words.length + " word cues.");
      })
      .catch(function(err){ if (status) status.textContent = "Gladia transcription failed: " + err.message; toast("Gladia error: " + err.message); console.error("LayerPop Gladia:", err); })
      .finally(function(){ if (btn) btn.disabled = false; });
  }
  function chooseMogrt(){
    if (!window.cep || !window.cep.fs || typeof window.cep.fs.showOpenDialogEx !== "function") { toast("CEP file picker unavailable."); return; }
    try {
      var startDir = getDefaultMogrtRoot();
      var r = window.cep.fs.showOpenDialogEx(false, false, "Select MOGRT", startDir, ["*.mogrt"], null);
      if (r && r.data && r.data[0]) {
        chosenMogrt = r.data[0];
        var mogrtStatus = $("mogrtStatus");
        if (mogrtStatus) mogrtStatus.textContent = "Selected: " + chosenMogrt;
        toast("MOGRT selected.");
      }
    } catch (err) { toast("Could not choose MOGRT: " + err.message); }
  }
  function insertMogrt(){
    if (!chosenMogrt) { toast("Choose a MOGRT first."); return; }
    var bridge = getHostBridge();
    if (!bridge) { toast("Premiere CEP bridge is unavailable."); return; }
    var safePath = chosenMogrt.replace(/\\/g, "/").replace(/"/g, '\\"');
    bridge.evalScript('LP_insertMogrt("' + safePath + '")', function(result){
      if (!result || result.indexOf("OK:") === -1) {
        toast((result && result.indexOf("ERROR") === 0) ? result : "MOGRT import request failed.");
      } else {
        toast("MOGRT import request sent to Premiere.");
      }
    });
  }
  function startGeneration(){ normalize(); if (!words.length) { toast("Import an SRT or paste a transcript first."); showTab("text"); return; } var modal = $("generationModal"); if (modal) modal.classList.remove("hidden"); var bar = $("generationBar"); if (bar) bar.style.width = "0%"; generationValue = 0; generationTimer = setInterval(function(){ generationValue = Math.min(100, generationValue + 10); if (bar) bar.style.width = generationValue + "%"; var label = $("generationStatus"); if (label) label.textContent = generationValue < 100 ? "Generating caption layers…" : "Ready for Premiere export."; if (generationValue >= 100) { clearInterval(generationTimer); generationTimer = null; } }, 180); }
  function cancelGeneration(){ if (generationTimer) { clearInterval(generationTimer); generationTimer = null; } var modal = $("generationModal"); if (modal) modal.classList.add("hidden"); toast("Generation cancelled."); }
  function initEvents(){
    var transcribeLocalBtn = $("transcribeMedia"); if (transcribeLocalBtn) transcribeLocalBtn.addEventListener("click", function(){ var fileInput = $("mediaFile"); if (fileInput) { fileInput.dataset.engine = selectedProvider; fileInput.click(); } });
    var transcribeGladiaBtn = $("transcribeGladia"); if (transcribeGladiaBtn) transcribeGladiaBtn.addEventListener("click", function(){ setProviderFromSelection("gladia"); var fileInput = $("mediaFile"); if (fileInput) { fileInput.dataset.engine = "gladia"; fileInput.click(); } });
    var providerSelect = $("providerSelect"); if (providerSelect) providerSelect.addEventListener("change", function(){ setProviderFromSelection(this.value); });
    var mediaFile = $("mediaFile"); if (mediaFile) mediaFile.addEventListener("change", function(){ var file = this.files && this.files[0]; if (!file) return; if (this.dataset.engine === "gladia") { transcribeGladia(file); } else { transcribeLocal(file); } this.value = ""; });
    var srtFile = $("srtFile"); if (srtFile) srtFile.addEventListener("change", function(){ var file = this.files && this.files[0]; if (!file) return; var reader = new FileReader(); reader.onload = function(){ var parsed = parseSrt(reader.result || ""); if (!parsed.length) { toast("No valid SRT cues were found."); return; } words = parsed; renderWords(); toast("Imported " + words.length + " word cues from SRT."); }; reader.readAsText(file); this.value = ""; });
    var importSrtBtn = $("importSrt"); if (importSrtBtn) importSrtBtn.addEventListener("click", function(){ if (srtFile) srtFile.click(); });
    var transcriptModal = $("transcriptModal"); var transcriptInput = $("transcriptInput"); var closeTranscript = $("closeTranscript"); var closeTranscriptBtn = $("closeTranscriptBtn"); var demoText = $("demoText"); var importTranscript = $("importTranscript"); if (importTranscript && transcriptModal) importTranscript.addEventListener("click", function(){ transcriptModal.classList.remove("hidden"); }); if (closeTranscript) closeTranscript.addEventListener("click", function(){ if (transcriptModal) transcriptModal.classList.add("hidden"); }); if (closeTranscriptBtn && transcriptModal) closeTranscriptBtn.addEventListener("click", function(){ transcriptModal.classList.add("hidden"); }); if (demoText && transcriptInput) demoText.addEventListener("click", function(){ var text = transcriptInput.value; splitTranscript(text, 22); if (transcriptModal) transcriptModal.classList.add("hidden"); });
    var addWordBtn = $("addWord"); if (addWordBtn) addWordBtn.addEventListener("click", function(){ var end = words.length ? words[words.length - 1].end : 0; words.push({ text: "word", start: end, end: end + 0.3 }); renderWords(); });
    document.addEventListener("click", function(e){ var t = e.target.closest("[data-tab]"); if (t) { showTab(t.dataset.tab); return; } var n = e.target.closest("[data-next]"); if (n) { showTab(n.dataset.next); return; } var b = e.target.closest("[data-back]"); if (b) { showTab(b.dataset.back); return; } var preset = e.target.closest("[data-preset]"); if (preset) { selectedPreset = preset.dataset.preset; renderPresets(); toast("Preset: " + selectedPreset); } });
    var accentColor = $("accentColor"); if (accentColor) accentColor.addEventListener("input", updatePreview); var textColor = $("textColor"); if (textColor) textColor.addEventListener("input", updatePreview); var fontSize = $("fontSize"); if (fontSize) fontSize.addEventListener("input", updatePreview);
    var wordRows = $("wordRows"); if (wordRows) wordRows.addEventListener("input", function(e){
      var el = e.target;
      if (typeof el.dataset.wordText !== "undefined") { var idx = +el.dataset.wordText; words[idx].text = el.value; updatePreview(); }
      if (typeof el.dataset.wordStart !== "undefined") { var idxStart = +el.dataset.wordStart; words[idxStart].start = Number(el.value) || 0; }
      if (typeof el.dataset.wordEnd !== "undefined") { var idxEnd = +el.dataset.wordEnd; words[idxEnd].end = Number(el.value) || 0; }
      renderWords();
    });
    var wordsPerBlock = $("wordsPerBlock"); if (wordsPerBlock) wordsPerBlock.addEventListener("change", function(){ toast("Block size set to " + this.value + " word(s). Export remains one cue per word."); });
    var caseMode = $("caseMode"); if (caseMode) caseMode.addEventListener("change", function(){ updatePreview(); });
    var exportSrtBtn = $("exportSrt"); if (exportSrtBtn) exportSrtBtn.addEventListener("click", exportSrt); var exportAssBtn = $("exportAss"); if (exportAssBtn) exportAssBtn.addEventListener("click", exportAss); var chooseMogrtBtn = $("chooseMogrt"); if (chooseMogrtBtn) chooseMogrtBtn.addEventListener("click", chooseMogrt); var generateBtn = $("generateBtn"); if (generateBtn) generateBtn.addEventListener("click", startGeneration); var closeGeneration = $("closeGeneration"); if (closeGeneration) closeGeneration.addEventListener("click", cancelGeneration); var aboutBtn = $("aboutBtn"); if (aboutBtn) aboutBtn.addEventListener("click", function(){ var modal = $("aboutModal"); if (modal) modal.classList.remove("hidden"); }); var closeAbout = $("closeAbout"); if (closeAbout) closeAbout.addEventListener("click", function(){ var modal = $("aboutModal"); if (modal) modal.classList.add("hidden"); });
    document.addEventListener("keydown", function(e){ if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") { e.preventDefault(); showTab("style"); }});
  }
  function boot(){
    if (typeof CSInterface !== "undefined") { window.__adobe_cep__ = new CSInterface(); }
    renderPresets();
    initEvents();
    updateProviderUI();
    checkBridge();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();
