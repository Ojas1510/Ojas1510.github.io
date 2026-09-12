(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isTouch = window.matchMedia("(pointer: coarse)").matches;

  var enhancementCSS = `
    :root { --cursor-x:50vw; --cursor-y:50vh; }
    body { overflow-x:hidden; }
    body::before { content:""; position:fixed; inset:0; pointer-events:none; z-index:48; background:radial-gradient(520px circle at var(--cursor-x) var(--cursor-y),rgba(255,176,0,.055),transparent 62%); opacity:0; transition:opacity .25s ease; }
    body.pointer-active::before { opacity:1; }
    .site-progress { position:fixed; top:0; left:0; width:100%; height:3px; z-index:1000; background:rgba(255,176,0,.08); }
    .site-progress > i { display:block; height:100%; width:0; background:var(--phosphor-amber); box-shadow:0 0 12px rgba(255,176,0,.7); }
    .hud { position:fixed; right:18px; top:18px; z-index:900; display:flex; gap:7px; align-items:center; font:10px/1 var(--font-mono); letter-spacing:.08em; color:var(--phosphor-amber-dim); opacity:.72; }
    .hud-pill { border:1px solid currentColor; padding:7px 9px; background:rgba(23,20,15,.82); backdrop-filter:blur(8px); }
    .hud-btn { color:inherit; cursor:pointer; }
    .hud-dot { display:inline-block; width:6px; height:6px; border-radius:50%; background:currentColor; box-shadow:0 0 8px currentColor; animation:hudpulse 1.8s ease-in-out infinite; }
    @keyframes hudpulse { 50%{opacity:.35;transform:scale(.7)} }
    .quick-nav button { position:relative; overflow:hidden; }
    .quick-nav button::after { content:""; position:absolute; left:50%; top:50%; width:0; height:0; border-radius:50%; background:rgba(255,255,255,.2); transform:translate(-50%,-50%); transition:width .35s ease,height .35s ease; }
    .quick-nav button:active::after { width:180px; height:180px; }
    .hero-actions { display:flex; flex-wrap:wrap; gap:9px; margin-top:18px; }
    .hero-action { display:inline-flex; align-items:center; gap:7px; padding:8px 12px; border:1px solid var(--phosphor-amber-dim); color:var(--phosphor-amber); background:rgba(255,176,0,.035); text-decoration:none; font:10px var(--font-mono); letter-spacing:.06em; transition:.2s ease; }
    .hero-action:hover { background:var(--phosphor-amber); color:var(--ink-black); transform:translateY(-2px); }
    .project-toolbar { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:12px; margin:0 0 20px; padding:10px 12px; border:1px solid rgba(111,147,184,.5); background:rgba(22,35,58,.42); }
    .filter-group { display:flex; flex-wrap:wrap; gap:6px; }
    .filter-btn { border:1px solid var(--blueprint-line); background:transparent; color:#a9c1d9; padding:6px 9px; cursor:pointer; font:9px var(--font-mono); letter-spacing:.05em; transition:.18s ease; }
    .filter-btn:hover,.filter-btn.active { background:#d8e2ee; color:#16233a; }
    .project-count { font:9px var(--font-mono); color:#8eabc7; letter-spacing:.08em; }
    .schematic-card { cursor:pointer; transform-style:preserve-3d; transition:transform .25s ease,box-shadow .25s ease,border-color .25s ease,opacity .25s ease; }
    .schematic-card:hover { border-color:#b8d5ef; box-shadow:0 18px 40px rgba(0,0,0,.25),inset 0 0 35px rgba(111,147,184,.06); }
    .schematic-card.project-hidden { display:none; }
    .card-hint { margin-top:1rem; font:9px/1.3 var(--font-mono); letter-spacing:.1em; color:#8eabc7; opacity:.7; text-transform:uppercase; }
    .project-modal { position:fixed; inset:0; z-index:1100; display:grid; place-items:center; padding:20px; background:rgba(5,8,14,.78); backdrop-filter:blur(9px); opacity:0; visibility:hidden; transition:opacity .25s ease,visibility .25s ease; }
    .project-modal.open { opacity:1; visibility:visible; }
    .project-window { width:min(680px,100%); max-height:min(78vh,720px); overflow:auto; border:1px solid #6f93b8; background:linear-gradient(145deg,#17263f,#101a2b); color:var(--paper-cream); box-shadow:0 30px 90px rgba(0,0,0,.55),0 0 0 1px rgba(255,176,0,.08); transform:translateY(18px) scale(.97); transition:transform .3s ease; }
    .project-modal.open .project-window { transform:none; }
    .project-window-head { display:flex; justify-content:space-between; align-items:center; gap:1rem; padding:12px 16px; border-bottom:1px solid #395673; font:10px var(--font-mono); color:#a9c1d9; }
    .project-close { border:1px solid #6f93b8; background:transparent; color:#d8e2ee; width:30px; height:30px; cursor:pointer; font:16px var(--font-mono); }
    .project-close:hover { background:#d8e2ee; color:#16233a; }
    .project-window-body { padding:25px; }
    .project-window-body h2 { margin:.15rem 0 .8rem; font:700 clamp(1.5rem,4vw,2.25rem) var(--font-label); }
    .project-window-body p { color:#d8e2ee; max-width:65ch; }
    .modal-meta { display:flex; flex-wrap:wrap; gap:7px; margin:1rem 0 1.4rem; }
    .modal-tag { border:1px solid #6f93b8; padding:5px 8px; font:9px var(--font-mono); color:#cfe0f0; }
    .modal-command { border-left:2px solid #ffb000; padding:10px 13px; margin-top:1.2rem; background:rgba(255,176,0,.045); font:11px/1.5 var(--font-mono); color:#ffcf8f; white-space:pre-line; }
    .modal-actions { display:flex; flex-wrap:wrap; gap:8px; margin-top:18px; }
    .modal-action { border:1px solid #6f93b8; color:#d8e2ee; background:transparent; padding:8px 11px; text-decoration:none; font:9px var(--font-mono); }
    .modal-action:hover { background:#d8e2ee; color:#16233a; }
    .skill-chip { display:inline-flex; margin:3px; padding:4px 7px; border:1px dashed var(--paper-shadow); font:9px var(--font-mono); cursor:default; transition:transform .15s ease,background .15s ease; }
    .skill-chip:hover { transform:translateY(-2px); background:rgba(176,89,46,.08); }
    .skill-cloud { margin-top:1.5rem; padding-top:1rem; border-top:1px dashed var(--paper-shadow); }
    .skill-cloud-label { display:block; margin-bottom:6px; font:9px var(--font-mono); color:var(--rust-copper); letter-spacing:.08em; }
    .timeline { position:relative; margin-top:2rem; padding-left:26px; }
    .timeline::before { content:""; position:absolute; left:7px; top:5px; bottom:5px; width:1px; background:var(--phosphor-amber-dim); }
    .timeline-item { position:relative; margin-bottom:18px; padding:13px 15px; border:1px solid rgba(255,176,0,.2); background:rgba(255,176,0,.025); transition:.2s ease; }
    .timeline-item::before { content:""; position:absolute; left:-23px; top:19px; width:9px; height:9px; border:1px solid var(--phosphor-amber); background:var(--ink-black-2); box-shadow:0 0 10px rgba(255,176,0,.25); }
    .timeline-item:hover { transform:translateX(4px); border-color:rgba(255,176,0,.5); }
    .timeline-period { font:9px var(--font-mono); color:var(--phosphor-amber); letter-spacing:.07em; }
    .timeline-title { margin:4px 0; color:var(--paper-cream); font:600 1rem var(--font-label); }
    .timeline-detail { margin:0; color:#cfc6b2; font-size:.9rem; }
    .active-section { position:fixed; left:18px; bottom:18px; z-index:900; font:9px var(--font-mono); letter-spacing:.1em; color:var(--rust-copper); opacity:.65; background:rgba(233,223,199,.88); padding:7px 9px; border:1px solid var(--paper-shadow); backdrop-filter:blur(7px); }
    .command-palette { position:fixed; inset:0; z-index:1200; display:grid; place-items:start center; padding-top:13vh; background:rgba(5,5,4,.7); backdrop-filter:blur(10px); opacity:0; visibility:hidden; transition:.2s ease; }
    .command-palette.open { opacity:1; visibility:visible; }
    .palette-box { width:min(620px,calc(100% - 28px)); border:1px solid var(--phosphor-amber-dim); background:#14110c; box-shadow:0 25px 80px rgba(0,0,0,.55),0 0 30px rgba(255,176,0,.08); }
    .palette-input { width:100%; border:0; border-bottom:1px solid #4a3920; outline:0; padding:16px; background:transparent; color:var(--phosphor-amber); font:16px var(--font-terminal); }
    .palette-list { max-height:300px; overflow:auto; padding:8px; }
    .palette-item { width:100%; display:flex; justify-content:space-between; border:0; background:transparent; color:#d7c59e; padding:11px 12px; cursor:pointer; font:11px var(--font-mono); text-align:left; }
    .palette-item:hover,.palette-item.selected { background:#2a2114; color:var(--phosphor-amber); }
    .palette-key { opacity:.45; }
    .copy-toast { position:fixed; left:50%; bottom:28px; transform:translate(-50%,12px); z-index:1300; background:#17140f; color:var(--phosphor-amber); border:1px solid var(--phosphor-amber-dim); padding:9px 13px; font:10px var(--font-mono); opacity:0; pointer-events:none; transition:.25s ease; }
    .copy-toast.show { opacity:1; transform:translate(-50%,0); }
    .back-top { position:fixed; right:18px; bottom:18px; z-index:900; width:38px; height:38px; border:1px solid var(--rust-copper); background:rgba(233,223,199,.88); color:var(--rust-copper); cursor:pointer; opacity:0; pointer-events:none; transform:translateY(8px); transition:.2s ease; font:14px var(--font-mono); }
    .back-top.show { opacity:1; pointer-events:auto; transform:none; }
    body.noir { --paper-cream:#d8d4cb; --paper-shadow:#8b887f; --ledger-ink:#24211d; }
    body.noir .paper-sheet { filter:saturate(.72) contrast(1.02); }
    @media (max-width:700px) { .hud{right:10px;top:10px}.hud-pill:nth-child(2){display:none}.active-section{left:10px;bottom:10px}.back-top{right:10px;bottom:10px}.project-window-body{padding:20px}.project-toolbar{align-items:flex-start}.project-count{width:100%} }
    @media (pointer:coarse) { body::before{display:none}.schematic-card:hover{transform:none!important}.timeline-item:hover{transform:none} }
    @media (prefers-reduced-motion:reduce) { .schematic-card,.project-window,.project-modal,.command-palette{transition:none}.hud-dot{animation:none}.timeline-item{transition:none} }
  `;
  var styleEl = document.createElement("style");
  styleEl.id = "portfolio-enhancements";
  styleEl.textContent = enhancementCSS;
  document.head.appendChild(styleEl);

  var bootLines = [
    "BOOTING OJAS-NAGTA.SYS ...",
    "LOADING PROFILE ................ OK",
    "MOUNTING PROJECTS ARCHIVE ....... OK",
    "CALIBRATING INSTRUMENT PANEL ... OK",
    "ENABLING INTERACTION LAYER ...... OK",
    "READY."
  ];
  var bootTextEl = document.getElementById("bootText");
  var terminalBody = document.getElementById("terminalBody");

  function typeBoot(callback) {
    if (prefersReducedMotion) { bootTextEl.textContent=bootLines.join("\n"); bootTextEl.style.display="none"; callback(); return; }
    var lineIndex=0,charIndex=0,output="";
    function step(){
      if(lineIndex>=bootLines.length){ setTimeout(function(){bootTextEl.style.display="none";callback();},250);return; }
      var currentLine=bootLines[lineIndex];
      if(charIndex<=currentLine.length){ output=bootLines.slice(0,lineIndex).join("\n")+(lineIndex>0?"\n":"")+currentLine.slice(0,charIndex);bootTextEl.textContent=output;charIndex++;setTimeout(step,7); }
      else { lineIndex++;charIndex=0;setTimeout(step,90); }
    }
    step();
  }

  var terminalInput=document.getElementById("terminalInput");
  var terminalLog=document.getElementById("terminalLog");
  var sectionIds=["about","projects","skills","experience","contact"];
  var commands={
    help:function(){return "commands: help, about, projects, skills, experience, contact, whoami, status, theme, socials, matrix, clear, top";},
    whoami:function(){return "guest — exploring Ojas Nagta // software + ML + full-stack systems.";},
    status:function(){return "SYSTEM ONLINE // interaction layer operational // all sectors nominal.";},
    theme:function(){toggleTheme();return "display mode toggled.";},
    socials:function(){return "GitHub: github.com/Ojas1510 // LinkedIn: linkedin.com/in/ojas-nagta-0226b3200/ // email: ojasnagta@gmail.com";},
    matrix:function(){document.body.classList.toggle("noir");return "visual matrix recalibrated.";},
    top:function(){window.scrollTo({top:0,behavior:prefersReducedMotion?"auto":"smooth"});return "returning to terminal...";},
    clear:function(){terminalLog.innerHTML="";return null;}
  };
  sectionIds.forEach(function(id){commands[id]=function(){goToSection(id);return "jumping to "+id+" ↓";};});

  function goToSection(id){var el=document.getElementById(id);if(el)el.scrollIntoView({behavior:prefersReducedMotion?"auto":"smooth",block:"start"});}
  function logLine(text,cls){if(text===null)return;var p=document.createElement("p");if(cls)p.className=cls;p.textContent=text;terminalLog.appendChild(p);terminalLog.scrollTop=terminalLog.scrollHeight;}
  function runCommand(raw){var cmd=raw.trim().toLowerCase();if(!cmd)return;logLine("guest@ojas:~$ "+raw,"echo");if(Object.prototype.hasOwnProperty.call(commands,cmd))logLine(commands[cmd]());else logLine("command not found: "+cmd+" (type help)","err");}
  function createEl(tag,cls,text){var el=document.createElement(tag);if(cls)el.className=cls;if(text!==undefined)el.textContent=text;return el;}

  var progress=createEl("div","site-progress"),progressBar=createEl("i");progress.appendChild(progressBar);document.body.appendChild(progress);
  var hud=createEl("div","hud"),hudStatus=createEl("span","hud-pill"),hudClock=createEl("span","hud-pill","00:00:00"),hudTheme=createEl("button","hud-pill hud-btn","NOIR");
  hudStatus.innerHTML='<span class="hud-dot"></span> SYSTEM ONLINE';hudTheme.type="button";hud.appendChild(hudStatus);hud.appendChild(hudClock);hud.appendChild(hudTheme);document.body.appendChild(hud);
  var active=createEl("div","active-section","SECTOR // HERO");document.body.appendChild(active);
  var backTop=createEl("button","back-top","↑");backTop.type="button";backTop.setAttribute("aria-label","Back to top");document.body.appendChild(backTop);
  var toast=createEl("div","copy-toast","COPIED");document.body.appendChild(toast);

  function showToast(text){toast.textContent=text;toast.classList.add("show");clearTimeout(showToast.timer);showToast.timer=setTimeout(function(){toast.classList.remove("show");},1500);}
  function updateScrollUI(){var max=document.documentElement.scrollHeight-window.innerHeight,pct=max>0?(window.scrollY/max)*100:0;progressBar.style.width=pct+"%";backTop.classList.toggle("show",window.scrollY>window.innerHeight*.7);}
  window.addEventListener("scroll",updateScrollUI,{passive:true});updateScrollUI();backTop.addEventListener("click",function(){window.scrollTo({top:0,behavior:prefersReducedMotion?"auto":"smooth"});});
  function updateClock(){var d=new Date();hudClock.textContent=[d.getHours(),d.getMinutes(),d.getSeconds()].map(function(n){return String(n).padStart(2,"0");}).join(":");}updateClock();setInterval(updateClock,1000);
  function toggleTheme(){document.body.classList.toggle("noir");hudTheme.textContent=document.body.classList.contains("noir")?"PAPER":"NOIR";}hudTheme.addEventListener("click",toggleTheme);

  /* Hero CTAs */
  var terminal = document.querySelector(".terminal-body");
  if(terminal){
    var actions=createEl("div","hero-actions");
    var actionData=[["VIEW MY WORK","projects"],["EMAIL ME","mailto:ojasnagta@gmail.com"],["GITHUB","https://github.com/Ojas1510"]];
    actionData.forEach(function(item){var a=createEl("a","hero-action",item[0]+"  →");a.href=item[1];if(item[1].indexOf("http")===0){a.target="_blank";a.rel="noopener noreferrer";}else if(item[1].charAt(0)==="#"){a.addEventListener("click",function(e){e.preventDefault();goToSection(item[1].slice(1));});}actions.appendChild(a);});
    terminal.appendChild(actions);
  }

  /* Command palette */
  var palette=createEl("div","command-palette"),paletteBox=createEl("div","palette-box"),paletteInput=document.createElement("input"),paletteList=createEl("div","palette-list");
  paletteInput.className="palette-input";paletteInput.placeholder="Type a command...  (Esc to close)";paletteInput.setAttribute("aria-label","Command palette");paletteBox.appendChild(paletteInput);paletteBox.appendChild(paletteList);palette.appendChild(paletteBox);document.body.appendChild(palette);
  var paletteItems=[["About","about"],["Projects","projects"],["Skills","skills"],["Experience","experience"],["Contact","contact"],["System status","status"],["Toggle theme","theme"],["Back to top","top"]];
  function renderPalette(filter){paletteList.innerHTML="";paletteItems.filter(function(item){return !filter||item[0].toLowerCase().indexOf(filter.toLowerCase())>=0;}).forEach(function(item,idx){var b=createEl("button","palette-item"+(idx===0?" selected":""));b.innerHTML="<span>"+item[0]+"</span><span class=\"palette-key\">"+item[1]+"</span>";b.addEventListener("click",function(){commands[item[1]]();closePalette();});paletteList.appendChild(b);});}
  function openPalette(){renderPalette("");palette.classList.add("open");setTimeout(function(){paletteInput.focus();},20);}function closePalette(){palette.classList.remove("open");paletteInput.value="";}
  paletteInput.addEventListener("input",function(){renderPalette(paletteInput.value);});palette.addEventListener("click",function(e){if(e.target===palette)closePalette();});
  document.addEventListener("keydown",function(e){if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openPalette();}if(e.key==="Escape"){closePalette();closeProjectModal();}});

  /* Project filtering */
  var projectGrid=document.querySelector(".schematic-grid");
  if(projectGrid){
    var toolbar=createEl("div","project-toolbar"),filters=createEl("div","filter-group"),count=createEl("span","project-count");
    [["ALL","all"],["ML / NLP","ml"],["FULL-STACK","fullstack"],["HARDWARE","hardware"],["DATA","data"]].forEach(function(item,idx){var b=createEl("button","filter-btn"+(idx===0?" active":""),item[0]);b.type="button";b.dataset.filter=item[1];filters.appendChild(b);});
    toolbar.appendChild(filters);toolbar.appendChild(count);projectGrid.parentNode.insertBefore(toolbar,projectGrid);
    var cards=Array.prototype.slice.call(projectGrid.querySelectorAll(".schematic-card"));
    function classify(card){var t=card.textContent.toLowerCase();if(t.indexOf("dating")>=0)return "fullstack";if(t.indexOf("haptic")>=0)return "hardware";if(t.indexOf("fraud")>=0||t.indexOf("predictive")>=0)return "data";return "ml";}
    cards.forEach(function(card){card.dataset.category=classify(card);});
    function applyFilter(filter){var visible=0;cards.forEach(function(card){var show=filter==="all"||card.dataset.category===filter;card.classList.toggle("project-hidden",!show);if(show)visible++;});count.textContent="SHOWING "+visible+" / "+cards.length+" PROJECTS";}
    toolbar.querySelectorAll(".filter-btn").forEach(function(b){b.addEventListener("click",function(){toolbar.querySelectorAll(".filter-btn").forEach(function(x){x.classList.remove("active")});b.classList.add("active");applyFilter(b.dataset.filter);});});applyFilter("all");
  }

  /* Project inspector */
  var modal=createEl("div","project-modal"),win=createEl("div","project-window"),winHead=createEl("div","project-window-head"),winLabel=createEl("span","project-window-label","PROJECT // INSPECTOR"),closeBtn=createEl("button","project-close","×"),winBody=createEl("div","project-window-body");
  closeBtn.type="button";closeBtn.setAttribute("aria-label","Close project details");winHead.appendChild(winLabel);winHead.appendChild(closeBtn);win.appendChild(winHead);win.appendChild(winBody);modal.appendChild(win);document.body.appendChild(modal);
  var projectInsights={
    "Large-Scale NLP Chatbot System":"A systems-heavy NLP project combining large-scale data preparation, persistent storage, and sequence-to-sequence response generation.",
    "Online Dating Application":"A full-stack product build spanning client UI, authentication, backend APIs, persistent data, and real-time communication.",
    "Sentiment Analysis on Amazon Reviews":"A practical comparison of classical lexicon sentiment scoring against a transformer-based NLP approach.",
    "Virtual Reality Haptic Gloves":"A hardware/software integration project connecting sensing, firmware, physical feedback, and VR software into one prototype.",
    "Credit Card Fraud Detection":"A machine-learning workflow focused on severe class imbalance and meaningful model evaluation.",
    "Predictive Analytics — CS:GO Round Outcome":"A predictive modeling experiment comparing multiple algorithms and identifying gameplay features associated with round outcomes."
  };
  function openProjectModal(card){var title=card.querySelector("h3")?card.querySelector("h3").textContent:"Project",desc=card.querySelector("p")?card.querySelector("p").textContent.trim():"",date=card.querySelector(".fig-date")?card.querySelector(".fig-date").textContent:"",tags=Array.prototype.map.call(card.querySelectorAll(".component-list li"),function(li){return li.textContent;});winLabel.textContent="PROJECT // "+(card.querySelector(".fig-num")?card.querySelector(".fig-num").textContent:"INSPECTOR");winBody.innerHTML="";winBody.appendChild(createEl("div","fig-date",date));winBody.appendChild(createEl("h2",null,title));winBody.appendChild(createEl("p",null,desc));var meta=createEl("div","modal-meta");tags.forEach(function(tag){meta.appendChild(createEl("span","modal-tag",tag));});winBody.appendChild(meta);winBody.appendChild(createEl("div","modal-command","> inspect --summary\n"+(projectInsights[title]||"Project details available in the project archive.")));
    var actions=createEl("div","modal-actions");var source=createEl("a","modal-action","VIEW GITHUB PROFILE →");source.href="https://github.com/Ojas1510";source.target="_blank";source.rel="noopener noreferrer";actions.appendChild(source);var contact=createEl("a","modal-action","START A CONVERSATION →");contact.href="mailto:ojasnagta@gmail.com?subject="+encodeURIComponent("Project enquiry: "+title);actions.appendChild(contact);winBody.appendChild(actions);modal.classList.add("open");closeBtn.focus();}
  function closeProjectModal(){modal.classList.remove("open");}closeBtn.addEventListener("click",closeProjectModal);modal.addEventListener("click",function(e){if(e.target===modal)closeProjectModal();});
  document.querySelectorAll(".schematic-card").forEach(function(card){var hint=createEl("div","card-hint","↳ click to inspect");card.appendChild(hint);card.setAttribute("tabindex","0");card.setAttribute("role","button");card.addEventListener("click",function(){openProjectModal(card);});card.addEventListener("keydown",function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();openProjectModal(card);}});if(!isTouch&&!prefersReducedMotion){card.addEventListener("pointermove",function(e){var r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;card.style.transform="perspective(900px) rotateX("+(-y*5)+"deg) rotateY("+(x*6)+"deg) translateY(-3px)";});card.addEventListener("pointerleave",function(){card.style.transform="";});}});

  /* Turn the existing ledger into an interactive timeline */
  var ledger=document.querySelector(".ledger-table");
  if(ledger){var rows=Array.prototype.slice.call(ledger.querySelectorAll("tbody tr")),timeline=createEl("div","timeline");rows.forEach(function(row){var cells=row.querySelectorAll("td"),item=createEl("article","timeline-item"),period=createEl("div","timeline-period",cells[0].textContent),title=createEl("div","timeline-title",cells[1].textContent),detail=createEl("p","timeline-detail",cells[2].textContent);item.appendChild(period);item.appendChild(title);item.appendChild(detail);timeline.appendChild(item);});ledger.style.display="none";ledger.parentNode.appendChild(timeline);}

  /* Skill cloud adds a more honest visual summary without fake percentages */
  var panelGrid=document.querySelector(".panel-grid");
  if(panelGrid){var cloud=createEl("div","skill-cloud"),label=createEl("span","skill-cloud-label","CORE STACK // QUICK SCAN");cloud.appendChild(label);["Python","C/C++","JavaScript","SQL","PostgreSQL","MongoDB","React","Node.js","Express","REST APIs","TensorFlow","Scikit-learn","NLP","Git","Data Analytics","Machine Learning"].forEach(function(s){cloud.appendChild(createEl("span","skill-chip",s));});panelGrid.parentNode.appendChild(cloud);}

  /* Active sector */
  if("IntersectionObserver" in window){var sectionObserver=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting)active.textContent="SECTOR // "+entry.target.id.toUpperCase();});},{rootMargin:"-25% 0px -60% 0px",threshold:0});["hero"].concat(sectionIds).forEach(function(id){var el=document.getElementById(id);if(el)sectionObserver.observe(el);});}

  /* Contact copy + mailto fallback for the currently static form */
  document.querySelectorAll(".telegram-details p").forEach(function(row){row.style.cursor="copy";row.title="Click to copy";row.addEventListener("click",function(){var link=row.querySelector("a");var text=link?link.textContent.trim():row.textContent.replace(/^.*?—\s*/,"").trim();if(navigator.clipboard)navigator.clipboard.writeText(text).then(function(){showToast("COPIED // "+text);});});});
  var contactForm=document.getElementById("contactForm");
  if(contactForm){contactForm.addEventListener("submit",function(e){e.preventDefault();var from=document.getElementById("fromField").value.trim(),email=document.getElementById("emailField").value.trim(),message=document.getElementById("messageField").value.trim(),note=document.getElementById("formNote");var subject="Portfolio enquiry from "+from;var body="Name: "+from+"\nReply-to: "+email+"\n\n"+message;window.location.href="mailto:ojasnagta@gmail.com?subject="+encodeURIComponent(subject)+"&body="+encodeURIComponent(body);if(note)note.textContent="MAIL CLIENT OPENING — COMPLETE THE TRANSMISSION THERE.";});}

  /* Pointer glow */
  if(!isTouch&&!prefersReducedMotion){document.addEventListener("pointermove",function(e){document.documentElement.style.setProperty("--cursor-x",e.clientX+"px");document.documentElement.style.setProperty("--cursor-y",e.clientY+"px");document.body.classList.add("pointer-active");},{passive:true});}

  /* Reveal */
  var revealEls=document.querySelectorAll(".reveal");
  if("IntersectionObserver" in window&&!prefersReducedMotion){var observer=new IntersectionObserver(function(entries){entries.forEach(function(entry){if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}});},{threshold:.12});revealEls.forEach(function(el){observer.observe(el);});}else revealEls.forEach(function(el){el.classList.add("is-visible");});

  typeBoot(function(){terminalBody.hidden=false;if(terminalInput)terminalInput.focus({preventScroll:true});});
  if(terminalInput)terminalInput.addEventListener("keydown",function(e){if(e.key==="Enter"){runCommand(terminalInput.value);terminalInput.value="";}});
  document.querySelectorAll(".quick-nav button").forEach(function(btn){btn.addEventListener("click",function(){goToSection(btn.getAttribute("data-cmd"));});});
  document.addEventListener("keydown",function(e){if(e.key==="/"&&document.activeElement!==terminalInput&&document.activeElement!==paletteInput){e.preventDefault();if(terminalInput)terminalInput.focus();}if(e.key==="?"&&document.activeElement!==paletteInput){e.preventDefault();openPalette();}});
  var yearEl=document.getElementById("year");if(yearEl)yearEl.textContent=new Date().getFullYear();
})();
