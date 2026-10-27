import subprocess
import os
import tempfile

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), "chrome_full_snap")
out_img = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\16-how-to-use-guide.png"
url = "file:///C:/OUTRRIGID-FRIEND/index.html"

# Run chrome with window-size large enough to see ws-studio and sectionHowToUse
cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2500",
    "--window-size=1600,2400",
    "--screenshot=" + out_img,
    url
]

res = subprocess.run(cmd, capture_output=True, text=True, encoding="utf-8", errors="ignore")
print("Return code:", res.returncode)
print("File exists:", os.path.exists(out_img), "Size:", os.path.getsize(out_img) if os.path.exists(out_img) else 0)

