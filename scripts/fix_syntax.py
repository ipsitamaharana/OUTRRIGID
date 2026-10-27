with open("js/app.js", "r", encoding="utf-8") as f:
    text = f.read()

target = """  const btnCornerGuide = document.getElementById("btnScrollToGuide");
  if (btnCornerGuide) {
    btnCornerGuide.addEventListener("click", (e) => {
      e.preventDefault();
      showAndScrollToHowToUseGuide();
    });
  });
  }"""

replacement = """  const btnCornerGuide = document.getElementById("btnScrollToGuide");
  if (btnCornerGuide) {
    btnCornerGuide.addEventListener("click", (e) => {
      e.preventDefault();
      showAndScrollToHowToUseGuide();
    });
  }"""

if target in text:
    text = text.replace(target, replacement)
    print("Replaced target (LF)")
elif target.replace("\n", "\r\n") in text:
    text = text.replace(target.replace("\n", "\r\n"), replacement.replace("\n", "\r\n"))
    print("Replaced target (CRLF)")
else:
    print("Target not found! Inspecting...")

with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(text)

