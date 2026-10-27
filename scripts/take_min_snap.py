import subprocess
import os
import tempfile

with open(r"c:\OUTRRIGID-FRIEND\index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Make it minimized by default or click minimize on load
inject_code = """
<script>
window.addEventListener('load', function() {
  var guide = document.getElementById('sectionHowToUse');
  if (guide) {
    guide.classList.add('is-minimized');
    var txt = document.getElementById('textGuideToggle');
    var icon = document.getElementById('iconGuideToggle');
    if (txt) txt.textContent = 'Expand';
    if (icon) icon.innerHTML = '<polyline points="6 9 12 15 18 9"></polyline>';
  }
});
</script>
</body>
"""

test_content = content.replace("</body>", inject_code)

temp_html = r"c:\OUTRRIGID-FRIEND\temp_guide_min.html"
with open(temp_html, "w", encoding="utf-8") as f:
    f.write(test_content)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), "chrome_min_snap")
out_img = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\20-guide-minimized.png"
url = "file:///C:/OUTRRIGID-FRIEND/temp_guide_min.html"

cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2000",
    "--window-size=1600,1650",
    "--screenshot=" + out_img,
    url
]

subprocess.run(cmd, capture_output=True, text=True)
if os.path.exists(temp_html):
    os.remove(temp_html)
print("File exists:", os.path.exists(out_img), "Size:", os.path.getsize(out_img))

