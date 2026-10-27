import subprocess
import os
import tempfile

with open(r"c:\OUTRRIGID-FRIEND\index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Inject dark mode and smooth scroll to guide
inject_code = """
<script>
window.addEventListener("DOMContentLoaded", function() {
  document.documentElement.classList.add("dark-theme");
  localStorage.setItem("jpcp_theme", "dark");
  setTimeout(function() {
    var guide = document.getElementById("sectionHowToUse");
    if (guide) {
      var rect = guide.getBoundingClientRect();
      window.scrollTo(0, window.pageYOffset + rect.top - 80);
    }
  }, 700);
});
</script>
</body>
"""

test_content = content.replace("</body>", inject_code)

temp_html = r"c:\OUTRRIGID-FRIEND\temp_guide_test.html"
with open(temp_html, "w", encoding="utf-8") as f:
    f.write(test_content)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), "chrome_guide_snap_dir")
out_img = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\16-how-to-use-guide.png"
url = "file:///C:/OUTRRIGID-FRIEND/temp_guide_test.html"

cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2500",
    "--window-size=1600,950",
    "--screenshot=" + out_img,
    url
]

res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
print("File exists:", os.path.exists(out_img), "Size:", os.path.getsize(out_img) if os.path.exists(out_img) else 0)

if os.path.exists(temp_html):
    os.remove(temp_html)

