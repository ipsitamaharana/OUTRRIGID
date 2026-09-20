/**
 * server/storage.js
 * Persistent Project & Highway Design Session Store
 */

const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "..", "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Initial default presets
const DEFAULT_PROJECTS = [
  {
    id: "preset-bihar-nh",
    name: "Four-Lane Divided National Highway (Bihar Benchmark)",
    description: "IRC:58:2015 Benchmark Problem: Zone III, 30-year design life, 3000 CVPD/dir, CBR 8%, 150mm GSB, M40.",
    createdAt: new Date().toISOString(),
    params: {
      projectName: "Four-Lane Divided NH (Bihar)",
      roadType: "divided_4lane",
      designPeriod: 30,
      laneWidth: 3.5,
      jointSpacing: 4.5,
      cvpdPerDirection: 3000,
      annualGrowthRate: 5.0,
      axlesPerCV: 2.35,
      subgradeCBR: 8.0,
      subbaseType: "gsb",
      subbaseThickness: 150,
      concreteGrade: "M40",
      fck28: 40,
      designFlexuralStrength: 4.87,
      zone: "III",
      shoulderType: "tied",
      transverseJointType: "doweled",
      trialThickness: 310,
      useWorkbookExactTraffic: true,
      workbookDayAxleRepetitions: 15019127,
      workbookNightAxleRepetitions: 12390780
    }
  },
  {
    id: "preset-golden-quad",
    name: "Golden Quadrilateral High-Density Corridor",
    description: "Heavy freight corridor: 8000 CVPD, 6-lane divided, Zone IV (Maharashtra/Karnataka), CBR 10%, 150mm DLC.",
    createdAt: new Date().toISOString(),
    params: {
      projectName: "Golden Quadrilateral High-Density Express Corridor",
      roadType: "divided_6lane",
      designPeriod: 30,
      laneWidth: 3.5,
      jointSpacing: 4.5,
      cvpdPerDirection: 8000,
      annualGrowthRate: 6.5,
      axlesPerCV: 2.85,
      subgradeCBR: 10.0,
      subbaseType: "dlc",
      subbaseThickness: 150,
      concreteGrade: "M45",
      fck28: 45,
      designFlexuralStrength: 5.15,
      zone: "IV",
      shoulderType: "tied",
      transverseJointType: "doweled",
      trialThickness: 330
    }
  },
  {
    id: "preset-ghat-bonded",
    name: "Western Ghats Mountain Pass (Bonded DLC)",
    description: "Steep sustained slope on ghat section with monolithic PQC bonded directly over DLC without polythene debonding layer.",
    createdAt: new Date().toISOString(),
    params: {
      projectName: "Western Ghats Mountain Pass Section",
      roadType: "divided_4lane",
      designPeriod: 30,
      laneWidth: 3.5,
      jointSpacing: 4.5,
      cvpdPerDirection: 4500,
      annualGrowthRate: 5.5,
      axlesPerCV: 2.50,
      subgradeCBR: 8.0,
      subbaseType: "dlc",
      subbaseThickness: 150,
      concreteGrade: "M40",
      fck28: 40,
      designFlexuralStrength: 4.87,
      zone: "IV",
      shoulderType: "tied",
      transverseJointType: "doweled",
      trialThickness: 280
    }
  }
];

class ProjectStore {
  static getProjects() {
    try {
      if (!fs.existsSync(PROJECTS_FILE)) {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify(DEFAULT_PROJECTS, null, 2), "utf8");
        return DEFAULT_PROJECTS;
      }
      const data = fs.readFileSync(PROJECTS_FILE, "utf8");
      return JSON.parse(data);
    } catch (e) {
      console.error("Failed to read projects file:", e);
      return DEFAULT_PROJECTS;
    }
  }

  static getProjectById(id) {
    const projects = this.getProjects();
    return projects.find((p) => p.id === id) || null;
  }

  static saveProject(project) {
    const projects = this.getProjects();
    const existingIdx = projects.findIndex((p) => p.id === project.id);
    const updated = { ...project, updatedAt: new Date().toISOString() };

    if (existingIdx >= 0) {
      projects[existingIdx] = updated;
    } else {
      projects.push({ ...updated, id: project.id || `proj-${Date.now()}`, createdAt: new Date().toISOString() });
    }

    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
    return updated;
  }

  static deleteProject(id) {
    let projects = this.getProjects();
    projects = projects.filter((p) => p.id !== id);
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), "utf8");
    return true;
  }
}

module.exports = { ProjectStore };
