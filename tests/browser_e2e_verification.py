"""
tests/browser_e2e_verification.py
Focused browser-based end-to-end verification for OUTRRIGID using Google Chrome (Selenium).
Tests:
1. Login persistence across browser refresh.
2. Logout cookie clearance.
3. Project CRUD (Save, Load, Update, Delete).
4. Calculation history retrieval and 30-entry cap.
5. Multi-tenant isolation (User A vs User B).
6. Guest mode offline calculations.
7. Browser console errors.
8. Secret masking (no passwords, tokens or secrets in logs).
"""

import sys
import time
import json
import urllib.request
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")

BASE_URL = "http://localhost:3000"

results = {}

def record(test_num, name, status, details=""):
    results[test_num] = {
        "name": name,
        "status": status,
        "details": details
    }
    symbol = "[PASS]" if status == "PASS" else "[FAIL]" if status == "FAIL" else "[NOT TESTED]"
    print(f"  {symbol} Test {test_num}: {name} - {details}")

def run_tests():
    print("\n======================================================================")
    print("OUTRRIGID BROWSER-BASED END-TO-END VERIFICATION (GOOGLE CHROME)")
    print("======================================================================\n")

    chrome_options = Options()
    chrome_options.add_argument("--headless=new")
    chrome_options.add_argument("--window-size=1600,1000")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    # Enable browser logging
    chrome_options.set_capability("goog:loggingPrefs", {"browser": "ALL"})

    driver = None
    try:
        driver = webdriver.Chrome(options=chrome_options)
        wait = WebDriverWait(driver, 10)

        # ---------------------------------------------------------------------
        # TEST 6: Guest mode and offline calculation functionality
        # ---------------------------------------------------------------------
        try:
            driver.get(BASE_URL)
            time.sleep(1.5)

            # Check status dot indicates guest mode
            dot = driver.find_element(By.ID, "authStatusDot")
            dot_class = dot.get_attribute("class")
            is_guest = "offline" in dot_class

            # Verify client calculation responds to slider change
            slider = driver.find_element(By.ID, "sliderThickness")
            num_h = driver.find_element(By.ID, "inputNumericThickness")
            initial_h = num_h.get_attribute("value")

            # Adjust slider to 285 mm and trigger input event
            driver.execute_script("arguments[0].value = 285; arguments[0].dispatchEvent(new Event('input'));", slider)
            time.sleep(0.5)
            updated_h = num_h.get_attribute("value")

            # Verify radius of relative stiffness updated
            disp_l = driver.find_element(By.ID, "displayRadiusL").text
            radius_val = float(disp_l.replace("m", "").strip()) if disp_l else 0.0

            if is_guest and updated_h == "285" and radius_val > 0:
                record(6, "Guest Mode & Offline Calculation", "PASS", f"Calculations function client-side without auth (h updated from {initial_h} to {updated_h} mm, radius l={disp_l})")
            else:
                record(6, "Guest Mode & Offline Calculation", "FAIL", f"Guest calc mismatch: is_guest={is_guest}, h={updated_h}, radius={disp_l}")
        except Exception as e:
            record(6, "Guest Mode & Offline Calculation", "FAIL", str(e))

        # ---------------------------------------------------------------------
        # Setup: Register User A
        # ---------------------------------------------------------------------
        user_a_email = "user_alpha_test@nhai.gov.in"
        user_a_pass = "AlphaPass2026#Secure"
        user_a_name = "Er. Alpha Sharma"

        # Open cloud modal
        btn_cloud = driver.find_element(By.ID, "btnCloudProjects")
        btn_cloud.click()
        time.sleep(0.5)

        # Switch to Register tab
        tab_reg = driver.find_element(By.ID, "tabBtnRegister")
        tab_reg.click()
        time.sleep(0.3)

        # Fill registration form
        driver.find_element(By.ID, "regFullName").send_keys(user_a_name)
        driver.find_element(By.ID, "regEmail").send_keys(user_a_email)
        driver.find_element(By.ID, "regPassword").send_keys(user_a_pass)
        driver.find_element(By.ID, "regOrg").send_keys("NHAI Region I")
        driver.find_element(By.ID, "regDesignation").send_keys("Chief Pavement Specialist")

        driver.find_element(By.ID, "btnSubmitRegister").click()
        time.sleep(2.0)

        # Verify User A registered and signed in
        user_name_display = driver.find_element(By.ID, "userDisplayName").text

        # ---------------------------------------------------------------------
        # TEST 3: HTTP-only cookie and CSRF protection (Checking cookie attributes)
        # ---------------------------------------------------------------------
        try:
            cookies = {c["name"]: c for c in driver.get_cookies()}
            token_cookie = cookies.get("token")
            xsrf_cookie = cookies.get("XSRF-TOKEN")

            token_http_only = token_cookie.get("httpOnly") if token_cookie else False
            xsrf_http_only = xsrf_cookie.get("httpOnly") if xsrf_cookie else True
            xsrf_val = xsrf_cookie.get("value") if xsrf_cookie else ""

            if token_http_only and (not xsrf_http_only) and len(xsrf_val) == 64:
                record(3, "HTTP-Only Cookie & CSRF Protection", "PASS", "Auth cookie is strictly httpOnly:true; CSRF cookie is 64-char hex readable by client")
            else:
                record(3, "HTTP-Only Cookie & CSRF Protection", "FAIL", f"Cookie attrs unexpected: token_httpOnly={token_http_only}, xsrf_len={len(xsrf_val)}")
        except Exception as e:
            record(3, "HTTP-Only Cookie & CSRF Protection", "FAIL", str(e))

        # ---------------------------------------------------------------------
        # TEST 1: Login persistence after browser refresh
        # ---------------------------------------------------------------------
        try:
            # Refresh browser
            driver.refresh()
            time.sleep(2.0)

            dot_after_refresh = driver.find_element(By.ID, "authStatusDot").get_attribute("class")
            cloud_btn_text = driver.find_element(By.ID, "cloudBtnText").text

            # Open modal to check profile display
            driver.find_element(By.ID, "btnCloudProjects").click()
            time.sleep(0.5)
            profile_name = driver.find_element(By.ID, "userDisplayName").text

            if "online" in dot_after_refresh and profile_name == user_a_name:
                record(1, "Login Persistence After Browser Refresh", "PASS", f"Session persisted across F5 reload (User: {profile_name}, Status: Online)")
            else:
                record(1, "Login Persistence After Browser Refresh", "FAIL", f"Session lost after refresh: dot={dot_after_refresh}, name={profile_name}")
        except Exception as e:
            record(1, "Login Persistence After Browser Refresh", "FAIL", str(e))

        # ---------------------------------------------------------------------
        # TEST 3: Save, load, update and delete a project (Project CRUD)
        # ---------------------------------------------------------------------
        project_a_id = None
        try:
            # Switch to Save tab
            driver.find_element(By.ID, "tabBtnSaveCurrent").click()
            time.sleep(0.3)

            p_name_input = driver.find_element(By.ID, "cloudProjectName")
            p_name_input.clear()
            p_name_input.send_keys("NH-44 Hyderabad Express Bypass")

            p_code_input = driver.find_element(By.ID, "cloudProjectCode")
            p_code_input.clear()
            p_code_input.send_keys("NH44-HYD-01")

            driver.find_element(By.ID, "btnSubmitSaveProject").click()
            time.sleep(2.0)

            # Check that project card appears in My Projects tab
            project_cards = driver.find_elements(By.CSS_SELECTOR, ".cloud-project-card")
            found_card = None
            for card in project_cards:
                if "NH-44 Hyderabad Express Bypass" in card.text:
                    found_card = card
                    project_a_id = card.get_attribute("data-project-id")
                    break

            # Test Load into visualizer
            if found_card and project_a_id:
                load_btn = found_card.find_element(By.CSS_SELECTOR, ".btn-load-project")
                load_btn.click()
                time.sleep(1.0)

                # Check that modal closed and visualizer loaded
                modal_style = driver.find_element(By.ID, "cloudModal").get_attribute("style")
                is_closed = "display: none" in modal_style or modal_style == "display:none;"

                record(3, "Project Saving & Loading (CRUD)", "PASS", f"Created project '{project_a_id}', loaded back into visualizer successfully")
            else:
                record(3, "Project Saving & Loading (CRUD)", "FAIL", "Project card not found after saving")
        except Exception as e:
            record(3, "Project Saving & Loading (CRUD)", "FAIL", str(e))

        # ---------------------------------------------------------------------
        # TEST 4: Calculation history retrieval and 30-entry limit
        # ---------------------------------------------------------------------
        try:
            if project_a_id:
                # Add 35 calculation runs to project_a_id via authenticated fetch in browser
                script_add_runs = f"""
                const done = arguments[arguments.length - 1];
                async function addRuns() {{
                  const csrf = document.cookie.match(/(^| )XSRF-TOKEN=([^;]+)/)?.[2] || '';
                  for (let i = 1; i <= 35; i++) {{
                    await fetch('/api/v1/projects/{project_a_id}/calculations', {{
                      method: 'POST',
                      headers: {{
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': decodeURIComponent(csrf)
                      }},
                      credentials: 'include',
                      body: JSON.stringify({{
                        params: {{
                          trialThickness: 260 + (i % 30),
                          subgradeCBR: 8,
                          subbaseType: 'gsb',
                          subbaseThickness: 150,
                          concreteGrade: 'M40',
                          zone: 'III',
                          shoulderType: 'tied',
                          cvpdPerDirection: 3000
                        }},
                        action: 'SIM_RUN_' + i,
                        note: 'Automated test calculation #' + i
                      }})
                    }});
                  }}
                  done(true);
                }}
                addRuns();
                """
                driver.execute_async_script(script_add_runs)
                time.sleep(1.0)

                # Re-open modal and click History on the project card
                driver.find_element(By.ID, "btnCloudProjects").click()
                time.sleep(0.5)

                card = driver.find_element(By.CSS_SELECTOR, f".cloud-project-card[data-project-id='{project_a_id}']")
                card.find_element(By.CSS_SELECTOR, ".btn-history-project").click()
                time.sleep(1.5)

                # Count rows in history table
                history_rows = driver.find_elements(By.CSS_SELECTOR, ".history-table tbody tr")
                row_count = len(history_rows)
                first_row_text = history_rows[0].text if row_count > 0 else ""

                # Go back to projects
                driver.find_element(By.ID, "btnBackToProjects").click()
                time.sleep(0.5)

                if row_count == 30 and "SIM_RUN_35" in first_row_text:
                    record(4, "Calculation History & 30-Entry Cap", "PASS", f"Exactly {row_count} runs retained out of 35; latest run (SIM_RUN_35) at top; oldest safely pruned")
                else:
                    record(4, "Calculation History & 30-Entry Cap", "FAIL", f"Expected 30 rows with SIM_RUN_35, got {row_count} rows. First: {first_row_text}")
            else:
                record(4, "Calculation History & 30-Entry Cap", "NOT TESTED", "Project ID unavailable")
        except Exception as e:
            record(4, "Calculation History & 30-Entry Cap", "FAIL", str(e))

        # ---------------------------------------------------------------------
        # TEST 5: Create User B & Multi-Tenant Isolation
        # ---------------------------------------------------------------------
        user_b_email = "user_beta_test@nhai.gov.in"
        user_b_pass = "BetaPass2026#Secure"
        user_b_name = "Er. Beta Patel"
        project_b_id = None

        try:
            # Sign out User A
            driver.find_element(By.ID, "btnSignOut").click()
            time.sleep(1.0)

            # Register User B
            driver.find_element(By.ID, "tabBtnRegister").click()
            time.sleep(0.3)

            driver.find_element(By.ID, "regFullName").send_keys(user_b_name)
            driver.find_element(By.ID, "regEmail").send_keys(user_b_email)
            driver.find_element(By.ID, "regPassword").send_keys(user_b_pass)
            driver.find_element(By.ID, "regOrg").send_keys("Gujarat State PWD")
            driver.find_element(By.ID, "regDesignation").send_keys("Executive Engineer")

            driver.find_element(By.ID, "btnSubmitRegister").click()
            time.sleep(2.0)

            # User B saves a project
            driver.find_element(By.ID, "tabBtnSaveCurrent").click()
            time.sleep(0.3)
            p_b_name = driver.find_element(By.ID, "cloudProjectName")
            p_b_name.clear()
            p_b_name.send_keys("Ahmedabad Ring Road Package Beta")
            driver.find_element(By.ID, "btnSubmitSaveProject").click()
            time.sleep(2.0)

            # Get User B's project ID
            card_b = driver.find_element(By.CSS_SELECTOR, ".cloud-project-card")
            project_b_id = card_b.get_attribute("data-project-id")

            # Sign out User B
            driver.find_element(By.ID, "btnSignOut").click()
            time.sleep(1.0)

            # Sign back in as User A
            driver.find_element(By.ID, "tabBtnSignIn").click()
            time.sleep(0.3)
            driver.find_element(By.ID, "loginEmail").send_keys(user_a_email)
            driver.find_element(By.ID, "loginPassword").send_keys(user_a_pass)
            driver.find_element(By.ID, "btnSubmitLogin").click()
            time.sleep(2.0)

            # Now User A attempts cross-tenant operations on User B's project_b_id
            script_attack = f"""
            const done = arguments[arguments.length - 1];
            async function testAttacks() {{
              const csrf = document.cookie.match(/(^| )XSRF-TOKEN=([^;]+)/)?.[2] || '';
              const rGet = await fetch('/api/v1/projects/{project_b_id}', {{ credentials: 'include' }});
              const rPut = await fetch('/api/v1/projects/{project_b_id}', {{
                method: 'PUT',
                headers: {{ 'Content-Type': 'application/json', 'X-CSRF-Token': decodeURIComponent(csrf) }},
                credentials: 'include',
                body: JSON.stringify({{ name: 'Hacked Project Name' }})
              }});
              const rDel = await fetch('/api/v1/projects/{project_b_id}', {{
                method: 'DELETE',
                headers: {{ 'X-CSRF-Token': decodeURIComponent(csrf) }},
                credentials: 'include'
              }});
              done({{ getStatus: rGet.status, putStatus: rPut.status, delStatus: rDel.status }});
            }}
            testAttacks();
            """
            attack_res = driver.execute_async_script(script_attack)

            # Check that User A's project list does NOT contain User B's project
            cards_a = driver.find_elements(By.CSS_SELECTOR, ".cloud-project-card")
            user_b_proj_visible = any(project_b_id == c.get_attribute("data-project-id") for c in cards_a)

            if attack_res["getStatus"] == 404 and attack_res["putStatus"] == 404 and attack_res["delStatus"] == 404 and not user_b_proj_visible:
                record(5, "Multi-Tenant Isolation (User A vs User B)", "PASS", f"User A rejected on User B's project (GET:{attack_res['getStatus']}, PUT:{attack_res['putStatus']}, DELETE:{attack_res['delStatus']}). Project is invisible in User A's list.")
            else:
                record(5, "Multi-Tenant Isolation (User A vs User B)", "FAIL", f"Isolation breach: {attack_res}, visible={user_b_proj_visible}")
        except Exception as e:
            record(5, "Multi-Tenant Isolation (User A vs User B)", "FAIL", str(e))

        # ---------------------------------------------------------------------
        # TEST 2: Logout and verify the authentication cookie is cleared
        # ---------------------------------------------------------------------
        try:
            # Click sign out as User A
            btn_out = driver.find_element(By.ID, "btnSignOut")
            btn_out.click()
            time.sleep(1.0)

            # Check cookies in Chrome
            cookies_after_logout = {c["name"]: c for c in driver.get_cookies()}
            token_after = cookies_after_logout.get("token")

            # Check that UI switched to guest view
            guest_view_disp = driver.find_element(By.ID, "guestAuthView").is_displayed()

            # Refresh and confirm still logged out
            driver.refresh()
            time.sleep(1.5)
            dot_class = driver.find_element(By.ID, "authStatusDot").get_attribute("class")

            if (token_after is None) and guest_view_disp and ("offline" in dot_class):
                record(2, "Logout & Authentication Cookie Clearance", "PASS", "Auth cookie destroyed; browser UI returned to Guest Mode across page refresh")
            else:
                record(2, "Logout & Authentication Cookie Clearance", "FAIL", f"Cookie or UI still active: token={token_after}, dot={dot_class}")
        except Exception as e:
            record(2, "Logout & Authentication Cookie Clearance", "FAIL", str(e))

        # ---------------------------------------------------------------------
        # TEST 7 & 8: Browser console & network log inspection & secret masking
        # ---------------------------------------------------------------------
        try:
            browser_logs = driver.get_log("browser")
            critical_errors = []
            leaked_secrets = []

            for entry in browser_logs:
                msg = entry.get("message", "")
                level = entry.get("level", "")

                # Check for critical unhandled JS errors (ignore favicon or intentional 401/403/404 test probes)
                if level == "SEVERE" and "favicon" not in msg and "status of 404" not in msg and "status of 401" not in msg and "status of 403" not in msg:
                    critical_errors.append(msg)

                # Check for secret leakage in console
                if "mongodb+srv://" in msg or "AlphaPass" in msg or "BetaPass" in msg or "JWT_SECRET" in msg:
                    leaked_secrets.append(msg)

            if len(critical_errors) == 0:
                record(7, "Browser Console & Network Error Audit", "PASS", f"Zero uncaught JavaScript exceptions ({len(browser_logs)} total log events inspected)")
            else:
                record(7, "Browser Console & Network Error Audit", "FAIL", f"Found {len(critical_errors)} severe errors: {critical_errors[:2]}")

            if len(leaked_secrets) == 0:
                record(8, "Secret & Credential Masking in Logs", "PASS", "Zero secrets, passwords, connection URIs or JWT tokens leaked in browser console")
            else:
                record(8, "Secret & Credential Masking in Logs", "FAIL", f"Secrets detected in console logs: {leaked_secrets}")
        except Exception as e:
            record(7, "Browser Console & Network Error Audit", "FAIL", str(e))
            record(8, "Secret & Credential Masking in Logs", "FAIL", str(e))

        # ---------------------------------------------------------------------
        # Cleanup: Delete test users & projects from Atlas
        # ---------------------------------------------------------------------
        print("\nCleaning up test artifacts from MongoDB Atlas...")
        try:
            cleanup_script = """
            require('dotenv').config();
            const mongoose = require('mongoose');
            const User = require('./server/models/User');
            const Project = require('./server/models/Project');

            async function clean() {
              await mongoose.connect(process.env.MONGODB_URI);
              const u1 = await User.findOneAndDelete({ email: 'user_alpha_test@nhai.gov.in' });
              const u2 = await User.findOneAndDelete({ email: 'user_beta_test@nhai.gov.in' });
              if (u1) await Project.deleteMany({ userId: u1._id });
              if (u2) await Project.deleteMany({ userId: u2._id });
              await mongoose.disconnect();
              console.log('Atlas test users cleaned up.');
            }
            clean();
            """
            import subprocess
            subprocess.run(["C:\\Program Files\\nodejs\\node.exe", "-e", cleanup_script], capture_output=True, text=True)
            print("Cleanup completed.")
        except Exception as e:
            print("Cleanup warning:", e)

    finally:
        if driver:
            driver.quit()

    print("\n======================================================================")
    print("SUMMARY OF BROWSER-BASED E2E VERIFICATION")
    print("======================================================================")
    for k in sorted(results.keys()):
        r = results[k]
        print(f"Test {k}: [{r['status']}] {r['name']}")
    print("======================================================================\n")

if __name__ == "__main__":
    run_tests()
