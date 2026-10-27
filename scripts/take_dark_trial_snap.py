import subprocess
import os
import tempfile

with open(r"c:\OUTRRIGID-FRIEND\index.html", "r", encoding="utf-8") as f:
    content = f.read()

# Enable dark mode
inject_code = """
<script>
window.addEventListener('DOMContentLoaded', function() {
  document.documentElement.classList.add('dark-theme');
  localStorage.setItem('jpcp_theme', 'dark');
});
</script>
</body>
"""

test_content = content.replace("</body>", inject_code)

temp_html = r"c:\OUTRRIGID-FRIEND\temp_dark_trial.html"
with open(temp_html, "w", encoding="utf-8") as f:
    f.write(test_content)

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), "chrome_dark_trial")
out_img = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\23-trial-card-dark.png"

cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2000",
    "--window-size=1600,650",
    "--screenshot=" + out_img,
    "file:///C:/OUTRRIGID-FRIEND/temp_dark_trial.html"
]

subprocess.run(cmd)
if os.path.exists(temp_html):
    os.remove(temp_html)
print("Dark snap size:", os.path.getsize(out_img) if os.path.exists(out_img) else 0)

