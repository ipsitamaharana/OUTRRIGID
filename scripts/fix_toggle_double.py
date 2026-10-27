with open("js/app.js", "r", encoding="utf-8") as f:
    code = f.read()

old_listeners = '''  // Bind to header corner button and floating corner pill
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

new_listeners = '''  // Bind to header corner button and floating corner pill
  const btnCornerGuide = document.getElementById("btnScrollToGuide");
  if (btnCornerGuide) {
    btnCornerGuide.addEventListener("click", (e) => {
      e.preventDefault();
      showAndScrollToHowToUseGuide();
    });
  }

  const btnFloatGuide = document.getElementById("btnFloatingGuide");
  if (btnFloatGuide) {
    btnFloatGuide.addEventListener("click", (e) => {
      e.preventDefault();
      showAndScrollToHowToUseGuide();
    });
  }

  const btnToggleGuide = document.getElementById("btnToggleHowToUse");
  if (btnToggleGuide) {
    btnToggleGuide.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleHowToUseGuide();
    });
  }

  const btnDismissGuide = document.getElementById("btnDismissHowToUse");
  if (btnDismissGuide) {
    btnDismissGuide.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideHowToUseGuide();
    });
  }'''

if old_listeners in code:
    code = code.replace(old_listeners, new_listeners)
elif old_listeners.replace('\n', '\r\n') in code:
    code = code.replace(old_listeners.replace('\n', '\r\n'), new_listeners.replace('\n', '\r\n'))
else:
    print("Could not match old_listeners!")

with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(code)

print("Updated js/app.js event handlers")

