import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

pattern = r'\n\n      <!-- ====================================================================\n           HOW TO USE OUTRRIGID: SIMPLIFIED 4-STEP WORKFLOW GUIDE\n           ==================================================================== -->\n      <section id="sectionHowToUse".*?</section>'

matches = list(re.finditer(pattern, html, flags=re.DOTALL))
print(f"Total matches found: {len(matches)}")

if len(matches) == 6:
    # We keep match 0, and remove matches 1 through 5 (from last to first so offsets don't shift)
    for m in reversed(matches[1:]):
        html = html[:m.start()] + html[m.end():]
    
    with open("index.html", "w", encoding="utf-8") as f:
        f.write(html)
    print("Successfully removed duplicate 5 sections, kept the primary one in Workspace 1.")
else:
    print("Unexpected number of matches!")

