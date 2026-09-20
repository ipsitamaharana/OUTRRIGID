/**
 * irc58_engine.js
 * Browser-Compatible IRC:58:2015 JPCP Rigid Pavement Calculation Engine.
 * Implements all mechanistic formulas, PCA fatigue model, and automated
 * thickness optimization as per IRC:58:2015 guidelines.
 *
 * This is the FRONTEND version — no module.exports or require() calls.
 * Exposes the global class IRC58Engine for use in app.js.
 */

class IRC58Engine {
  constructor(data) {
    this.data = data || {};
    // Tables from IRC:58:2015
    this.cbrToK = [
      { cbr: 2, k: 21 },
      { cbr: 3, k: 28 },
      { cbr: 4, k: 35 },
      { cbr: 5, k: 42 },
      { cbr: 7, k: 48 },
      { cbr: 10, k: 55 },
      { cbr: 15, k: 62 },
      { cbr: 20, k: 69 },
      { cbr: 50, k: 140 },
      { cbr: 100, k: 220 }
    ];

    // Table 3: Effective k for Granular Subbase (GSB)
    this.gsbTable = [
      { subgradeK: 28, t150: 39, t225: 44, t300: 53 },
      { subgradeK: 56, t150: 63, t225: 75, t300: 88 },
      { subgradeK: 84, t150: 92, t225: 102, t300: 119 }
    ];

    // Table 3: Effective k for DLC subbase
    this.dlcTable = [
      { subgradeK: 21, t100: 56, t150: 97 },
      { subgradeK: 28, t100: 97, t150: 138 },
      { subgradeK: 42, t100: 166, t150: 208 },
      { subgradeK: 48, t100: 208, t150: 277 },
      { subgradeK: 55, t100: 278, t150: 300 },
      { subgradeK: 62, t100: 300, t150: 300 }
    ];

    // Table 1: Temperature differentials per zone
    this.tempDifferentials = [
      { zone: "I", t150: 12.5, t200: 13.1, t250: 14.3, t300: 15.8 },
      { zone: "II", t150: 12.5, t200: 13.1, t250: 14.3, t300: 15.8 },
      { zone: "III", t150: 15.6, t200: 16.4, t250: 16.6, t300: 16.8 },
      { zone: "IV", t150: 17.3, t200: 19.0, t250: 20.3, t300: 21.0 },
      { zone: "V", t150: 15.0, t200: 16.4, t250: 17.6, t300: 18.1 },
      { zone: "VI", t150: 14.6, t200: 15.8, t250: 16.2, t300: 17.0 },
      { zone: "VII", t150: 15.5, t200: 17.0, t250: 19.0, t300: 19.2 }
    ];

    // Default axle load spectrum
    this.defaultSpectrum = {
      single: [
        { min: 185, max: 195, mean: 190, frequency: 18.15 },
        { min: 175, max: 185, mean: 180, frequency: 17.43 },
        { min: 165, max: 175, mean: 170, frequency: 18.27 },
        { min: 155, max: 165, mean: 160, frequency: 12.98 },
        { min: 145, max: 155, mean: 150, frequency: 2.98 },
        { min: 135, max: 145, mean: 140, frequency: 1.62 },
        { min: 125, max: 135, mean: 130, frequency: 2.62 },
        { min: 115, max: 125, mean: 120, frequency: 2.65 },
        { min: 105, max: 115, mean: 110, frequency: 2.65 },
        { min: 95, max: 105, mean: 100, frequency: 3.25 },
        { min: 85, max: 95, mean: 90, frequency: 3.25 },
        { min: 0, max: 85, mean: 85, frequency: 14.15 }
      ],
      tandem: [
        { min: 380, max: 400, mean: 390, frequency: 14.50 },
        { min: 360, max: 380, mean: 370, frequency: 10.50 },
        { min: 340, max: 360, mean: 350, frequency: 3.63 },
        { min: 320, max: 340, mean: 330, frequency: 2.50 },
        { min: 300, max: 320, mean: 310, frequency: 2.69 },
        { min: 280, max: 300, mean: 290, frequency: 1.26 },
        { min: 260, max: 280, mean: 270, frequency: 3.90 },
        { min: 240, max: 260, mean: 250, frequency: 5.19 },
        { min: 220, max: 240, mean: 230, frequency: 6.30 },
        { min: 200, max: 220, mean: 210, frequency: 6.40 },
        { min: 180, max: 200, mean: 190, frequency: 8.90 },
        { min: 0, max: 180, mean: 180, frequency: 34.23 }
      ],
      tridem: [
        { min: 530, max: 560, mean: 545, frequency: 5.23 },
        { min: 500, max: 530, mean: 515, frequency: 4.85 },
        { min: 470, max: 500, mean: 485, frequency: 3.44 },
        { min: 440, max: 470, mean: 455, frequency: 7.12 },
        { min: 410, max: 440, mean: 425, frequency: 10.11 },
        { min: 380, max: 410, mean: 395, frequency: 12.01 },
        { min: 350, max: 380, mean: 365, frequency: 15.57 },
        { min: 320, max: 350, mean: 335, frequency: 13.28 },
        { min: 290, max: 320, mean: 305, frequency: 4.55 },
        { min: 260, max: 290, mean: 275, frequency: 3.16 },
        { min: 230, max: 260, mean: 245, frequency: 3.10 },
        { min: 0, max: 230, mean: 230, frequency: 17.58 }
      ]
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 1. SUBGRADE & SUBBASE MODULUS
  // ─────────────────────────────────────────────────────────────────────────

  interpolateSubgradeK(cbr) {
    const table = this.cbrToK;
    if (cbr <= table[0].cbr) return table[0].k;
    if (cbr >= table[table.length - 1].cbr) return table[table.length - 1].k;
    for (let i = 0; i < table.length - 1; i++) {
      const p1 = table[i], p2 = table[i + 1];
      if (cbr >= p1.cbr && cbr <= p2.cbr) {
        return Math.round((p1.k + ((p2.k - p1.k) * (cbr - p1.cbr)) / (p2.cbr - p1.cbr)) * 100) / 100;
      }
    }
    return 50.0;
  }

  calculateEffectiveK(subgradeK, subbaseType, thickness) {
    if (subbaseType === "gsb") {
      const table = this.gsbTable;
      const getK = (row, t) => {
        if (t <= 150) return row.t150;
        if (t >= 300) return row.t300;
        if (t <= 225) return row.t150 + ((row.t225 - row.t150) * (t - 150)) / 75;
        return row.t225 + ((row.t300 - row.t225) * (t - 225)) / 75;
      };
      if (subgradeK <= table[0].subgradeK) return getK(table[0], thickness);
      if (subgradeK >= table[table.length - 1].subgradeK) return getK(table[table.length - 1], thickness);
      for (let i = 0; i < table.length - 1; i++) {
        const r1 = table[i], r2 = table[i + 1];
        if (subgradeK >= r1.subgradeK && subgradeK <= r2.subgradeK) {
          const k1 = getK(r1, thickness), k2 = getK(r2, thickness);
          return Math.round((k1 + ((k2 - k1) * (subgradeK - r1.subgradeK)) / (r2.subgradeK - r1.subgradeK)) * 100) / 100;
        }
      }
    } else if (subbaseType === "dlc") {
      const table = this.dlcTable;
      const getK = (row, t) => {
        if (t <= 100) return row.t100;
        if (t >= 150) return row.t150;
        return row.t100 + ((row.t150 - row.t100) * (t - 100)) / 50;
      };
      if (subgradeK <= table[0].subgradeK) return getK(table[0], thickness);
      if (subgradeK >= table[table.length - 1].subgradeK) return getK(table[table.length - 1], thickness);
      for (let i = 0; i < table.length - 1; i++) {
        const r1 = table[i], r2 = table[i + 1];
        if (subgradeK >= r1.subgradeK && subgradeK <= r2.subgradeK) {
          const k1 = getK(r1, thickness), k2 = getK(r2, thickness);
          return Math.round((k1 + ((k2 - k1) * (subgradeK - r1.subgradeK)) / (r2.subgradeK - r1.subgradeK)) * 100) / 100;
        }
      }
    } else if (subbaseType === "ctb") {
      // Cement Treated Base — simple boost (approx IRC:58 guidance)
      return Math.min(300, Math.round(subgradeK * 2.5));
    }
    return subgradeK;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 2. TEMPERATURE DIFFERENTIAL
  // ─────────────────────────────────────────────────────────────────────────

  getTemperatureDifferential(zone, slabThicknessMm) {
    const entry = this.tempDifferentials.find(z => z.zone === zone) || this.tempDifferentials[2];
    let dayDeltaT;
    if (slabThicknessMm <= 150) dayDeltaT = entry.t150;
    else if (slabThicknessMm <= 200) dayDeltaT = entry.t150 + ((entry.t200 - entry.t150) * (slabThicknessMm - 150)) / 50;
    else if (slabThicknessMm <= 250) dayDeltaT = entry.t200 + ((entry.t250 - entry.t200) * (slabThicknessMm - 200)) / 50;
    else if (slabThicknessMm <= 300) dayDeltaT = entry.t250 + ((entry.t300 - entry.t250) * (slabThicknessMm - 250)) / 50;
    else dayDeltaT = entry.t300;

    dayDeltaT = Math.round(dayDeltaT * 10) / 10;
    // IRC:58:2015 Cl. 5.4: night ΔT = (dayΔT/2) + 5.0 (permanent curl allowance)
    const nightDeltaT = Math.round(((dayDeltaT / 2) + 5.0) * 10) / 10;
    return { dayDeltaT, nightDeltaT };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 3. RADIUS OF RELATIVE STIFFNESS
  // ─────────────────────────────────────────────────────────────────────────

  calculateRadiusOfRelativeStiffness(E, hMeters, kMpaPerM, mu = 0.15) {
    const num = E * Math.pow(hMeters, 3);
    const denom = 12 * kMpaPerM * (1 - Math.pow(mu, 2));
    return Math.round(Math.pow(num / denom, 0.25) * 1000) / 1000;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 4. CUMULATIVE TRAFFIC PROJECTIONS
  // ─────────────────────────────────────────────────────────────────────────

  calculateTrafficProjections(p) {
    // 1. Directional Traffic Volume (Crossing in each and every direction)
    const cvpdDir1 = p.cvpdDir1 !== undefined ? Number(p.cvpdDir1) : (Number(p.cvpdPerDirection) || 3000);
    const cvpdDir2 = p.cvpdDir2 !== undefined ? Number(p.cvpdDir2) : (Number(p.cvpdPerDirection) || 3000);
    const twoWayCvpd = cvpdDir1 + cvpdDir2;
    const predominantDirCvpd = Math.max(cvpdDir1, cvpdDir2);
    const computedPredominantPct = twoWayCvpd > 0 ? (predominantDirCvpd / twoWayCvpd) * 100 : 50.0;

    // Use user-specified predominant direction % if explicitly given, otherwise computed
    const predominantDirFactor = (p.trafficPredominantDirPct !== undefined ? Number(p.trafficPredominantDirPct) : computedPredominantPct) / 100;

    // 2. Average Axles per CV (from vehicle fleet types or user override)
    let axlesPerCV = Number(p.axlesPerCV) || 2.35;
    if (p.pct2Axle !== undefined && p.pct3Axle !== undefined && p.pctMultiAxle !== undefined) {
      const p2 = Number(p.pct2Axle) || 0;
      const p3 = Number(p.pct3Axle) || 0;
      const pm = Number(p.pctMultiAxle) || 0;
      const sum = p2 + p3 + pm;
      if (sum > 0) {
        // 2-axle = 2, 3-axle = 3, multi-axle = ~4.5-5.0
        axlesPerCV = Math.round(((2 * p2 + 3 * p3 + 5 * pm) / sum) * 100) / 100;
      }
    }

    const A = twoWayCvpd; // two-way initial CVPD
    const r = (Number(p.annualGrowthRate) || 5.0) / 100;
    const n = Number(p.designPeriod) || 30;

    // Cumulative commercial vehicles over design life (both directions)
    const totalCommercialVehicles = r > 0 ? Math.round((365 * A * (Math.pow(1 + r, n) - 1)) / r) : Math.round(365 * A * n);
    // Total axle repetitions
    const totalAxleRepetitions = Math.round(totalCommercialVehicles * axlesPerCV);
    // Predominant direction axles
    const predominantDirectionAxles = Math.round(totalAxleRepetitions * predominantDirFactor);
    // Design lane factor: outer lane (e.g., 25% for 4-lane divided per IRC:58 Table 4.1)
    const designLaneAxles = Math.round(predominantDirectionAxles * ((Number(p.trafficDesignLanePct) || 25) / 100));

    // 3. Day vs Night 12-to-12 Hour Split (passing in 24 hours)
    const nightTrafficPct = (Number(p.nightTraffic12hPct) || 60) / 100;
    const dayTrafficPct = Math.max(0, 1 - nightTrafficPct);
    const nightAxles12h = Math.round(designLaneAxles * nightTrafficPct);
    const dayAxles12h = Math.round(designLaneAxles * dayTrafficPct);

    // 4. Critical 6-Hour Windows (6h from day for BUC, 6h from night for TDC)
    const peak6hDayFraction = (Number(p.peak6hDayPct) || 50) / 100;
    const peak6hNightFraction = (Number(p.peak6hNightPct) || 50) / 100;

    const dayAxles6hBUC = Math.round(dayAxles12h * peak6hDayFraction);
    const nightAxles6hTDC = Math.round(nightAxles12h * peak6hNightFraction);

    // 5. Distance of Vehicle vs Transverse Joint Spacing Filter
    // TDC occurs when vehicle distance (wheelbase) <= transverse joint spacing (slab length)
    const wheelbasePct = (Number(p.wheelbaseLess45Pct) || 55) / 100;
    const nightAxlesShortWheelbaseTDC = Math.round(nightAxles6hTDC * wheelbasePct);

    // Allow workbook-exact overrides only if explicitly requested for benchmark reproduction
    const dayBUCTotal = p.useWorkbookExactTraffic ? (p.workbookDayAxleRepetitions || dayAxles6hBUC) : dayAxles6hBUC;
    const nightTDCTotal = p.useWorkbookExactTraffic ? (p.workbookNightAxleRepetitions || nightAxlesShortWheelbaseTDC) : nightAxlesShortWheelbaseTDC;

    const dayRepetitionsByCategory = {
      frontSingle: Math.round(dayBUCTotal * ((Number(p.frontSingleSteeringPct) || 45) / 100)),
      rearSingle: Math.round(dayBUCTotal * ((Number(p.rearSinglePct) || 15) / 100)),
      rearTandem: Math.round(dayBUCTotal * ((Number(p.rearTandemPct) || 25) / 100)),
      rearTridem: Math.round(dayBUCTotal * ((Number(p.rearTridemPct) || 15) / 100))
    };

    const nightRepetitionsByCategory = {
      frontSingle: Math.round(nightTDCTotal * ((Number(p.frontSingleSteeringPct) || 45) / 100)),
      rearSingle: Math.round(nightTDCTotal * ((Number(p.rearSinglePct) || 15) / 100)),
      rearTandem: Math.round(nightTDCTotal * ((Number(p.rearTandemPct) || 25) / 100)),
      rearTridem: Math.round(nightTDCTotal * ((Number(p.rearTridemPct) || 15) / 100))
    };

    return {
      cvpdDir1,
      cvpdDir2,
      twoWayCvpd,
      predominantDirCvpd,
      computedPredominantPct,
      predominantDirFactor,
      axlesPerCV,
      totalCommercialVehicles,
      totalAxleRepetitions,
      predominantDirectionAxles,
      designLaneAxles,
      nightAxles12h,
      dayAxles12h,
      dayBUCTotal,
      nightTDCTotal,
      dayBUCTotalForCategories: dayBUCTotal,
      nightTDCTotalForCategories: nightTDCTotal,
      dayRepetitionsByCategory,
      nightRepetitionsByCategory,
      // Passing vehicles per day breakdowns
      day12hVehiclesPerDay: Math.round(predominantDirCvpd * dayTrafficPct),
      night12hVehiclesPerDay: Math.round(predominantDirCvpd * nightTrafficPct),
      day6hPeakVehiclesPerDay: Math.round(predominantDirCvpd * dayTrafficPct * peak6hDayFraction),
      night6hPeakVehiclesPerDay: Math.round(predominantDirCvpd * nightTrafficPct * peak6hNightFraction)
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 5. BOTTOM-UP CRACKING (BUC) STRESS — IRC:58:2015 FE Regression Formulas
  // ─────────────────────────────────────────────────────────────────────────
  //  P  = axle load (kN)     h = slab thickness (m)
  //  k  = eff. k (MPa/m)     l = radius of relative stiffness (m)
  //  γ  = unit weight (kN/m³) ΔT = positive temperature differential (°C)

  calculateBUCStress(axleType, P, h, k, l, gamma, deltaTDay, shoulderType = "tied") {
    const l2 = Math.pow(l, 2);
    const l4 = Math.pow(l, 4);
    const gammaH2_kL2 = (gamma * Math.pow(h, 2)) / (k * l2);
    const Ph_kL4 = (P * h) / (k * l4);

    let stress = 0;
    const isTied = shoulderType === "tied" || shoulderType === "widened";

    if (isTied) {
      // Tied concrete shoulder — lower edge stress
      if (axleType === "single") {
        if (k <= 80) stress = 0.008 - 6.12 * gammaH2_kL2 + 2.36 * Ph_kL4 + 0.0266 * deltaTDay;
        else if (k <= 150) stress = 0.08 - 9.69 * gammaH2_kL2 + 2.09 * Ph_kL4 + 0.0409 * deltaTDay;
        else stress = 0.042 + 3.26 * gammaH2_kL2 + 1.62 * Ph_kL4 + 0.0522 * deltaTDay;
      } else {
        // tandem (and tridem treated as tandem for BUC per IRC:58)
        if (k <= 80) stress = -0.188 + 0.93 * gammaH2_kL2 + 1.025 * Ph_kL4 + 0.0207 * deltaTDay;
        else if (k <= 150) stress = -0.174 + 1.21 * gammaH2_kL2 + 0.87 * Ph_kL4 + 0.0364 * deltaTDay;
        else stress = -0.210 + 3.88 * gammaH2_kL2 + 0.73 * Ph_kL4 + 0.0506 * deltaTDay;
      }
      // Widened outer lane: 25% edge-stress reduction (IRC:58 Cl. 6.3.4)
      if (shoulderType === "widened") stress *= 0.75;
    } else {
      // No tied shoulder — higher edge stress
      if (axleType === "single") {
        if (k <= 80) stress = -0.149 - 2.60 * gammaH2_kL2 + 3.13 * Ph_kL4 + 0.0297 * deltaTDay;
        else if (k <= 150) stress = -0.119 - 2.99 * gammaH2_kL2 + 2.78 * Ph_kL4 + 0.0456 * deltaTDay;
        else stress = -0.238 + 7.02 * gammaH2_kL2 + 2.41 * Ph_kL4 + 0.0585 * deltaTDay;
      } else {
        if (k <= 80) stress = -0.223 + 2.73 * gammaH2_kL2 + 1.335 * Ph_kL4 + 0.0229 * deltaTDay;
        else if (k <= 150) stress = -0.276 + 5.78 * gammaH2_kL2 + 1.14 * Ph_kL4 + 0.0404 * deltaTDay;
        else stress = -0.300 + 9.88 * gammaH2_kL2 + 0.965 * Ph_kL4 + 0.0543 * deltaTDay;
      }
    }

    return Math.max(0, Math.round(stress * 10000) / 10000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 6. TOP-DOWN CRACKING (TDC) STRESS — IRC:58:2015 FE Regression Formulas
  // ─────────────────────────────────────────────────────────────────────────

  calculateTDCStress(axleType, meanAxleLoad, h, k, l, deltaTNight, beta = 0.66) {
    const l2 = Math.pow(l, 2);
    const l4 = Math.pow(l, 4);

    // Effective axle load sharing factor per axle group
    let effectiveP;
    if (axleType === "single") effectiveP = meanAxleLoad * 1.00;
    else if (axleType === "tandem") effectiveP = meanAxleLoad * 0.50;
    else effectiveP = meanAxleLoad * 0.33; // tridem

    const term1 = -0.219;
    const term2 = (1.686 * beta * effectiveP * h) / (k * l4);
    const term3 = (168.48 * Math.pow(h, 2)) / (k * l2);
    const term4 = 0.1089 * deltaTNight;

    const stress = term1 + term2 + term3 + term4;
    return Math.max(0, Math.round(stress * 10000) / 10000);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 7. PCA FATIGUE MODEL — Allowable Repetitions Nᵢ
  // ─────────────────────────────────────────────────────────────────────────

  calculateAllowableRepetitions(stress, fcr) {
    const sr = stress / fcr;
    const roundedSR = Math.round(sr * 10000) / 10000;

    if (roundedSR < 0.45) {
      return { sr: roundedSR, allowableNi: Infinity, isInfinite: true };
    }
    if (roundedSR <= 0.55) {
      const denom = roundedSR - 0.4325;
      if (denom <= 0) return { sr: roundedSR, allowableNi: Infinity, isInfinite: true };
      const ni = Math.pow(4.2577 / denom, 3.268);
      return { sr: roundedSR, allowableNi: Math.round(ni), isInfinite: false };
    }
    // SR > 0.55
    const exponent = (0.9718 - roundedSR) / 0.0828;
    return { sr: roundedSR, allowableNi: Math.round(Math.pow(10, exponent)), isInfinite: false };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 8. FULL ANALYSIS — runs BUC + TDC fatigue for a given trial thickness
  // ─────────────────────────────────────────────────────────────────────────

  runFullAnalysis(params) {
    const p = { ...params };

    const hMm = p.trialThickness || 310;
    const hMeters = hMm / 1000;

    // Material & subgrade
    const subgradeCBR = p.subgradeCBR || 8.0;
    const subgradeK = this.interpolateSubgradeK(subgradeCBR);
    const effectiveK = this.calculateEffectiveK(subgradeK, p.subbaseType || "gsb", p.subbaseThickness || 150);
    const fck28 = p.fck28 || 40;
    const E = p.elasticModulus || Math.round(5000 * Math.sqrt(fck28));
    const mu = p.poissonRatio || 0.15;
    const gamma = p.unitWeight || 24.0;
    const fcr = p.designFlexuralStrength || 4.87;
    const lMeters = this.calculateRadiusOfRelativeStiffness(E, hMeters, effectiveK, mu);

    // Climate
    const zone = p.zone || "III";
    const { dayDeltaT, nightDeltaT } = this.getTemperatureDifferential(zone, hMm);

    // Traffic
    const traffic = this.calculateTrafficProjections(p);

    // Joint type — beta factor
    const beta = (p.transverseJointType === "undoweled") ? 0.90 : 0.66;

    // Shoulder
    const shoulderType = p.shoulderType || "tied";

    // Axle spectrum
    const spectrum = p.axleSpectrum || this.defaultSpectrum;

    // ── BUC Analysis ────────────────────────────────────────────────────────
    let bucSingleDamageSum = 0;
    let bucTandemDamageSum = 0;

    const bucSingleRows = spectrum.single.map(item => {
      const rep = Math.round(traffic.dayRepetitionsByCategory.rearSingle * (item.frequency / 100));
      const stress = this.calculateBUCStress("single", item.mean, hMeters, effectiveK, lMeters, gamma, dayDeltaT, shoulderType);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      bucSingleDamageSum += damage;
      return {
        meanLoad: item.mean, frequency: item.frequency,
        expectedRep: rep, stress,
        sr: fatigue.sr, allowableNi: fatigue.allowableNi,
        isInfinite: fatigue.isInfinite,
        damage: Math.round(damage * 100000) / 100000
      };
    });

    const bucTandemRows = spectrum.tandem.map(item => {
      const rep = Math.round(traffic.dayRepetitionsByCategory.rearTandem * (item.frequency / 100));
      const stress = this.calculateBUCStress("tandem", item.mean, hMeters, effectiveK, lMeters, gamma, dayDeltaT, shoulderType);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      bucTandemDamageSum += damage;
      return {
        meanLoad: item.mean, frequency: item.frequency,
        expectedRep: rep, stress,
        sr: fatigue.sr, allowableNi: fatigue.allowableNi,
        isInfinite: fatigue.isInfinite,
        damage: Math.round(damage * 100000) / 100000
      };
    });

    const totalBUCDamage = Math.round((bucSingleDamageSum + bucTandemDamageSum) * 10000) / 10000;

    // ── TDC Analysis ────────────────────────────────────────────────────────
    let tdcSingleDamageSum = 0;
    let tdcTandemDamageSum = 0;
    let tdcTridemDamageSum = 0;

    const tdcSingleRows = spectrum.single.map(item => {
      const rep = Math.round(traffic.nightRepetitionsByCategory.rearSingle * (item.frequency / 100));
      const stress = this.calculateTDCStress("single", item.mean, hMeters, effectiveK, lMeters, nightDeltaT, beta);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      tdcSingleDamageSum += damage;
      return {
        meanLoad: item.mean, expectedRep: rep, stress,
        sr: fatigue.sr, allowableNi: fatigue.allowableNi,
        isInfinite: fatigue.isInfinite,
        damage: Math.round(damage * 100000) / 100000
      };
    });

    const tdcTandemRows = spectrum.tandem.map(item => {
      const rep = Math.round(traffic.nightRepetitionsByCategory.rearTandem * (item.frequency / 100));
      const stress = this.calculateTDCStress("tandem", item.mean, hMeters, effectiveK, lMeters, nightDeltaT, beta);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      tdcTandemDamageSum += damage;
      return {
        meanLoad: item.mean, expectedRep: rep, stress,
        sr: fatigue.sr, allowableNi: fatigue.allowableNi,
        isInfinite: fatigue.isInfinite,
        damage: Math.round(damage * 100000) / 100000
      };
    });

    const tdcTridemRows = spectrum.tridem.map(item => {
      const rep = Math.round(traffic.nightRepetitionsByCategory.rearTridem * (item.frequency / 100));
      const stress = this.calculateTDCStress("tridem", item.mean, hMeters, effectiveK, lMeters, nightDeltaT, beta);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      tdcTridemDamageSum += damage;
      return {
        meanLoad: item.mean, expectedRep: rep, stress,
        sr: fatigue.sr, allowableNi: fatigue.allowableNi,
        isInfinite: fatigue.isInfinite,
        damage: Math.round(damage * 100000) / 100000
      };
    });

    const totalTDCDamage = Math.round((tdcSingleDamageSum + tdcTandemDamageSum + tdcTridemDamageSum) * 10000) / 10000;
    const totalCFD = Math.round((totalBUCDamage + totalTDCDamage) * 10000) / 10000;
    const isSafe = totalCFD <= 1.0;

    return {
      inputs: p,
      derived: { subgradeK, effectiveK, E, mu, gamma, fcr, lMeters, hMeters, dayDeltaT, nightDeltaT },
      traffic,
      buc: { singleRows: bucSingleRows, tandemRows: bucTandemRows, totalBUCDamage },
      tdc: { singleRows: tdcSingleRows, tandemRows: tdcTandemRows, tridemRows: tdcTridemRows, totalTDCDamage },
      summary: {
        trialThicknessMm: hMm,
        wearAllowanceMm: p.wearAllowance || 10,
        finalThicknessMm: hMm + (p.wearAllowance || 10),
        totalCFD,
        isSafe
      }
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 9. AUTO-OPTIMIZE THICKNESS
  // ─────────────────────────────────────────────────────────────────────────

  optimizeThickness(params, minThickness = 200, maxThickness = 400, step = 5) {
    let optimalThickness = null;
    const sensitivityPoints = [];

    for (let t = minThickness; t <= maxThickness; t += step) {
      const testParams = { ...params, trialThickness: t };
      const res = this.runFullAnalysis(testParams);
      sensitivityPoints.push({
        thicknessMm: t,
        bucCFD: res.buc.totalBUCDamage,
        tdcCFD: res.tdc.totalTDCDamage,
        totalCFD: res.summary.totalCFD,
        isSafe: res.summary.isSafe
      });
      if (res.summary.isSafe && optimalThickness === null) {
        optimalThickness = t;
      }
    }

    const optimalAnalysis = optimalThickness
      ? this.runFullAnalysis({ ...params, trialThickness: optimalThickness })
      : null;

    return {
      optimalThicknessMm: optimalThickness || maxThickness,
      providedThicknessMm: (optimalThickness || maxThickness) + 10,
      optimalAnalysis,
      sensitivityPoints,
      concreteSavingsPct: optimalThickness
        ? Math.round(((maxThickness - optimalThickness) / maxThickness) * 100)
        : 0
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // 10. COMPARE 4 CONSTRUCTION VARIANTS (IRC:58:2015 Cl. 5.9)
  // ─────────────────────────────────────────────────────────────────────────

  compareVariants(params) {
    const variants = [
      { name: "Option 1: Tied Concrete Shoulder & Doweled Joints", shoulderType: "tied", transverseJointType: "doweled" },
      { name: "Option 2: Without Concrete Shoulder & Undoweled", shoulderType: "untied", transverseJointType: "undoweled" },
      { name: "Option 3: Widened Outer Lane (+0.6 m) & Doweled", shoulderType: "widened", transverseJointType: "doweled" },
      { name: "Option 4: Bonded to Dry Lean Concrete (DLC) Subbase", shoulderType: "tied", transverseJointType: "doweled", subbaseType: "dlc" }
    ];

    return variants.map(v => {
      const opt = this.optimizeThickness({ ...params, ...v });
      return {
        variantName: v.name,
        shoulderType: v.shoulderType,
        jointType: v.transverseJointType,
        requiredThicknessMm: opt.optimalThicknessMm,
        providedThicknessMm: opt.providedThicknessMm,
        totalCFD: opt.optimalAnalysis ? opt.optimalAnalysis.summary.totalCFD : "N/A",
        isSafe: opt.optimalAnalysis ? opt.optimalAnalysis.summary.isSafe : false
      };
    });
  }
}
