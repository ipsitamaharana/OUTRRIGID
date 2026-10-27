import subprocess
import os
import tempfile

chrome_path = r"C:\Program Files\Google\Chrome\Application\chrome.exe"
temp_dir = os.path.join(tempfile.gettempdir(), "chrome_single_btn_snap")
os.makedirs(temp_dir, exist_ok=True)

out_img = r"C:\OUTRRIGID-FRIEND\assets\images\walkthrough\21-single-how-to-use-corner.png"
cmd = [
    chrome_path,
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu",
    "--disable-software-rasterizer",
    "--user-data-dir=" + temp_dir,
    "--virtual-time-budget=2000",
    "--window-size=1600,1000",
    "--screenshot=" + out_img,
    "file:///C:/OUTRRIGID-FRIEND/index.html"
]
subprocess.run(cmd)
print("File size:", os.path.getsize(out_img) if os.path.exists(out_img) else 0)

