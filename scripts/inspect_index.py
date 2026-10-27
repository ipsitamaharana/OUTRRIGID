import re

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

# Let's see how many occurrences of <section id="sectionHowToUse" exist
matches = [m.start() for m in re.finditer(r'<section id="sectionHowToUse"', html)]
print(f"Found {len(matches)} occurrences")

# Find the end of workspace 1:
# In workspace 1, after id="visualizerContainer" and its layers-legend-bar
# Let's locate the visualizer card in ws-studio
p1 = html.find('id="visualizerContainer"')
print(f"visualizerContainer at: {p1}")

# Let's see lines around visualizerContainer
lines = html.splitlines(keepends=True)
for i, l in enumerate(lines):
    if 'id="sectionHowToUse"' in l:
        print(f"Occurrence at line {i+1}")
    if 'id="ws-inputs"' in l:
        print(f"ws-inputs at line {i+1}")

