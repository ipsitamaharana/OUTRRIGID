import re

with open("index.html", "r", encoding="utf-8") as f:
    text = f.read()

pattern = r'\s*<!-- Floating Bottom-Right Corner Quick-Help Trigger -->\s*<button id="btnFloatingGuide"[^>]*>.*?</button>'
text, count = re.subn(pattern, '', text, flags=re.DOTALL)
print(f"Removed {count} occurrences from index.html")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

# Also remove from js/app.js
with open("js/app.js", "r", encoding="utf-8") as f:
    js = f.read()

js = re.sub(r'\s*btnFloatingGuide:\s*document\.getElementById\("btnFloatingGuide"\),?', '', js)
js = re.sub(r'\s*const btnFloatGuide = document\.getElementById\("btnFloatingGuide"\);[^}]*\}', '', js, flags=re.DOTALL)
js = js.replace(', #btnFloatingGuide', '')
js = js.replace('#btnFloatingGuide, ', '')

with open("js/app.js", "w", encoding="utf-8") as f:
    f.write(js)
print("Updated js/app.js")

# Also remove from css/styles.css
with open("css/styles.css", "r", encoding="utf-8") as f:
    css = f.read()

css = re.sub(r'/\* Floating Bottom-Right Corner Action Pill \*/\s*\.btn-floating-corner-guide\s*\{[^}]*\}\s*\.btn-floating-corner-guide\s+svg\s*\{[^}]*\}\s*\.btn-floating-corner-guide:hover\s*\{[^}]*\}', '', css)

with open("css/styles.css", "w", encoding="utf-8") as f:
    f.write(css)
print("Updated css/styles.css")

