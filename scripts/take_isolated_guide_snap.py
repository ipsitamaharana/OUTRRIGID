import subprocess
import os
import tempfile
import re

with open(r"c:\OUTRRIGID-FRIEND\index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Extract sectionHowToUse
m = re.search(r'(<section id="sectionHowToUse".*?</section>)', content, flags=re.DOTALL)
if not m:
    print("Could not find sectionHowToUse!")
    exit(1)

guide_html = m.group(1)

# Build a standalone HTML page with the exact styling and fonts
standalone = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <style>
    body {{
      background: var(--bg-main);
      padding: 24px;
      margin: 0;
      min-height: auto;
    }}
  </style>
</head>
<body>
  <div style="max-width: 1400px; margin: 0 auto;">
    {guide_html}
  </div>
</body>
</html>
"""

temp_file = r"c:\OUTRRIGID-FRIEND\temp_guide_isolated.html"
with open(temp_file, "w", encoding="utf-8") as f:
    f.write(standalone)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), "chrome_detail_snap")
out_img = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\17-how-to-use-guide-detail.png"
url = "file:///C:/OUTRRIGID-FRIEND/temp_guide_isolated.html"

cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2000",
    "--window-size=1450,550",
    "--screenshot=" + out_img,
    url
]

res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
print("Return code:", res.returncode)
print("File exists:", os.path.exists(out_img), "Size:", os.path.getsize(out_img) if os.path.exists(out_img) else 0)

if os.path.exists(temp_file):
    os.remove(temp_file)

