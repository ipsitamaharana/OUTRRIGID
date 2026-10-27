import subprocess
import os
import tempfile
import time

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), f"chrome_prof_{int(time.time())}")
os.makedirs(temp_dir, exist_ok=True)

test_html = r"c:\OUTRRIGID-FRIEND\test_scroll.html"

with open(r"c:\OUTRRIGID-FRIEND\index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Scroll to sectionHowToUse
scroll_script = """
<script>
window.addEventListener('load', () => {
  setTimeout(() => {
    const el = document.getElementById('sectionHowToUse');
    if (el) {
      el.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, 1000);
});
</script>
"""
modified_html = content.replace("</body>", scroll_script + "\n</body>")

with open(test_html, "w", encoding="utf-8") as f:
    f.write(modified_html)

out_img = r"c:\OUTRRIGID-FRIEND\assets\images\walkthrough\16-how-to-use-guide.png"

cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    f"--user-data-dir={temp_dir}",
    "--window-size=1440,900",
    "--virtual-time-budget=3500",
    f"--screenshot={out_img}",
    f"file:///{test_html.replace(os.sep, '/')}"
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Returncode:", res.returncode)
if os.path.exists(out_img):
    print("File size:", os.path.getsize(out_img), "bytes")

# Clean up test_html
if os.path.exists(test_html):
    os.remove(test_html)

