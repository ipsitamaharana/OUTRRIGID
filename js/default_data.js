/**
 * default_data.js
 * Reference datasets, lookup tables, and default values as per IRC:58:2015.
 * Comprehensive Pan-India State & Region Mapping (All 28 States & 8 Union Territories).
 */

const IRC58_DATA = {
  // Exhaustive Indian States & Union Territories database with IRC:58 Climatic Zones
  indianStates: [
    { state: "Andhra Pradesh", region: "Inland Plateau", zone: "IV", defaultCbr: 6.0, defaultCvpd: 3500 },
    { state: "Andhra Pradesh", region: "Coastal Belt", zone: "VII", defaultCbr: 5.0, defaultCvpd: 4000 },
    { state: "Arunachal Pradesh", region: "Hilly Terrain", zone: "I", defaultCbr: 7.0, defaultCvpd: 1200 },
    { state: "Assam", region: "Brahmaputra Valley & Plains", zone: "III", defaultCbr: 5.0, defaultCvpd: 2500 },
    { state: "Bihar", region: "Gangetic Plains", zone: "III", defaultCbr: 8.0, defaultCvpd: 3000 },
    { state: "Chhattisgarh", region: "Central Plateau", zone: "IV", defaultCbr: 7.0, defaultCvpd: 3200 },
    { state: "Goa", region: "West Coastal Strip", zone: "VI", defaultCbr: 6.0, defaultCvpd: 2800 },
    { state: "Gujarat", region: "Plains & Saurashtra", zone: "II", defaultCbr: 7.0, defaultCvpd: 5000 },
    { state: "Gujarat", region: "Coastal Region", zone: "VII", defaultCbr: 6.0, defaultCvpd: 4500 },
    { state: "Haryana", region: "Northern Plains", zone: "II", defaultCbr: 8.0, defaultCvpd: 5500 },
    { state: "Himachal Pradesh", region: "Hilly & Mountainous", zone: "I", defaultCbr: 8.0, defaultCvpd: 1500 },
    { state: "Jharkhand", region: "Chota Nagpur Plateau", zone: "III", defaultCbr: 7.0, defaultCvpd: 3200 },
    { state: "Karnataka", region: "Deccan Plateau", zone: "IV", defaultCbr: 7.0, defaultCvpd: 4200 },
    { state: "Karnataka", region: "Coastal (Karavali)", zone: "VI", defaultCbr: 6.0, defaultCvpd: 3500 },
    { state: "Kerala", region: "Midland & Highlands", zone: "V", defaultCbr: 6.0, defaultCvpd: 3800 },
    { state: "Kerala", region: "Coastal Belt", zone: "VI", defaultCbr: 5.0, defaultCvpd: 4200 },
    { state: "Madhya Pradesh", region: "Northern MP (Gwalior/Chambal)", zone: "II", defaultCbr: 7.0, defaultCvpd: 3600 },
    { state: "Madhya Pradesh", region: "Southern MP (Malwa/Narmada)", zone: "IV", defaultCbr: 7.0, defaultCvpd: 4000 },
    { state: "Maharashtra", region: "Deccan Plateau / Marathwada / Vidarbha", zone: "IV", defaultCbr: 6.0, defaultCvpd: 6000 },
    { state: "Maharashtra", region: "Konkan Coastal Strip", zone: "VI", defaultCbr: 6.0, defaultCvpd: 4500 },
    { state: "Manipur", region: "Hilly & Valley", zone: "I", defaultCbr: 6.0, defaultCvpd: 1000 },
    { state: "Meghalaya", region: "Shillong Plateau / Hilly", zone: "I", defaultCbr: 7.0, defaultCvpd: 1100 },
    { state: "Mizoram", region: "Hilly Terrain", zone: "I", defaultCbr: 6.0, defaultCvpd: 900 },
    { state: "Nagaland", region: "Hilly Terrain", zone: "I", defaultCbr: 6.0, defaultCvpd: 1000 },
    { state: "Odisha", region: "Western & Central Odisha", zone: "IV", defaultCbr: 7.0, defaultCvpd: 3400 },
    { state: "Odisha", region: "Eastern Plains & Coastal", zone: "III", defaultCbr: 6.0, defaultCvpd: 3600 },
    { state: "Punjab", region: "Northern Plains", zone: "II", defaultCbr: 8.0, defaultCvpd: 5000 },
    { state: "Rajasthan", region: "Arid & Semi-Arid Plains", zone: "II", defaultCbr: 8.0, defaultCvpd: 4200 },
    { state: "Sikkim", region: "Himalayan Region", zone: "I", defaultCbr: 8.0, defaultCvpd: 800 },
    { state: "Tamil Nadu", region: "Northern Inland", zone: "IV", defaultCbr: 7.0, defaultCvpd: 4800 },
    { state: "Tamil Nadu", region: "Southern Inland", zone: "V", defaultCbr: 7.0, defaultCvpd: 4000 },
    { state: "Tamil Nadu", region: "Eastern Coastal Plains", zone: "VII", defaultCbr: 6.0, defaultCvpd: 4500 },
    { state: "Telangana", region: "Telangana Plateau", zone: "IV", defaultCbr: 7.0, defaultCvpd: 4500 },
    { state: "Tripura", region: "Plains & Low Hills", zone: "III", defaultCbr: 6.0, defaultCvpd: 1200 },
    { state: "Uttar Pradesh", region: "Gangetic Plains", zone: "II", defaultCbr: 8.0, defaultCvpd: 5500 },
    { state: "Uttarakhand", region: "Hilly (Garhwal/Kumaon)", zone: "I", defaultCbr: 8.0, defaultCvpd: 1800 },
    { state: "Uttarakhand", region: "Plains (Terai/Haridwar)", zone: "II", defaultCbr: 8.0, defaultCvpd: 3500 },
    { state: "West Bengal", region: "Gangetic Plains & Delta", zone: "III", defaultCbr: 6.0, defaultCvpd: 4200 },
    { state: "West Bengal", region: "Hilly (Darjeeling/Kalimpong)", zone: "I", defaultCbr: 7.0, defaultCvpd: 1200 },
    // Union Territories
    { state: "Delhi (NCT)", region: "National Capital Region", zone: "II", defaultCbr: 8.0, defaultCvpd: 8000 },
    { state: "Jammu & Kashmir", region: "Hilly & Mountainous", zone: "I", defaultCbr: 8.0, defaultCvpd: 2000 },
    { state: "Ladakh", region: "High Altitude Cold Arid", zone: "I", defaultCbr: 9.0, defaultCvpd: 800 },
    { state: "Chandigarh", region: "Northern Plains", zone: "II", defaultCbr: 8.0, defaultCvpd: 4500 },
    { state: "Puducherry", region: "Coastal", zone: "VII", defaultCbr: 6.0, defaultCvpd: 2500 },
    { state: "Dadra and Nagar Haveli and Daman and Diu", region: "West Coastal", zone: "VI", defaultCbr: 6.0, defaultCvpd: 3000 },
    { state: "Andaman and Nicobar Islands", region: "Island Coastal", zone: "VII", defaultCbr: 6.0, defaultCvpd: 800 }
  ],

  // Default Pan-India Design Configuration
  benchmark: {
    projectName: "National Highway Rigid Pavement Project",
    selectedState: "Bihar",
    selectedRegion: "Gangetic Plains",
    roadType: "divided_4lane",
    numLanes: 4,
    carriagewayType: "divided",
    designPeriod: 30, // years
    laneWidth: 3.5, // meters
    jointSpacing: 4.5, // meters
    vehicleDistance: 4.2, // average vehicle wheelbase / axle distance in meters

    // Directional Traffic Volumes
    cvpdDir1: 3000, // Direction 1 commercial vehicles / day
    cvpdDir2: 3000, // Direction 2 commercial vehicles / day
    cvpdPerDirection: 3000, // commercial vehicles per day in each direction
    annualGrowthRate: 5.0, // %
    axlesPerCV: 2.35, // average axles per commercial vehicle
    trafficPredominantDirPct: 50.0, // %
    trafficDesignLanePct: 25.0, // % of predominant direction traffic for multi-lane (outer lane)
    nightTraffic12hPct: 60.0, // %
    dayTraffic12hPct: 40.0, // %
    peak6hDayPct: 50.0, // %
    peak6hNightPct: 50.0, // %
    wheelbaseLess45Pct: 55.0, // %

    // Commercial Vehicle Fleet Type Proportions (% of commercial vehicles)
    pct2Axle: 45.0, // 2-axle trucks / buses
    pct3Axle: 35.0, // 3-axle MAV trucks (tandem)
    pctMultiAxle: 20.0, // 4-to-6+ axle semi-trailers / tridem

    // Axle Category Proportions (% of total axles)
    frontSingleSteeringPct: 45.0,
    rearSinglePct: 15.0,
    rearTandemPct: 25.0,
    rearTridemPct: 15.0,

    // Subgrade & Subbase
    subgradeCBR: 8.0, // %
    subbaseType: "gsb", // "gsb" or "dlc"
    subbaseThickness: 150, // mm

    // Concrete Properties
    concreteGrade: "M40",
    fck28: 40.0, // MPa
    fck90: 48.0, // MPa
    flexuralStrength28: 4.5, // MPa
    designFlexuralStrength: 4.87, // MPa
    elasticModulus: 31623, // MPa
    poissonRatio: 0.15,
    unitWeight: 24.0, // kN/m3
    thermalExpansionCoeff: 10e-6, // per deg C

    // Temperature & Climate
    stateRegion: "Bihar (Zone III)",
    zone: "III",
    dayTempDiff: 16.8, // deg C
    nightTempDiff: 13.4, // deg C

    // Structural Joint & Shoulder Conditions
    shoulderType: "tied", // "tied", "untied", or "widened"
    transverseJointType: "doweled", // "doweled" (B=0.66) or "undoweled" (B=0.90)
    betaFactor: 0.66,

    // Trial Slab Design
    trialThickness: 310, // mm (0.31 m)
    wearAllowance: 10, // mm

    useWorkbookExactTraffic: true,
    workbookDayAxleRepetitions: 15019127,
    workbookNightAxleRepetitions: 12390780
  },

  // Axle Load Spectrum (12 classes for each axle type)
  axleSpectrum: {
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
  },

  // IRC:58 Table 2: Subgrade CBR vs Modulus of Subgrade Reaction (k) for 750 mm dia plate
  cbrToKTable: [
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

  // IRC:58 Table 3: Effective k-value for Untreated Granular Subbase (GSB) & Cement-Treated Subbase
  subbaseKTable: {
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

  // IRC:58 Table 1: Recommended Maximum Temperature Differentials (deg C)
  tempDifferentialTable: [
    {
      zone: "I",
      name: "Zone I: Hilly regions (J&K, Ladakh, HP, Uttarakhand, Sikkim, Arunachal)",
      t150: 12.5, t200: 13.1, t250: 14.3, t300: 15.8
    },
    {
      zone: "II",
      name: "Zone II: Punjab, UP, Gujarat, Rajasthan, Haryana, North MP, Delhi",
      t150: 12.5, t200: 13.1, t250: 14.3, t300: 15.8
    },
    {
      zone: "III",
      name: "Zone III: Bihar, Jharkhand, West Bengal, Assam, Eastern Odisha, Tripura",
      t150: 15.6, t200: 16.4, t250: 16.6, t300: 16.8
    },
    {
      zone: "IV",
      name: "Zone IV: Maharashtra, Karnataka, South MP, Chhattisgarh, AP, Telangana, West Odisha, North TN",
      t150: 17.3, t200: 19.0, t250: 20.3, t300: 21.0
    },
    {
      zone: "V",
      name: "Zone V: Kerala and South Tamil Nadu",
      t150: 15.0, t200: 16.4, t250: 17.6, t300: 18.1
    },
    {
      zone: "VI",
      name: "Zone VI: Coastal areas bounded by hills (Konkan, Goa, Coastal Karnataka/Kerala)",
      t150: 14.6, t200: 15.8, t250: 16.2, t300: 17.0
    },
    {
      zone: "VII",
      name: "Zone VII: Coastal areas unbounded by hills (Coastal TN, AP, Odisha, Gujarat Coast)",
      t150: 15.5, t200: 17.0, t250: 19.0, t300: 19.2
    }
  ],

  // IRC:58 Table 6: Recommended Dimensions of Dowel Bars
  dowelBarTable: [
    { slabThickness: 200, diameter: 25, length: 360, spacing: 300 },
    { slabThickness: 230, diameter: 30, length: 400, spacing: 300 },
    { slabThickness: 250, diameter: 32, length: 450, spacing: 300 },
    { slabThickness: 280, diameter: 36, length: 450, spacing: 300 },
    { slabThickness: 300, diameter: 38, length: 500, spacing: 300 },
    { slabThickness: 350, diameter: 38, length: 500, spacing: 300 }
  ],

  // IRC:58 Table 7: Details of Tie Bars for Longitudinal Joints
  tieBarTable: [
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

// Export to window object for browser access
if (typeof window !== "undefined") {
  window.IRC58_DATA = IRC58_DATA;
}
