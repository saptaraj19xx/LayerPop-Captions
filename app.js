(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var words = [], selectedPreset = "punchline", chosenMogrt = "", generationTimer = null, generationValue = 0;
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
  function toast(message) { var el = $("toast"); el.textContent = message; el.classList.add("show"); window.setTimeout(function(){el.classList.remove("show");}, 2600); }
  function esc(value) { return String(value).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];}); }
  function clamp(n,min,max){return Math.max(min,Math.min(max,n));}
  function renderPresets() {
    $("presetGrid").innerHTML = presets.map(function(p){
      var sample = p.id === "creatorbox" ? "background:"+p.accent+";color:#111;padding:4px 6px;border-radius:3px;" : "color:#fff;text-shadow:2px 2px #000,-2px 2px #000,0 0 8px "+p.accent+";";
      return '<button class="preset '+(selectedPreset===p.id?'selected':'')+'" data-preset="'+p.id+'"><div class="preset-sample" style="'+sample+'">WORD <span style="color:'+p.accent+'">POP</span></div><span class="preset-name">'+esc(p.name)+'</span><small>'+esc(p.desc)+'</small></button>';
    }).join("");
    var p = presets.find(function(x){return x.id===selectedPreset;}) || presets[0];
    $("accentColor").value = p.accent;
    updatePreview();
  }
  function updatePreview(){
    var p=presets.find(function(x){return x.id===selectedPreset;})||presets[0], accent=$("accentColor").value, textColor=$("textColor").value;
    var sample=words.length ? words[0].text : "THIS IS THE MOMENT", parts=sample.split(/\s+/), split=Math.max(1,Math.floor(parts.length*.6));
    var first=parts.slice(0,split).join(" "), second=parts.slice(split).join(" ");
    var el=$("previewText"); el.innerHTML=esc(first)+(second?' <b>'+esc(second)+'</b>':'');
    el.style.color=textColor;el.style.fontSize=$("fontSize").value+"px";el.style.textShadow=p.treatment==="glow"?"0 0 8px "+accent+",0 3px 4px #000":"2px 2px #000,-2px 2px #000,0 3px 4px #000";
    var b=el.querySelector("b");if(b)b.style.color=accent;
    if(p.treatment==="box"){el.style.background=accent;el.style.color="#111";el.style.padding="8px 12px";if(b)b.style.color="#111";}else{el.style.background="transparent";el.style.padding="0";}
    $("fontSizeOut").textContent=$("fontSize").value+" px";
  }
  function formatTime(seconds, comma) {
    var ms=Math.max(0,Math.round((Number(seconds)||0)*1000)), h=Math.floor(ms/3600000);ms%=3600000;var m=Math.floor(ms/60000);ms%=60000;var s=Math.floor(ms/1000);ms%=1000;
    return String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")+":"+String(s).padStart(2,"0")+(comma?",":".")+String(ms).padStart(3,"0");
  }
  function parseTime(t){var m=String(t).trim().match(/^(\d{1,2}):(\d{2}):(\d{2})[,.](\d{1,3})$/);if(!m)return NaN;return +m[1]*3600 + +m[2]*60 + +m[3] + +(m[4].padEnd(3,"0"))/1000;}
  function normalize(){words=words.map(function(w,i){var start=Math.max(0,Number(w.start)||0),end=Number(w.end);if(!Number.isFinite(end)||end<=start)end=start+.25;return {text:String(w.text||"").trim(),start:start,end:end};}).filter(function(w){return w.text;}).sort(function(a,b){return a.start-b.start;});}
  function renderWords(){
    normalize();$("wordCount").textContent=words.length+" WORDS";
    if(!words.length){$("wordRows").innerHTML='<div class="empty">Import an SRT or paste a transcript to start.</div>';$("timeline").innerHTML='<div class="empty">Your timed words will appear here.</div>';updatePreview();return;}
    $("wordRows").innerHTML=words.map(function(w,i){return '<div class="word-row"><span class="word-index">'+String(i+1).padStart(2,"0")+'</span><input class="word-text" data-word-text="'+i+'" aria-label="Word '+(i+1)+'" value="'+esc(w.text)+'"><input type="number" step="0.01" min="0" data-word-start="'+i+'" aria-label="Start seconds" value="'+w.start.toFixed(2)+'"><input type="number" step="0.01" min="0.01" data-word-end="'+i+'" aria-label="End seconds" value="'+w.end.toFixed(2)+'"><button class="remove-word" data-remove-word="'+i+'" title="Remove word">×</button></div>';}).join("");
    var maxEnd=Math.max(5,words.reduce(function(m,w){return Math.max(m,w.end);},0));
    $("timelineRuler").innerHTML=[0,.2,.4,.6,.8,1].map(function(f){return '<span>'+ (maxEnd*f).toFixed(1)+'s</span>';}).join("");
    $("timeline").innerHTML=words.map(function(w,i){var width=clamp((w.end-w.start)/maxEnd*100,1.3,100);return '<div class="timeline-word" title="'+esc(w.text)+': '+w.start.toFixed(2)+'–'+w.end.toFixed(2)+'s" style="width:'+Math.max(28,width*4.8)+'px;" data-timeline-word="'+i+'">'+esc(w.text)+'</div>';}).join("");
    updatePreview();
  }
  function splitTranscript(text,duration){
    var tokens=String(text||"").trim().split(/\s+/).filter(Boolean);if(!tokens.length){toast("Paste a transcript first.");return false;}
    var total=Math.max(1,Number(duration)||Math.max(2,tokens.length*.35)), unit=total/tokens.length;
    words=tokens.map(function(token,i){return {text:token.replace(/^\s+|\s+$/g,""),start:i*unit,end:(i+1)*unit};});renderWords();return true;
  }
  function parseSrt(text){
    var blocks=String(text).replace(/\r/g,"").trim().split(/\n\s*\n/), parsed=[];
    blocks.forEach(function(block){var rows=block.split("\n"),idx=rows.findIndex(function(r){return r.indexOf("-->")>=0;});if(idx<0)return;var pair=rows[idx].split("-->"),start=parseTime(pair[0].trim()),end=parseTime(pair[1].trim().split(/\s+/)[0]);var cue=rows.slice(idx+1).join(" ").replace(/<[^>]*>/g,"").trim();if(!Number.isFinite(start)||!Number.isFinite(end)||end<=start||!cue)return;var toks=cue.split(/\s+/);var duration=(end-start)/toks.length;toks.forEach(function(t,i){parsed.push({text:t,start:start+i*duration,end:i===toks.length-1?end:start+(i+1)*duration});});});return parsed;
  }
  function download(name,content,type){var blob=new Blob([content],{type:type||"text/plain;charset=utf-8"}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();window.setTimeout(function(){URL.revokeObjectURL(url);},1500);}
  function exportSrt(){normalize();if(!words.length){toast("Add or import words first.");return;}var output=words.map(function(w,i){return (i+1)+"\n"+formatTime(w.start,true)+" --> "+formatTime(w.end,true)+"\n"+applyCase(w.text);}).join("\n\n")+"\n";download("layerpop-word-captions.srt",output,"application/x-subrip;charset=utf-8");toast("Word-level SRT exported.");}
  function applyCase(text){var mode=$("caseMode")?$("caseMode").value:"normal";return mode==="upper"?text.toUpperCase():mode==="lower"?text.toLowerCase():text;}
  function exportAss(){
    normalize();if(!words.length){toast("Add or import words first.");return;}
    var rgb=$("accentColor").value,rr=rgb.slice(1,3),gg=rgb.slice(3,5),bb=rgb.slice(5,7),color="&H00"+bb+gg+rr;
    var pos=$("captionPosition")?$("captionPosition").value:"bottom",align=pos==="top"?8:(pos==="center"?5:2),marginV=pos==="top"?120:(pos==="center"?0:190);
    var animation=$("animationStyle")?$("animationStyle").value:"pop";
    var header="[Script Info]\nScriptType: v4.00+\nPlayResX: 1080\nPlayResY: 1920\nScaledBorderAndShadow: yes\n\n[V4+ Styles]\nFormat: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding\nStyle: LayerPop,Arial,"+$("fontSize").value+",&H00FFFFFF,"+color+",&H00000000,&H64000000,-1,0,1,3,2,"+align+",60,60,"+marginV+",1\n\n[Events]\nFormat: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text\n";
    var body=words.map(function(w){var tags="\\c"+color;if(animation==="fade")tags+="\\fad(90,60)";else if(animation==="pop")tags+="\\fscx65\\fscy65\\t(0,120,\\fscx100\\fscy100)";else if(animation==="scale")tags+="\\fscx10\\fscy10\\t(0,160,\\fscx100\\fscy100)";return "Dialogue: 0,"+formatTime(w.start,false).replace(/\.(\d{3})$/,function(_,n){return "."+n.slice(0,2);})+","+formatTime(w.end,false).replace(/\.(\d{3})$/,function(_,n){return "."+n.slice(0,2);})+",LayerPop,,0,0,0,,{"+tags+"}"+applyCase(w.text).replace(/[{}]/g,"");}).join("\n");
    download("layerpop-animated-word-captions.ass",header+body+"\n","text/plain;charset=utf-8");toast("ASS captions exported with selected placement and supported animation tags.");
  }
  function transcribeLocal(file){
    if(!file){toast("Choose a video or audio file first.");return;}
    var status=$("transcriptionStatus"); var btn=$("transcribeMedia");
    status.textContent="Connecting to local transcription engine…"; btn.disabled=true;
    var form=new FormData(); form.append("file",file,file.name);
    fetch("http://127.0.0.1:8765/transcribe",{method:"POST",body:form})
      .then(function(r){if(!r.ok)return r.text().then(function(t){throw new Error(t||("HTTP "+r.status));});return r.json();})
      .then(function(data){
        if(!data.words||!data.words.length)throw new Error("No speech words were detected.");
        words=data.words.map(function(w){return {text:w.text,start:Number(w.start),end:Number(w.end)};});
        renderWords();showTab("text");status.textContent="Transcribed "+words.length+" words locally.";
        toast("Local transcription complete: "+words.length+" words.");
      }).catch(function(err){
        status.textContent="Local engine unavailable: "+err.message;
        toast("Start the LayerPop local transcription server; see LOCAL-TRANSCRIPTION.md.");
        console.error("LayerPop local transcription:",err);
      }).finally(function(){btn.disabled=false;});
  }
  function showTab(name){document.querySelectorAll(".step").forEach(function(b){b.classList.toggle("active",b.dataset.tab===name);});document.querySelectorAll(".panel").forEach(function(p){p.classList.toggle("active",p.id==="panel-"+name);});}
  function checkBridge(){var status=$("bridgeStatus");function set(t){if(status)status.textContent=t;}if(!window.__adobe_cep__){set("CEP host bridge unavailable");return;}if(typeof CSInterface==="undefined"){set("CSInterface.js missing");return;}try{var cs=new CSInterface();cs.evalScript("LP_ping()",function(result){set(result==="LAYERPOP_READY"?"Premiere bridge connected":"Bridge response: "+String(result));});}catch(e){set("Bridge error: "+e.message);}}
  function transcribeGladia(file){
    if(!file){toast("Choose an audio or video file first.");return;}
    var keyEl=$("gladiaKey"), key=keyEl?keyEl.value.trim():"";
    if(!key){toast("Paste your Gladia API key first.");if(keyEl)keyEl.focus();return;}
    var status=$("transcriptionStatus"), btn=$("transcribeGladia");
    status.textContent="Uploading selected media to Gladia…";btn.disabled=true;
    var form=new FormData();form.append("file",file);form.append("api_key",key);
    fetch("http://127.0.0.1:8765/transcribe-gladia",{method:"POST",body:form})
      .then(function(r){return r.json().then(function(data){if(!r.ok)throw new Error(data.detail||data.error||("HTTP "+r.status));return data;});})
      .then(function(data){
        if(!data.words||!data.words.length)throw new Error("Gladia returned no word timestamps. Check the selected media and API response.");
        words=data.words.map(function(w){return {text:String(w.text||w.word||"").trim(),start:Number(w.start),end:Number(w.end)};});
        renderWords();showTab("text");status.textContent="Gladia transcription complete: "+words.length+" words.";toast("Gladia transcription complete: "+words.length+" word cues.");
      })
      .catch(function(err){status.textContent="Gladia transcription failed: "+err.message;toast("Gladia error: "+err.message);console.error("LayerPop Gladia:",err);})
      .finally(function(){btn.disabled=false;});
  }
  function chooseMogrt(){if(!window.cep||!window.cep.fs||typeof window.cep.fs.showOpenDialogEx!=="function"){toast("CEP file picker unavailable.");return;}try{var r=window.cep.fs.showOpenDialogEx(false,false,"Choose a Motion Graphics Template","",["mogrt"]);if(r&&r.err===0&&r.data&&r.data.length){chosenMogrt=r.data[0];$("mogrtStatus").textContent=chosenMogrt;toast("MOGRT selected.");}else if(r&&r.err!==0)toast("File picker error: "+r.err);}catch(e){toast("File picker failed: "+e.message);}}
  function insertMogrt(){if(!chosenMogrt){toast("Choose a MOGRT first.");return;}if(!window.__adobe_cep__||typeof CSInterface==="undefined"){toast("Premiere CEP bridge is unavailable.");return;}try{var cs=new CSInterface();cs.evalScript("LP_insertMogrt("+JSON.stringify(chosenMogrt)+")",function(result){if(result==="MOGRT_INSERTED"||result==="true")toast("MOGRT insertion reported success.");else toast("MOGRT insertion: "+String(result));});}catch(e){toast("Insertion error: "+e.message);}}
  function startGeneration(){normalize();if(!words.length){toast("Import an SRT or paste a transcript first.");showTab("text");return;}$("generationModal").classList.remove("hidden");$("generationTitle").textContent="Preparing word captions…";$("generationNote").textContent="Validating "+words.length+" timed words and preparing exports. Native animated graphics are not generated by this step.";$("finishGeneration").classList.add("hidden");$("progressFill").style.width="0%";generationValue=0;clearInterval(generationTimer);generationTimer=window.setInterval(function(){generationValue=Math.min(100,generationValue+8);$("progressFill").style.width=generationValue+"%";$("progressPercent").textContent=generationValue+"%";$("progressLabel").textContent=generationValue<35?"Checking word timings…":generationValue<70?"Preparing caption blocks…":"Preparing export…";if(generationValue>=100){clearInterval(generationTimer);generationTimer=null;$("generationTitle").textContent="Caption data ready";$("progressLabel").textContent="Ready to export";$("generationNote").textContent="Word-level caption data is ready. Export SRT/ASS for timed subtitles. For one animated Premiere graphic per word, a supported graphic-generation integration is still required.";$("finishGeneration").classList.remove("hidden");}},90);}
  function cancelGeneration(){if(generationTimer){clearInterval(generationTimer);generationTimer=null;}$("generationModal").classList.add("hidden");toast("Generation cancelled.");}
  function initEvents(){
    if($("transcribeMedia"))$("transcribeMedia").addEventListener("click",function(){$("mediaFile").dataset.engine="local";$("mediaFile").click();});
    if($("transcribeGladia"))$("transcribeGladia").addEventListener("click",function(){$("mediaFile").dataset.engine="gladia";$("mediaFile").click();});
    if($("mediaFile"))$("mediaFile").addEventListener("change",function(){var f=this.files&&this.files[0];if(f){if(this.dataset.engine==="gladia")transcribeGladia(f);else transcribeLocal(f);}this.value="";});
    document.addEventListener("click",function(e){var t=e.target.closest("[data-tab]");if(t){showTab(t.dataset.tab);return;}var n=e.target.closest("[data-next]");if(n){showTab(n.dataset.next);return;}var b=e.target.closest("[data-back]");if(b){showTab(b.dataset.back);return;}var p=e.target.closest("[data-preset]");if(p){selectedPreset=p.dataset.preset;renderPresets();return;}var rem=e.target.closest("[data-remove-word]");if(rem){words.splice(Number(rem.dataset.removeWord),1);renderWords();return;}var tw=e.target.closest("[data-timeline-word]");if(tw){document.querySelectorAll(".timeline-word").forEach(function(el){el.classList.remove("active");});tw.classList.add("active");return;}});
    $("accentColor").addEventListener("input",updatePreview);$("textColor").addEventListener("input",updatePreview);$("fontSize").addEventListener("input",updatePreview);
    $("importSrt").addEventListener("click",function(){$("srtFile").click();});$("srtFile").addEventListener("change",function(){var file=this.files&&this.files[0];if(!file)return;var reader=new FileReader();reader.onload=function(){var parsed=parseSrt(reader.result);if(parsed.length){words=parsed;renderWords();showTab("text");toast("Imported SRT and created "+words.length+" editable word cues.");}else toast("No valid SRT cues found.");};reader.onerror=function(){toast("Couldn't read that file.");};reader.readAsText(file);this.value="";});
    $("importTranscript").addEventListener("click",function(){$("transcriptModal").classList.remove("hidden");});$("closeTranscript").addEventListener("click",function(){$("transcriptModal").classList.add("hidden");});$("cancelTranscript").addEventListener("click",function(){$("transcriptModal").classList.add("hidden");});$("createWords").addEventListener("click",function(){if(splitTranscript($("transcriptText").value,$("durationInput").value)){$("transcriptModal").classList.add("hidden");showTab("text");toast("Words created with estimated timing.");}});
    $("addWord").addEventListener("click",function(){var end=words.length?words[words.length-1].end:0;words.push({text:"word",start:end,end:end+.3});renderWords();});$("demoText").addEventListener("click",function(){splitTranscript("THIS IS THE MOMENT THAT CHANGES EVERYTHING",4.2);toast("Demo words loaded with estimated timing.");});
    $("wordRows").addEventListener("input",function(e){var el=e.target,idx;if(el.dataset.wordText!==undefined){idx=+el.dataset.wordText;words[idx].text=el.value;updatePreview();var block=$("timeline").querySelector('[data-timeline-word="'+idx+'"]');if(block)block.textContent=el.value;}else if(el.dataset.wordStart!==undefined){idx=+el.dataset.wordStart;words[idx].start=Math.max(0,Number(el.value)||0);renderTimelineOnly();}else if(el.dataset.wordEnd!==undefined){idx=+el.dataset.wordEnd;words[idx].end=Math.max(words[idx].start+.01,Number(el.value)||words[idx].start+.01);renderTimelineOnly();}});
    $("wordsPerBlock").addEventListener("change",function(){toast("Block size set to "+this.value+" word(s). Export remains one cue per word.");});$("caseMode").addEventListener("change",function(){updatePreview();});$("layoutWords").addEventListener("change",function(){toast("Caption block size set to "+this.value+" word(s).");});
    $("exportSrt").addEventListener("click",exportSrt);$("exportAss").addEventListener("click",exportAss);$("chooseMogrt").addEventListener("click",chooseMogrt);$("generateBtn").addEventListener("click",startGeneration);$("cancelGeneration").addEventListener("click",cancelGeneration);$("closeGeneration").addEventListener("click",cancelGeneration);$("finishGeneration").addEventListener("click",function(){$("generationModal").classList.add("hidden");exportSrt();});
    $("aboutBtn").addEventListener("click",function(){$("aboutModal").classList.remove("hidden");});$("closeAbout").addEventListener("click",function(){$("aboutModal").classList.add("hidden");});
    document.addEventListener("keydown",function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();showTab("style");}});
  }
  function renderTimelineOnly(){var maxEnd=Math.max(5,words.reduce(function(m,w){return Math.max(m,w.end);},0));$("timeline").innerHTML=words.map(function(w,i){var width=clamp((w.end-w.start)/maxEnd*100,1.3,100);return '<div class="timeline-word" title="'+esc(w.text)+': '+w.start.toFixed(2)+'–'+w.end.toFixed(2)+'s" style="width:'+Math.max(28,width*4.8)+'px;" data-timeline-word="'+i+'">'+esc(w.text)+'</div>';}).join("");}
  function boot(){renderPresets();initEvents();checkBridge();}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot);else boot();
})();
