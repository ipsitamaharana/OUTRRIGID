with open("js/app.js", "r", encoding="utf-8") as f:
    code = f.read()

# Add btnFloatingGuide to el
if 'btnFloatingGuide:' not in code:
    code = code.replace(
        'btnScrollToGuide: document.getElementById("btnScrollToGuide"),',
        'btnScrollToGuide: document.getElementById("btnScrollToGuide"),\n    btnFloatingGuide: document.getElementById("btnFloatingGuide"),'
    )

# Replace the Quick-Start event listeners block
old_block = '''  // Quick-Start Guide ("How to Use") Event Listeners
  if (el.btnScrollToGuide) {
    el.btnScrollToGuide.addEventListener("click", () => {
      // 1. Ensure we switch to Workspace 1 (Design Studio & Visualizer)
      switchWorkspace("ws-studio");

      // 2. Unhide section if it was dismissed
      if (el.sectionHowToUse) {
        el.sectionHowToUse.style.display = "block";
        
        // 3. Un-minimize if collapsed
        if (el.sectionHowToUse.classList.contains("is-minimized")) {
          el.sectionHowToUse.classList.remove("is-minimized");
          if (el.textGuideToggle) el.textGuideToggle.textContent = "Minimize";
          if (el.iconGuideToggle) {
            el.iconGuideToggle.innerHTML = '<polyline points="18 15 12 9 6 15"></polyline>';
          }
        }

        // 4. Smoothly scroll into view
        el.sectionHowToUse.scrollIntoView({ behavior: "smooth", block: "start" });

        // 5. Trigger pleasant pulse highlight
        el.sectionHowToUse.classList.remove("guide-highlight-glow");
        void el.sectionHowToUse.offsetWidth; // Force reflow
        el.sectionHowToUse.classList.add("guide-highlight-glow");
        setTimeout(() => {
          if (el.sectionHowToUse) el.sectionHowToUse.classList.remove("guide-highlight-glow");
        }, 2600);
      }
    });
  }

  if (el.btnToggleHowToUse && el.sectionHowToUse) {
    el.btnToggleHowToUse.addEventListener("click", () => {
      const isMin = el.sectionHowToUse.classList.toggle("is-minimized");
      if (el.textGuideToggle) {
        el.textGuideToggle.textContent = isMin ? "Expand" : "Minimize";
      }
      if (el.iconGuideToggle) {
        el.iconGuideToggle.innerHTML = isMin
          ? '<polyline points="6 9 12 15 18 9"></polyline>'
          : '<polyline points="18 15 12 9 6 15"></polyline>';
      }
    });
  }

  if (el.btnDismissHowToUse && el.sectionHowToUse) {
    el.btnDismissHowToUse.addEventListener("click", () => {
      el.sectionHowToUse.style.display = "none";
      if (typeof showAppToast === "function") {
        showAppToast("Quick-Start Guide hidden. Click 'How to Use' in the top bar anytime to view.");
      }
    });
  }'''

new_block = '''  // Quick-Start Guide ("How to Use") Helper Functions & Event Listeners
  function showAndScrollToHowToUseGuide() {
    const guide = document.getElementById("sectionHowToUse");
    if (!guide) return;
    guide.style.display = "block";
    guide.classList.remove("is-hidden");
    if (guide.classList.contains("is-minimized")) {
      guide.classList.remove("is-minimized");
      const txt = document.getElementById("textGuideToggle");
      const icon = document.getElementById("iconGuideToggle");
      if (txt) txt.textContent = "Minimize";
      if (icon) icon.innerHTML = '<polyline points="18 15 12 9 6 15"></polyline>';
    }
    guide.scrollIntoView({ behavior: "smooth", block: "start" });
    guide.classList.remove("guide-highlight-glow");
    void guide.offsetWidth;
    guide.classList.add("guide-highlight-glow");
    setTimeout(() => {
      if (guide) guide.classList.remove("guide-highlight-glow");
    }, 2500);
  }

  function toggleHowToUseGuide() {
    const guide = document.getElementById("sectionHowToUse");
    if (!guide) return;
    const isMin = guide.classList.toggle("is-minimized");
    const txt = document.getElementById("textGuideToggle");
    const icon = document.getElementById("iconGuideToggle");
    if (txt) txt.textContent = isMin ? "Expand" : "Minimize";
    if (icon) {
      icon.innerHTML = isMin
        ? '<polyline points="6 9 12 15 18 9"></polyline>'
        : '<polyline points="18 15 12 9 6 15"></polyline>';
    }
  }

  function hideHowToUseGuide() {
    const guide = document.getElementById("sectionHowToUse");
    if (!guide) return;
    guide.style.display = "none";
    guide.classList.add("is-hidden");
    if (typeof showAppToast === "function") {
      showAppToast("Quick-Start Guide hidden. Click 'How to Use' in the corner anytime to view.");
    }
  }

  // Bind to header corner button and floating corner pill
  const btnCornerGuide = document.getElementById("btnScrollToGuide");
  if (btnCornerGuide) btnCornerGuide.addEventListener("click", showAndScrollToHowToUseGuide);

  const btnFloatGuide = document.getElementById("btnFloatingGuide");
  if (btnFloatGuide) btnFloatGuide.addEventListener("click", showAndScrollToHowToUseGuide);

  const btnToggleGuide = document.getElementById("btnToggleHowToUse");
  if (btnToggleGuide) btnToggleGuide.addEventListener("click", toggleHowToUseGuide);

  const btnDismissGuide = document.getElementById("btnDismissHowToUse");
  if (btnDismissGuide) btnDismissGuide.addEventListener("click", hideHowToUseGuide);

  // Global delegation for 100% click reliability
  document.addEventListener("click", (e) => {
    const dismissTarget = e.target.closest("#btnDismissHowToUse, .btn-guide-dismiss");
    if (dismissTarget) {
      hideHowToUseGuide();
      return;
    }
    const toggleTarget = e.target.closest("#btnToggleHowToUse");
    if (toggleTarget) {
      toggleHowToUseGuide();
      return;
    }
    const openTarget = e.target.closest("#btnScrollToGuide, #btnFloatingGuide");
    if (openTarget) {
      showAndScrollToHowToUseGuide();
      return;
    }
  });'''

# Handle CRLF vs LF
if old_block in code:
    code = code.replace(old_block, new_block)
    print("Replaced old_block (LF)")
elif old_block.replace('\n', '\r\n') in code:
    code = code.replace(old_block.replace('\n', '\r\n'), new_block.replace('\n', '\r\n'))
    print("Replaced old_block (CRLF)")
else:
    print("Could not match old_block! Inspecting...")

with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated js/app.js successfully!")

