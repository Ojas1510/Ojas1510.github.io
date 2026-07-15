(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ============================================================
     BOOT SEQUENCE
     ============================================================ */
  var bootLines = [
    "BOOTING OJAS-NAGTA.SYS ...",
    "LOADING PROFILE ................ OK",
    "MOUNTING PROJECTS ARCHIVE ....... OK",
    "CALIBRATING INSTRUMENT PANEL ... OK",
    "READY."
  ];

  var bootTextEl = document.getElementById("bootText");
  var terminalBody = document.getElementById("terminalBody");

  function typeBoot(callback) {
    if (prefersReducedMotion) {
      bootTextEl.textContent = bootLines.join("\n");
      bootTextEl.style.display = "none";
      callback();
      return;
    }

    var lineIndex = 0;
    var charIndex = 0;
    var output = "";

    function step() {
      if (lineIndex >= bootLines.length) {
        setTimeout(function () {
          bootTextEl.style.display = "none";
          callback();
        }, 300);
        return;
      }
      var currentLine = bootLines[lineIndex];
      if (charIndex <= currentLine.length) {
        output = bootLines.slice(0, lineIndex).join("\n") +
          (lineIndex > 0 ? "\n" : "") + currentLine.slice(0, charIndex);
        bootTextEl.textContent = output;
        charIndex++;
        setTimeout(step, 8);
      } else {
        lineIndex++;
        charIndex = 0;
        setTimeout(step, 120);
      }
    }
    step();
  }

  typeBoot(function () {
    terminalBody.hidden = false;
    var input = document.getElementById("terminalInput");
    if (input) input.focus({ preventScroll: true });
  });

  /* ============================================================
     TERMINAL COMMANDS
     ============================================================ */
  var terminalInput = document.getElementById("terminalInput");
  var terminalLog = document.getElementById("terminalLog");

  var sectionIds = ["about", "projects", "skills", "experience", "contact"];

  var commands = {
    help: function () {
      return "commands: help, about, projects, skills, experience, contact, whoami, clear";
    },
    whoami: function () {
      return "guest — scroll or type a section name to explore Ojas's work.";
    },
    clear: function () {
      terminalLog.innerHTML = "";
      return null;
    }
  };

  sectionIds.forEach(function (id) {
    commands[id] = function () {
      goToSection(id);
      return "jumping to " + id + " \u2193";
    };
  });

  function goToSection(id) {
    var el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: prefersReducedMotion ? "auto" : "smooth" });
    }
  }

  function logLine(text, cls) {
    if (text === null) return;
    var p = document.createElement("p");
    if (cls) p.className = cls;
    p.textContent = text;
    terminalLog.appendChild(p);
    terminalLog.scrollTop = terminalLog.scrollHeight;
  }

  function runCommand(raw) {
    var cmd = raw.trim().toLowerCase();
    if (!cmd) return;
    logLine("guest@ojas:~$ " + raw, "echo");
    if (commands.hasOwnProperty(cmd)) {
      var result = commands[cmd]();
      logLine(result);
    } else {
      logLine("command not found: " + cmd + " (type help)", "err");
    }
  }

  if (terminalInput) {
    terminalInput.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        runCommand(terminalInput.value);
        terminalInput.value = "";
      }
    });
  }

  document.querySelectorAll(".quick-nav button").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var id = btn.getAttribute("data-cmd");
      goToSection(id);
    });
  });

  /* ============================================================
     SCROLL REVEAL
     ============================================================ */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReducedMotion) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ============================================================
     CONTACT FORM (front-end only — see README to wire it up)
     ============================================================ */
  var contactForm = document.getElementById("contactForm");
  var formNote = document.getElementById("formNote");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      formNote.textContent = "This form isn't wired to send messages yet — see README.md to connect it, or email directly.";
    });
  }

  /* ============================================================
     FOOTER YEAR
     ============================================================ */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
