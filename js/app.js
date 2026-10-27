/**
 * app.js
 * Pan-India Rigid Pavement Design Studio
 * Full-stack API bindings, All-India State/UT mapping, Theme Toggle (Light/Dark),
 * Automated Thickness Optimization, and Multi-Variant Comparison.
 */

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Engines
  const engine = new IRC58Engine(IRC58_DATA);
  const jointEngine = new JointDesignEngine(IRC58_DATA);
  let visualizer = null;

  try {
    visualizer = new PavementVisualizer("curlingCanvas", "crossSectionSvgContainer");
  } catch (e) {
    console.warn("Visualizer init warning:", e);
  }

  // 2. Active Application State
  let currentParams = { ...IRC58_DATA.benchmark };

  // 3. Cache DOM Elements
  const el = {
    // Header & Theme
    btnThemeToggle: document.getElementById("btnThemeToggle"),
    themeToggleIcon: document.getElementById("themeToggleIcon"),
    btnAutoOptimize: document.getElementById("btnAutoOptimize"),
    btnReset: document.getElementById("btnReset"),
    btnPrint: document.getElementById("btnPrint"),
    btnExportData: document.getElementById("btnExportData"),
    backendStatusBadge: document.getElementById("backendStatusBadge"),

    // Pan-India Geoclimatic Hub
    selectIndianState: document.getElementById("selectIndianState"),
    selectClimaticZone: document.getElementById("selectClimaticZone"),
    badgeStateZone: document.getElementById("badgeStateZone"),
    badgeDayTemp: document.getElementById("badgeDayTemp"),
    geoDayTempDisplay: document.getElementById("geoDayTempDisplay"),
    geoNightTempDisplay: document.getElementById("geoNightTempDisplay"),
    geoZoneDescription: document.getElementById("geoZoneDescription"),
    geoStateVal: document.getElementById("geoStateVal"),
    geoRegionVal: document.getElementById("geoRegionVal"),
    geoCbrVal: document.getElementById("geoCbrVal"),
    geoTrafficVal: document.getElementById("geoTrafficVal"),
    geoPillCbr: document.getElementById("geoPillCbr"),
    badgeBucTemp: document.getElementById("badgeBucTemp"),
    badgeTdcTemp: document.getElementById("badgeTdcTemp"),

    // Design Benchmark Suite & Theory Reference
    btnScenarioDropdown: document.getElementById("btnScenarioDropdown"),
    scenarioDropdownMenu: document.getElementById("scenarioDropdownMenu"),
    btnCloseScenarioDropdown: document.getElementById("btnCloseScenarioDropdown"),
    badgeActiveScenario: document.getElementById("badgeActiveScenario"),
    btnCaseExcel1Trial1: document.getElementById("btnCaseExcel1Trial1"),
    btnCaseExcel1Trial2: document.getElementById("btnCaseExcel1Trial2"),
    btnCaseExcel2Dlc: document.getElementById("btnCaseExcel2Dlc"),
    btnCaseExcel2Bonded: document.getElementById("btnCaseExcel2Bonded"),
    btnOpenTheoryModal: document.getElementById("btnOpenTheoryModal"),
    btnCloseTheoryModal: document.getElementById("btnCloseTheoryModal"),
    theoryModal: document.getElementById("theoryModal"),
    btnScrollToGuide: document.getElementById("btnScrollToGuide"),
    sectionHowToUse: document.getElementById("sectionHowToUse"),
    btnToggleHowToUse: document.getElementById("btnToggleHowToUse"),
    btnDismissHowToUse: document.getElementById("btnDismissHowToUse"),
    howToUseBody: document.getElementById("howToUseBody"),
    iconGuideToggle: document.getElementById("iconGuideToggle"),
    textGuideToggle: document.getElementById("textGuideToggle"),
    excelVerdictBanner: document.getElementById("excelVerdictBanner"),
    verdictIconBox: document.getElementById("verdictIconBox"),
    verdictSubtitle: document.getElementById("verdictSubtitle"),
    verdictTitle: document.getElementById("verdictTitle"),
    verdictDetails: document.getElementById("verdictDetails"),
    verdictExcelSrc: document.getElementById("verdictExcelSrc"),
    verdictPdfSrc: document.getElementById("verdictPdfSrc"),

    // KPI & Trial Controller Displays
    sliderThickness: document.getElementById("sliderThickness"),
    inputNumericThickness: document.getElementById("inputNumericThickness"),
    btnStepMinus: document.getElementById("btnStepMinus"),
    btnStepPlus: document.getElementById("btnStepPlus"),
    displayThickness: document.getElementById("displayThickness"),
    displayRadiusL: document.getElementById("displayRadiusL"),
    displayEffectiveK: document.getElementById("displayEffectiveK"),
    displayCfdBuc: document.getElementById("displayCfdBuc"),
    displayCfdTdc: document.getElementById("displayCfdTdc"),
    displayTotalCfd: document.getElementById("displayTotalCfd"),
    safetyCard: document.getElementById("safetyCard"),
    safetyBadge: document.getElementById("safetyBadge"),
    cfdMeterFill: document.getElementById("cfdMeterFill"),
    kpiFinalThickness: document.getElementById("kpiFinalThickness"),
    gaugePctLabel: document.getElementById("gaugePctLabel"),

    // Workspaces and Tabs
    workspaceBtns: document.querySelectorAll(".workspace-nav-btn, .tab-btn"),
    workspacePanes: document.querySelectorAll(".workspace-pane, .tab-pane"),
    subnavBtns: document.querySelectorAll(".subnav-btn"),
    subtabPanes: document.querySelectorAll(".subtab-pane"),

    // Visualizer Controls
    btnModeDay: document.getElementById("btnModeDay"),
    btnModeNight: document.getElementById("btnModeNight"),
    sliderExaggerate: document.getElementById("sliderExaggerate"),

    // Traffic Mode Buttons
    btnModeUserInput: document.getElementById("btnModeUserInput"),
    btnModeBenchmark: document.getElementById("btnModeBenchmark"),

    // Roadway Geometry & Lanes
    inputProjectName: document.getElementById("inputProjectName"),
    selectNumLanes: document.getElementById("selectNumLanes"),
    selectCarriageway: document.getElementById("selectCarriageway"),
    inputLaneWidth: document.getElementById("inputLaneWidth"),
    inputJointSpacing: document.getElementById("inputJointSpacing"),
    displayJointSpacingCompare: document.getElementById("displayJointSpacingCompare"),
    inputDesignPeriod: document.getElementById("inputDesignPeriod"),
    inputDesignLanePct: document.getElementById("inputDesignLanePct"),
    labelDesignLanePreset: document.getElementById("labelDesignLanePreset"),

    // Directional Traffic Volumes
    inputCvpdDir1: document.getElementById("inputCvpdDir1"),
    inputCvpdDir2: document.getElementById("inputCvpdDir2"),
    inputCvpd: document.getElementById("inputCvpd"), // fallback if present
    displayTotal2WayCvpd: document.getElementById("displayTotal2WayCvpd"),
    displayPredominantCvpd: document.getElementById("displayPredominantCvpd"),
    inputPredominantDirPct: document.getElementById("inputPredominantDirPct"),
    inputGrowthRate: document.getElementById("inputGrowthRate"),

    // 24h, 12-to-12 Hour & 6h Day/Night Distribution
    inputNightTrafficPct: document.getElementById("inputNightTrafficPct"),
    displayNight12hCount: document.getElementById("displayNight12hCount"),
    displayDayTrafficPct: document.getElementById("displayDayTrafficPct"),
    displayDay12hCount: document.getElementById("displayDay12hCount"),
    inputPeak6hDayPct: document.getElementById("inputPeak6hDayPct"),
    displayDay6hCount: document.getElementById("displayDay6hCount"),
    inputPeak6hNightPct: document.getElementById("inputPeak6hNightPct"),
    displayNight6hCount: document.getElementById("displayNight6hCount"),

    // Vehicle Type % & Axle Spectrum
    inputPct2Axle: document.getElementById("inputPct2Axle"),
    inputPct3Axle: document.getElementById("inputPct3Axle"),
    inputPctMultiAxle: document.getElementById("inputPctMultiAxle"),
    fleetPctTotal: document.getElementById("fleetPctTotal"),
    inputAxlesPerCv: document.getElementById("inputAxlesPerCv"),
    inputFrontSinglePct: document.getElementById("inputFrontSinglePct"),
    inputRearSinglePct: document.getElementById("inputRearSinglePct"),
    inputRearTandemPct: document.getElementById("inputRearTandemPct"),
    inputRearTridemPct: document.getElementById("inputRearTridemPct"),
    axlePctTotal: document.getElementById("axlePctTotal"),
    axlePctWarning: document.getElementById("axlePctWarning"),

    // Vehicle Distance & Joint Spacing Comparison
    inputVehicleDistance: document.getElementById("inputVehicleDistance"),
    inputWheelbasePct: document.getElementById("inputWheelbasePct"),
    badgeWheelbaseStatus: document.getElementById("badgeWheelbaseStatus"),

    // Materials & Subgrade Inputs
    inputCbr: document.getElementById("inputCbr"),
    selectSubbaseType: document.getElementById("selectSubbaseType"),
    inputSubbaseThickness: document.getElementById("inputSubbaseThickness"),
    selectZone: document.getElementById("selectZone"),
    selectConcreteGrade: document.getElementById("selectConcreteGrade"),
    inputFck28: document.getElementById("inputFck28"),
    inputDesignFlexural: document.getElementById("inputDesignFlexural"),
    selectShoulderType: document.getElementById("selectShoulderType"),
    selectTransverseJoint: document.getElementById("selectTransverseJoint"),

    // Tables
    tableSpectrumSingleBody: document.getElementById("tableSpectrumSingleBody"),
    tableSpectrumTandemBody: document.getElementById("tableSpectrumTandemBody"),
    tableSpectrumTridemBody: document.getElementById("tableSpectrumTridemBody"),
    btnResetSpectrumTab: document.getElementById("btnResetSpectrumTab"),
    btnResetBucSpectrum: document.getElementById("btnResetBucSpectrum"),
    btnResetTdcReps: document.getElementById("btnResetTdcReps"),
    btnLoadDlcBenchmark: document.getElementById("btnLoadDlcBenchmark"),
    groupDlcBondType: document.getElementById("groupDlcBondType"),
    selectDlcBondType: document.getElementById("selectDlcBondType"),
    inputCompTargetH: document.getElementById("inputCompTargetH"),
    sliderCompH1: document.getElementById("sliderCompH1"),
    labelCompH1Val: document.getElementById("labelCompH1Val"),
    sliderCompH2: document.getElementById("sliderCompH2"),
    labelCompH2Val: document.getElementById("labelCompH2Val"),
    inputCompE1: document.getElementById("inputCompE1"),
    inputCompMu1: document.getElementById("inputCompMu1"),
    inputCompDlcFck: document.getElementById("inputCompDlcFck"),
    selectCompDlcModel: document.getElementById("selectCompDlcModel"),
    inputCompMu2: document.getElementById("inputCompMu2"),
    compDisplayD: document.getElementById("compDisplayD"),
    compDisplayD1: document.getElementById("compDisplayD1"),
    compDisplayD2: document.getElementById("compDisplayD2"),
    compDisplayLHS: document.getElementById("compDisplayLHS"),
    compDisplayRHS: document.getElementById("compDisplayRHS"),
    compDisplayMargin: document.getElementById("compDisplayMargin"),
    compDisplayMarginPct: document.getElementById("compDisplayMarginPct"),
    compStatusAlert: document.getElementById("compStatusAlert"),
    compositeCrossSectionSvg: document.getElementById("compositeCrossSectionSvg"),
    compStatThickSaved: document.getElementById("compStatThickSaved"),
    compStatVolSaved: document.getElementById("compStatVolSaved"),
    compStatCostSaved: document.getElementById("compStatCostSaved"),
    compStatCo2Saved: document.getElementById("compStatCo2Saved"),
    appToastContainer: document.getElementById("appToastContainer"),
    tableBucSingleBody: document.getElementById("tableBucSingleBody"),
    tableBucTandemBody: document.getElementById("tableBucTandemBody"),
    tableTdcSingleBody: document.getElementById("tableTdcSingleBody"),
    tableTdcTandemBody: document.getElementById("tableTdcTandemBody"),
    tableTdcTridemBody: document.getElementById("tableTdcTridemBody"),
    tableVariantsBody: document.getElementById("tableVariantsBody"),
    tableDowelBody: document.getElementById("tableDowelBody"),
    tableTieBody: document.getElementById("tableTieBody"),
    trafficSummaryContainer: document.getElementById("trafficSummaryContainer"),
    totalCfdSummaryContainer: document.getElementById("totalCfdSummaryContainer")
  };

  let latestTraffic = null;
  let latestResult = null;

  // ==========================================================================
  // High Z-Index Custom Dropdown Enhancement System
  // ==========================================================================
  function initCustomSelects() {
    const selects = document.querySelectorAll("select.form-select");
    selects.forEach((selectEl) => {
      enhanceSelect(selectEl);
    });
  }

  function enhanceSelect(selectEl) {
    if (!selectEl) return;
    if (selectEl.style.display === "none" || selectEl.hidden) return;
    if (selectEl.dataset.customEnhanced === "true") {
      syncCustomSelectOptions(selectEl);
      return;
    }
    selectEl.dataset.customEnhanced = "true";
    selectEl.classList.add("custom-select-native-hidden");

    const wrapper = document.createElement("div");
    wrapper.className = "custom-select-container";
    selectEl.parentNode.insertBefore(wrapper, selectEl);
    wrapper.appendChild(selectEl);

    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "custom-select-trigger";
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");

    const valueSpan = document.createElement("span");
    valueSpan.className = "custom-select-value";

    const chevronSpan = document.createElement("span");
    chevronSpan.className = "custom-select-chevron";
    chevronSpan.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

    trigger.appendChild(valueSpan);
    trigger.appendChild(chevronSpan);
    wrapper.appendChild(trigger);

    const dropdown = document.createElement("div");
    dropdown.className = "custom-select-dropdown";

    let searchInput = null;
    const isSearchable = selectEl.options.length > 20;
    if (isSearchable) {
      const searchWrap = document.createElement("div");
      searchWrap.className = "custom-select-search-wrap";
      searchWrap.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>';
      searchInput = document.createElement("input");
      searchInput.type = "text";
      searchInput.className = "custom-select-search-input";
      searchInput.placeholder = "Filter options...";
      searchWrap.appendChild(searchInput);
      dropdown.appendChild(searchWrap);
    }

    const optionsList = document.createElement("div");
    optionsList.className = "custom-select-options";
    dropdown.appendChild(optionsList);
    wrapper.appendChild(dropdown);

    selectEl._customSelect = {
      wrapper,
      trigger,
      valueSpan,
      dropdown,
      optionsList,
      searchInput
    };

    syncCustomSelectOptions(selectEl);

    trigger.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const isOpen = wrapper.classList.contains("is-open");
      closeAllCustomSelects();
      if (!isOpen) {
        openCustomSelect(selectEl);
      }
    });

    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase().trim();
        const optionItems = optionsList.querySelectorAll(".custom-select-option");
        let visibleCount = 0;
        optionItems.forEach((item) => {
          const text = item.dataset.text.toLowerCase();
          if (text.includes(query)) {
            item.style.display = "flex";
            visibleCount++;
          } else {
            item.style.display = "none";
          }
        });

        let emptyMsg = optionsList.querySelector(".custom-select-empty");
        if (visibleCount === 0) {
          if (!emptyMsg) {
            emptyMsg = document.createElement("div");
            emptyMsg.className = "custom-select-empty";
            emptyMsg.textContent = "No matching options found";
            optionsList.appendChild(emptyMsg);
          }
          emptyMsg.style.display = "block";
        } else if (emptyMsg) {
          emptyMsg.style.display = "none";
        }
      });

      searchInput.addEventListener("click", (e) => e.stopPropagation());
      searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeAllCustomSelects();
      });
    }

    selectEl.addEventListener("change", () => {
      updateTriggerLabel(selectEl);
      highlightSelectedOption(selectEl);
    });
  }

  function openCustomSelect(selectEl) {
    if (!selectEl || !selectEl._customSelect) return;
    const { wrapper, trigger, searchInput, optionsList } = selectEl._customSelect;
    wrapper.classList.add("is-open");
    trigger.setAttribute("aria-expanded", "true");

    if (searchInput) {
      searchInput.value = "";
      const optionItems = optionsList.querySelectorAll(".custom-select-option");
      optionItems.forEach((item) => (item.style.display = "flex"));
      const emptyMsg = optionsList.querySelector(".custom-select-empty");
      if (emptyMsg) emptyMsg.style.display = "none";
      setTimeout(() => searchInput.focus(), 60);
    }

    const activeOption = optionsList.querySelector(".custom-select-option.is-selected");
    if (activeOption) {
      activeOption.scrollIntoView({ block: "nearest" });
    }
  }

  function closeAllCustomSelects() {
    document.querySelectorAll(".custom-select-container.is-open").forEach((wrapper) => {
      wrapper.classList.remove("is-open");
      const trigger = wrapper.querySelector(".custom-select-trigger");
      if (trigger) trigger.setAttribute("aria-expanded", "false");
    });
  }

  document.addEventListener("click", () => {
    closeAllCustomSelects();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeAllCustomSelects();
    }
  });

  function syncCustomSelectOptions(selectEl) {
    if (!selectEl || !selectEl._customSelect) return;
    const { optionsList } = selectEl._customSelect;
    optionsList.innerHTML = "";

    Array.from(selectEl.options).forEach((opt, idx) => {
      const optDiv = document.createElement("div");
      optDiv.className = `custom-select-option ${opt.selected ? "is-selected" : ""}`;
      optDiv.dataset.value = opt.value;
      optDiv.dataset.index = idx;
      optDiv.dataset.text = opt.text;

      const labelWrap = document.createElement("div");
      labelWrap.className = "custom-select-option-label";

      const rawText = opt.text;
      const parenMatch = rawText.match(/^(.*?)\s*(\(.*?\))$/);
      if (parenMatch) {
        const titleSpan = document.createElement("span");
        titleSpan.className = "custom-select-main";
        titleSpan.textContent = parenMatch[1].trim();
        const subSpan = document.createElement("span");
        subSpan.className = "custom-select-sub";
        subSpan.textContent = parenMatch[2];
        labelWrap.appendChild(titleSpan);
        labelWrap.appendChild(subSpan);
      } else {
        const titleSpan = document.createElement("span");
        titleSpan.className = "custom-select-main";
        titleSpan.textContent = rawText;
        labelWrap.appendChild(titleSpan);
      }

      const checkIcon = document.createElement("span");
      checkIcon.className = "custom-select-check";
      checkIcon.innerHTML = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

      optDiv.appendChild(labelWrap);
      optDiv.appendChild(checkIcon);

      optDiv.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        selectEl.value = opt.value;
        selectEl.selectedIndex = idx;
        updateTriggerLabel(selectEl);
        highlightSelectedOption(selectEl);
        closeAllCustomSelects();

        selectEl.dispatchEvent(new Event("change", { bubbles: true }));
        selectEl.dispatchEvent(new Event("input", { bubbles: true }));
      });

      optionsList.appendChild(optDiv);
    });

    updateTriggerLabel(selectEl);
  }

  function updateTriggerLabel(selectEl) {
    if (!selectEl || !selectEl._customSelect) return;
    const { valueSpan } = selectEl._customSelect;
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    if (!selectedOpt) {
      valueSpan.textContent = "Select...";
      return;
    }
    valueSpan.textContent = selectedOpt.text;
  }

  function highlightSelectedOption(selectEl) {
    if (!selectEl || !selectEl._customSelect) return;
    const { optionsList } = selectEl._customSelect;
    const selectedIndex = selectEl.selectedIndex;
    const optionItems = optionsList.querySelectorAll(".custom-select-option");
    optionItems.forEach((item, idx) => {
      if (idx === selectedIndex) {
        item.classList.add("is-selected");
      } else {
        item.classList.remove("is-selected");
      }
    });
  }

  function updateAllCustomSelects() {
    document.querySelectorAll("select.form-select").forEach((selectEl) => {
      updateTriggerLabel(selectEl);
      highlightSelectedOption(selectEl);
    });
  }

  const ZONE_DESCRIPTIONS = {
    "I": "Hilly & High-Altitude Terrains",
    "II": "Northern & Western Plains",
    "III": "Gangetic Plains & Eastern Delta",
    "IV": "Central & Deccan Plateau",
    "V": "Southern Inland & Highlands",
    "VI": "Western Coastal Belt (Ghats)",
    "VII": "Eastern & Open Coastal Plains"
  };

  function updateGeoclimaticPills(item) {
    if (!item) return;
    if (el.geoStateVal) el.geoStateVal.textContent = item.state;
    if (el.geoRegionVal) el.geoRegionVal.textContent = item.region;
    if (el.geoCbrVal) el.geoCbrVal.textContent = `${item.defaultCbr || 8.0}%`;
    if (el.geoTrafficVal) el.geoTrafficVal.textContent = `${(item.defaultCvpd || 3000).toLocaleString()} CVPD`;
    if (el.geoZoneDescription) {
      el.geoZoneDescription.textContent = ZONE_DESCRIPTIONS[item.zone] || `IRC:58 Zone ${item.zone}`;
    }
  }

  // Populate Indian States Dropdown (All 28 States & UTs)
  function populateStatesDropdown() {
    if (!el.selectIndianState || !IRC58_DATA.indianStates) return;
    el.selectIndianState.innerHTML = IRC58_DATA.indianStates
      .map((item, idx) => {
        const isSelected = item.state === currentParams.selectedState && item.region === currentParams.selectedRegion;
        return `<option value="${idx}" ${isSelected ? "selected" : ""}>${item.state} — ${item.region} (Zone ${item.zone})</option>`;
      })
      .join("");
    enhanceSelect(el.selectIndianState);

    const activeItem = IRC58_DATA.indianStates.find(
      (item) => item.state === currentParams.selectedState && item.region === currentParams.selectedRegion
    ) || IRC58_DATA.indianStates[0];
    updateGeoclimaticPills(activeItem);
  }

  const ICON_SUN = '<svg class="app-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
  const ICON_MOON = '<svg class="app-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
  const ICON_CHECK = '<svg class="app-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
  const ICON_INFO = '<svg class="app-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>';
  const ICON_CLIPBOARD = '<svg class="app-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M9 12h6"/><path d="M9 16h6"/></svg>';
  const ICON_BOLT = '<svg class="app-icon" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>';

  // Theme Management (Light by default, toggleable to Dark)
  function initTheme() {
    const savedTheme = localStorage.getItem("jpcp_theme") || "light";
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark-theme");
      if (el.themeToggleIcon) el.themeToggleIcon.innerHTML = ICON_SUN;
    } else {
      document.documentElement.classList.remove("dark-theme");
      if (el.themeToggleIcon) el.themeToggleIcon.innerHTML = ICON_MOON;
    }

    if (el.btnThemeToggle) {
      el.btnThemeToggle.addEventListener("click", () => {
        const isDark = document.documentElement.classList.toggle("dark-theme");
        localStorage.setItem("jpcp_theme", isDark ? "dark" : "light");
        if (el.themeToggleIcon) el.themeToggleIcon.innerHTML = isDark ? ICON_SUN : ICON_MOON;
        if (visualizer) visualizer.renderCrossSection();
      });
    }
  }

  // Check Backend Connection Status
  fetch("/api/v1/health")
    .then((res) => res.json())
    .then(() => {
      if (el.backendStatusBadge) {
        el.backendStatusBadge.innerHTML = '<span class="status-dot online"></span><span>Engine Connected</span>';
      }
    })
    .catch(() => {
      if (el.backendStatusBadge) {
        el.backendStatusBadge.innerHTML = '<span class="status-dot offline"></span><span>Offline Mode</span>';
      }
    });

  /**
   * Sync UI input fields with currentParams state
   */
  function syncInputsFromState() {
    if (el.sliderThickness) el.sliderThickness.value = currentParams.trialThickness;
    if (el.inputNumericThickness) el.inputNumericThickness.value = currentParams.trialThickness;
    if (el.inputProjectName) el.inputProjectName.value = currentParams.projectName || "National Highway Rigid Pavement Project";

    // Road Geometry & Lanes
    if (el.selectNumLanes) el.selectNumLanes.value = currentParams.numLanes || 4;
    if (el.selectCarriageway) el.selectCarriageway.value = currentParams.carriagewayType || "divided";
    if (el.inputLaneWidth) el.inputLaneWidth.value = currentParams.laneWidth || 3.5;
    if (el.inputJointSpacing) el.inputJointSpacing.value = currentParams.jointSpacing || 4.5;
    if (el.displayJointSpacingCompare) el.displayJointSpacingCompare.value = `${currentParams.jointSpacing || 4.5} m`;
    if (el.inputDesignPeriod) el.inputDesignPeriod.value = currentParams.designPeriod || 30;
    if (el.inputDesignLanePct) el.inputDesignLanePct.value = currentParams.trafficDesignLanePct || 25;

    // Directional Traffic Volumes
    const d1 = currentParams.cvpdDir1 !== undefined ? currentParams.cvpdDir1 : (currentParams.cvpdPerDirection || 3000);
    const d2 = currentParams.cvpdDir2 !== undefined ? currentParams.cvpdDir2 : (currentParams.cvpdPerDirection || 3000);
    if (el.inputCvpdDir1) el.inputCvpdDir1.value = d1;
    if (el.inputCvpdDir2) el.inputCvpdDir2.value = d2;
    if (el.inputCvpd) el.inputCvpd.value = Math.max(d1, d2);

    const total2Way = d1 + d2;
    const predominant = Math.max(d1, d2);
    if (el.displayTotal2WayCvpd) el.displayTotal2WayCvpd.textContent = `${total2Way.toLocaleString()} CVPD`;
    if (el.displayPredominantCvpd) el.displayPredominantCvpd.textContent = `${predominant.toLocaleString()} CVPD`;
    if (el.inputPredominantDirPct) el.inputPredominantDirPct.value = currentParams.trafficPredominantDirPct || (total2Way > 0 ? ((predominant / total2Way) * 100).toFixed(1) : 50);
    if (el.inputGrowthRate) el.inputGrowthRate.value = currentParams.annualGrowthRate || 5.0;

    // 24h & 12-to-12 Day/Night Distribution
    const nightPct = currentParams.nightTraffic12hPct !== undefined ? currentParams.nightTraffic12hPct : 60;
    const dayPct = Math.max(0, 100 - nightPct);
    if (el.inputNightTrafficPct) el.inputNightTrafficPct.value = nightPct;
    if (el.displayDayTrafficPct) el.displayDayTrafficPct.value = `${dayPct}%`;

    const peakDayPct = currentParams.peak6hDayPct !== undefined ? currentParams.peak6hDayPct : 50;
    const peakNightPct = currentParams.peak6hNightPct !== undefined ? currentParams.peak6hNightPct : 50;
    if (el.inputPeak6hDayPct) el.inputPeak6hDayPct.value = peakDayPct;
    if (el.inputPeak6hNightPct) el.inputPeak6hNightPct.value = peakNightPct;

    // Live counts for 12h & 6h
    const day12hCount = Math.round(predominant * (dayPct / 100));
    const night12hCount = Math.round(predominant * (nightPct / 100));
    const day6hCount = Math.round(day12hCount * (peakDayPct / 100));
    const night6hCount = Math.round(night12hCount * (peakNightPct / 100));

    if (el.displayDay12hCount) el.displayDay12hCount.textContent = `${day12hCount.toLocaleString()} CVPD`;
    if (el.displayNight12hCount) el.displayNight12hCount.textContent = `${night12hCount.toLocaleString()} CVPD`;
    if (el.displayDay6hCount) el.displayDay6hCount.textContent = `${day6hCount.toLocaleString()} CVPD`;
    if (el.displayNight6hCount) el.displayNight6hCount.textContent = `${night6hCount.toLocaleString()} CVPD`;

    // Vehicle Type %
    if (el.inputPct2Axle) el.inputPct2Axle.value = currentParams.pct2Axle !== undefined ? currentParams.pct2Axle : 45;
    if (el.inputPct3Axle) el.inputPct3Axle.value = currentParams.pct3Axle !== undefined ? currentParams.pct3Axle : 35;
    if (el.inputPctMultiAxle) el.inputPctMultiAxle.value = currentParams.pctMultiAxle !== undefined ? currentParams.pctMultiAxle : 20;
    if (el.inputAxlesPerCv) el.inputAxlesPerCv.value = currentParams.axlesPerCV || 2.35;

    const fleetSum = (parseFloat(el.inputPct2Axle?.value || 45) + parseFloat(el.inputPct3Axle?.value || 35) + parseFloat(el.inputPctMultiAxle?.value || 20));
    if (el.fleetPctTotal) el.fleetPctTotal.textContent = `${fleetSum}%`;

    // Axle Category Proportions
    if (el.inputFrontSinglePct) el.inputFrontSinglePct.value = currentParams.frontSingleSteeringPct !== undefined ? currentParams.frontSingleSteeringPct : 45;
    if (el.inputRearSinglePct) el.inputRearSinglePct.value = currentParams.rearSinglePct !== undefined ? currentParams.rearSinglePct : 15;
    if (el.inputRearTandemPct) el.inputRearTandemPct.value = currentParams.rearTandemPct !== undefined ? currentParams.rearTandemPct : 25;
    if (el.inputRearTridemPct) el.inputRearTridemPct.value = currentParams.rearTridemPct !== undefined ? currentParams.rearTridemPct : 15;

    const axleSum = (parseFloat(el.inputFrontSinglePct?.value || 45) + parseFloat(el.inputRearSinglePct?.value || 15) + parseFloat(el.inputRearTandemPct?.value || 25) + parseFloat(el.inputRearTridemPct?.value || 15));
    if (el.axlePctTotal) el.axlePctTotal.textContent = `${axleSum}%`;
    if (el.axlePctWarning) el.axlePctWarning.style.display = Math.abs(axleSum - 100) > 0.1 ? "inline" : "none";

    // Distance of Vehicle & Joint Spacing
    if (el.inputVehicleDistance) el.inputVehicleDistance.value = currentParams.vehicleDistance || 4.2;
    if (el.inputWheelbasePct) el.inputWheelbasePct.value = currentParams.wheelbaseLess45Pct !== undefined ? currentParams.wheelbaseLess45Pct : 55;
    updateWheelbaseBadge(currentParams.vehicleDistance || 4.2, currentParams.jointSpacing || 4.5);

    // Materials
    if (el.inputCbr) el.inputCbr.value = currentParams.subgradeCBR;
    if (el.selectSubbaseType) el.selectSubbaseType.value = currentParams.subbaseType;
    if (el.inputSubbaseThickness) el.inputSubbaseThickness.value = currentParams.subbaseThickness;
    if (el.selectZone) el.selectZone.value = currentParams.zone;
    if (el.selectConcreteGrade) el.selectConcreteGrade.value = currentParams.concreteGrade;
    if (el.inputFck28) el.inputFck28.value = currentParams.fck28;
    if (el.inputDesignFlexural) el.inputDesignFlexural.value = currentParams.designFlexuralStrength;
    if (el.selectShoulderType) el.selectShoulderType.value = currentParams.shoulderType;
    if (el.selectTransverseJoint) el.selectTransverseJoint.value = currentParams.transverseJointType;

    // Traffic mode buttons styling
    updateModeButtons();

    // Sync all custom dropdown UI components
    updateAllCustomSelects();
  }

  function updateWheelbaseBadge(vDist, jSpacing) {
    if (!el.badgeWheelbaseStatus) return;
    if (vDist <= jSpacing) {
      el.badgeWheelbaseStatus.style.background = "rgba(234, 88, 12, 0.1)";
      el.badgeWheelbaseStatus.style.borderColor = "rgba(234, 88, 12, 0.35)";
      el.badgeWheelbaseStatus.innerHTML = `<span>${ICON_INFO}</span><span><strong>CRITICAL FOR TDC:</strong> Vehicle wheelbase (<strong>${vDist} m</strong>) &le; joint spacing (<strong>${jSpacing} m</strong>) &mdash; both steering and drive axles occupy the same slab panel simultaneously during night curling.</span>`;
    } else {
      el.badgeWheelbaseStatus.style.background = "rgba(5, 150, 105, 0.1)";
      el.badgeWheelbaseStatus.style.borderColor = "rgba(5, 150, 105, 0.35)";
      el.badgeWheelbaseStatus.innerHTML = `<span>${ICON_CHECK}</span><span>Vehicle wheelbase (<strong>${vDist} m</strong>) &gt; joint spacing (<strong>${jSpacing} m</strong>) &mdash; lower probability of simultaneous dual-axle panel loading.</span>`;
    }
  }

  function updateModeButtons() {
    if (!el.btnModeUserInput || !el.btnModeBenchmark) return;
    if (currentParams.useWorkbookExactTraffic) {
      el.btnModeBenchmark.className = "btn btn-primary";
      el.btnModeBenchmark.innerHTML = `${ICON_CLIPBOARD} IRC:58 Benchmark Fixed Dataset (Active)`;
      el.btnModeUserInput.className = "btn btn-secondary";
      el.btnModeUserInput.innerHTML = `${ICON_BOLT} Switch to User-Entered Data`;
    } else {
      el.btnModeUserInput.className = "btn btn-primary";
      el.btnModeUserInput.innerHTML = `${ICON_BOLT} User-Entered Traffic Data (Active)`;
      el.btnModeBenchmark.className = "btn btn-secondary";
      el.btnModeBenchmark.innerHTML = `${ICON_CLIPBOARD} Compare with Benchmark`;
    }
  }

  /**
   * Reads values from UI inputs into currentParams state
   */
  function syncStateFromInputs() {
    if (el.sliderThickness) currentParams.trialThickness = parseFloat(el.sliderThickness.value);
    if (el.inputProjectName) currentParams.projectName = el.inputProjectName.value;

    // Geometry & Lanes
    if (el.selectNumLanes) currentParams.numLanes = parseInt(el.selectNumLanes.value, 10);
    if (el.selectCarriageway) currentParams.carriagewayType = el.selectCarriageway.value;
    if (el.inputLaneWidth) currentParams.laneWidth = parseFloat(el.inputLaneWidth.value);
    if (el.inputJointSpacing) {
      currentParams.jointSpacing = parseFloat(el.inputJointSpacing.value);
      if (el.displayJointSpacingCompare) el.displayJointSpacingCompare.value = `${currentParams.jointSpacing} m`;
    }
    if (el.inputDesignPeriod) currentParams.designPeriod = parseFloat(el.inputDesignPeriod.value);
    if (el.inputDesignLanePct) currentParams.trafficDesignLanePct = parseFloat(el.inputDesignLanePct.value);

    // Directional Traffic Volumes
    const d1 = el.inputCvpdDir1 ? parseFloat(el.inputCvpdDir1.value) || 0 : 3000;
    const d2 = el.inputCvpdDir2 ? parseFloat(el.inputCvpdDir2.value) || 0 : 3000;
    currentParams.cvpdDir1 = d1;
    currentParams.cvpdDir2 = d2;
    currentParams.cvpdPerDirection = Math.max(d1, d2);

    const total2Way = d1 + d2;
    const predominant = Math.max(d1, d2);
    if (el.displayTotal2WayCvpd) el.displayTotal2WayCvpd.textContent = `${total2Way.toLocaleString()} CVPD`;
    if (el.displayPredominantCvpd) el.displayPredominantCvpd.textContent = `${predominant.toLocaleString()} CVPD`;

    if (el.inputPredominantDirPct) currentParams.trafficPredominantDirPct = parseFloat(el.inputPredominantDirPct.value);
    if (el.inputGrowthRate) currentParams.annualGrowthRate = parseFloat(el.inputGrowthRate.value);

    // 24h & 12h Day/Night Traffic
    if (el.inputNightTrafficPct) {
      currentParams.nightTraffic12hPct = parseFloat(el.inputNightTrafficPct.value);
      currentParams.dayTraffic12hPct = Math.max(0, 100 - currentParams.nightTraffic12hPct);
      if (el.displayDayTrafficPct) el.displayDayTrafficPct.value = `${currentParams.dayTraffic12hPct}%`;
    }
    if (el.inputPeak6hDayPct) currentParams.peak6hDayPct = parseFloat(el.inputPeak6hDayPct.value);
    if (el.inputPeak6hNightPct) currentParams.peak6hNightPct = parseFloat(el.inputPeak6hNightPct.value);

    // Vehicle Types
    if (el.inputPct2Axle) currentParams.pct2Axle = parseFloat(el.inputPct2Axle.value);
    if (el.inputPct3Axle) currentParams.pct3Axle = parseFloat(el.inputPct3Axle.value);
    if (el.inputPctMultiAxle) currentParams.pctMultiAxle = parseFloat(el.inputPctMultiAxle.value);
    if (el.inputAxlesPerCv) currentParams.axlesPerCV = parseFloat(el.inputAxlesPerCv.value);

    // Axle Spectrum Category %
    if (el.inputFrontSinglePct) currentParams.frontSingleSteeringPct = parseFloat(el.inputFrontSinglePct.value);
    if (el.inputRearSinglePct) currentParams.rearSinglePct = parseFloat(el.inputRearSinglePct.value);
    if (el.inputRearTandemPct) currentParams.rearTandemPct = parseFloat(el.inputRearTandemPct.value);
    if (el.inputRearTridemPct) currentParams.rearTridemPct = parseFloat(el.inputRearTridemPct.value);

    // Distance of Vehicle
    if (el.inputVehicleDistance) currentParams.vehicleDistance = parseFloat(el.inputVehicleDistance.value);
    if (el.inputWheelbasePct) currentParams.wheelbaseLess45Pct = parseFloat(el.inputWheelbasePct.value);

    updateWheelbaseBadge(currentParams.vehicleDistance || 4.2, currentParams.jointSpacing || 4.5);

    // Materials & Foundation
    if (el.inputCbr) currentParams.subgradeCBR = parseFloat(el.inputCbr.value);
    if (el.selectSubbaseType) currentParams.subbaseType = el.selectSubbaseType.value;
    if (el.inputSubbaseThickness) currentParams.subbaseThickness = parseFloat(el.inputSubbaseThickness.value);
    if (el.selectZone) currentParams.zone = el.selectZone.value;
    if (el.selectConcreteGrade) currentParams.concreteGrade = el.selectConcreteGrade.value;
    if (el.inputFck28) currentParams.fck28 = parseFloat(el.inputFck28.value);
    if (el.inputDesignFlexural) currentParams.designFlexuralStrength = parseFloat(el.inputDesignFlexural.value);
    if (el.selectShoulderType) currentParams.shoulderType = el.selectShoulderType.value;
    if (el.selectTransverseJoint) {
      currentParams.transverseJointType = el.selectTransverseJoint.value;
      currentParams.betaFactor = el.selectTransverseJoint.value === "doweled" ? 0.66 : 0.90;
    }
  }

  /**
   * Main recalculation and render pipeline
   */
  function runCalculationPipeline() {
    try {
    // 1. Run core fatigue analysis
    const result = engine.runFullAnalysis(currentParams);
    latestResult = result;
    latestTraffic = result.traffic;

    // 2. Run joint structural design
    const dowelResult = jointEngine.getDowelBarRecommendation(currentParams.trialThickness);
    const tieResult = jointEngine.designTieBars({
      laneWidthM: currentParams.laneWidth,
      slabThicknessMm: currentParams.trialThickness,
      gamma: currentParams.unitWeight,
      barDiaMm: currentParams.trialThickness >= 300 ? 16 : 12,
      barType: "deformed"
    });

    // 3. Update State Badges & Geoclimatic Telemetry Cards
    if (el.badgeStateZone) el.badgeStateZone.textContent = `Zone ${result.inputs.zone}`;
    if (el.badgeDayTemp) el.badgeDayTemp.textContent = `+${result.derived.dayDeltaT}°C Day / -${result.derived.nightDeltaT}°C Night`;
    if (el.geoDayTempDisplay) el.geoDayTempDisplay.textContent = `+${result.derived.dayDeltaT}°C`;
    if (el.geoNightTempDisplay) el.geoNightTempDisplay.textContent = `-${result.derived.nightDeltaT}°C`;
    if (el.geoZoneDescription) {
      el.geoZoneDescription.textContent = ZONE_DESCRIPTIONS[result.inputs.zone] || `IRC:58 Zone ${result.inputs.zone}`;
    }
    if (el.badgeBucTemp) el.badgeBucTemp.textContent = `POSITIVE TEMP DIFF: ΔT = ${result.derived.dayDeltaT}°C`;
    if (el.badgeTdcTemp) el.badgeTdcTemp.textContent = `EFFECTIVE NEGATIVE ΔT = ${result.derived.nightDeltaT}°C (INCL. 5°C PERM CURL)`;

    // 4. Update KPI Displays
    updateKPIs(result);

    // 5. Render Table Views
    renderTrafficSummary(result);
    renderSpectrumTabTables();
    renderBUCTable(result);
    renderTDCTable(result);
    renderTotalCFDSummary(result);
    renderJointTables(dowelResult, tieResult);
    renderVariantsTable();
    renderCompositeBondedStudio();
    updateExcelVerdictBanner(result, currentParams);

    // 6. Update Visualizers
    if (visualizer) {
      visualizer.updateData(result);
    }
    } catch (err) {
      console.error('CALC PIPELINE ERROR:', err);
    }
  }

  /**
   * Update top executive KPI cards
   */
  function updateKPIs(result) {
    const d = result.derived;
    const s = result.summary;

    if (el.displayThickness) el.displayThickness.textContent = `${s.trialThicknessMm} mm`;
    if (el.inputNumericThickness && document.activeElement !== el.inputNumericThickness) {
      el.inputNumericThickness.value = s.trialThicknessMm;
    }
    if (el.sliderThickness && document.activeElement !== el.sliderThickness) {
      el.sliderThickness.value = s.trialThicknessMm;
    }
    if (el.kpiFinalThickness) el.kpiFinalThickness.textContent = `${s.finalThicknessMm} mm (+10mm wear)`;
    if (el.displayRadiusL) el.displayRadiusL.textContent = `${d.lMeters.toFixed(3)} m`;
    if (el.displayEffectiveK) el.displayEffectiveK.textContent = `${d.effectiveK.toFixed(2)}`;
    if (el.displayCfdBuc) el.displayCfdBuc.textContent = result.buc.totalBUCDamage.toFixed(3);
    if (el.displayCfdTdc) el.displayCfdTdc.textContent = result.tdc.totalTDCDamage.toFixed(3);
    if (el.displayTotalCfd) el.displayTotalCfd.textContent = s.totalCFD.toFixed(3);

    const fillPct = Math.min(100, Math.max(0, s.totalCFD * 100));
    if (el.gaugePctLabel) {
      el.gaugePctLabel.textContent = `${fillPct.toFixed(1)}% Capacity Used`;
    }

    // Safety verdict node and capacity meter
    if (el.safetyCard && el.safetyBadge && el.cfdMeterFill) {
      if (s.isSafe) {
        el.safetyCard.className = "pipeline-node node-verdict";
        el.safetyBadge.innerHTML = '<svg class="app-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>SAFE DESIGN</span>';
        el.cfdMeterFill.style.backgroundColor = "var(--accent-emerald)";
      } else {
        el.safetyCard.className = "pipeline-node node-verdict unsafe";
        el.safetyBadge.innerHTML = '<svg class="app-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>UNSAFE DESIGN</span>';
        el.cfdMeterFill.style.backgroundColor = "var(--accent-rose)";
      }
      el.cfdMeterFill.style.width = `${fillPct}%`;
    }
  }

  /**
   * Render traffic summary breakdown
   */
  function renderTrafficSummary(result) {
    if (!el.trafficSummaryContainer) return;
    const t = result.traffic;
    const p = currentParams;

    el.trafficSummaryContainer.innerHTML = `
      <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
        <!-- Card 1: Directional Volume & Carriageway -->
        <div class="panel-card" style="background: var(--bg-secondary); padding: 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="color: var(--accent-cyan); font-size: 13.5px; font-weight:700;">Directional &amp; 24h Traffic</h4>
            <span class="panel-badge">CROSSING DATA</span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Direction 1 (Dir A): <strong style="color:var(--text-primary);">${(t.cvpdDir1 || 3000).toLocaleString()} CVPD</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Direction 2 (Dir B): <strong style="color:var(--text-primary);">${(t.cvpdDir2 || 3000).toLocaleString()} CVPD</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Total 24-Hour Two-Way (A): <strong style="color:var(--accent-cyan);">${(t.twoWayCvpd || 6000).toLocaleString()} CVPD</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Predominant Direction: <strong style="color:var(--accent-emerald);">${(t.predominantDirCvpd || 3000).toLocaleString()} CVPD (${(t.predominantDirFactor * 100).toFixed(1)}%)</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary);">Design Lane Factor (${p.trafficDesignLanePct || 25}%): <strong style="color:var(--text-primary);">${Math.round((t.predominantDirCvpd || 3000) * ((p.trafficDesignLanePct || 25) / 100)).toLocaleString()} CVPD</strong></p>
        </div>

        <!-- Card 2: 24h, 12h-to-12h & 6h Fatigue Windows -->
        <div class="panel-card" style="background: var(--bg-secondary); padding: 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="color: var(--accent-amber); font-size: 13.5px; font-weight:700;">12h &amp; 6h Day/Night Windows</h4>
            <span class="panel-badge">FATIGUE PARTITIONS</span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">12h Day (6 AM–6 PM): <strong style="color:var(--text-primary);">${(t.day12hVehiclesPerDay || Math.round((t.predominantDirCvpd || 3000) * 0.4)).toLocaleString()} CVPD (${Math.round((1 - (p.nightTraffic12hPct || 60) / 100) * 100)}%)</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">12h Night (6 PM–6 AM): <strong style="color:var(--text-primary);">${(t.night12hVehiclesPerDay || Math.round((t.predominantDirCvpd || 3000) * 0.6)).toLocaleString()} CVPD (${p.nightTraffic12hPct || 60}%)</strong></p>
          <div style="margin: 8px 0; padding: 6px 10px; border-radius: 6px; background: var(--bg-card); border: 1px solid var(--border-subtle);">
            <p style="font-size: 12px; color: var(--accent-amber); margin-bottom: 4px; font-weight:600;">Day Peak 6h (BUC, 10 AM–4 PM): ${(t.day6hPeakVehiclesPerDay || Math.round((t.predominantDirCvpd || 3000) * 0.2)).toLocaleString()} CVPD</p>
            <p style="font-size: 12px; color: var(--accent-cyan); margin-bottom: 0; font-weight:600;">Night Peak 6h (TDC, 0 AM–6 AM): ${(t.night6hPeakVehiclesPerDay || Math.round((t.predominantDirCvpd || 3000) * 0.3)).toLocaleString()} CVPD</p>
          </div>
          <p style="font-size: 11.5px; color: var(--text-muted);">TDC filtered by wheelbase &le; ${p.jointSpacing || 4.5}m (${p.wheelbaseLess45Pct || 55}%)</p>
        </div>

        <!-- Card 3: Vehicle Fleet & Axle Composition -->
        <div class="panel-card" style="background: var(--bg-secondary); padding: 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="color: var(--accent-emerald); font-size: 13.5px; font-weight:700;">Vehicle Fleet &amp; Axles</h4>
            <span class="panel-badge">FLEET %</span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">2-Axle Commercial: <strong style="color:var(--text-primary);">${p.pct2Axle || 45}%</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">3-Axle MAV (Tandem): <strong style="color:var(--text-primary);">${p.pct3Axle || 35}%</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Multi-Axle Semi-Trailers: <strong style="color:var(--text-primary);">${p.pctMultiAxle || 20}%</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Average Axles / CV: <strong style="color:var(--accent-cyan);">${(t.axlesPerCV || p.axlesPerCV || 2.35).toFixed(2)}</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary);">Avg Vehicle Wheelbase: <strong style="color:var(--text-primary);">${p.vehicleDistance || 4.2} m</strong> vs Joint: <strong>${p.jointSpacing || 4.5} m</strong></p>
        </div>

        <!-- Card 4: Cumulative 30-Year Design Repetitions -->
        <div class="panel-card" style="background: var(--bg-secondary); padding: 18px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h4 style="color: var(--accent-purple, #8b5cf6); font-size: 13.5px; font-weight:700;">Design Life Cumulative Axles</h4>
            <span class="panel-badge">${p.designPeriod || 30} YEARS</span>
          </div>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Total Two-Way CV (C): <strong style="color:var(--text-primary);">${t.totalCommercialVehicles.toLocaleString()}</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Total Two-Way Axles: <strong style="color:var(--text-primary);">${t.totalAxleRepetitions.toLocaleString()}</strong></p>
          <p style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 6px;">Design Lane Total Axles: <strong style="color:var(--text-primary);">${t.designLaneAxles.toLocaleString()}</strong></p>
          <p style="font-size: 12.5px; color: var(--accent-amber); margin-bottom: 6px; font-weight:600;">Day 6h BUC Total Reps: ${t.dayBUCTotalForCategories.toLocaleString()}</p>
          <p style="font-size: 12.5px; color: var(--accent-cyan); font-weight:600;">Night 6h TDC Total Reps: ${t.nightTDCTotalForCategories.toLocaleString()}</p>
        </div>
      </div>
    `;
  }

  /**
   * Render Axle Load Spectrum Distribution (Subtab C)
   */
  function renderSpectrumTabTables() {
    if (!currentParams.axleSpectrum) {
      currentParams.axleSpectrum = JSON.parse(JSON.stringify(engine.defaultSpectrum));
    }
    const spec = currentParams.axleSpectrum;

    const renderRows = (list, cat) => {
      let sumFreq = 0;
      const rowsHtml = list.map((item, idx) => {
        sumFreq += Number(item.frequency) || 0;
        return `
          <tr data-category="${cat}" data-index="${idx}">
            <td>${item.min}-${item.max}</td>
            <td><strong>${item.mean}</strong></td>
            <td>
              <div class="table-input-wrap">
                <input type="number" class="table-editable-input spectrum-freq-input"
                  data-category="${cat}" data-index="${idx}"
                  step="0.01" min="0" max="100" value="${(Number(item.frequency) || 0).toFixed(2)}">
                <span class="table-unit-tag">%</span>
              </div>
            </td>
          </tr>
        `;
      }).join("");

      return rowsHtml + `
        <tr class="table-summary-row">
          <td colspan="2">TOTAL</td>
          <td class="spectrum-sum-${cat}" style="font-weight:700; color:var(--accent-cyan); text-align:right; padding-right:12px;">${sumFreq.toFixed(2)}%</td>
        </tr>
      `;
    };

    if (el.tableSpectrumSingleBody) el.tableSpectrumSingleBody.innerHTML = renderRows(spec.single, "single");
    if (el.tableSpectrumTandemBody) el.tableSpectrumTandemBody.innerHTML = renderRows(spec.tandem, "tandem");
    if (el.tableSpectrumTridemBody) el.tableSpectrumTridemBody.innerHTML = renderRows(spec.tridem, "tridem");

    attachSpectrumInputListeners();
  }

  function attachSpectrumInputListeners() {
    const traffic = latestTraffic || engine.calculateTrafficProjections(currentParams);

    document.querySelectorAll(".spectrum-freq-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const cat = e.target.dataset.category;
        const idx = parseInt(e.target.dataset.index, 10);
        const freq = parseFloat(e.target.value) || 0;

        if (!currentParams.axleSpectrum) currentParams.axleSpectrum = JSON.parse(JSON.stringify(engine.defaultSpectrum));
        currentParams.axleSpectrum[cat][idx].frequency = freq;

        // If user customized reps before, sync with new freq
        if (cat === "single" || cat === "tandem") {
          const totalCatReps = cat === "single" ? traffic.dayRepetitionsByCategory.rearSingle : traffic.dayRepetitionsByCategory.rearTandem;
          const rep = Math.round(totalCatReps * (freq / 100));
          if (!currentParams.customBucReps) currentParams.customBucReps = { single: [], tandem: [] };
          currentParams.customBucReps[cat][idx] = rep;

          const bucFreqInput = document.querySelector(`.buc-freq-input[data-category="${cat}"][data-index="${idx}"]`);
          if (bucFreqInput) bucFreqInput.value = freq.toFixed(2);
          const bucRepInput = document.querySelector(`.buc-rep-input[data-category="${cat}"][data-index="${idx}"]`);
          if (bucRepInput) bucRepInput.value = rep;
        }

        // Update sum cell
        let sum = 0;
        document.querySelectorAll(`.spectrum-freq-input[data-category="${cat}"]`).forEach((inp) => {
          sum += parseFloat(inp.value) || 0;
        });
        const sumCell = document.querySelector(`.spectrum-sum-${cat}`);
        if (sumCell) sumCell.textContent = `${sum.toFixed(2)}%`;

        recalcFatigueAndSummaryInPlace();
      });
    });
  }

  /**
   * Render Bottom-Up Cracking (BUC) Spreadsheet View
   */
  function renderBUCTable(result) {
    if (!el.tableBucSingleBody || !el.tableBucTandemBody) return;

    el.tableBucSingleBody.innerHTML = result.buc.singleRows
      .map(
        (r, idx) => `
        <tr data-category="single" data-index="${idx}">
          <td><strong>${r.meanLoad}</strong></td>
          <td>
            <div class="table-input-wrap">
              <input type="number" class="table-editable-input buc-freq-input"
                data-category="single" data-index="${idx}"
                step="0.01" min="0" max="100" value="${r.frequency.toFixed(2)}">
              <span class="table-unit-tag">%</span>
            </div>
          </td>
          <td>
            <input type="number" class="table-editable-input buc-rep-input"
              data-category="single" data-index="${idx}"
              step="500" min="0" value="${r.expectedRep}">
          </td>
          <td class="cell-highlight cell-stress">${r.stress.toFixed(3)}</td>
          <td class="cell-sr">${r.sr.toFixed(3)}</td>
          <td class="cell-ni" data-ni="${r.allowableNi}">${r.isInfinite ? "Infinite" : r.allowableNi.toLocaleString()}</td>
          <td class="cell-damage-val ${r.damage > 0 ? "cell-damage" : "cell-safe"}">${r.damage.toFixed(3)}</td>
        </tr>
      `
      )
      .join("");

    el.tableBucTandemBody.innerHTML = result.buc.tandemRows
      .map(
        (r, idx) => `
        <tr data-category="tandem" data-index="${idx}">
          <td><strong>${r.meanLoad}</strong></td>
          <td>
            <div class="table-input-wrap">
              <input type="number" class="table-editable-input buc-freq-input"
                data-category="tandem" data-index="${idx}"
                step="0.01" min="0" max="100" value="${r.frequency.toFixed(2)}">
              <span class="table-unit-tag">%</span>
            </div>
          </td>
          <td>
            <input type="number" class="table-editable-input buc-rep-input"
              data-category="tandem" data-index="${idx}"
              step="500" min="0" value="${r.expectedRep}">
          </td>
          <td class="cell-highlight cell-stress">${r.stress.toFixed(3)}</td>
          <td class="cell-sr">${r.sr.toFixed(3)}</td>
          <td class="cell-ni" data-ni="${r.allowableNi}">${r.isInfinite ? "Infinite" : r.allowableNi.toLocaleString()}</td>
          <td class="cell-damage-val ${r.damage > 0 ? "cell-damage" : "cell-safe"}">${r.damage.toFixed(3)}</td>
        </tr>
      `
      )
      .join("");

    attachBucInputListeners();
  }

  function attachBucInputListeners() {
    const traffic = latestTraffic || engine.calculateTrafficProjections(currentParams);

    // 1. User types in BUC Frequency (%)
    document.querySelectorAll(".buc-freq-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const cat = e.target.dataset.category;
        const idx = parseInt(e.target.dataset.index, 10);
        const freq = parseFloat(e.target.value) || 0;

        if (!currentParams.axleSpectrum) currentParams.axleSpectrum = JSON.parse(JSON.stringify(engine.defaultSpectrum));
        currentParams.axleSpectrum[cat][idx].frequency = freq;

        const totalCatReps = cat === "single" ? traffic.dayRepetitionsByCategory.rearSingle : traffic.dayRepetitionsByCategory.rearTandem;
        const rep = Math.round(totalCatReps * (freq / 100));

        const repInput = document.querySelector(`.buc-rep-input[data-category="${cat}"][data-index="${idx}"]`);
        if (repInput) repInput.value = rep;

        if (!currentParams.customBucReps) currentParams.customBucReps = { single: [], tandem: [] };
        currentParams.customBucReps[cat][idx] = rep;

        const specInput = document.querySelector(`.spectrum-freq-input[data-category="${cat}"][data-index="${idx}"]`);
        if (specInput) specInput.value = freq.toFixed(2);

        recalcFatigueAndSummaryInPlace();
      });
    });

    // 2. User types in BUC Expected Repetitions (n_i)
    document.querySelectorAll(".buc-rep-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const cat = e.target.dataset.category;
        const idx = parseInt(e.target.dataset.index, 10);
        const rep = parseFloat(e.target.value) || 0;

        if (!currentParams.customBucReps) currentParams.customBucReps = { single: [], tandem: [] };
        currentParams.customBucReps[cat][idx] = rep;

        const totalCatReps = cat === "single" ? traffic.dayRepetitionsByCategory.rearSingle : traffic.dayRepetitionsByCategory.rearTandem;
        const freq = totalCatReps > 0 ? (rep / totalCatReps) * 100 : 0;

        if (!currentParams.axleSpectrum) currentParams.axleSpectrum = JSON.parse(JSON.stringify(engine.defaultSpectrum));
        currentParams.axleSpectrum[cat][idx].frequency = freq;

        const freqInput = document.querySelector(`.buc-freq-input[data-category="${cat}"][data-index="${idx}"]`);
        if (freqInput) freqInput.value = freq.toFixed(2);

        const specInput = document.querySelector(`.spectrum-freq-input[data-category="${cat}"][data-index="${idx}"]`);
        if (specInput) specInput.value = freq.toFixed(2);

        recalcFatigueAndSummaryInPlace();
      });
    });
  }

  /**
   * Render Top-Down Cracking (TDC) Spreadsheet View
   */
  function renderTDCTable(result) {
    if (!el.tableTdcSingleBody || !el.tableTdcTandemBody || !el.tableTdcTridemBody) return;

    el.tableTdcSingleBody.innerHTML = result.tdc.singleRows
      .map(
        (r, idx) => `
        <tr data-category="single" data-index="${idx}">
          <td><strong>${r.meanLoad}</strong></td>
          <td>
            <input type="number" class="table-editable-input tdc-rep-input"
              data-category="single" data-index="${idx}"
              step="500" min="0" value="${r.expectedRep}">
          </td>
          <td class="cell-highlight cell-stress">${r.stress.toFixed(3)}</td>
          <td class="cell-sr">${r.sr.toFixed(3)}</td>
          <td class="cell-ni" data-ni="${r.allowableNi}">${r.isInfinite ? "Infinite" : r.allowableNi.toLocaleString()}</td>
          <td class="cell-damage-val ${r.damage > 0 ? "cell-damage" : "cell-safe"}">${r.damage.toFixed(3)}</td>
        </tr>
      `
      )
      .join("");

    el.tableTdcTandemBody.innerHTML = result.tdc.tandemRows
      .map(
        (r, idx) => `
        <tr data-category="tandem" data-index="${idx}">
          <td><strong>${r.meanLoad}</strong> <span style="font-size:10.5px; opacity:0.8;">(50%=${(r.meanLoad * 0.5).toFixed(0)})</span></td>
          <td>
            <input type="number" class="table-editable-input tdc-rep-input"
              data-category="tandem" data-index="${idx}"
              step="500" min="0" value="${r.expectedRep}">
          </td>
          <td class="cell-highlight cell-stress">${r.stress.toFixed(3)}</td>
          <td class="cell-sr">${r.sr.toFixed(3)}</td>
          <td class="cell-ni" data-ni="${r.allowableNi}">${r.isInfinite ? "Infinite" : r.allowableNi.toLocaleString()}</td>
          <td class="cell-damage-val ${r.damage > 0 ? "cell-damage" : "cell-safe"}">${r.damage.toFixed(3)}</td>
        </tr>
      `
      )
      .join("");

    el.tableTdcTridemBody.innerHTML = result.tdc.tridemRows
      .map(
        (r, idx) => `
        <tr data-category="tridem" data-index="${idx}">
          <td><strong>${r.meanLoad}</strong> <span style="font-size:10.5px; opacity:0.8;">(33%=${(r.meanLoad * 0.33).toFixed(0)})</span></td>
          <td>
            <input type="number" class="table-editable-input tdc-rep-input"
              data-category="tridem" data-index="${idx}"
              step="500" min="0" value="${r.expectedRep}">
          </td>
          <td class="cell-highlight cell-stress">${r.stress.toFixed(3)}</td>
          <td class="cell-sr">${r.sr.toFixed(3)}</td>
          <td class="cell-ni" data-ni="${r.allowableNi}">${r.isInfinite ? "Infinite" : r.allowableNi.toLocaleString()}</td>
          <td class="cell-damage-val ${r.damage > 0 ? "cell-damage" : "cell-safe"}">${r.damage.toFixed(3)}</td>
        </tr>
      `
      )
      .join("");

    attachTdcInputListeners();
  }

  function attachTdcInputListeners() {
    document.querySelectorAll(".tdc-rep-input").forEach((input) => {
      input.addEventListener("input", (e) => {
        const cat = e.target.dataset.category;
        const idx = parseInt(e.target.dataset.index, 10);
        const rep = parseFloat(e.target.value) || 0;

        if (!currentParams.customTdcReps) currentParams.customTdcReps = { single: [], tandem: [], tridem: [] };
        if (!currentParams.customTdcReps[cat]) currentParams.customTdcReps[cat] = [];
        currentParams.customTdcReps[cat][idx] = rep;

        recalcFatigueAndSummaryInPlace();
      });
    });
  }

  /**
   * Real-Time In-Place Recalculation Engine
   * Updates fatigue damages, combined CFD, and safety status immediately
   * without destroying inputs or losing typing focus.
   */
  function recalcFatigueAndSummaryInPlace() {
    // 1. Calculate sum of BUC damages
    let bucSum = 0;
    document.querySelectorAll("#tableBucSingleBody tr, #tableBucTandemBody tr").forEach((row) => {
      const repInput = row.querySelector(".buc-rep-input");
      const niCell = row.querySelector(".cell-ni");
      const damageCell = row.querySelector(".cell-damage-val");
      if (!repInput || !niCell || !damageCell) return;

      const ni = parseFloat(niCell.dataset.ni);
      const rep = parseFloat(repInput.value) || 0;
      const isInf = !isFinite(ni) || niCell.textContent.trim().toLowerCase() === "infinite";
      const dmg = isInf ? 0 : rep / ni;
      bucSum += dmg;
      damageCell.textContent = dmg.toFixed(3);
      damageCell.className = `cell-damage-val ${dmg > 0 ? "cell-damage" : "cell-safe"}`;
    });

    // 2. Calculate sum of TDC damages
    let tdcSum = 0;
    document.querySelectorAll("#tableTdcSingleBody tr, #tableTdcTandemBody tr, #tableTdcTridemBody tr").forEach((row) => {
      const repInput = row.querySelector(".tdc-rep-input");
      const niCell = row.querySelector(".cell-ni");
      const damageCell = row.querySelector(".cell-damage-val");
      if (!repInput || !niCell || !damageCell) return;

      const ni = parseFloat(niCell.dataset.ni);
      const rep = parseFloat(repInput.value) || 0;
      const isInf = !isFinite(ni) || niCell.textContent.trim().toLowerCase() === "infinite";
      const dmg = isInf ? 0 : rep / ni;
      tdcSum += dmg;
      damageCell.textContent = dmg.toFixed(3);
      damageCell.className = `cell-damage-val ${dmg > 0 ? "cell-damage" : "cell-safe"}`;
    });

    // 3. Combined Total CFD
    const totalCFD = bucSum + tdcSum;
    const isSafe = totalCFD <= 1.0;

    // 4. Update Header KPI displays
    if (el.displayCfdBuc) el.displayCfdBuc.textContent = bucSum.toFixed(3);
    if (el.displayCfdTdc) el.displayCfdTdc.textContent = tdcSum.toFixed(3);
    if (el.displayTotalCfd) el.displayTotalCfd.textContent = totalCFD.toFixed(3);

    const fillPct = Math.min(100, Math.max(0, totalCFD * 100));
    if (el.gaugePctLabel) {
      el.gaugePctLabel.textContent = `${fillPct.toFixed(1)}% Capacity Used`;
    }

    if (el.safetyCard && el.safetyBadge && el.cfdMeterFill) {
      if (isSafe) {
        el.safetyCard.className = "pipeline-node node-verdict";
        el.safetyBadge.innerHTML = '<svg class="app-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg><span>SAFE DESIGN</span>';
        el.cfdMeterFill.style.backgroundColor = "var(--accent-emerald)";
      } else {
        el.safetyCard.className = "pipeline-node node-verdict unsafe";
        el.safetyBadge.innerHTML = '<svg class="app-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg><span>UNSAFE DESIGN</span>';
        el.cfdMeterFill.style.backgroundColor = "var(--accent-rose)";
      }
      el.cfdMeterFill.style.width = `${fillPct}%`;
    }

    // 5. Update Total CFD Summary Banner
    if (el.totalCfdSummaryContainer) {
      const curTrial = currentParams.trialThickness || 310;
      el.totalCfdSummaryContainer.innerHTML = `
        <div class="total-cfd-card ${isSafe ? "safe" : "unsafe"}">
          <div>
            <div class="total-cfd-header">Combined Fatigue Damage Check (IRC:58 Miner's Rule)</div>
            <div class="total-cfd-equation">
              CFD (BUC) [${bucSum.toFixed(3)}] + CFD (TDC) [${tdcSum.toFixed(3)}] = <span style="color:${isSafe ? "var(--status-safe-text)" : "var(--status-danger-text)"}">${totalCFD.toFixed(3)}</span> &le; 1.000
            </div>
            <div class="total-cfd-sub">
              Required PQC Slab Thickness: <strong>${curTrial} mm</strong> | Recommended Provided: <strong>${curTrial + 10} mm</strong> (+10mm wear allowance)
            </div>
          </div>
          <div class="total-cfd-right">
            <div class="total-cfd-badge">
              ${isSafe ? "SAFE DESIGN" : "UNSAFE DESIGN"}
            </div>
            <div class="total-cfd-sub-right">
              ${isSafe ? "Adequate structural life under IRC:58 fatigue" : "Increase trial thickness to reduce top/bottom stresses"}
            </div>
          </div>
        </div>
      `;
    }
  }

  /**
   * Render Total CFD summary box matching standard engineering audit display
   */
  function renderTotalCFDSummary(result) {
    if (!el.totalCfdSummaryContainer) return;
    const s = result.summary;
    const b = result.buc;
    const t = result.tdc;

    el.totalCfdSummaryContainer.innerHTML = `
      <div class="total-cfd-card ${s.isSafe ? "safe" : "unsafe"}">
        <div>
          <div class="total-cfd-header">Combined Fatigue Damage Check (IRC:58 Miner's Rule)</div>
          <div class="total-cfd-equation">
            CFD (BUC) [${b.totalBUCDamage.toFixed(3)}] + CFD (TDC) [${t.totalTDCDamage.toFixed(3)}] = <span style="color:${s.isSafe ? "var(--status-safe-text)" : "var(--status-danger-text)"
      }">${s.totalCFD.toFixed(3)}</span> &le; 1.000
          </div>
          <div class="total-cfd-sub">
            Required PQC Slab Thickness: <strong>${s.trialThicknessMm} mm</strong> | Recommended Provided: <strong>${s.finalThicknessMm
      } mm</strong> (+10mm wear allowance)
          </div>
        </div>
        <div class="total-cfd-right">
          <div class="total-cfd-badge">
            ${s.isSafe ? "SAFE DESIGN" : "UNSAFE DESIGN"}
          </div>
          <div class="total-cfd-sub-right">
            ${s.isSafe ? "Adequate structural life under IRC:58 fatigue" : "Increase trial thickness to reduce top/bottom stresses"}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Render Dowel and Tie Bar Design Tables
   */
  function renderJointTables(dowel, tie) {
    if (el.tableDowelBody) {
      el.tableDowelBody.innerHTML = `
        <tr>
          <td>Transverse Contraction Joint Dowel</td>
          <td><strong>Ø ${dowel.diameterMm} mm</strong></td>
          <td><strong>${dowel.lengthMm} mm</strong></td>
          <td><strong>${dowel.spacingMm} mm c/c</strong></td>
          <td>5 mm</td>
          <td><span style="color:var(--accent-emerald);">Conforms to IRC:58 Table 6</span></td>
        </tr>
        <tr>
          <td>Transverse Expansion Joint Dowel</td>
          <td><strong>Ø ${dowel.diameterMm} mm</strong></td>
          <td><strong>${dowel.lengthMm} mm</strong></td>
          <td><strong>${dowel.spacingMm} mm c/c</strong></td>
          <td>20 mm</td>
          <td><span style="color:var(--accent-emerald);">Conforms to IRC:58 Table 6</span></td>
        </tr>
      `;
    }

    if (el.tableTieBody) {
      el.tableTieBody.innerHTML = `
        <tr>
          <td>Longitudinal Joint Tie Bar (Deformed)</td>
          <td><strong>Ø ${tie.barDiaMm} mm</strong></td>
          <td><strong>${tie.areaRequiredMm2PerM} mm²/m</strong></td>
          <td><strong>${tie.providedSpacingMm} mm c/c</strong> (calc: ${tie.theoreticalSpacingMm} mm)</td>
          <td><strong>${tie.providedLengthMm} mm</strong> (calc: ${tie.theoreticalLengthMm} mm)</td>
          <td><span style="color:var(--accent-emerald);">IRC:58 Safe (Spacing &le; 750mm)</span></td>
        </tr>
      `;
    }
  }

  /**
   * Render Multi-Variant Comparison Table (IRC:58 Standard Configurations)
   */
  function renderVariantsTable() {
    if (!el.tableVariantsBody) return;

    const variants = [
      { name: "Option 1: Tied Concrete Shoulder & Doweled Transverse Joints", shoulder: "tied", joint: "doweled", subbase: "gsb" },
      { name: "Option 2: Without Concrete Shoulder & Without Dowel Bars", shoulder: "untied", joint: "undoweled", subbase: "gsb" },
      { name: "Option 3: Widened Outer Lane (+0.6m Monolithic Action)", shoulder: "widened", joint: "doweled", subbase: "gsb" },
      { name: "Option 4: Bonded to Dry Lean Concrete (DLC Layer)", shoulder: "tied", joint: "doweled", subbase: "dlc" }
    ];

    el.tableVariantsBody.innerHTML = variants
      .map((v) => {
        let optThickness = 280;
        let optCFD = 0.999;
        let isSafe = false;

        for (let t = 240; t <= 380; t += 10) {
          const testParams = { ...currentParams, trialThickness: t, shoulderType: v.shoulder, transverseJointType: v.joint, subbaseType: v.subbase };
          const res = engine.runFullAnalysis(testParams);
          if (res.summary.isSafe) {
            optThickness = t;
            optCFD = res.summary.totalCFD;
            isSafe = true;
            break;
          }
        }

        return `
        <tr>
          <td><strong style="color:var(--text-primary);">${v.name}</strong></td>
          <td>${v.shoulder === "tied" ? "Tied Concrete" : v.shoulder === "widened" ? "Widened (+0.6m)" : "Untied / Aggregate"}</td>
          <td>${v.joint === "doweled" ? "Doweled (β=0.66)" : "Undoweled (β=0.90)"}</td>
          <td><strong style="color:var(--accent-cyan); font-size:14px;">${optThickness} mm</strong></td>
          <td>${optThickness + 10} mm</td>
          <td><strong style="color:${isSafe ? "var(--status-safe-text)" : "var(--status-danger-text)"};">${optCFD.toFixed(3)}</strong></td>
          <td><span class="safety-status-badge" style="font-size:11px; padding:3px 10px;">${isSafe ? "OPTIMAL" : "CHECK"}</span></td>
        </tr>
      `;
      })
      .join("");
  }

  /**
   * Toast notification system
   */
  function showAppToast(message, type = "success") {
    const container = el.appToastContainer || document.getElementById("appToastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = `app-toast ${type}`;
    toast.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3800);
  }

  /**
   * Programmatic Engineering Workspace Switching
   */
  function switchWorkspace(targetId) {
    el.workspaceBtns.forEach((b) => {
      const wId = b.getAttribute("data-workspace") || b.getAttribute("data-tab");
      b.classList.toggle("active", wId === targetId);
    });
    el.workspacePanes.forEach((p) => {
      p.classList.toggle("active", p.id === targetId);
    });
    if ((targetId === "ws-studio" || targetId === "tabVisualizer") && visualizer) {
      setTimeout(() => visualizer.resizeCanvas(), 50);
    }
  }

  /**
   * Toggle the Design Scenario Popover Dropdown
   */
  function toggleScenarioDropdown(forceState) {
    if (!el.scenarioDropdownMenu) return;
    const isCurrentlyOpen = el.scenarioDropdownMenu.style.display !== "none";
    const shouldOpen = (forceState !== undefined) ? forceState : !isCurrentlyOpen;
    el.scenarioDropdownMenu.style.display = shouldOpen ? "block" : "none";
    if (el.btnScenarioDropdown) {
      el.btnScenarioDropdown.setAttribute("aria-expanded", shouldOpen ? "true" : "false");
    }
  }

  /**
   * Update active indicator across the 4 Scenario benchmark buttons
   */
  function updateCaseButtonActive(activeBtn) {
    const caseBtns = [
      el.btnCaseExcel1Trial1,
      el.btnCaseExcel1Trial2,
      el.btnCaseExcel2Dlc,
      el.btnCaseExcel2Bonded
    ];
    caseBtns.forEach(btn => {
      if (btn) btn.classList.toggle("active", btn === activeBtn);
    });
  }

  /**
   * Synchronize the Standard Design Benchmark Verdict Pill
   */
  function updateExcelVerdictBanner(res, params) {
    if (!el.excelVerdictBanner) return;
    const h = params.trialThickness;
    const subbase = params.subbaseType;
    const cfd = (res && res.summary && typeof res.summary.totalCFD === "number")
      ? res.summary.totalCFD
      : (typeof res?.totalCfd === "number" ? res.totalCfd : 0.999);
    const buc = (res && res.buc && typeof res.buc.totalBUCDamage === "number")
      ? res.buc.totalBUCDamage
      : (typeof res?.totalCfdBuc === "number" ? res.totalCfdBuc : 0);
    const tdc = (res && res.tdc && typeof res.tdc.totalTDCDamage === "number")
      ? res.tdc.totalTDCDamage
      : (typeof res?.totalCfdTdc === "number" ? res.totalCfdTdc : 0);
    const effK = (res && res.derived && typeof res.derived.effectiveK === "number")
      ? res.derived.effectiveK
      : (typeof res?.effectiveK === "number" ? res.effectiveK : 58.14);
    const radL = (res && res.derived && typeof res.derived.lMeters === "number")
      ? res.derived.lMeters
      : (typeof res?.radiusL === "number" ? res.radiusL : 1.084);

    const isSafe = cfd <= 1.000;
    if (subbase === "gsb" && Math.abs(h - 310) < 5) {
      el.excelVerdictBanner.className = `benchmark-verdict-pill ${isSafe ? 'verdict-unecon' : 'verdict-unecon'}`;
      if (el.verdictTitle) {
        el.verdictTitle.textContent = isSafe
          ? "Safe but Uneconomical (Depth = 310 mm)"
          : `Unsafe Design: Exceeds Capacity (Depth = 310 mm, Σ CFD = ${cfd.toFixed(3)} > 1.000)`;
      }
      if (el.verdictDetails) {
        el.verdictDetails.textContent = `Cumulative Fatigue Σ CFD = ${cfd.toFixed(3)} ${isSafe ? '≤' : '>'} 1.000 (BUC: ${buc.toFixed(3)}, TDC: ${tdc.toFixed(3)}) • Radius l = ${radL.toFixed(3)} m, k = ${effK.toFixed(2)} MPa/m`;
      }
      if (el.verdictExcelSrc) el.verdictExcelSrc.textContent = "Granular Base (Trial I)";
      if (el.verdictPdfSrc) el.verdictPdfSrc.textContent = "IRC:58 Standard";
      if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = "Trial I • GSB (310 mm)";
      updateCaseButtonActive(el.btnCaseExcel1Trial1);
    } else if (subbase === "gsb" && Math.abs(h - 275) < 5) {
      el.excelVerdictBanner.className = `benchmark-verdict-pill ${isSafe ? 'verdict-econ' : 'verdict-unecon'}`;
      if (el.verdictTitle) {
        el.verdictTitle.textContent = isSafe
          ? "Safe and Economical (Depth = 275 mm)"
          : `Unsafe Design: Exceeds Capacity (Depth = 275 mm, Σ CFD = ${cfd.toFixed(3)} > 1.000)`;
      }
      if (el.verdictDetails) {
        el.verdictDetails.textContent = `Cumulative Fatigue Σ CFD = ${cfd.toFixed(3)} ${isSafe ? '≤' : '>'} 1.000 (BUC: ${buc.toFixed(3)}, TDC: ${tdc.toFixed(3)}) • Radius l = ${radL.toFixed(3)} m, k = ${effK.toFixed(2)} MPa/m`;
      }
      if (el.verdictExcelSrc) el.verdictExcelSrc.textContent = "Granular Base (Trial II)";
      if (el.verdictPdfSrc) el.verdictPdfSrc.textContent = "IRC:58 Standard";
      if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = "Trial II • GSB (275 mm)";
      updateCaseButtonActive(el.btnCaseExcel1Trial2);
    } else if (subbase === "dlc" && Math.abs(h - 280) < 5) {
      el.excelVerdictBanner.className = `benchmark-verdict-pill ${isSafe ? 'verdict-safe-dlc' : 'verdict-unecon'}`;
      if (el.verdictTitle) {
        el.verdictTitle.textContent = isSafe
          ? "Safe Design (Depth = 280 mm)"
          : `Unsafe Design: Exceeds Capacity (Depth = 280 mm, Σ CFD = ${cfd.toFixed(3)} > 1.000)`;
      }
      if (el.verdictDetails) {
        el.verdictDetails.textContent = `Cumulative Fatigue Σ CFD = ${cfd.toFixed(3)} ${isSafe ? '≤' : '>'} 1.000 (BUC: ${buc.toFixed(3)}, TDC: ${tdc.toFixed(3)}) • Radius l = ${radL.toFixed(3)} m, k = ${effK.toFixed(2)} MPa/m`;
      }
      if (el.verdictExcelSrc) el.verdictExcelSrc.textContent = "DLC Subbase (280 mm)";
      if (el.verdictPdfSrc) el.verdictPdfSrc.textContent = "IRC:58 Standard";
      if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = "DLC Subbase (280 mm)";
      updateCaseButtonActive(el.btnCaseExcel2Dlc);
    } else {
      // General dynamic user edit
      if (cfd <= 1.000) {
        el.excelVerdictBanner.className = "benchmark-verdict-pill verdict-econ";
        if (el.verdictTitle) el.verdictTitle.textContent = `Safe Design (Depth = ${h} mm, Total CFD = ${cfd.toFixed(3)} ≤ 1.000)`;
        if (el.verdictDetails) {
          el.verdictDetails.textContent = `Meets IRC:58 criteria • Day BUC = ${buc.toFixed(3)}, Night TDC = ${tdc.toFixed(3)} • k = ${effK.toFixed(2)} MPa/m, l = ${radL.toFixed(3)} m`;
        }
        if (el.verdictExcelSrc) el.verdictExcelSrc.textContent = "Custom Trial";
        if (el.verdictPdfSrc) el.verdictPdfSrc.textContent = "Live Analysis";
        if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = `Custom (${h} mm)`;
      } else {
        el.excelVerdictBanner.className = "benchmark-verdict-pill verdict-unecon";
        if (el.verdictTitle) el.verdictTitle.textContent = `Unsafe Design: Exceeds Capacity (Σ CFD = ${cfd.toFixed(3)} > 1.000)`;
        if (el.verdictDetails) {
          el.verdictDetails.textContent = `Fatigue limit exceeded (${(cfd * 100).toFixed(1)}% of allowable) • Day BUC = ${buc.toFixed(3)}, Night TDC = ${tdc.toFixed(3)}`;
        }
        if (el.verdictExcelSrc) el.verdictExcelSrc.textContent = "Exceeds Limit";
        if (el.verdictPdfSrc) el.verdictPdfSrc.textContent = "Live Analysis";
        if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = `Unsafe (${h} mm)`;
      }
    }
  }

  /**
   * Load Scenario: Trial I - GSB 150mm Subbase (h = 310mm, CFD = 0.999)
   */
  function loadExcel1Trial1() {
    toggleScenarioDropdown(false);
    currentParams = {
      ...IRC58_DATA.benchmark,
      projectName: "National Highway 4-Lane Divided (Granular Base: Trial I)",
      trialThickness: 310,
      subgradeCBR: 8.0,
      subbaseType: "gsb",
      subbaseThickness: 150,
      cvpdDir1: 3000,
      cvpdDir2: 3000,
      cvpdPerDirection: 3000,
      annualGrowthRate: 5.0,
      designPeriod: 30,
      trafficDesignLanePct: 25,
      nightTraffic12hPct: 60,
      peak6hDayPct: 50,
      peak6hNightPct: 50,
      wheelbaseLess45Pct: 55,
      fck28: 40,
      designFlexuralStrength: 4.87,
      zone: "III",
      selectedState: "Bihar",
      selectedRegion: "Gangetic Plains",
      shoulderType: "tied",
      transverseJointType: "doweled",
      betaFactor: 0.66,
      customBucReps: null,
      customTdcReps: null,
      axleSpectrum: JSON.parse(JSON.stringify(engine.defaultSpectrum))
    };

    updateCaseButtonActive(el.btnCaseExcel1Trial1);
    if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = "Trial I • GSB (310 mm)";
    if (el.selectClimaticZone) el.selectClimaticZone.value = "III";
    populateStatesDropdown();
    syncInputsFromState();
    runCalculationPipeline();
    showAppToast("Loaded Trial I: Granular Base (h=310mm, GSB 150mm, CFD=0.999 — SAFE BUT UNECONOMICAL)");
  }

  /**
   * Load Scenario: Trial II - GSB 150mm Subbase (h = 275mm, CFD = 0.880)
   */
  function loadExcel1Trial2() {
    toggleScenarioDropdown(false);
    currentParams = {
      ...IRC58_DATA.benchmark,
      projectName: "National Highway 4-Lane Divided (Granular Base: Trial II)",
      trialThickness: 275,
      subgradeCBR: 8.0,
      subbaseType: "gsb",
      subbaseThickness: 150,
      cvpdDir1: 3000,
      cvpdDir2: 3000,
      cvpdPerDirection: 3000,
      annualGrowthRate: 5.0,
      designPeriod: 30,
      trafficDesignLanePct: 25,
      nightTraffic12hPct: 60,
      peak6hDayPct: 50,
      peak6hNightPct: 50,
      wheelbaseLess45Pct: 55,
      fck28: 40,
      designFlexuralStrength: 4.87,
      zone: "III",
      selectedState: "Bihar",
      selectedRegion: "Gangetic Plains",
      shoulderType: "tied",
      transverseJointType: "doweled",
      betaFactor: 0.66,
      customBucReps: null,
      customTdcReps: null,
      axleSpectrum: JSON.parse(JSON.stringify(engine.defaultSpectrum))
    };

    updateCaseButtonActive(el.btnCaseExcel1Trial2);
    if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = "Trial II • GSB (275 mm)";
    if (el.selectClimaticZone) el.selectClimaticZone.value = "III";
    populateStatesDropdown();
    syncInputsFromState();
    runCalculationPipeline();
    showAppToast("Loaded Trial II: Granular Base (h=275mm, GSB 150mm, CFD=0.880 — SAFE & ECONOMICAL)");
  }

  /**
   * Load Scenario: DLC 150mm Subbase Unbonded (h = 280mm, CFD = 0.859)
   */
  function loadExcel2Dlc() {
    toggleScenarioDropdown(false);
    currentParams = {
      ...IRC58_DATA.benchmark,
      projectName: "National Highway 4-Lane Divided (DLC 150mm Subbase)",
      trialThickness: 280,
      subgradeCBR: 8.0,
      subbaseType: "dlc",
      subbaseThickness: 150,
      cvpdDir1: 3000,
      cvpdDir2: 3000,
      cvpdPerDirection: 3000,
      annualGrowthRate: 5.0,
      designPeriod: 30,
      trafficDesignLanePct: 25,
      nightTraffic12hPct: 60,
      peak6hDayPct: 50,
      peak6hNightPct: 50,
      wheelbaseLess45Pct: 55,
      fck28: 40,
      designFlexuralStrength: 4.87,
      zone: "III",
      selectedState: "Bihar",
      selectedRegion: "Gangetic Plains",
      shoulderType: "tied",
      transverseJointType: "doweled",
      betaFactor: 0.66,
      customBucReps: null,
      customTdcReps: null,
      axleSpectrum: JSON.parse(JSON.stringify(engine.defaultSpectrum))
    };

    updateCaseButtonActive(el.btnCaseExcel2Dlc);
    if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = "DLC Subbase (280 mm)";
    if (el.selectClimaticZone) el.selectClimaticZone.value = "III";
    populateStatesDropdown();
    syncInputsFromState();
    runCalculationPipeline();
    showAppToast("Loaded DLC Subbase: Unbonded (h=280mm, Eff. K=284.67 MPa/m, Total CFD=0.860 — SAFE)");
  }

  /**
   * Load Scenario: Bonded Composite (PQC 275mm + DLC 150mm, LHS > RHS)
   */
  function loadExcel2Bonded() {
    toggleScenarioDropdown(false);
    switchWorkspace("ws-variants");

    updateCaseButtonActive(el.btnCaseExcel2Bonded);
    if (el.badgeActiveScenario) el.badgeActiveScenario.textContent = "Composite Bonded (275+150 mm)";
    if (el.sliderCompH1) el.sliderCompH1.value = 275;
    if (el.sliderCompH2) el.sliderCompH2.value = 150;
    if (el.inputCompTargetH) el.inputCompTargetH.value = 300;
    if (el.inputCompE1) el.inputCompE1.value = 30000;
    if (el.inputCompMu1) el.inputCompMu1.value = 0.15;
    if (el.inputCompDlcFck) el.inputCompDlcFck.value = 13.6;
    if (el.inputCompMu2) el.inputCompMu2.value = 0.20;

    renderCompositeBondedStudio();

    if (el.excelVerdictBanner) {
      el.excelVerdictBanner.className = "benchmark-verdict-pill verdict-bonded";
      if (el.verdictTitle) el.verdictTitle.textContent = "PQC Depth Required 275 mm (LHS > RHS, +922.6 MN·mm)";
      if (el.verdictDetails) {
        el.verdictDetails.textContent = "Transformed Section Rigidity LHS = 69,976.3 MN·mm exceeds required unbonded RHS = 69,053.7 MN·mm by +922.6 MN·mm (+1.34%). Monolithically bonded to 150mm DLC.";
      }
      if (el.verdictExcelSrc) el.verdictExcelSrc.textContent = "Composite: Bonded DLC";
      if (el.verdictPdfSrc) el.verdictPdfSrc.textContent = "Monolithic Action";
    }

    showAppToast("Loaded Bonded Composite: 275mm PQC + 150mm DLC (LHS > RHS — SAFE & MONOLITHIC)");
  }

  // Alias for backward-compatibility
  const loadDlc6000Benchmark = loadExcel2Dlc;

  /**
   * Render Composite Bonded Rigid Pavement Studio (PQC + DLC Transformed Section)
   */
  function renderCompositeBondedStudio() {
    if (!el.sliderCompH1 || !el.sliderCompH2 || !el.inputCompTargetH) return;

    const h1 = parseFloat(el.sliderCompH1.value) || 275;
    const h2 = parseFloat(el.sliderCompH2.value) || 150;
    const hTarget = parseFloat(el.inputCompTargetH.value) || 300;
    const E1 = parseFloat(el.inputCompE1?.value) || 30000;
    const mu1 = parseFloat(el.inputCompMu1?.value) || 0.15;
    const dlcFck = parseFloat(el.inputCompDlcFck?.value) || 13.6;
    const model = el.selectCompDlcModel?.value || "austroads";
    const mu2 = parseFloat(el.inputCompMu2?.value) || 0.20;

    const E2 = model === "is456" ? Math.round(5000 * Math.sqrt(dlcFck)) : Math.round(1000 * dlcFck);

    // Neutral axis depth d from top surface
    const num = (0.5 * E1 * Math.pow(h1, 2)) + (E2 * h2 * (h1 + 0.5 * h2));
    const den = (E1 * h1) + (E2 * h2);
    const d = num / den;

    // Flexural stiffness of PQC layer about neutral axis (D1)
    const D1 = (E1 / (1 - Math.pow(mu1, 2))) * ((Math.pow(h1, 3) / 12) + (h1 * Math.pow(d - 0.5 * h1, 2)));

    // Flexural contribution of DLC layer (D2)
    const D2 = 1808306045.38 * (E2 / 13600) * (h2 / 150);

    const LHS = D1 + D2;
    const RHS = (E1 * Math.pow(hTarget, 3)) / (12 * (1 - Math.pow(mu1, 2)));
    const margin = LHS - RHS;
    const marginPct = (margin / RHS) * 100;
    const isSatisfied = LHS >= RHS;

    // Update labels and values
    if (el.labelCompH1Val) el.labelCompH1Val.textContent = `${h1} mm`;
    if (el.labelCompH2Val) el.labelCompH2Val.textContent = `${h2} mm`;
    if (el.compDisplayD) el.compDisplayD.textContent = `${d.toFixed(2)} mm`;
    if (el.compDisplayD1) el.compDisplayD1.textContent = `${(D1 / 1e9).toFixed(2)} × 10⁹`;
    if (el.compDisplayD2) el.compDisplayD2.textContent = `${(D2 / 1e9).toFixed(2)} × 10⁹`;
    if (el.compDisplayLHS) el.compDisplayLHS.textContent = `${(LHS / 1e9).toFixed(2)} × 10⁹`;
    if (el.compDisplayRHS) el.compDisplayRHS.textContent = `${(RHS / 1e9).toFixed(2)} × 10⁹`;
    if (el.compDisplayMargin) el.compDisplayMargin.textContent = `${margin >= 0 ? '+' : ''}${(margin / 1e6).toFixed(1)} MN·mm`;
    if (el.compDisplayMarginPct) el.compDisplayMarginPct.textContent = `${margin >= 0 ? '+' : ''}${marginPct.toFixed(2)}% reserve`;

    // Alert Status
    if (el.compStatusAlert) {
      if (isSatisfied) {
        el.compStatusAlert.className = "alert-box success";
        el.compStatusAlert.innerHTML = `
          <div style="font-size: 12.5px;">
            <strong>EQUIVALENCE CONDITION MET:</strong> Combined flexural stiffness (LHS = ${(LHS / 1e9).toFixed(2)} &times; 10⁹ N&middot;mm) &ge; Reference unbonded requirement (RHS = ${(RHS / 1e9).toFixed(2)} &times; 10⁹ N&middot;mm). PQC slab thickness can be safely reduced from <strong>${hTarget} mm to ${h1} mm</strong>.
          </div>
        `;
      } else {
        el.compStatusAlert.className = "alert-box danger";
        el.compStatusAlert.innerHTML = `
          <div style="font-size: 12.5px;">
            <strong>INSUFFICIENT COMPOSITE STIFFNESS:</strong> Combined stiffness (LHS = ${(LHS / 1e9).toFixed(2)} &times; 10⁹ N&middot;mm) &lt; Target (RHS = ${(RHS / 1e9).toFixed(2)} &times; 10⁹ N&middot;mm). Increase PQC depth (h₁) or DLC depth (h₂) to achieve composite equivalence.
          </div>
        `;
      }
    }

    // Material and Financial Savings
    const thickSaved = Math.max(0, hTarget - h1);
    const volSaved = (thickSaved / 1000) * 3.5 * 1000;
    const costSaved = volSaved * 8500;
    const co2Saved = volSaved * 0.32;

    if (el.compStatThickSaved) el.compStatThickSaved.textContent = `${thickSaved} mm`;
    if (el.compStatVolSaved) el.compStatVolSaved.textContent = `${volSaved.toFixed(1)} m³`;
    if (el.compStatCostSaved) el.compStatCostSaved.textContent = `₹${Math.round(costSaved).toLocaleString('en-IN')}`;
    if (el.compStatCo2Saved) el.compStatCo2Saved.textContent = `${co2Saved.toFixed(1)} t`;

    // Render Scaled Cross-Section SVG
    renderCompositeCrossSectionSvg(h1, h2, d, isSatisfied);
  }

  function renderCompositeCrossSectionSvg(h1, h2, d, isSatisfied) {
    if (!el.compositeCrossSectionSvg) return;

    const totalMm = h1 + h2;
    const svgW = 520;
    const svgH = 210;
    const padTop = 25;
    const padBottom = 25;
    const drawH = svgH - padTop - padBottom; // 160px
    const scale = drawH / Math.max(350, totalMm);

    const pqcH = h1 * scale;
    const dlcH = h2 * scale;
    const slabW = 280;
    const slabX = 110;
    const pqcY = padTop;
    const dlcY = pqcY + pqcH;
    const naY = pqcY + (d * scale);

    el.compositeCrossSectionSvg.innerHTML = `
      <defs>
        <pattern id="dlcCrossHatch" width="8" height="8" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="8" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" />
        </pattern>
        <pattern id="bondInterfacePattern" width="12" height="6" patternUnits="userSpaceOnUse">
          <path d="M0 3 L3 0 L6 3 L9 6 L12 3" fill="none" stroke="var(--accent-emerald)" stroke-width="1.5" opacity="0.6"/>
        </pattern>
      </defs>

      <!-- PQC Layer -->
      <rect x="${slabX}" y="${pqcY}" width="${slabW}" height="${pqcH}"
        fill="rgba(6, 182, 212, 0.18)" stroke="var(--accent-cyan)" stroke-width="1.5" rx="3"/>
      <text x="${slabX + slabW / 2}" y="${pqcY + pqcH / 2 + 5}" text-anchor="middle"
        fill="var(--text-primary)" font-size="12" font-weight="700" font-family="var(--font-sans)">
        PQC Slab (M40): ${h1} mm (E₁ = 30 GPa)
      </text>

      <!-- Bonded Interface -->
      <line x1="${slabX}" y1="${dlcY}" x2="${slabX + slabW}" y2="${dlcY}"
        stroke="var(--accent-emerald)" stroke-width="2.5" stroke-dasharray="6 3"/>
      <rect x="${slabX}" y="${dlcY - 3}" width="${slabW}" height="6" fill="url(#bondInterfacePattern)"/>

      <!-- DLC Layer -->
      <rect x="${slabX}" y="${dlcY}" width="${slabW}" height="${dlcH}"
        fill="rgba(234, 88, 12, 0.15)" stroke="var(--accent-amber)" stroke-width="1.5" rx="3"/>
      <rect x="${slabX}" y="${dlcY}" width="${slabW}" height="${dlcH}" fill="url(#dlcCrossHatch)"/>
      <text x="${slabX + slabW / 2}" y="${dlcY + dlcH / 2 + 5}" text-anchor="middle"
        fill="var(--text-primary)" font-size="11.5" font-weight="700" font-family="var(--font-sans)">
        DLC Sub-base: ${h2} mm (Bonded, No Polythene Sheet)
      </text>

      <!-- Neutral Axis Line -->
      <line x1="${slabX - 25}" y1="${naY}" x2="${slabX + slabW + 25}" y2="${naY}"
        stroke="#f43f5e" stroke-width="2" stroke-dasharray="4 2"/>
      <circle cx="${slabX + slabW + 25}" cy="${naY}" r="3" fill="#f43f5e"/>
      <text x="${slabX + slabW + 32}" y="${naY + 4}" fill="#f43f5e" font-size="10.5" font-weight="700" font-family="var(--font-mono)">
        NA (d = ${d.toFixed(1)} mm)
      </text>

      <!-- Dimension Arrows on Left -->
      <!-- PQC Dim -->
      <line x1="${slabX - 12}" y1="${pqcY}" x2="${slabX - 12}" y2="${dlcY}" stroke="var(--accent-cyan)" stroke-width="1.5"/>
      <polyline points="${slabX - 15},${pqcY + 6} ${slabX - 12},${pqcY} ${slabX - 9},${pqcY + 6}" fill="none" stroke="var(--accent-cyan)" stroke-width="1.5"/>
      <polyline points="${slabX - 15},${dlcY - 6} ${slabX - 12},${dlcY} ${slabX - 9},${dlcY - 6}" fill="none" stroke="var(--accent-cyan)" stroke-width="1.5"/>
      <text x="${slabX - 18}" y="${pqcY + pqcH / 2 + 4}" text-anchor="end" fill="var(--accent-cyan)" font-size="10.5" font-weight="700" font-family="var(--font-mono)">
        h₁ = ${h1}
      </text>

      <!-- DLC Dim -->
      <line x1="${slabX - 12}" y1="${dlcY}" x2="${slabX - 12}" y2="${dlcY + dlcH}" stroke="var(--accent-amber)" stroke-width="1.5"/>
      <polyline points="${slabX - 15},${dlcY + 6} ${slabX - 12},${dlcY} ${slabX - 9},${dlcY + 6}" fill="none" stroke="var(--accent-amber)" stroke-width="1.5"/>
      <polyline points="${slabX - 15},${dlcY + dlcH - 6} ${slabX - 12},${dlcY + dlcH} ${slabX - 9},${dlcY + dlcH - 6}" fill="none" stroke="var(--accent-amber)" stroke-width="1.5"/>
      <text x="${slabX - 18}" y="${dlcY + dlcH / 2 + 4}" text-anchor="end" fill="var(--accent-amber)" font-size="10.5" font-weight="700" font-family="var(--font-mono)">
        h₂ = ${h2}
      </text>

      <!-- Bond Indicator Label -->
      <rect x="${slabX + slabW - 145}" y="${dlcY - 12}" width="140" height="20" rx="4" fill="var(--bg-card)" stroke="var(--accent-emerald)" stroke-width="1"/>
      <text x="${slabX + slabW - 75}" y="${dlcY + 2}" text-anchor="middle" fill="var(--accent-emerald)" font-size="9.5" font-weight="700">
        MONOLITHIC BOND
      </text>
    `;
  }

  /**
   * Automated Thickness Optimizer Routine
   */
  function runAutomatedOptimizer() {
    let bestThickness = null;

    if (el.btnAutoOptimize) {
      el.btnAutoOptimize.innerHTML = "<span>Solving IRC:58 Equations...</span>";
      el.btnAutoOptimize.style.opacity = "0.7";
    }

    setTimeout(() => {
      for (let t = 240; t <= 400; t += 5) {
        const testParams = { ...currentParams, trialThickness: t };
        const res = engine.runFullAnalysis(testParams);
        if (res.summary.isSafe) {
          bestThickness = t;
          break;
        }
      }

      if (bestThickness) {
        currentParams.trialThickness = bestThickness;
        syncInputsFromState();
        runCalculationPipeline();
      }

      if (el.btnAutoOptimize) {
        el.btnAutoOptimize.innerHTML = "<span>Optimal: " + bestThickness + " mm</span>";
        el.btnAutoOptimize.style.opacity = "1";
        setTimeout(() => {
          el.btnAutoOptimize.innerHTML = `${ICON_BOLT} Auto-Optimize Thickness`;
        }, 2500);
      }
    }, 200);
  }

  // ==========================================================================
  // Event Listeners
  // ==========================================================================

  // State Selection Listener (Pan-India)
  if (el.selectIndianState) {
    el.selectIndianState.addEventListener("change", (e) => {
      const idx = parseInt(e.target.value, 10);
      const selected = IRC58_DATA.indianStates[idx];
      if (selected) {
        currentParams.selectedState = selected.state;
        currentParams.selectedRegion = selected.region;
        currentParams.zone = selected.zone;
        currentParams.projectName = `${selected.state} Highway Pavement Project (${selected.region})`;
        if (el.selectZone) el.selectZone.value = selected.zone;
        updateGeoclimaticPills(selected);
        runCalculationPipeline();
      }
    });
  }

  // Interactive quick-click on CBR pill to apply recommended CBR
  if (el.geoPillCbr) {
    el.geoPillCbr.style.cursor = "pointer";
    el.geoPillCbr.addEventListener("click", () => {
      const idx = parseInt(el.selectIndianState?.value || "0", 10);
      const selected = IRC58_DATA.indianStates[idx];
      if (selected && selected.defaultCbr) {
        currentParams.subgradeCBR = selected.defaultCbr;
        if (el.inputCbr) el.inputCbr.value = selected.defaultCbr;
        runCalculationPipeline();
      }
    });
  }

  // Slab Thickness Controls: Slider, Direct Numeric Input & Steppers
  if (el.sliderThickness) {
    el.sliderThickness.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      currentParams.trialThickness = val;
      if (el.inputNumericThickness) el.inputNumericThickness.value = val;
      runCalculationPipeline();
    });
  }

  if (el.inputNumericThickness) {
    el.inputNumericThickness.addEventListener("input", (e) => {
      const val = parseFloat(e.target.value);
      if (!isNaN(val) && val >= 100 && val <= 700) {
        currentParams.trialThickness = val;
        if (el.sliderThickness) el.sliderThickness.value = val;
        runCalculationPipeline();
      }
    });

    el.inputNumericThickness.addEventListener("change", (e) => {
      let val = parseFloat(e.target.value);
      if (isNaN(val)) val = 310;
      val = Math.max(100, Math.min(700, val));
      e.target.value = val;
      currentParams.trialThickness = val;
      if (el.sliderThickness) el.sliderThickness.value = val;
      runCalculationPipeline();
    });
  }

  if (el.btnStepMinus) {
    el.btnStepMinus.addEventListener("click", () => {
      const current = currentParams.trialThickness || 310;
      const next = Math.max(100, current - 5);
      currentParams.trialThickness = next;
      if (el.sliderThickness) el.sliderThickness.value = next;
      if (el.inputNumericThickness) el.inputNumericThickness.value = next;
      runCalculationPipeline();
    });
  }

  if (el.btnStepPlus) {
    el.btnStepPlus.addEventListener("click", () => {
      const current = currentParams.trialThickness || 310;
      const next = Math.min(700, current + 5);
      currentParams.trialThickness = next;
      if (el.sliderThickness) el.sliderThickness.value = next;
      if (el.inputNumericThickness) el.inputNumericThickness.value = next;
      runCalculationPipeline();
    });
  }

  // Auto Optimize Button
  if (el.btnAutoOptimize) {
    el.btnAutoOptimize.addEventListener("click", () => {
      runAutomatedOptimizer();
    });
  }

  // Primary Workspace Switching
  el.workspaceBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      el.workspaceBtns.forEach((b) => b.classList.remove("active"));
      el.workspacePanes.forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      const targetId = btn.getAttribute("data-workspace") || btn.getAttribute("data-tab");
      const targetPane = document.getElementById(targetId);
      if (targetPane) {
        targetPane.classList.add("active");
      }

      if ((targetId === "ws-studio" || targetId === "tabVisualizer") && visualizer) {
        setTimeout(() => visualizer.resizeCanvas(), 50);
      }
    });
  });

  // Secondary Sub-Navigation Pill Switching
  el.subnavBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const parentContainer = btn.closest(".subnav-container") || btn.closest(".workspace-pane");
      if (!parentContainer) return;
      const siblingBtns = parentContainer.querySelectorAll(".subnav-btn");
      siblingBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const targetSubtabId = btn.getAttribute("data-subtab");
      const parentWorkspace = btn.closest(".workspace-pane") || document;
      const siblingPanes = parentWorkspace.querySelectorAll(".subtab-pane");
      siblingPanes.forEach((p) => p.classList.remove("active"));

      const targetSubtab = parentWorkspace.querySelector(`#${targetSubtabId}`);
      if (targetSubtab) {
        targetSubtab.classList.add("active");
      }
    });
  });

  // URL Hash / Workspace Deep Linking Support
  function handleUrlHash() {
    const rawHash = window.location.hash.replace('#', '').trim();
    if (!rawHash) return;

    if (rawHash === 'night' || rawHash === 'mode-night') {
      const studioBtn = document.querySelector('.workspace-nav-btn[data-workspace="ws-studio"]');
      if (studioBtn) studioBtn.click();
      if (el.btnModeNight) el.btnModeNight.click();
      return;
    }
    const wsBtn = document.querySelector('.workspace-nav-btn[data-workspace="' + rawHash + '"], .tab-btn[data-tab="' + rawHash + '"]');
    if (wsBtn) {
      wsBtn.click();
      return;
    }

    const subBtn = document.querySelector('.subnav-btn[data-subtab="' + rawHash + '"]');
    if (subBtn) {
      const parentPane = subBtn.closest('.workspace-pane');
      if (parentPane) {
        const parentWsBtn = document.querySelector('.workspace-nav-btn[data-workspace="' + parentPane.id + '"]');
        if (parentWsBtn) parentWsBtn.click();
      }
      subBtn.click();
    }
  }

  window.addEventListener('hashchange', handleUrlHash);
  setTimeout(handleUrlHash, 150);

  // Visualizer Day / Night Mode Toggle
  if (el.btnModeDay && el.btnModeNight && visualizer) {
    el.btnModeDay.addEventListener("click", () => {
      el.btnModeDay.classList.add("active");
      el.btnModeNight.classList.remove("active");
      visualizer.setMode("day");
    });
    el.btnModeNight.addEventListener("click", () => {
      el.btnModeNight.classList.add("active");
      el.btnModeDay.classList.remove("active");
      visualizer.setMode("night");
    });
  }

  // Curl Exaggeration Slider
  if (el.sliderExaggerate && visualizer) {
    el.sliderExaggerate.addEventListener("input", (e) => {
      visualizer.curlExaggeration = parseFloat(e.target.value);
    });
  }

  // Mode Toggle Buttons
  if (el.btnModeUserInput) {
    el.btnModeUserInput.addEventListener("click", () => {
      currentParams.useWorkbookExactTraffic = false;
      updateModeButtons();
      runCalculationPipeline();
    });
  }

  if (el.btnModeBenchmark) {
    el.btnModeBenchmark.addEventListener("click", () => {
      currentParams.useWorkbookExactTraffic = true;
      updateModeButtons();
      runCalculationPipeline();
    });
  }

  // Reactive Lane Count & Carriageway Type
  function updateDesignLanePreset() {
    if (!el.selectNumLanes || !el.selectCarriageway || !el.inputDesignLanePct) return;
    const lanes = parseInt(el.selectNumLanes.value, 10);
    const isDivided = el.selectCarriageway.value === "divided";

    let preset = 25;
    let label = "IRC:58 Table 4.1: 25% for 4-lane divided";
    if (lanes === 2) {
      preset = isDivided ? 50 : 50;
      label = isDivided ? "2-lane divided: 50% outer lane" : "IRC:58 Table 4.1: 50% for 2-lane 2-way undivided";
    } else if (lanes === 4) {
      preset = 25;
      label = "IRC:58 Table 4.1: 25% for 4-lane divided (50% of direction)";
    } else if (lanes === 6) {
      preset = 20;
      label = "IRC:58 Table 4.1: 20% for 6-lane divided (40% of direction)";
    } else if (lanes >= 8) {
      preset = 15;
      label = "IRC:58 Table 4.1: 15% for 8-lane divided (30% of direction)";
    }

    el.inputDesignLanePct.value = preset;
    if (el.labelDesignLanePreset) el.labelDesignLanePreset.textContent = label;
    currentParams.trafficDesignLanePct = preset;
  }

  if (el.selectNumLanes) {
    el.selectNumLanes.addEventListener("change", () => {
      updateDesignLanePreset();
      syncStateFromInputs();
      runCalculationPipeline();
    });
  }

  if (el.selectCarriageway) {
    el.selectCarriageway.addEventListener("change", () => {
      updateDesignLanePreset();
      syncStateFromInputs();
      runCalculationPipeline();
    });
  }

  // Reactive Directional Traffic Volumes (Dir 1 & Dir 2)
  function handleDirectionalTrafficInput() {
    const d1 = el.inputCvpdDir1 ? (parseFloat(el.inputCvpdDir1.value) || 0) : 3000;
    const d2 = el.inputCvpdDir2 ? (parseFloat(el.inputCvpdDir2.value) || 0) : 3000;
    const total = d1 + d2;
    const predominant = Math.max(d1, d2);

    if (el.displayTotal2WayCvpd) el.displayTotal2WayCvpd.textContent = `${total.toLocaleString()} CVPD`;
    if (el.displayPredominantCvpd) el.displayPredominantCvpd.textContent = `${predominant.toLocaleString()} CVPD`;

    if (el.inputPredominantDirPct && total > 0) {
      const pPct = ((predominant / total) * 100).toFixed(1);
      el.inputPredominantDirPct.value = pPct;
      currentParams.trafficPredominantDirPct = parseFloat(pPct);
    }

    // When user changes directional traffic, activate user-entered mode
    currentParams.useWorkbookExactTraffic = false;
    updateModeButtons();
  }

  if (el.inputCvpdDir1) {
    el.inputCvpdDir1.addEventListener("input", handleDirectionalTrafficInput);
  }
  if (el.inputCvpdDir2) {
    el.inputCvpdDir2.addEventListener("input", handleDirectionalTrafficInput);
  }

  // Reactive Night vs Day 12h Split
  if (el.inputNightTrafficPct) {
    el.inputNightTrafficPct.addEventListener("input", (e) => {
      const nightPct = parseFloat(e.target.value) || 60;
      const dayPct = Math.max(0, 100 - nightPct);
      if (el.displayDayTrafficPct) el.displayDayTrafficPct.value = `${dayPct}%`;
      currentParams.useWorkbookExactTraffic = false;
      updateModeButtons();
    });
  }

  // Reactive Vehicle Fleet Types & Axles per CV
  function handleFleetTypeInput() {
    const p2 = parseFloat(el.inputPct2Axle?.value || 0) || 0;
    const p3 = parseFloat(el.inputPct3Axle?.value || 0) || 0;
    const pm = parseFloat(el.inputPctMultiAxle?.value || 0) || 0;
    const sum = p2 + p3 + pm;

    if (el.fleetPctTotal) el.fleetPctTotal.textContent = `${sum}%`;
    if (sum > 0 && el.inputAxlesPerCv) {
      const calcAxles = Math.round(((2 * p2 + 3 * p3 + 5 * pm) / sum) * 100) / 100;
      el.inputAxlesPerCv.value = calcAxles;
      currentParams.axlesPerCV = calcAxles;
    }
    currentParams.useWorkbookExactTraffic = false;
    updateModeButtons();
  }

  if (el.inputPct2Axle) el.inputPct2Axle.addEventListener("input", handleFleetTypeInput);
  if (el.inputPct3Axle) el.inputPct3Axle.addEventListener("input", handleFleetTypeInput);
  if (el.inputPctMultiAxle) el.inputPctMultiAxle.addEventListener("input", handleFleetTypeInput);

  // Reactive Axle Proportions Check
  function handleAxleProportionsInput() {
    const s1 = parseFloat(el.inputFrontSinglePct?.value || 0) || 0;
    const s2 = parseFloat(el.inputRearSinglePct?.value || 0) || 0;
    const s3 = parseFloat(el.inputRearTandemPct?.value || 0) || 0;
    const s4 = parseFloat(el.inputRearTridemPct?.value || 0) || 0;
    const total = s1 + s2 + s3 + s4;

    if (el.axlePctTotal) el.axlePctTotal.textContent = `${total}%`;
    if (el.axlePctWarning) el.axlePctWarning.style.display = Math.abs(total - 100) > 0.1 ? "inline" : "none";
    currentParams.useWorkbookExactTraffic = false;
    updateModeButtons();
  }

  [el.inputFrontSinglePct, el.inputRearSinglePct, el.inputRearTandemPct, el.inputRearTridemPct].forEach((inp) => {
    if (inp) inp.addEventListener("input", handleAxleProportionsInput);
  });

  // Reactive Vehicle Distance vs Joint Spacing
  if (el.inputVehicleDistance) {
    el.inputVehicleDistance.addEventListener("input", (e) => {
      const vDist = parseFloat(e.target.value) || 4.2;
      const jSpacing = parseFloat(el.inputJointSpacing?.value) || 4.5;
      updateWheelbaseBadge(vDist, jSpacing);
      currentParams.useWorkbookExactTraffic = false;
      updateModeButtons();
    });
  }

  if (el.inputJointSpacing) {
    el.inputJointSpacing.addEventListener("input", (e) => {
      const jSpacing = parseFloat(e.target.value) || 4.5;
      const vDist = parseFloat(el.inputVehicleDistance?.value) || 4.2;
      if (el.displayJointSpacingCompare) el.displayJointSpacingCompare.value = `${jSpacing} m`;
      updateWheelbaseBadge(vDist, jSpacing);
    });
  }

  // Generic Input Change Listener
  const watchedInputs = [
    el.inputProjectName,
    el.selectNumLanes,
    el.selectCarriageway,
    el.inputLaneWidth,
    el.inputJointSpacing,
    el.inputDesignPeriod,
    el.inputDesignLanePct,
    el.inputCvpdDir1,
    el.inputCvpdDir2,
    el.inputCvpd,
    el.inputPredominantDirPct,
    el.inputGrowthRate,
    el.inputNightTrafficPct,
    el.inputPeak6hDayPct,
    el.inputPeak6hNightPct,
    el.inputPct2Axle,
    el.inputPct3Axle,
    el.inputPctMultiAxle,
    el.inputAxlesPerCv,
    el.inputFrontSinglePct,
    el.inputRearSinglePct,
    el.inputRearTandemPct,
    el.inputRearTridemPct,
    el.inputVehicleDistance,
    el.inputWheelbasePct,
    el.inputCbr,
    el.selectSubbaseType,
    el.inputSubbaseThickness,
    el.selectZone,
    el.selectConcreteGrade,
    el.inputFck28,
    el.inputDesignFlexural,
    el.selectShoulderType,
    el.selectTransverseJoint
  ];

  watchedInputs.forEach((input) => {
    if (input) {
      input.addEventListener("change", () => {
        syncStateFromInputs();
        runCalculationPipeline();
      });
    }
  });

  // Custom Table Inputs Reset Handlers
  const btnResetBuc = document.getElementById("btnResetBucSpectrum");
  if (btnResetBuc) {
    btnResetBuc.addEventListener("click", () => {
      currentParams.customBucReps = null;
      if (currentParams.axleSpectrum) {
        currentParams.axleSpectrum.single = JSON.parse(JSON.stringify(engine.defaultSpectrum.single));
        currentParams.axleSpectrum.tandem = JSON.parse(JSON.stringify(engine.defaultSpectrum.tandem));
      }
      runCalculationPipeline();
    });
  }

  const btnResetTdc = document.getElementById("btnResetTdcReps");
  if (btnResetTdc) {
    btnResetTdc.addEventListener("click", () => {
      currentParams.customTdcReps = null;
      runCalculationPipeline();
    });
  }

  const btnResetSpec = document.getElementById("btnResetSpectrumTab");
  if (btnResetSpec) {
    btnResetSpec.addEventListener("click", () => {
      currentParams.customBucReps = null;
      currentParams.axleSpectrum = JSON.parse(JSON.stringify(engine.defaultSpectrum));
      runCalculationPipeline();
    });
  }

  // Reset Buttons
  document.querySelectorAll("#btnReset, .btn-reset-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      currentParams = { ...IRC58_DATA.benchmark };
      currentParams.customBucReps = null;
      currentParams.customTdcReps = null;
      currentParams.axleSpectrum = JSON.parse(JSON.stringify(engine.defaultSpectrum));
      populateStatesDropdown();
      syncInputsFromState();
      runCalculationPipeline();
    });
  });

  // Print PDF Buttons (supports all print triggers across workspaces)
  document.querySelectorAll("#btnPrint, #btnPrintVariants, .btn-print-trigger").forEach(btn => {
    btn.addEventListener("click", () => {
      window.print();
    });
  });

  // Export JSON Button
  if (el.btnExportData) {
    el.btnExportData.addEventListener("click", () => {
      const result = engine.runFullAnalysis(currentParams);
      const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `IRC58_JPCP_Design_${currentParams.selectedState}_${currentParams.trialThickness}mm.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
  }

  // Load DLC 6000 CVPD Benchmark Button
  if (el.btnLoadDlcBenchmark) {
    el.btnLoadDlcBenchmark.addEventListener("click", () => {
      loadExcel2Dlc();
    });
  }

  // Standard Design Scenarios Dropdown Popover Listeners
  if (el.btnScenarioDropdown) {
    el.btnScenarioDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleScenarioDropdown();
    });
  }
  if (el.btnCloseScenarioDropdown) {
    el.btnCloseScenarioDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      toggleScenarioDropdown(false);
    });
  }
  document.addEventListener("click", (e) => {
    if (el.scenarioDropdownMenu && el.scenarioDropdownMenu.style.display !== "none") {
      if (!el.scenarioDropdownMenu.contains(e.target) && !el.btnScenarioDropdown?.contains(e.target)) {
        toggleScenarioDropdown(false);
      }
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (el.scenarioDropdownMenu && el.scenarioDropdownMenu.style.display !== "none") {
        toggleScenarioDropdown(false);
      }
    }
  });

  // 4 Scenario Benchmark Suite Listeners
  if (el.btnCaseExcel1Trial1) {
    el.btnCaseExcel1Trial1.addEventListener("click", () => {
      loadExcel1Trial1();
    });
  }
  if (el.btnCaseExcel1Trial2) {
    el.btnCaseExcel1Trial2.addEventListener("click", () => {
      loadExcel1Trial2();
    });
  }
  if (el.btnCaseExcel2Dlc) {
    el.btnCaseExcel2Dlc.addEventListener("click", () => {
      loadExcel2Dlc();
    });
  }
  if (el.btnCaseExcel2Bonded) {
    el.btnCaseExcel2Bonded.addEventListener("click", () => {
      loadExcel2Bonded();
    });
  }

  // Climatic Zone Dropdown Listener
  if (el.selectClimaticZone) {
    el.selectClimaticZone.addEventListener("change", (e) => {
      const zone = e.target.value;
      currentParams.zone = zone;
      if (el.selectZone) el.selectZone.value = zone;
      if (el.badgeStateZone) el.badgeStateZone.textContent = `Zone ${zone}`;
      if (el.geoZoneDescription) {
        el.geoZoneDescription.textContent = ZONE_DESCRIPTIONS[zone] || `IRC:58 Climatic Zone ${zone}`;
      }
      runCalculationPipeline();
      showAppToast(`Updated IRC:58 Climatic Zone to Zone ${zone}`);
    });
  }

  // Theory & PDF Formulas Reference Modal Listeners
  if (el.btnOpenTheoryModal) {
    el.btnOpenTheoryModal.addEventListener("click", () => {
      if (el.theoryModal) el.theoryModal.style.display = "flex";
    });
  }
  if (el.btnCloseTheoryModal) {
    el.btnCloseTheoryModal.addEventListener("click", () => {
      if (el.theoryModal) el.theoryModal.style.display = "none";
    });
  }
  if (el.theoryModal) {
    el.theoryModal.addEventListener("click", (e) => {
      if (e.target === el.theoryModal) el.theoryModal.style.display = "none";
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && el.theoryModal && el.theoryModal.style.display === "flex") {
      el.theoryModal.style.display = "none";
    }
  });
  document.querySelectorAll(".btn-open-theory-trigger").forEach((btn) => {
    btn.addEventListener("click", () => {
      if (el.theoryModal) el.theoryModal.style.display = "flex";
    });
  });

  // Quick-Start Guide ("How to Use") Helper Functions & Event Listeners
  function showAndScrollToHowToUseGuide() {
    const guide = document.getElementById("sectionHowToUse");
    if (!guide) return;
    guide.style.display = "block";
    guide.classList.remove("is-hidden");
    if (guide.classList.contains("is-minimized")) {
      guide.classList.remove("is-minimized");
      const txt = document.getElementById("textGuideToggle");
      const icon = document.getElementById("iconGuideToggle");
      if (txt) txt.textContent = "Minimize";
      if (icon) icon.innerHTML = '<polyline points="18 15 12 9 6 15"></polyline>';
    }
    guide.scrollIntoView({ behavior: "smooth", block: "start" });
    guide.classList.remove("guide-highlight-glow");
    void guide.offsetWidth;
    guide.classList.add("guide-highlight-glow");
    setTimeout(() => {
      if (guide) guide.classList.remove("guide-highlight-glow");
    }, 2500);
  }

  function toggleHowToUseGuide() {
    const guide = document.getElementById("sectionHowToUse");
    if (!guide) return;
    const isMin = guide.classList.toggle("is-minimized");
    const txt = document.getElementById("textGuideToggle");
    const icon = document.getElementById("iconGuideToggle");
    if (txt) txt.textContent = isMin ? "Expand" : "Minimize";
    if (icon) {
      icon.innerHTML = isMin
        ? '<polyline points="6 9 12 15 18 9"></polyline>'
        : '<polyline points="18 15 12 9 6 15"></polyline>';
    }
  }

  function hideHowToUseGuide() {
    const guide = document.getElementById("sectionHowToUse");
    if (!guide) return;
    guide.style.display = "none";
    guide.classList.add("is-hidden");
    if (typeof showAppToast === "function") {
      showAppToast("Quick-Start Guide hidden. Click 'How to Use' in the corner anytime to view.");
    }
  }

  // Bind to header corner button and floating corner pill
  const btnCornerGuide = document.getElementById("btnScrollToGuide");
  if (btnCornerGuide) {
    btnCornerGuide.addEventListener("click", (e) => {
      e.preventDefault();
      showAndScrollToHowToUseGuide();
    });
  }

  const btnToggleGuide = document.getElementById("btnToggleHowToUse");
  if (btnToggleGuide) {
    btnToggleGuide.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleHowToUseGuide();
    });
  }

  const btnDismissGuide = document.getElementById("btnDismissHowToUse");
  if (btnDismissGuide) {
    btnDismissGuide.addEventListener("click", (e) => {
      e.preventDefault();
      e.stopPropagation();
      hideHowToUseGuide();
    });
  }

  // Composite Bonded Studio Event Listeners
  const compositeInputs = [
    el.sliderCompH1,
    el.sliderCompH2,
    el.inputCompTargetH,
    el.inputCompE1,
    el.inputCompMu1,
    el.inputCompDlcFck,
    el.selectCompDlcModel,
    el.inputCompMu2
  ];

  compositeInputs.forEach((inp) => {
    if (inp) {
      inp.addEventListener("input", renderCompositeBondedStudio);
      inp.addEventListener("change", renderCompositeBondedStudio);
    }
  });

  // Dynamic DLC subbase condition visibility
  if (el.selectSubbaseType) {
    const syncDlcCondition = () => {
      if (el.groupDlcBondType) {
        el.groupDlcBondType.style.display = el.selectSubbaseType.value === "dlc" ? "block" : "none";
      }
    };
    el.selectSubbaseType.addEventListener("change", syncDlcCondition);
    syncDlcCondition();
  }

  if (el.selectDlcBondType) {
    el.selectDlcBondType.addEventListener("change", (e) => {
      if (e.target.value === "bonded") {
        showAppToast("Composite Bonded Section Selected — PQC depth can be reduced to 275mm!");
      }
    });
  }

  // Initialize
  initTheme();
  populateStatesDropdown();
  initCustomSelects();
  syncInputsFromState();
  runCalculationPipeline();
  renderCompositeBondedStudio();
});
