/* ============================================================
   ADVANCED INTERACTION LAYER
   Loaded after script.js. Adds: theme engine (amber/green/paper),
   richer terminal (history, tab-completion, typo suggestions,
   extra commands), CRT power-on, parallax. Nothing removed.
   ============================================================ */
(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------------- THEME ENGINE ---------------- */
  var THEMES = ["amber", "green", "paper"];
  var STORE = "ojas-theme";

  function currentTheme() {
    return root.getAttribute("data-theme") || "amber";
  }
  function setTheme(name) {
    if (THEMES.indexOf(name) < 0) return false;
    root.setAttribute("data-theme", name);
    try { localStorage.setItem(STORE, name); } catch (e) {}
    Array.prototype.forEach.call(
      document.querySelectorAll(".theme-switch button"),
      function (b) { b.setAttribute("aria-pressed", String(b.dataset.theme === name)); }
    );
    return true;
  }
  var saved = null;
  try { saved = localStorage.getItem(STORE); } catch (e) {}
  setTheme(saved || "amber");

  // HUD theme switch
  var hud = document.querySelector(".hud");
  if (hud) {
    var oldToggle = hud.querySelector(".hud-btn");
    if (oldToggle) oldToggle.remove();
    var sw = document.createElement("div");
    sw.className = "theme-switch";
    [["amber", "AMB"], ["green", "GRN"], ["paper", "PPR"]].forEach(function (t) {
      var b = document.createElement("button");
      b.type = "button";
      b.dataset.theme = t[0];
      b.textContent = t[1];
      b.setAttribute("aria-label", "Switch to " + t[0] + " theme");
      b.addEventListener("click", function () { setTheme(t[0]); });
      sw.appendChild(b);
    });
    hud.appendChild(sw);
    setTheme(currentTheme());
  }

  /* ---------------- CRT POWER-ON ---------------- */
  var screen = document.getElementById("crtScreen");
  if (screen && !reduced) {
    screen.classList.add("crt-power-on");
    setTimeout(function () { screen.classList.remove("crt-power-on"); }, 900);
  }

  /* ---------------- TERMINAL UPGRADE ---------------- */
  var input = document.getElementById("terminalInput");
  var log = document.getElementById("terminalLog");

  function write(text, cls) {
    if (!log) return;
    var el = document.createElement(cls === "block" ? "pre" : "p");
    if (cls) el.className = cls;
    el.textContent = text;
    log.appendChild(el);
    log.scrollTop = log.scrollHeight;
  }

  function scrollTo(id) {
    var el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  }

  var FILES = {
    "about.txt": "Software engineer. EE + Minor CSE, Thapar Institute (CGPA 8.11).\nWorks across ML/NLP, data pipelines, full-stack apps, and occasionally hardware.",
    "projects.txt": "6 entries in the archive. Run `projects` to open the schematic index,\nor click any card to inspect it.",
    "skills.txt": "Python, C/C++, JavaScript, SQL, MongoDB, React, Node/Express,\nTensorFlow, Scikit-learn, NLP, Git, Power BI.",
    "contact.txt": "ojasnagta@gmail.com // +91-7018991170\ngithub.com/Ojas1510 // linkedin.com/in/ojas-nagta-0226b3200",
    "resume.txt": "Ask for the full CV at ojasnagta@gmail.com — happy to send it over."
  };

  var extra = {
    ls: function () {
      write(Object.keys(FILES).join("   "), "block");
    },
    cat: function (arg) {
      if (!arg) { write("usage: cat <file>  (try `ls`)", "err"); return; }
      if (FILES[arg]) write(FILES[arg], "block");
      else write("cat: " + arg + ": no such file", "err");
    },
    theme: function (arg) {
      if (!arg) {
        var next = THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length];
        setTheme(next);
        write("display mode → " + next, "ok");
        return;
      }
      if (setTheme(arg)) write("display mode → " + arg, "ok");
      else write("theme: unknown mode '" + arg + "' (amber | green | paper)", "err");
    },
    date: function () { write(new Date().toString(), "ok"); },
    echo: function (arg) { write(arg || ""); },
    sudo: function () { write("nice try. permission denied — but I like the ambition.", "err"); },
    coffee: function () { write("brewing... ERR_TEAPOT: this terminal only serves code.", "err"); },
    history: function () {
      if (!history.length) { write("no history yet.", "sug"); return; }
      write(history.map(function (h, i) { return String(i + 1).padStart(3, " ") + "  " + h; }).join("\n"), "block");
    },
    hire: function () {
      write("opening mail transmission...", "ok");
      window.location.href = "mailto:ojasnagta@gmail.com?subject=" + encodeURIComponent("Let's work together");
    },
    resume: function () { write(FILES["resume.txt"], "block"); },
    open: function (arg) {
      var links = {
        github: "https://github.com/Ojas1510",
        linkedin: "https://www.linkedin.com/in/ojas-nagta-0226b3200/"
      };
      if (links[arg]) { write("opening " + arg + "...", "ok"); window.open(links[arg], "_blank", "noopener"); }
      else write("open: try `open github` or `open linkedin`", "err");
    },
    help: function () {
      write(
        "NAVIGATION   about  projects  skills  experience  contact  top\n" +
        "FILES        ls  cat <file>  resume\n" +
        "SYSTEM       theme [amber|green|paper]  status  whoami  date  history  clear\n" +
        "REACH OUT    hire  open github  open linkedin  socials\n" +
        "KEYS         ↑/↓ history · Tab complete · Ctrl+K palette · / focus",
        "block"
      );
    }
  };

  var SECTIONS = ["about", "projects", "skills", "experience", "contact"];
  var ALL = Object.keys(extra).concat(SECTIONS, ["whoami", "status", "socials", "matrix", "clear", "top"]);

  function suggest(cmd) {
    var best = null, bestScore = 99;
    ALL.forEach(function (c) {
      var d = distance(cmd, c);
      if (d < bestScore) { bestScore = d; best = c; }
    });
    return bestScore <= 2 ? best : null;
  }
  function distance(a, b) {
    var m = a.length, n = b.length, prev = [], cur = [], i, j;
    for (j = 0; j <= n; j++) prev[j] = j;
    for (i = 1; i <= m; i++) {
      cur[0] = i;
      for (j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur.slice();
    }
    return prev[n];
  }

  var history = [];
  var histIdx = -1;

  if (input) {
    input.setAttribute("placeholder", "type `help` — Tab completes, ↑ recalls");

    var promptLine = input.closest(".prompt-line");
    if (promptLine && !document.querySelector(".term-hint")) {
      var hint = document.createElement("p");
      hint.className = "term-hint";
      hint.innerHTML = "<kbd>Tab</kbd> complete &nbsp;<kbd>↑</kbd> history &nbsp;<kbd>Ctrl</kbd>+<kbd>K</kbd> palette &nbsp;<kbd>/</kbd> focus";
      promptLine.parentNode.appendChild(hint);
    }

    input.addEventListener("keydown", function (e) {
      // History
      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
        if (!history.length) return;
        e.preventDefault();
        if (e.key === "ArrowUp") histIdx = histIdx < 0 ? history.length - 1 : Math.max(0, histIdx - 1);
        else histIdx = histIdx < 0 ? -1 : Math.min(history.length - 1, histIdx + 1);
        input.value = histIdx >= 0 ? history[histIdx] : "";
        return;
      }

      // Tab completion
      if (e.key === "Tab") {
        e.preventDefault();
        var partial = input.value.trim().toLowerCase();
        if (!partial) return;
        var matches = ALL.filter(function (c) { return c.indexOf(partial) === 0; });
        if (matches.length === 1) input.value = matches[0];
        else if (matches.length > 1) write(matches.join("   "), "sug");
        return;
      }

      if (e.key !== "Enter") return;

      var raw = input.value.trim();
      if (!raw) return;
      history.push(raw);
      histIdx = -1;

      var parts = raw.split(/\s+/);
      var cmd = parts[0].toLowerCase();
      var arg = parts.slice(1).join(" ").toLowerCase();

      // Let the original handler deal with its own commands.
      var ownsIt = Object.prototype.hasOwnProperty.call(extra, cmd);
      var known = ALL.indexOf(cmd) >= 0;

      if (ownsIt) {
        e.stopImmediatePropagation();
        e.preventDefault();
        write("guest@ojas:~$ " + raw, "echo");
        extra[cmd](arg);
        input.value = "";
        return;
      }

      if (!known) {
        var guess = suggest(cmd);
        if (guess) {
          e.stopImmediatePropagation();
          e.preventDefault();
          write("guest@ojas:~$ " + raw, "echo");
          write("command not found: " + cmd + " — did you mean `" + guess + "`?", "sug");
          input.value = "";
          return;
        }
      }
      // otherwise falls through to the original terminal handler
    }, true);
  }

  /* ---------------- SECTION HIGHLIGHT ON JUMP ---------------- */
  SECTIONS.forEach(function (id) {
    var el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("focusjump", function () {});
  });
  document.querySelectorAll(".quick-nav button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var el = document.getElementById(btn.getAttribute("data-cmd"));
      if (!el || reduced) return;
      el.animate(
        [{ filter: "brightness(1)" }, { filter: "brightness(1.12)" }, { filter: "brightness(1)" }],
        { duration: 700, easing: "ease-out" }
      );
    });
  });

  /* ---------------- PARALLAX ON SHEETS ---------------- */
  if (!reduced && window.matchMedia("(pointer: fine)").matches) {
    var sheets = Array.prototype.slice.call(document.querySelectorAll(".sheet"));
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        var vh = window.innerHeight;
        sheets.forEach(function (s) {
          var r = s.getBoundingClientRect();
          if (r.bottom < 0 || r.top > vh) return;
          var offset = ((r.top + r.height / 2 - vh / 2) / vh) * -10;
          var inner = s.querySelector(".sheet-inner");
          if (inner) inner.style.transform = "translate3d(0," + offset.toFixed(2) + "px,0)";
        });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ---------------- KEYBOARD: theme shortcut ---------------- */
  document.addEventListener("keydown", function (e) {
    if (e.altKey && e.key.toLowerCase() === "t") {
      e.preventDefault();
      setTheme(THEMES[(THEMES.indexOf(currentTheme()) + 1) % THEMES.length]);
    }
  });
})();
