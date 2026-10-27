import subprocess
import os
import tempfile
import time

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), f"chrome_guide_{int(time.time())}")
os.makedirs(temp_dir, exist_ok=True)

html_url = "file:///c:/OUTRRIGID-FRIEND/index.html"
out_img = r"c:\OUTRRIGID-FRIEND\assets\images\walkthrough\16-how-to-use-guide.png"

# We want to capture the page scrolled to sectionHowToUse or full page
# Let's write an HTML wrapper or inline script that scrolls directly to sectionHowToUse on load
# Or Chrome's default full page screenshot / window screenshot
cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    f"--user-data-dir={temp_dir}",
    "--window-size=1440,1200",
    "--virtual-time-budget=3000",
    f"--screenshot={out_img}",
    html_url
]

print("Running command:", " ".join(cmd))
res = subprocess.run(cmd, capture_output=True, text=True)
print("Returncode:", res.returncode)
print("Stdout:", res.stdout)
print("Stderr:", res.stderr)

if os.path.exists(out_img):
    print("Screenshot successfully generated, size:", os.path.getsize(out_img), "bytes")
else:
    print("Screenshot failed to generate!")

