/* Pace timer for the 20-minute presentation course.
   Self-contained: it looks for #paceTimer inside the rendered section and builds
   the widget there. It never touches the rest of the app. */
(function () {
  "use strict";

  var TOTAL = 20 * 60; // 20 minutes, in seconds

  var STEPS = [
    { at: 0,    label: "Understand the job",         emoji: "🔍", note: "2 min" },
    { at: 120,  label: "Plan your channel",          emoji: "🗺️", note: "4 min" },
    { at: 360,  label: "Make your first video",      emoji: "🎬", note: "6 min" },
    { at: 720,  label: "Upload like a pro",          emoji: "🚀", note: "4 min" },
    { at: 960,  label: "Grow & stay safe",           emoji: "📈", note: "4 min" }
  ];

  var tick = null;
  var remaining = TOTAL;
  var running = false;
  var host = null;
  var els = {};

  function mmss(sec) {
    var m = Math.floor(sec / 60), s = sec % 60;
    return (m < 10 ? "0" : "") + m + ":" + (s < 10 ? "0" : "") + s;
  }

  function stepIndex(elapsed) {
    var i = 0;
    for (var k = 0; k < STEPS.length; k++) if (elapsed >= STEPS[k].at) i = k;
    return i;
  }

  function paint() {
    if (!els.time) return;
    var elapsed = TOTAL - remaining;
    var idx = stepIndex(elapsed);
    els.time.textContent = mmss(remaining);
    els.bar.style.width = (elapsed / TOTAL * 100) + "%";
    els.now.textContent = STEPS[idx].emoji + " " + STEPS[idx].label;
    els.now.className = "timer-now" + (remaining === 0 ? " done" : "");
    for (var k = 0; k < els.steps.length; k++) {
      els.steps[k].className = "timer-step" + (k === idx ? " active" : "") + (k < idx ? " past" : "");
    }
    els.btn.textContent = remaining === 0 ? "▶ Start again" : (running ? "⏸ Pause" : "▶ Start");
    els.hint.textContent = remaining === 0
      ? "Time's up — you have a channel plan. Now go make video one."
      : (running ? "Keep going — don't stop to perfect anything." : "Press Start and work through the five steps.");
  }

  function stop() {
    if (tick) { clearInterval(tick); tick = null; }
    running = false;
  }

  function start() {
    if (remaining === 0) remaining = TOTAL;
    if (running) return;
    running = true;
    tick = setInterval(function () {
      remaining -= 1;
      if (remaining <= 0) { remaining = 0; stop(); }
      paint();
    }, 1000);
    paint();
  }

  function reset() {
    stop();
    remaining = TOTAL;
    paint();
  }

  function jumpTo(sec) {
    remaining = TOTAL - sec;
    if (remaining <= 0) { remaining = 0; stop(); }
    paint();
  }

  function build() {
    if (!host) return;
    stop();
    host.textContent = "";
    remaining = TOTAL;

    var wrap = document.createElement("div");
    wrap.className = "timer";

    var head = document.createElement("div");
    head.className = "timer-head";
    var time = document.createElement("div");
    time.className = "timer-time";
    time.textContent = mmss(TOTAL);
    var meta = document.createElement("div");
    meta.className = "timer-meta";
    var now = document.createElement("div");
    now.className = "timer-now";
    var hint = document.createElement("p");
    hint.className = "timer-hint";
    meta.appendChild(now);
    meta.appendChild(hint);
    head.appendChild(time);
    head.appendChild(meta);
    wrap.appendChild(head);

    var track = document.createElement("div");
    track.className = "timer-track";
    var bar = document.createElement("span");
    track.appendChild(bar);
    wrap.appendChild(track);

    var list = document.createElement("ol");
    list.className = "timer-steps";
    var stepEls = [];
    STEPS.forEach(function (s, i) {
      var li = document.createElement("li");
      li.className = "timer-step";
      li.tabIndex = 0;
      li.setAttribute("role", "button");
      var label = document.createElement("span");
      label.className = "timer-step-label";
      label.textContent = s.emoji + " " + s.label;
      var note = document.createElement("span");
      note.className = "timer-step-note";
      note.textContent = s.note;
      li.appendChild(label);
      li.appendChild(note);
      var go = function () { jumpTo(s.at); };
      li.addEventListener("click", go);
      li.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); }
      });
      list.appendChild(li);
      stepEls.push(li);
    });
    wrap.appendChild(list);

    var tools = document.createElement("div");
    tools.className = "timer-tools";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn timer-btn";
    btn.addEventListener("click", function () { running ? stop() : start(); paint(); });
    var rst = document.createElement("button");
    rst.type = "button";
    rst.className = "btn timer-btn ghost";
    rst.textContent = "↺ Reset";
    rst.addEventListener("click", reset);
    tools.appendChild(btn);
    tools.appendChild(rst);
    wrap.appendChild(tools);

    host.appendChild(wrap);
    els = { time: time, now: now, hint: hint, bar: bar, steps: stepEls, btn: btn };
    paint();
  }

  function scan() {
    var found = document.getElementById("paceTimer");
    if (!found) {
      if (host) { stop(); host = null; els = {}; }
      return;
    }
    if (found === host) return;
    host = found;
    build();
  }

  function boot() {
    scan();
    var body = document.getElementById("sectionBody");
    if (body && window.MutationObserver) {
      new MutationObserver(scan).observe(body, { childList: true });
    }
    window.addEventListener("hashchange", function () { setTimeout(scan, 30); });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
