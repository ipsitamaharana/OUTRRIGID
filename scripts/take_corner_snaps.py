import subprocess
import os
import tempfile

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), "chrome_snaps_corner")
os.makedirs(temp_dir, exist_ok=True)

# 1. Capture Header showing Corner button
out_header = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\18-header-corner-how-to-use.png"
cmd1 = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2000",
    "--window-size=1600,450",
    "--screenshot=" + out_header,
    "file:///C:/OUTRRIGID-FRIEND/index.html"
]
subprocess.run(cmd1)
print("Header corner snap size:", os.path.getsize(out_header) if os.path.exists(out_header) else 0)

# 2. Capture bottom section at last
snap2_html = """
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var guide = document.getElementById('sectionHowToUse');
    if (guide) {
      guide.scrollIntoView({ behavior: 'instant', block: 'start' });
    }
  }, 500);
});
</script>
</body>
"""
with open("index.html", "r", encoding="utf-8") as f:
    c = f.read().replace("</body>", snap2_html)
temp_f2 = r"c:\OUTRRIGID-FRIEND\temp_snap2.html"
with open(temp_f2, "w", encoding="utf-8") as f:
    f.write(c)

out_bottom = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\19-bottom-guide-at-last.png"
cmd2 = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2000",
    "--window-size=1600,650",
    "--screenshot=" + out_bottom,
    "file:///C:/OUTRRIGID-FRIEND/temp_snap2.html"
]
subprocess.run(cmd2)
print("Bottom guide snap size:", os.path.getsize(out_bottom) if os.path.exists(out_bottom) else 0)
if os.path.exists(temp_f2):
    os.remove(temp_f2)

# 3. Capture Minimized section
snap3_html = """
<script>
window.addEventListener('load', function() {
  setTimeout(function() {
    var btn = document.getElementById('btnToggleHowToUse');
    if (btn) btn.click();
    var guide = document.getElementById('sectionHowToUse');
    if (guide) guide.scrollIntoView({ behavior: 'instant', block: 'start' });
  }, 500);
});
</script>
</body>
"""
with open("index.html", "r", encoding="utf-8") as f:
    c3 = f.read().replace("</body>", snap3_html)
temp_f3 = r"c:\OUTRRIGID-FRIEND\temp_snap3.html"
with open(temp_f3, "w", encoding="utf-8") as f:
    f.write(c3)

out_min = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\20-guide-minimized.png"
cmd3 = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2000",
    "--window-size=1600,350",
    "--screenshot=" + out_min,
    "file:///C:/OUTRRIGID-FRIEND/temp_snap3.html"
]
subprocess.run(cmd3)
print("Minimized guide snap size:", os.path.getsize(out_min) if os.path.exists(out_min) else 0)
if os.path.exists(temp_f3):
    os.remove(temp_f3)

