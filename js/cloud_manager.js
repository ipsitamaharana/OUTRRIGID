/**
 * js/cloud_manager.js
 * OUTRRIGID Full-Stack Cloud Manager & Authentication Controller
 * Handles MongoDB Atlas user sessions, HTTP-Only cookie auth, Double-Submit CSRF,
 * user project synchronization, and 30-run calculation history.
 */

(function () {
  let currentUser = null;
  let activeCloudProjectId = null;
  let cachedCsrfToken = "";

  // Helper: Retrieve CSRF token from cookie or memory
  function getCsrfToken() {
    if (cachedCsrfToken) return cachedCsrfToken;
    const match = document.cookie.match(new RegExp("(^| )XSRF-TOKEN=([^;]+)"));
    return match ? decodeURIComponent(match[2]) : "";
  }

  function setCsrfToken(token) {
    if (token) cachedCsrfToken = token;
  }

  document.addEventListener("DOMContentLoaded", () => {
    // 1. Cache DOM Elements
    const el = {
      btnCloudProjects: document.getElementById("btnCloudProjects"),
      cloudBtnText: document.getElementById("cloudBtnText"),
      authStatusDot: document.getElementById("authStatusDot"),
      cloudModal: document.getElementById("cloudModal"),
      btnCloseCloudModal: document.getElementById("btnCloseCloudModal"),
      cloudAuthAlert: document.getElementById("cloudAuthAlert"),
      guestAuthView: document.getElementById("guestAuthView"),
      userProjectsView: document.getElementById("userProjectsView"),
      tabBtnSignIn: document.getElementById("tabBtnSignIn"),
      tabBtnRegister: document.getElementById("tabBtnRegister"),
      formSignIn: document.getElementById("formSignIn"),
      formRegister: document.getElementById("formRegister"),
      loginEmail: document.getElementById("loginEmail"),
      loginPassword: document.getElementById("loginPassword"),
      regFullName: document.getElementById("regFullName"),
      regEmail: document.getElementById("regEmail"),
      regPassword: document.getElementById("regPassword"),
      regOrg: document.getElementById("regOrg"),
      regDesignation: document.getElementById("regDesignation"),
      userAvatarInitial: document.getElementById("userAvatarInitial"),
      userDisplayName: document.getElementById("userDisplayName"),
      userOrgDisplay: document.getElementById("userOrgDisplay"),
      userProjectCount: document.getElementById("userProjectCount"),
      btnSignOut: document.getElementById("btnSignOut"),
      tabBtnMyProjects: document.getElementById("tabBtnMyProjects"),
      tabBtnSaveCurrent: document.getElementById("tabBtnSaveCurrent"),
      paneMyProjects: document.getElementById("paneMyProjects"),
      paneSaveCurrent: document.getElementById("paneSaveCurrent"),
      paneProjectHistory: document.getElementById("paneProjectHistory"),
      projectListContainer: document.getElementById("projectListContainer"),
      formSaveProject: document.getElementById("formSaveProject"),
      cloudProjectName: document.getElementById("cloudProjectName"),
      cloudProjectCode: document.getElementById("cloudProjectCode"),
      cloudProjectDesc: document.getElementById("cloudProjectDesc"),
      snapshotChips: document.getElementById("snapshotChips"),
      btnBackToProjects: document.getElementById("btnBackToProjects"),
      historyProjectTitle: document.getElementById("historyProjectTitle"),
      historyTableContainer: document.getElementById("historyTableContainer"),
    };

    function notify(message, type = "success") {
      if (window.OUTRRIGID_APP && typeof window.OUTRRIGID_APP.showToast === "function") {
        window.OUTRRIGID_APP.showToast(message, type);
      }
    }

    function showCloudAlert(message, type = "error") {
      if (!el.cloudAuthAlert) return;
      el.cloudAuthAlert.className = `cloud-alert-box ${type}`;
      el.cloudAuthAlert.textContent = message;
      el.cloudAuthAlert.style.display = "block";
    }

    function clearCloudAlert() {
      if (!el.cloudAuthAlert) return;
      el.cloudAuthAlert.style.display = "none";
      el.cloudAuthAlert.textContent = "";
    }

    function toggleCloudModal(show) {
      if (!el.cloudModal) return;
      clearCloudAlert();
      if (show) {
        el.cloudModal.style.display = "flex";
        updateDesignSnapshotPreview();
        if (currentUser) {
          loadUserProjects();
        }
      } else {
        el.cloudModal.style.display = "none";
      }
    }

    function updateAuthUI(user) {
      currentUser = user;
      if (user) {
        const firstName = user.profile?.fullName ? user.profile.fullName.split(" ")[0] : "Engineer";
        if (el.cloudBtnText) el.cloudBtnText.textContent = firstName;
        if (el.authStatusDot) {
          el.authStatusDot.className = "auth-status-dot online";
          el.authStatusDot.title = `Signed in: ${user.email} (${user.profile?.organization || "Cloud Active"})`;
        }
        if (el.guestAuthView) el.guestAuthView.style.display = "none";
        if (el.userProjectsView) el.userProjectsView.style.display = "block";
        if (el.userDisplayName) el.userDisplayName.textContent = user.profile?.fullName || user.email;
        if (el.userOrgDisplay) el.userOrgDisplay.textContent = user.profile?.organization || "Highway Engineering Dept";
        if (el.userAvatarInitial) {
          const name = user.profile?.fullName || user.email;
          el.userAvatarInitial.textContent = name.charAt(0).toUpperCase();
        }
      } else {
        if (el.cloudBtnText) el.cloudBtnText.textContent = "Cloud Projects";
        if (el.authStatusDot) {
          el.authStatusDot.className = "auth-status-dot offline";
          el.authStatusDot.title = "Guest Mode (Local Only)";
        }
        if (el.guestAuthView) el.guestAuthView.style.display = "block";
        if (el.userProjectsView) el.userProjectsView.style.display = "none";
      }
    }

    async function checkAuthSession() {
      try {
        const res = await fetch("/api/v1/auth/me", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            if (data.csrfToken) setCsrfToken(data.csrfToken);
            updateAuthUI(data.user);
          } else {
            updateAuthUI(null);
          }
        } else {
          updateAuthUI(null);
        }
      } catch (e) {
        updateAuthUI(null);
      }
    }

    async function handleLogin(email, password) {
      clearCloudAlert();
      try {
        const res = await fetch("/api/v1/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          showCloudAlert(data.error || "Login failed. Please check your credentials.", "error");
          return;
        }
        if (data.csrfToken) setCsrfToken(data.csrfToken);
        updateAuthUI(data.user);
        showCloudAlert(`Welcome back, ${data.user.profile?.fullName || data.user.email}!`, "success");
        notify("Signed in successfully to OUTRRIGID Cloud.");
        switchCloudProjectTab("projects");
        loadUserProjects();
      } catch (e) {
        showCloudAlert("Connection error. Ensure the server is running.", "error");
      }
    }

    async function handleRegister(payload) {
      clearCloudAlert();
      try {
        const res = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          showCloudAlert(data.error || "Registration failed.", "error");
          return;
        }
        if (data.csrfToken) setCsrfToken(data.csrfToken);
        updateAuthUI(data.user);
        showCloudAlert("Account created successfully! Welcome to OUTRRIGID.", "success");
        notify("Engineer account registered successfully.");
        switchCloudProjectTab("projects");
        loadUserProjects();
      } catch (e) {
        showCloudAlert("Connection error during registration.", "error");
      }
    }

    async function handleSignOut() {
      try {
        await fetch("/api/v1/auth/logout", {
          method: "POST",
          credentials: "include",
        });
      } catch (e) {}
      cachedCsrfToken = "";
      activeCloudProjectId = null;
      updateAuthUI(null);
      showCloudAlert("Signed out successfully. Switched to Guest Mode.", "success");
      notify("Signed out. Switched to Guest Mode.");
    }

    function updateDesignSnapshotPreview() {
      if (!el.snapshotChips || !window.OUTRRIGID_APP) return;
      const p = window.OUTRRIGID_APP.getParams ? window.OUTRRIGID_APP.getParams() : {};
      const res = window.OUTRRIGID_APP.getLatestResult ? window.OUTRRIGID_APP.getLatestResult() : null;
      const isSafe = res && res.summary ? res.summary.isSafe : false;
      const totalCFD = res && res.summary ? Number(res.summary.totalCFD).toFixed(3) : "—";

      el.snapshotChips.innerHTML = `
        <span class="snapshot-chip">Thickness: <strong>${p.trialThickness || 310} mm</strong></span>
        <span class="snapshot-chip">Zone: <strong>${p.zone || "III"}</strong></span>
        <span class="snapshot-chip">Subgrade CBR: <strong>${p.subgradeCBR || 8}%</strong></span>
        <span class="snapshot-chip">Base: <strong>${(p.subbaseType || "gsb").toUpperCase()} (${p.subbaseThickness || 150}mm)</strong></span>
        <span class="snapshot-chip">Concrete: <strong>${p.concreteGrade || "M40"}</strong></span>
        <span class="snapshot-chip">CFD: <strong>${totalCFD} (${isSafe ? "SAFE" : "UNSAFE"})</strong></span>
      `;

      if (el.cloudProjectName && (!el.cloudProjectName.value || el.cloudProjectName.value === "")) {
        el.cloudProjectName.value = p.projectName || "Rigid Pavement Design Highway Package";
      }
    }

    async function loadUserProjects() {
      if (!el.projectListContainer) return;
      el.projectListContainer.innerHTML =
        '<div style="text-align:center; padding:20px; color:var(--text-muted);">Loading projects from MongoDB Atlas...</div>';

      try {
        const res = await fetch("/api/v1/projects", { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          el.projectListContainer.innerHTML = `<div class="cloud-empty-state"><p>${data.error || "Failed to load projects."}</p></div>`;
          return;
        }

        const projects = data.projects || [];
        if (el.userProjectCount) el.userProjectCount.textContent = projects.length;

        if (projects.length === 0) {
          el.projectListContainer.innerHTML = `
            <div class="cloud-empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="color:var(--text-muted); opacity:0.6;">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z"></path>
                <path d="M6 6h10"></path>
                <path d="M6 10h10"></path>
              </svg>
              <p>No cloud highway projects saved in MongoDB yet.</p>
              <button type="button" class="btn-modal-action primary" id="btnGoToSaveTab">
                Save Active Design as First Project
              </button>
            </div>
          `;
          const btnGo = document.getElementById("btnGoToSaveTab");
          if (btnGo) btnGo.addEventListener("click", () => switchCloudProjectTab("save"));
          return;
        }

        el.projectListContainer.innerHTML = projects
          .map((proj) => {
            const isSafe = proj.latestCalculation?.summary?.isSafe;
            const cfd =
              proj.latestCalculation?.summary?.totalCFD !== undefined
                ? Number(proj.latestCalculation.summary.totalCFD).toFixed(3)
                : "—";
            const h = proj.latestCalculation?.summary?.trialThicknessMm || "—";
            const dateStr = new Date(proj.updatedAt || proj.createdAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });

            return `
            <div class="cloud-project-card" data-project-id="${proj._id}">
              <div class="project-card-info">
                <h4>${proj.name} ${proj.projectCode ? `<span style="font-size:11px; opacity:0.7; font-weight:normal;">(${proj.projectCode})</span>` : ""}</h4>
                <div class="project-meta-chips">
                  <span class="project-chip">${proj.state || "India"} &bull; Zone ${proj.climaticZone || "III"}</span>
                  <span class="project-chip">${proj.roadType === "divided_4lane" ? "4-Lane Divided" : proj.roadType || "Highway"}</span>
                  <span class="project-chip">${h} mm PQC</span>
                  <span class="project-chip ${isSafe ? "safe" : "unsafe"}">CFD: ${cfd} (${isSafe ? "SAFE" : "UNSAFE"})</span>
                  <span style="font-size:11px; color:var(--text-muted); margin-left:4px;">${dateStr}</span>
                </div>
              </div>
              <div class="project-card-actions">
                <button type="button" class="btn-modal-action primary btn-load-project" data-id="${proj._id}" title="Load into Studio Visualizer">Load</button>
                <button type="button" class="btn-modal-action subtle btn-history-project" data-id="${proj._id}" data-name="${encodeURIComponent(proj.name)}" title="View Capped 30 Calculation Runs">History</button>
                <button type="button" class="btn-modal-action danger btn-delete-project" data-id="${proj._id}" title="Delete Cloud Project">&times;</button>
              </div>
            </div>
          `;
          })
          .join("");

        // Wire card actions
        el.projectListContainer.querySelectorAll(".btn-load-project").forEach((btn) => {
          btn.addEventListener("click", () => loadProjectIntoWorkspace(btn.getAttribute("data-id")));
        });

        el.projectListContainer.querySelectorAll(".btn-history-project").forEach((btn) => {
          btn.addEventListener("click", () =>
            viewProjectHistory(btn.getAttribute("data-id"), decodeURIComponent(btn.getAttribute("data-name") || "Project"))
          );
        });

        el.projectListContainer.querySelectorAll(".btn-delete-project").forEach((btn) => {
          btn.addEventListener("click", () => deleteProject(btn.getAttribute("data-id")));
        });
      } catch (e) {
        el.projectListContainer.innerHTML =
          '<div class="cloud-empty-state"><p>Connection error loading projects.</p></div>';
      }
    }

    async function loadProjectIntoWorkspace(projectId) {
      try {
        const res = await fetch(`/api/v1/projects/${projectId}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          notify("Failed to load project details.", "error");
          return;
        }

        const p = data.project;
        activeCloudProjectId = p._id;

        if (window.OUTRRIGID_APP && typeof window.OUTRRIGID_APP.setParams === "function") {
          const newParams = { ...p.designParameters };
          if (p.name) newParams.projectName = p.name;
          window.OUTRRIGID_APP.setParams(newParams);
        }

        toggleCloudModal(false);
        notify(`Loaded cloud project: "${p.name}"`);
      } catch (e) {
        notify("Error loading project from cloud.", "error");
      }
    }

    async function saveActiveDesignToCloud(e) {
      if (e) e.preventDefault();
      clearCloudAlert();

      const name = el.cloudProjectName ? el.cloudProjectName.value.trim() : "";
      const projectCode = el.cloudProjectCode ? el.cloudProjectCode.value.trim() : "";
      const description = el.cloudProjectDesc ? el.cloudProjectDesc.value.trim() : "";

      if (!name) {
        showCloudAlert("Please provide a Project Name.", "error");
        return;
      }

      const activeParams = window.OUTRRIGID_APP?.getParams() || {};
      const latestResult = window.OUTRRIGID_APP?.getLatestResult() || {};

      const payload = {
        name,
        projectCode,
        description,
        state: activeParams.stateName || "Bihar",
        climaticZone: activeParams.zone || "III",
        roadType:
          activeParams.roadType ||
          (activeParams.carriagewayType === "divided" ? "divided_4lane" : "undivided_2lane"),
        designParameters: activeParams,
        latestCalculation: latestResult,
      };

      try {
        const res = await fetch("/api/v1/projects", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRF-Token": getCsrfToken(),
          },
          credentials: "include",
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          showCloudAlert(data.error || "Failed to save project to MongoDB.", "error");
          return;
        }

        activeCloudProjectId = data.project._id;
        notify(`Project "${name}" saved to MongoDB Atlas!`);
        switchCloudProjectTab("projects");
        loadUserProjects();
      } catch (e) {
        showCloudAlert("Network error saving project.", "error");
      }
    }

    async function deleteProject(projectId) {
      if (!confirm("Are you sure you want to permanently delete this cloud project?")) return;

      try {
        const res = await fetch(`/api/v1/projects/${projectId}`, {
          method: "DELETE",
          headers: {
            "X-CSRF-Token": getCsrfToken(),
          },
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          notify(data.error || "Failed to delete project.", "error");
          return;
        }
        notify("Project deleted from MongoDB Atlas.");
        if (activeCloudProjectId === projectId) activeCloudProjectId = null;
        loadUserProjects();
      } catch (e) {
        notify("Network error deleting project.", "error");
      }
    }

    async function viewProjectHistory(projectId, projectName) {
      if (el.paneMyProjects) el.paneMyProjects.style.display = "none";
      if (el.paneSaveCurrent) el.paneSaveCurrent.style.display = "none";
      if (el.paneProjectHistory) el.paneProjectHistory.style.display = "block";
      if (el.historyProjectTitle) el.historyProjectTitle.textContent = `${projectName} — Calculation Runs`;
      if (el.historyTableContainer) {
        el.historyTableContainer.innerHTML =
          '<div style="padding:16px; text-align:center; color:var(--text-muted);">Fetching history from MongoDB Atlas...</div>';
      }

      try {
        const res = await fetch(`/api/v1/projects/${projectId}/history`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok || !data.success) {
          el.historyTableContainer.innerHTML =
            '<div style="padding:16px; text-align:center;">Failed to load calculation history.</div>';
          return;
        }

        const history = data.history || [];
        if (history.length === 0) {
          el.historyTableContainer.innerHTML =
            '<div style="padding:20px; text-align:center; color:var(--text-muted);">No calculation runs recorded for this project yet.</div>';
          return;
        }

        el.historyTableContainer.innerHTML = `
          <table class="history-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Date / Time</th>
                <th>Thickness</th>
                <th>Cumulative Fatigue Damage (CFD)</th>
                <th>Verdict</th>
                <th>Action / Note</th>
              </tr>
            </thead>
            <tbody>
              ${history
                .map((h, i) => {
                  const dt = new Date(h.timestamp).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  });
                  const isSafe = h.isSafe;
                  const cfd = h.totalCFD !== undefined ? Number(h.totalCFD).toFixed(3) : "—";
                  return `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${dt}</td>
                    <td class="mono"><strong>${h.trialThicknessMm} mm</strong></td>
                    <td class="mono">${cfd} / 1.000</td>
                    <td><span class="project-chip ${isSafe ? "safe" : "unsafe"}">${isSafe ? "SAFE" : "UNSAFE"}</span></td>
                    <td>${h.action || "ANALYSIS"} ${h.note ? `<span style="opacity:0.7">(${h.note})</span>` : ""}</td>
                  </tr>
                `;
                })
                .join("")}
            </tbody>
          </table>
        `;
      } catch (e) {
        el.historyTableContainer.innerHTML =
          '<div style="padding:16px; text-align:center;">Connection error loading history.</div>';
      }
    }

    function switchCloudProjectTab(tab) {
      if (tab === "projects") {
        if (el.tabBtnMyProjects) el.tabBtnMyProjects.classList.add("active");
        if (el.tabBtnSaveCurrent) el.tabBtnSaveCurrent.classList.remove("active");
        if (el.paneMyProjects) el.paneMyProjects.style.display = "block";
        if (el.paneSaveCurrent) el.paneSaveCurrent.style.display = "none";
        if (el.paneProjectHistory) el.paneProjectHistory.style.display = "none";
      } else if (tab === "save") {
        if (el.tabBtnMyProjects) el.tabBtnMyProjects.classList.remove("active");
        if (el.tabBtnSaveCurrent) el.tabBtnSaveCurrent.classList.add("active");
        if (el.paneMyProjects) el.paneMyProjects.style.display = "none";
        if (el.paneSaveCurrent) el.paneSaveCurrent.style.display = "block";
        if (el.paneProjectHistory) el.paneProjectHistory.style.display = "none";
        updateDesignSnapshotPreview();
      }
    }

    // 2. Wire Listeners
    if (el.btnCloudProjects) {
      el.btnCloudProjects.addEventListener("click", () => toggleCloudModal(true));
    }
    if (el.btnCloseCloudModal) {
      el.btnCloseCloudModal.addEventListener("click", () => toggleCloudModal(false));
    }
    if (el.cloudModal) {
      el.cloudModal.addEventListener("click", (e) => {
        if (e.target === el.cloudModal) toggleCloudModal(false);
      });
    }
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && el.cloudModal && el.cloudModal.style.display !== "none") {
        toggleCloudModal(false);
      }
    });

    if (el.tabBtnSignIn) {
      el.tabBtnSignIn.addEventListener("click", () => {
        el.tabBtnSignIn.classList.add("active");
        if (el.tabBtnRegister) el.tabBtnRegister.classList.remove("active");
        if (el.formSignIn) el.formSignIn.style.display = "block";
        if (el.formRegister) el.formRegister.style.display = "none";
      });
    }

    if (el.tabBtnRegister) {
      el.tabBtnRegister.addEventListener("click", () => {
        el.tabBtnRegister.classList.add("active");
        if (el.tabBtnSignIn) el.tabBtnSignIn.classList.remove("active");
        if (el.formSignIn) el.formSignIn.style.display = "none";
        if (el.formRegister) el.formRegister.style.display = "block";
      });
    }

    if (el.formSignIn) {
      el.formSignIn.addEventListener("submit", (e) => {
        e.preventDefault();
        const email = el.loginEmail ? el.loginEmail.value.trim() : "";
        const password = el.loginPassword ? el.loginPassword.value : "";
        if (email && password) handleLogin(email, password);
      });
    }

    if (el.formRegister) {
      el.formRegister.addEventListener("submit", (e) => {
        e.preventDefault();
        const payload = {
          fullName: el.regFullName ? el.regFullName.value.trim() : "",
          email: el.regEmail ? el.regEmail.value.trim() : "",
          password: el.regPassword ? el.regPassword.value : "",
          organization: el.regOrg ? el.regOrg.value.trim() : "",
          designation: el.regDesignation ? el.regDesignation.value.trim() : "",
        };
        if (payload.email && payload.password) handleRegister(payload);
      });
    }

    if (el.btnSignOut) {
      el.btnSignOut.addEventListener("click", handleSignOut);
    }

    if (el.tabBtnMyProjects) {
      el.tabBtnMyProjects.addEventListener("click", () => switchCloudProjectTab("projects"));
    }

    if (el.tabBtnSaveCurrent) {
      el.tabBtnSaveCurrent.addEventListener("click", () => switchCloudProjectTab("save"));
    }

    if (el.formSaveProject) {
      el.formSaveProject.addEventListener("submit", saveActiveDesignToCloud);
    }

    if (el.btnBackToProjects) {
      el.btnBackToProjects.addEventListener("click", () => switchCloudProjectTab("projects"));
    }

    // 3. Check for existing active session on boot
    checkAuthSession();
  });
})();

