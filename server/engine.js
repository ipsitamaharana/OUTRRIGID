/**
 * server/engine.js
 * Comprehensive IRC:58:2015 Mechanistic Calculation Engine & Optimizer
 * Supports all 4 design variants, all 7 climate zones, subbase types,
 * PCA fatigue analysis, and automated thickness optimization.
 */

// IRC:58:2015 Reference Tables & Constants
const TABLES = {
  // Table 2: Subgrade CBR vs Modulus of Subgrade Reaction (k) for 750 mm dia plate
  cbrToK: [
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
  ],

  // Table 3: Effective k-value for Granular Subbase (GSB) & Cement-Treated Subbase
  subbaseK: {
    gsb: [
      { subgradeK: 28, t150: 39, t225: 44, t300: 53 },
      { subgradeK: 56, t150: 63, t225: 75, t300: 88 },
      { subgradeK: 84, t150: 92, t225: 102, t300: 119 }
    ],
    cementTreated: [
      { subgradeK: 28, t100: 76, t150: 108, t200: 141 },
      { subgradeK: 56, t100: 127, t150: 173, t200: 225 }
    ],
    dlc: [
      { subgradeK: 21, t100: 56, t150: 97 },
      { subgradeK: 28, t100: 97, t150: 138 },
      { subgradeK: 42, t100: 166, t150: 208 },
      { subgradeK: 48, t100: 208, t150: 277 },
      { subgradeK: 55, t100: 278, t150: 300 },
      { subgradeK: 62, t100: 300, t150: 300 }
    ]
  },

  // Table 1: Recommended Maximum Temperature Differentials (deg C)
  tempDifferentials: [
    { zone: "I", name: "Hilly regions (J&K, HP, Uttaranchal, Arunachal)", t150: 12.5, t200: 13.1, t250: 14.3, t300: 15.8 },
    { zone: "II", name: "Punjab, UP, Gujarat, Rajasthan, Haryana, North MP", t150: 12.5, t200: 13.1, t250: 14.3, t300: 15.8 },
    { zone: "III", name: "Bihar, Jharkhand, West Bengal, Assam, Eastern Orissa", t150: 15.6, t200: 16.4, t250: 16.6, t300: 16.8 },
    { zone: "IV", name: "Maharashtra, Karnataka, South MP, Chattisgarh, AP, West Orissa, North TN", t150: 17.3, t200: 19.0, t250: 20.3, t300: 21.0 },
    { zone: "V", name: "Kerala and South Tamil Nadu", t150: 15.0, t200: 16.4, t250: 17.6, t300: 18.1 },
    { zone: "VI", name: "Coastal areas bounded by hills", t150: 14.6, t200: 15.8, t250: 16.2, t300: 17.0 },
    { zone: "VII", name: "Coastal areas unbounded by hills", t150: 15.5, t200: 17.0, t250: 19.0, t300: 19.2 }
  ],

  // Table 6: Recommended Dimensions of Dowel Bars
  dowelBars: [
    { slabThickness: 200, diameter: 25, length: 360, spacing: 300 },
    { slabThickness: 230, diameter: 30, length: 400, spacing: 300 },
    { slabThickness: 250, diameter: 32, length: 450, spacing: 300 },
    { slabThickness: 280, diameter: 36, length: 450, spacing: 300 },
    { slabThickness: 300, diameter: 38, length: 500, spacing: 300 },
    { slabThickness: 350, diameter: 38, length: 500, spacing: 300 }
  ],

  // Table 7: Details of Tie Bars for Longitudinal Joints
  tieBars: [
    { slabThickness: 150, dia: 8, maxSpacingPlain: 330, maxSpacingDef: 530, minLenPlain: 440, minLenDef: 480 },
    { slabThickness: 150, dia: 10, maxSpacingPlain: 520, maxSpacingDef: 830, minLenPlain: 510, minLenDef: 560 },
    { slabThickness: 200, dia: 10, maxSpacingPlain: 390, maxSpacingDef: 620, minLenPlain: 510, minLenDef: 560 },
    { slabThickness: 200, dia: 12, maxSpacingPlain: 560, maxSpacingDef: 900, minLenPlain: 580, minLenDef: 640 },
    { slabThickness: 250, dia: 12, maxSpacingPlain: 450, maxSpacingDef: 720, minLenPlain: 580, minLenDef: 640 },
    { slabThickness: 300, dia: 12, maxSpacingPlain: 370, maxSpacingDef: 600, minLenPlain: 580, minLenDef: 640 },
    { slabThickness: 300, dia: 16, maxSpacingPlain: 660, maxSpacingDef: 1060, minLenPlain: 720, minLenDef: 800 },
    { slabThickness: 350, dia: 12, maxSpacingPlain: 320, maxSpacingDef: 510, minLenPlain: 580, minLenDef: 640 },
    { slabThickness: 350, dia: 16, maxSpacingPlain: 570, maxSpacingDef: 910, minLenPlain: 720, minLenDef: 800 }
  ]
};

// Default Axle Spectrum (from IRC:58 Weighing Survey Benchmark)
const DEFAULT_SPECTRUM = {
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

class CalculationEngine {
  /**
   * Interpolate Subgrade Reaction k (MPa/m) from Soaked CBR (%)
   */
  static interpolateSubgradeK(cbr) {
    const table = TABLES.cbrToK;
    if (cbr <= table[0].cbr) return table[0].k;
    if (cbr >= table[table.length - 1].cbr) return table[table.length - 1].k;

    for (let i = 0; i < table.length - 1; i++) {
      const p1 = table[i];
      const p2 = table[i + 1];
      if (cbr >= p1.cbr && cbr <= p2.cbr) {
        const k = p1.k + ((p2.k - p1.k) * (cbr - p1.cbr)) / (p2.cbr - p1.cbr);
        return Math.round(k * 100) / 100;
      }
    }
    return 50.3;
  }

  /**
   * Calculate Effective k_eff (MPa/m) over Subbase
   */
  static calculateEffectiveK(subgradeK, subbaseType, thickness) {
    if (subbaseType === "gsb") {
      const gsbTable = TABLES.subbaseK.gsb;
      const getK = (row, t) => {
        if (t <= 150) return row.t150;
        if (t >= 300) return row.t300;
        if (t <= 225) return row.t150 + ((row.t225 - row.t150) * (t - 150)) / 75;
        return row.t225 + ((row.t300 - row.t225) * (t - 225)) / 75;
      };

      if (subgradeK <= gsbTable[0].subgradeK) return getK(gsbTable[0], thickness);
      if (subgradeK >= gsbTable[gsbTable.length - 1].subgradeK) return getK(gsbTable[gsbTable.length - 1], thickness);

      for (let i = 0; i < gsbTable.length - 1; i++) {
        const r1 = gsbTable[i];
        const r2 = gsbTable[i + 1];
        if (subgradeK >= r1.subgradeK && subgradeK <= r2.subgradeK) {
          const k1 = getK(r1, thickness);
          const k2 = getK(r2, thickness);
          const val = k1 + ((k2 - k1) * (subgradeK - r1.subgradeK)) / (r2.subgradeK - r1.subgradeK);
          return Math.round(val * 100) / 100;
        }
      }
    } else if (subbaseType === "dlc") {
      const dlcTable = TABLES.subbaseK.dlc;
      const getK = (row, t) => {
        if (t <= 100) return row.t100;
        if (t >= 150) return row.t150;
        return row.t100 + ((row.t150 - row.t100) * (t - 100)) / 50;
      };

      if (subgradeK <= dlcTable[0].subgradeK) return getK(dlcTable[0], thickness);
      if (subgradeK >= dlcTable[dlcTable.length - 1].subgradeK) return getK(dlcTable[dlcTable.length - 1], thickness);

      for (let i = 0; i < dlcTable.length - 1; i++) {
        const r1 = dlcTable[i];
        const r2 = dlcTable[i + 1];
        if (subgradeK >= r1.subgradeK && subgradeK <= r2.subgradeK) {
          const k1 = getK(r1, thickness);
          const k2 = getK(r2, thickness);
          const val = k1 + ((k2 - k1) * (subgradeK - r1.subgradeK)) / (r2.subgradeK - r1.subgradeK);
          return Math.round(val * 100) / 100;
        }
      }
    }
    return subgradeK;
  }

  /**
   * Temperature differential from Table 1 + permanent curl
   */
  static getTemperatureDifferential(zone, slabThicknessMm) {
    const entry = TABLES.tempDifferentials.find((z) => z.zone === zone) || TABLES.tempDifferentials[2];
    let dayDeltaT;
    if (slabThicknessMm <= 150) dayDeltaT = entry.t150;
    else if (slabThicknessMm <= 200) dayDeltaT = entry.t150 + ((entry.t200 - entry.t150) * (slabThicknessMm - 150)) / 50;
    else if (slabThicknessMm <= 250) dayDeltaT = entry.t200 + ((entry.t250 - entry.t200) * (slabThicknessMm - 200)) / 50;
    else if (slabThicknessMm <= 300) dayDeltaT = entry.t250 + ((entry.t300 - entry.t250) * (slabThicknessMm - 250)) / 50;
    else dayDeltaT = entry.t300;

    dayDeltaT = Math.round(dayDeltaT * 10) / 10;
    let nightDeltaT;
    if (zone === "III") {
      nightDeltaT = 13.4;
    } else {
      nightDeltaT = Math.round((dayDeltaT * 0.8) * 10) / 10;
    }
    return { dayDeltaT, nightDeltaT };
  }

  /**
   * Radius of relative stiffness l (m)
   */
  static calculateRadiusOfRelativeStiffness(E, hMeters, kMpaPerM, mu = 0.15) {
    const num = E * Math.pow(hMeters, 3);
    const denom = 12 * kMpaPerM * (1 - Math.pow(mu, 2));
    return Math.round(Math.pow(num / denom, 0.25) * 1000) / 1000;
  }

  /**
   * Cumulative Traffic Projection
   */
  static calculateTrafficProjections(params) {
    const A = params.twoWayCVPD || ((params.cvpdPerDirection || 3000) * 2);
    const r = (params.annualGrowthRate || 5.0) / 100;
    const n = params.designPeriod || 30;

    const totalCommercialVehicles = Math.round((365 * A * (Math.pow(1 + r, n) - 1)) / r);
    const totalAxleRepetitions = Math.round(totalCommercialVehicles * (params.axlesPerCV || 2.35));
    const predominantDirectionAxles = Math.round(totalAxleRepetitions * ((params.trafficPredominantDirPct || 50) / 100));
    const designLaneAxles = Math.round(predominantDirectionAxles * ((params.trafficDesignLanePct || 25) / 100));

    const nightAxles12h = Math.round(designLaneAxles * ((params.nightTraffic12hPct || 60) / 100));
    const dayAxles12h = Math.round(designLaneAxles * ((params.dayTraffic12hPct || 40) / 100));

    const dayAxles6hBUC = Math.round(dayAxles12h * ((params.peak6hDayPct || 50) / 100));
    const nightAxles6hTDC = Math.round(nightAxles12h * ((params.peak6hNightPct || 50) / 100));
    const nightAxlesShortWheelbaseTDC = Math.round(nightAxles6hTDC * ((params.wheelbaseLess45Pct || 55) / 100));

    let dayBUCTotal;
    let nightTDCTotal;

    if (params.useWorkbookExactTraffic) {
      dayBUCTotal = params.workbookDayAxleRepetitions || 15019127;
      nightTDCTotal = params.workbookNightAxleRepetitions || 12390780;
    } else {
      dayBUCTotal = dayAxles6hBUC;
      nightTDCTotal = nightAxlesShortWheelbaseTDC;
    }

    return {
      totalCommercialVehicles,
      totalAxleRepetitions,
      predominantDirectionAxles,
      designLaneAxles,
      dayBUCTotal,
      nightTDCTotal,
      dayRepetitionsByCategory: {
        frontSingle: Math.round(dayBUCTotal * ((params.frontSingleSteeringPct || 45) / 100)),
        rearSingle: Math.round(dayBUCTotal * ((params.rearSinglePct || 15) / 100)),
        rearTandem: Math.round(dayBUCTotal * ((params.rearTandemPct || 25) / 100)),
        rearTridem: Math.round(dayBUCTotal * ((params.rearTridemPct || 15) / 100))
      },
      nightRepetitionsByCategory: {
        frontSingle: Math.round(nightTDCTotal * ((params.frontSingleSteeringPct || 45) / 100)),
        rearSingle: Math.round(nightTDCTotal * ((params.rearSinglePct || 15) / 100)),
        rearTandem: Math.round(nightTDCTotal * ((params.rearTandemPct || 25) / 100)),
        rearTridem: Math.round(nightTDCTotal * ((params.rearTridemPct || 15) / 100))
      }
    };
  }

  /**
   * Bottom-Up Cracking Stress (MPa)
   */
  static calculateBUCStress(axleType, P, h, k, l, gamma, deltaTDay, shoulderType = "tied") {
    const l2 = Math.pow(l, 2);
    const l4 = Math.pow(l, 4);
    const gammaH2_kL2 = (gamma * Math.pow(h, 2)) / (k * l2);
    const Ph_kL4 = (P * h) / (k * l4);

    let stress = 0;
    const isTied = shoulderType === "tied" || shoulderType === "widened";

    if (isTied) {
      if (axleType === "single") {
        if (k <= 80) stress = 0.008 - 6.12 * gammaH2_kL2 + 2.36 * Ph_kL4 + 0.0266 * deltaTDay;
        else if (k <= 150) stress = 0.08 - 9.69 * gammaH2_kL2 + 2.09 * Ph_kL4 + 0.0409 * deltaTDay;
        else stress = 0.042 + 3.26 * gammaH2_kL2 + 1.62 * Ph_kL4 + 0.0522 * deltaTDay;
      } else {
        if (k <= 80) stress = -0.188 - 0.93 * gammaH2_kL2 + 1.025 * Ph_kL4 + 0.0207 * deltaTDay;
        else if (k <= 150) stress = -0.174 + 1.21 * gammaH2_kL2 + 0.87 * Ph_kL4 + 0.0364 * deltaTDay;
        else stress = -0.210 + 3.88 * gammaH2_kL2 + 0.73 * Ph_kL4 + 0.0506 * deltaTDay;
      }
      // Widened outer lane reduces edge stress by 25% (Slide 40)
      if (shoulderType === "widened") stress *= 0.75;
    } else {
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

    return Math.max(0, Math.round(stress * 1000) / 1000);
  }

  /**
   * Top-Down Cracking Stress (MPa)
   */
  static calculateTDCStress(axleType, meanAxleLoad, h, k, l, deltaTNight, beta = 0.66) {
    const l2 = Math.pow(l, 2);
    const l4 = Math.pow(l, 4);

    let effectiveP;
    if (axleType === "single") effectiveP = meanAxleLoad * 1.0;
    else if (axleType === "tandem") effectiveP = meanAxleLoad * 0.50;
    else effectiveP = meanAxleLoad * 0.33;

    const term1 = -0.219;
    const term2 = (1.686 * effectiveP * h) / (k * l4);
    const term3 = ((168.48 * Math.pow(h, 2)) / k) * l2;
    const term4 = 0.1089 * deltaTNight;

    const stress = (term1 + term2 + term3 + term4) * beta;
    return Math.max(0, Math.round(stress * 1000) / 1000);
  }

  /**
   * PCA Fatigue Model: Allowable Repetitions Ni
   */
  static calculateAllowableRepetitions(stress, fcr) {
    const sr = stress / fcr;
    const roundedSR = Math.round(sr * 1000) / 1000;

    if (roundedSR < 0.45) return { sr: roundedSR, allowableNi: Infinity, isInfinite: true };
    if (roundedSR <= 0.55) {
      const denom = roundedSR - 0.4325;
      if (denom <= 0) return { sr: roundedSR, allowableNi: Infinity, isInfinite: true };
      const ni = Math.pow(4.2577 / denom, 3.268);
      return { sr: roundedSR, allowableNi: Math.round(ni), isInfinite: false };
    }
    const exponent = (0.9718 - roundedSR) / 0.0828;
    return { sr: roundedSR, allowableNi: Math.round(Math.pow(10, exponent)), isInfinite: false };
  }

  /**
   * Full Analysis Engine
   */
  static runFullAnalysis(params) {
    const p = { ...params };
    const hMeters = (p.trialThickness || 310) / 1000;
    const subgradeK = this.interpolateSubgradeK(p.subgradeCBR || 8.0);
    const effectiveK = this.calculateEffectiveK(subgradeK, p.subbaseType || "gsb", p.subbaseThickness || 150);
    const E = p.elasticModulus || Math.round(5000 * Math.sqrt(p.fck28 || 40));
    const mu = p.poissonRatio || 0.15;
    const lMeters = this.calculateRadiusOfRelativeStiffness(E, hMeters, effectiveK, mu);
    const gamma = p.unitWeight || 24.0;
    const fcr = p.designFlexuralStrength || 4.87;
    const { dayDeltaT, nightDeltaT } = this.getTemperatureDifferential(p.zone || "III", p.trialThickness || 310);
    const traffic = this.calculateTrafficProjections(p);
    const beta = p.transverseJointType === "undoweled" ? 0.90 : 0.66;
    const spectrum = p.axleSpectrum || DEFAULT_SPECTRUM;

    // BUC Analysis
    let bucSingleDamageSum = 0;
    let bucTandemDamageSum = 0;
    const bucSingleRows = spectrum.single.map((item, idx) => {
      let rep;
      let freq = item.frequency;
      if (p.customBucReps && p.customBucReps.single && p.customBucReps.single[idx] !== undefined) {
        rep = Number(p.customBucReps.single[idx]);
        if (traffic.dayRepetitionsByCategory.rearSingle > 0) {
          freq = (rep / traffic.dayRepetitionsByCategory.rearSingle) * 100;
        }
      } else {
        rep = Math.round(traffic.dayRepetitionsByCategory.rearSingle * (item.frequency / 100));
      }
      const stress = this.calculateBUCStress("single", item.mean, hMeters, effectiveK, lMeters, gamma, dayDeltaT, p.shoulderType);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      bucSingleDamageSum += damage;
      return { meanLoad: item.mean, frequency: freq, expectedRep: rep, stress, sr: fatigue.sr, allowableNi: fatigue.allowableNi, isInfinite: fatigue.isInfinite, damage: Math.round(damage * 100000) / 100000 };
    });

    const bucTandemRows = spectrum.tandem.map((item, idx) => {
      let rep;
      let freq = item.frequency;
      if (p.customBucReps && p.customBucReps.tandem && p.customBucReps.tandem[idx] !== undefined) {
        rep = Number(p.customBucReps.tandem[idx]);
        if (traffic.dayRepetitionsByCategory.rearTandem > 0) {
          freq = (rep / traffic.dayRepetitionsByCategory.rearTandem) * 100;
        }
      } else {
        rep = Math.round(traffic.dayRepetitionsByCategory.rearTandem * (item.frequency / 100));
      }
      const stress = this.calculateBUCStress("tandem", item.mean, hMeters, effectiveK, lMeters, gamma, dayDeltaT, p.shoulderType);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      bucTandemDamageSum += damage;
      return { meanLoad: item.mean, frequency: freq, expectedRep: rep, stress, sr: fatigue.sr, allowableNi: fatigue.allowableNi, isInfinite: fatigue.isInfinite, damage: Math.round(damage * 100000) / 100000 };
    });

    const totalBUCDamage = Math.round((bucSingleDamageSum + bucTandemDamageSum) * 1000) / 1000;

    // TDC Analysis
    let tdcSingleDamageSum = 0;
    let tdcTandemDamageSum = 0;
    let tdcTridemDamageSum = 0;

    const tdcSingleRows = spectrum.single.map((item, idx) => {
      let rep;
      if (p.customTdcReps && p.customTdcReps.single && p.customTdcReps.single[idx] !== undefined) {
        rep = Number(p.customTdcReps.single[idx]);
      } else {
        rep = Math.round(traffic.nightRepetitionsByCategory.rearSingle * (item.frequency / 100));
      }
      const stress = this.calculateTDCStress("single", item.mean, hMeters, effectiveK, lMeters, nightDeltaT, beta);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      tdcSingleDamageSum += damage;
      return { meanLoad: item.mean, expectedRep: rep, stress, sr: fatigue.sr, allowableNi: fatigue.allowableNi, isInfinite: fatigue.isInfinite, damage: Math.round(damage * 100000) / 100000 };
    });

    const tdcTandemRows = spectrum.tandem.map((item, idx) => {
      let rep;
      if (p.customTdcReps && p.customTdcReps.tandem && p.customTdcReps.tandem[idx] !== undefined) {
        rep = Number(p.customTdcReps.tandem[idx]);
      } else {
        rep = Math.round(traffic.nightRepetitionsByCategory.rearTandem * (item.frequency / 100));
      }
      const stress = this.calculateTDCStress("tandem", item.mean, hMeters, effectiveK, lMeters, nightDeltaT, beta);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      tdcTandemDamageSum += damage;
      return { meanLoad: item.mean, expectedRep: rep, stress, sr: fatigue.sr, allowableNi: fatigue.allowableNi, isInfinite: fatigue.isInfinite, damage: Math.round(damage * 100000) / 100000 };
    });

    const tdcTridemRows = spectrum.tridem.map((item, idx) => {
      let rep;
      if (p.customTdcReps && p.customTdcReps.tridem && p.customTdcReps.tridem[idx] !== undefined) {
        rep = Number(p.customTdcReps.tridem[idx]);
      } else {
        rep = Math.round(traffic.nightRepetitionsByCategory.rearTridem * (item.frequency / 100));
      }
      const stress = this.calculateTDCStress("tridem", item.mean, hMeters, effectiveK, lMeters, nightDeltaT, beta);
      const fatigue = this.calculateAllowableRepetitions(stress, fcr);
      const damage = fatigue.isInfinite ? 0 : rep / fatigue.allowableNi;
      tdcTridemDamageSum += damage;
      return { meanLoad: item.mean, expectedRep: rep, stress, sr: fatigue.sr, allowableNi: fatigue.allowableNi, isInfinite: fatigue.isInfinite, damage: Math.round(damage * 100000) / 100000 };
    });

    const totalTDCDamage = Math.round((tdcSingleDamageSum + tdcTandemDamageSum + tdcTridemDamageSum) * 1000) / 1000;
    const totalCFD = Math.round((totalBUCDamage + totalTDCDamage) * 1000) / 1000;
    const isSafe = totalCFD <= 1.0;

    return {
      inputs: p,
      derived: { subgradeK, effectiveK, E, mu, gamma, fcr, lMeters, hMeters, dayDeltaT, nightDeltaT },
      traffic,
      buc: { singleRows: bucSingleRows, tandemRows: bucTandemRows, totalBUCDamage },
      tdc: { singleRows: tdcSingleRows, tandemRows: tdcTandemRows, tridemRows: tdcTridemRows, totalTDCDamage },
      summary: {
        trialThicknessMm: p.trialThickness || 310,
        wearAllowanceMm: p.wearAllowance || 10,
        finalThicknessMm: (p.trialThickness || 310) + (p.wearAllowance || 10),
        totalCFD,
        isSafe
      }
    };
  }

  /**
   * Automated Thickness Optimizer
   * Finds the minimum safe slab thickness h (mm) where Total CFD <= 1.0
   */
  static optimizeThickness(params, minThickness = 220, maxThickness = 400, step = 5) {
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

    const optimalAnalysis = optimalThickness ? this.runFullAnalysis({ ...params, trialThickness: optimalThickness }) : null;

    return {
      optimalThicknessMm: optimalThickness || maxThickness,
      providedThicknessMm: (optimalThickness || maxThickness) + 10,
      optimalAnalysis,
      sensitivityPoints,
      concreteSavingsPct: optimalThickness ? Math.round(((maxThickness - optimalThickness) / maxThickness) * 100) : 0
    };
  }

  /**
   * Compare All 4 Construction Variants (Slide 58)
   */
  static compareVariants(params) {
    const variants = [
      { name: "Option 1: Tied Concrete Shoulder & Doweled Joints", shoulderType: "tied", transverseJointType: "doweled" },
      { name: "Option 2: Without Concrete Shoulder & Undoweled", shoulderType: "untied", transverseJointType: "undoweled" },
      { name: "Option 3: Widened Outer Lane (+0.6m) & Doweled", shoulderType: "widened", transverseJointType: "doweled" },
      { name: "Option 4: Bonded to Dry Lean Concrete (DLC)", shoulderType: "tied", transverseJointType: "doweled", subbaseType: "dlc" }
    ];

    return variants.map((v) => {
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

module.exports = { CalculationEngine, TABLES, DEFAULT_SPECTRUM };
