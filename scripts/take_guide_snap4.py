import subprocess
import os
import tempfile

with open(r"c:\OUTRRIGID-FRIEND\index.html", "r", encoding="utf-8") as f:
    content = f.read()

inject_code = """
<script>
window.addEventListener("DOMContentLoaded", function() {
  document.documentElement.classList.add("dark-theme");
  localStorage.setItem("jpcp_theme", "dark");
});

window.addEventListener("load", function() {
  setTimeout(function() {
    var guide = document.getElementById("sectionHowToUse");
    if (guide) {
      window.scrollTo(0, 1150);
      document.documentElement.scrollTop = 1150;
      document.body.scrollTop = 1150;
    }
  }, 400);
});
</script>
</body>
"""

test_content = content.replace("</body>", inject_code)

temp_html = r"c:\OUTRRIGID-FRIEND\temp_guide_scroll.html"
with open(temp_html, "w", encoding="utf-8") as f:
    f.write(test_content)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), "chrome_guide_snap4")
out_img = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\16-how-to-use-guide.png"
url = "file:///C:/OUTRRIGID-FRIEND/temp_guide_scroll.html"

cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2000",
    "--window-size=1600,950",
    "--screenshot=" + out_img,
    url
]

res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
print("Return code:", res.returncode)
print("File exists:", os.path.exists(out_img), "Size:", os.path.getsize(out_img) if os.path.exists(out_img) else 0)

if os.path.exists(temp_html):
    os.remove(temp_html)

