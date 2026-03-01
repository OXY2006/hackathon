/**
 * api.js — Data layer.
 * Tries the Express backend first (/api/*).
 * If the server is not running (404/NetworkError), falls back to
 * LOCAL_DATA so the app works by opening index.html directly in a browser.
 */

const API_BASE = "/api";

// ── Local fallback data ───────────────────────────────────────
const LOCAL_FACULTY = [
  { id:1,  emoji:"👩‍💻", name:"Dr. Priya Nair",           title:"Associate Professor",       dept:"CSE",   deptLabel:"Computer Science",     phone:"+91 98765 43210", email:"priya.nair@univ.edu.in",    free:["Mon 10–12","Wed 2–4","Fri 11–1"],       busy:["Tue 9–11"] },
  { id:2,  emoji:"👨‍🔬", name:"Prof. S. Krishnaswamy",    title:"Professor & Head of Dept",  dept:"CSE",   deptLabel:"Computer Science",     phone:"+91 94321 87654", email:"s.krishna@univ.edu.in",     free:["Tue 3–5","Thu 10–12"],                  busy:["Mon 9–11","Fri 9–11"] },
  { id:3,  emoji:"👩‍🏫", name:"Dr. Meena Rajagopalan",    title:"Assistant Professor",       dept:"ECE",   deptLabel:"Electronics & Comm.",  phone:"+91 91234 56789", email:"meena.raj@univ.edu.in",     free:["Mon 2–4","Thu 11–1","Fri 3–5"],         busy:[] },
  { id:4,  emoji:"👨‍🏫", name:"Dr. Ramesh Iyer",          title:"Senior Professor",          dept:"MECH",  deptLabel:"Mechanical Engg.",     phone:"+91 97654 32109", email:"r.iyer@univ.edu.in",        free:["Wed 10–12","Fri 2–4"],                  busy:["Mon 10–12"] },
  { id:5,  emoji:"👩‍🔬", name:"Dr. Anitha Subramaniam",   title:"Associate Professor",       dept:"MATH",  deptLabel:"Mathematics",          phone:"+91 93456 78901", email:"anitha.s@univ.edu.in",      free:["Mon 11–1","Tue 2–4","Thu 9–11"],        busy:[] },
  { id:6,  emoji:"👨‍💼", name:"Prof. Vijay Shankar",       title:"Professor",                 dept:"CIVIL", deptLabel:"Civil Engineering",    phone:"+91 98901 23456", email:"v.shankar@univ.edu.in",     free:["Tue 10–12","Fri 9–11"],                 busy:["Wed 2–4"] },
  { id:7,  emoji:"👩‍💼", name:"Dr. Kavitha Menon",         title:"Assistant Professor",       dept:"CSE",   deptLabel:"Computer Science",     phone:"+91 95678 12345", email:"kavitha.m@univ.edu.in",     free:["Mon 9–11","Wed 11–1"],                  busy:["Thu 2–4"] },
  { id:8,  emoji:"🧑‍🏫", name:"Dr. Suresh Babu",           title:"Associate Professor",       dept:"ECE",   deptLabel:"Electronics & Comm.",  phone:"+91 99012 34567", email:"suresh.b@univ.edu.in",      free:["Tue 11–1","Thu 3–5","Fri 10–12"],       busy:[] },
  { id:9,  emoji:"👩‍🔬", name:"Prof. Lakshmi Devi",        title:"Senior Professor",          dept:"MATH",  deptLabel:"Mathematics",          phone:"+91 90123 45678", email:"lakshmi.d@univ.edu.in",     free:["Mon 3–5","Wed 9–11"],                   busy:["Tue 9–11"] },
  { id:10, emoji:"👨‍🔬", name:"Dr. Arunkumar Patel",       title:"Assistant Professor",       dept:"MECH",  deptLabel:"Mechanical Engg.",     phone:"+91 88765 43210", email:"arun.p@univ.edu.in",        free:["Tue 2–4","Thu 10–12","Fri 2–4"],        busy:[] },
  { id:11, emoji:"🧑‍💻", name:"Dr. Deepa Chandrasekhar",   title:"Associate Professor",       dept:"CIVIL", deptLabel:"Civil Engineering",    phone:"+91 87654 32109", email:"deepa.c@univ.edu.in",       free:["Mon 11–1","Fri 11–1"],                  busy:["Wed 10–12"] },
  { id:12, emoji:"👨‍🏫", name:"Prof. Mohan Venkatesh",     title:"Professor",                 dept:"CSE",   deptLabel:"Computer Science",     phone:"+91 86543 21098", email:"m.venkatesh@univ.edu.in",   free:["Wed 3–5","Thu 11–1"],                   busy:["Mon 9–11","Tue 3–5"] },
];

const LOCAL_PROJECTS = {
  1:  [
    { id:"p1-1",  title:"Smart Campus Attendance System",          desc:"Real-time face-recognition attendance tracking using OpenCV and Flask, integrated with the university DBMS.",                    tags:["Python","OpenCV","Flask","MySQL"],           status:"ongoing",   students:4, year:"2024-25" },
    { id:"p1-2",  title:"NLP-Based Student Query Chatbot",         desc:"A fine-tuned language model chatbot to answer student FAQs about university policies and schedules.",                           tags:["NLP","Transformers","React"],                status:"completed", students:3, year:"2023-24" },
    { id:"p1-3",  title:"Distributed File Sharing System",         desc:"Peer-to-peer file sharing with encryption for secure document exchange between students and faculty.",                           tags:["Java","Sockets","Cryptography"],             status:"open",      students:0, year:"2025-26" },
  ],
  2:  [
    { id:"p2-1",  title:"Blockchain-Based Certificate Verification",desc:"Issuing and verifying academic certificates on a permissioned blockchain to prevent forgery.",                                  tags:["Blockchain","Solidity","Web3"],              status:"ongoing",   students:5, year:"2024-25" },
    { id:"p2-2",  title:"Graph-Based Course Recommendation",        desc:"Using knowledge graphs to recommend elective courses based on a student academic history and career goals.",                    tags:["Graph DB","ML","Neo4j"],                     status:"open",      students:0, year:"2025-26" },
  ],
  3:  [
    { id:"p3-1",  title:"IoT-Based Smart Classroom",                desc:"Sensor network controlling lighting, fans, and attendance boards in seminar halls, visualized on a real-time dashboard.",       tags:["IoT","Arduino","MQTT","React"],              status:"ongoing",   students:3, year:"2024-25" },
    { id:"p3-2",  title:"Spectrum Sensing for Cognitive Radio",      desc:"Machine-learning based spectrum sensing algorithm for dynamic spectrum access in cognitive radio networks.",                    tags:["Signal Processing","Python","ML"],           status:"completed", students:2, year:"2023-24" },
  ],
  4:  [
    { id:"p4-1",  title:"CAD Automation for Gear Design",            desc:"Automated MATLAB scripts to generate and optimize spur gear profiles based on load and torque specifications.",               tags:["MATLAB","CAD","Optimization"],               status:"completed", students:4, year:"2023-24" },
    { id:"p4-2",  title:"3D Printed Prosthetic Hand",                 desc:"Low-cost prosthetic hand with servo-controlled fingers, driven by EMG signals from the residual limb.",                      tags:["3D Printing","EMG","Arduino"],               status:"ongoing",   students:3, year:"2024-25" },
    { id:"p4-3",  title:"Solar Tracker Mechanism",                    desc:"A single-axis solar panel tracking system using LDR sensors to maximize energy capture throughout the day.",                 tags:["Mechanical","Electronics","Energy"],         status:"open",      students:0, year:"2025-26" },
  ],
  5:  [
    { id:"p5-1",  title:"Cryptographic Key Generation via Chaos",    desc:"Generating pseudo-random keys using chaotic dynamical systems for lightweight encryption.",                                   tags:["Cryptography","Chaos Theory","Python"],      status:"completed", students:2, year:"2023-24" },
    { id:"p5-2",  title:"Mathematical Modelling of Epidemic Spread", desc:"SIR/SEIR model implementation and simulation to study infection dynamics in university populations.",                         tags:["Differential Equations","Simulation","R"],  status:"ongoing",   students:3, year:"2024-25" },
  ],
  6:  [
    { id:"p6-1",  title:"Structural Health Monitoring System",       desc:"Wireless sensor-based monitoring of bridge structures to detect micro-cracks and stress anomalies in real time.",             tags:["IoT","Structural Engg","Sensors"],           status:"ongoing",   students:5, year:"2024-25" },
    { id:"p6-2",  title:"GIS-Based Urban Flood Mapping",             desc:"Using satellite imagery and GIS tools to identify flood-prone zones and plan drainage infrastructure.",                       tags:["GIS","Python","Remote Sensing"],             status:"open",      students:0, year:"2025-26" },
  ],
  7:  [
    { id:"p7-1",  title:"Student Performance Prediction",            desc:"ML model predicting student performance using attendance, assignments, and mid-term scores to flag at-risk students early.",  tags:["ML","Scikit-learn","Django"],                status:"ongoing",   students:4, year:"2024-25" },
    { id:"p7-2",  title:"Automated Code Review Tool",                desc:"Static analysis tool that reviews student code submissions for correctness, efficiency, and style violations.",               tags:["AST","Python","React"],                      status:"open",      students:0, year:"2025-26" },
  ],
  8:  [
    { id:"p8-1",  title:"VLSI Design of Low-Power ALU",              desc:"Gate-level design and simulation of a low-power 8-bit ALU using Cadence tools targeting sub-threshold operation.",           tags:["VLSI","Cadence","Verilog"],                  status:"completed", students:2, year:"2023-24" },
    { id:"p8-2",  title:"Wireless Body Area Network for Health",     desc:"WBAN architecture for continuous patient monitoring, transmitting vitals to a mobile app over BLE.",                          tags:["BLE","Embedded C","Healthcare"],             status:"ongoing",   students:3, year:"2024-25" },
  ],
  9:  [
    { id:"p9-1",  title:"Numerical Methods Visualizer",              desc:"Interactive web app to visualize root-finding algorithms, numerical integration, and ODE solvers step by step.",             tags:["JavaScript","D3.js","Algorithms"],           status:"completed", students:2, year:"2023-24" },
    { id:"p9-2",  title:"Fractal Geometry Art Generator",            desc:"Generating and animating fractal patterns (Mandelbrot, Julia sets) using GPU-accelerated WebGL shaders.",                    tags:["WebGL","GLSL","Math"],                       status:"open",      students:0, year:"2025-26" },
  ],
  10: [
    { id:"p10-1", title:"CFD Analysis of Aerodynamic Bodies",        desc:"OpenFOAM-based CFD simulation of drag and lift on various vehicle profiles to guide lightweight design.",                     tags:["CFD","OpenFOAM","Python"],                   status:"ongoing",   students:4, year:"2024-25" },
    { id:"p10-2", title:"Autonomous Line-Following Robot",           desc:"PID-controlled differential drive robot that follows a track using IR sensors and adapts to varying line widths.",            tags:["Arduino","PID","C++"],                       status:"completed", students:3, year:"2023-24" },
  ],
  11: [
    { id:"p11-1", title:"Rainwater Harvesting Simulation",           desc:"Simulation model for optimizing rainwater collection and storage in urban residential complexes.",                            tags:["MATLAB","Water Resources","GIS"],            status:"completed", students:3, year:"2023-24" },
    { id:"p11-2", title:"Smart Traffic Signal System",               desc:"Computer vision based adaptive traffic signal control that adjusts green-time based on real-time vehicle density.",           tags:["OpenCV","Raspberry Pi","IoT"],               status:"open",      students:0, year:"2025-26" },
  ],
  12: [
    { id:"p12-1", title:"Compiler Design: Mini-Language",            desc:"End-to-end compiler for a custom teaching language — lexer, parser, semantic analyser, and bytecode generator.",             tags:["Compiler Design","C","LLVM"],                status:"ongoing",   students:5, year:"2024-25" },
    { id:"p12-2", title:"Federated Learning for Privacy",            desc:"Decentralized ML training across devices without sharing raw data, tested on medical image classification.",                  tags:["Federated Learning","PyTorch","Privacy"],    status:"completed", students:4, year:"2023-24" },
    { id:"p12-3", title:"Operating System Scheduler Simulator",      desc:"Web-based interactive simulator for CPU scheduling algorithms — FCFS, SJF, RR, and Priority with Gantt charts.",            tags:["OS","React","Algorithms"],                   status:"open",      students:0, year:"2025-26" },
  ],
};

// ── Helpers ───────────────────────────────────────────────────

/** Try a fetch; on any network/HTTP error resolve to null instead of rejecting. */
function tryFetch(url) {
  return fetch(url)
    .then((r) => (r.ok ? r.json() : null))
    .catch(() => null);
}

/** Apply ?q and ?dept filters locally (mirrors backend logic). */
function localFilterFaculty(params = {}) {
  let result = LOCAL_FACULTY;
  if (params.dept) {
    const depts = params.dept.toUpperCase().split(",");
    result = result.filter((f) => depts.includes(f.dept));
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    result = result.filter(
      (f) =>
        f.name.toLowerCase().includes(q) ||
        f.dept.toLowerCase().includes(q) ||
        f.deptLabel.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q)
    );
  }
  return { count: result.length, data: result };
}

// ── Public API object ─────────────────────────────────────────
const api = {
  /** Get all faculty, with optional { q, dept } params. */
  getFaculty(params = {}) {
    const qs  = new URLSearchParams(params).toString();
    const url = qs ? `${API_BASE}/faculty?${qs}` : `${API_BASE}/faculty`;
    return tryFetch(url).then((json) => json ?? localFilterFaculty(params));
  },

  /** Get a single faculty member by numeric ID. */
  getFacultyById(id) {
    return tryFetch(`${API_BASE}/faculty/${id}`).then((json) => {
      if (json) return json;
      const member = LOCAL_FACULTY.find((f) => f.id === id);
      if (!member) throw new Error(`Faculty ${id} not found`);
      return member;
    });
  },

  /** Get all projects across all faculty, with optional { status } param. */
  getAllProjects(params = {}) {
    const qs  = new URLSearchParams(params).toString();
    const url = qs ? `${API_BASE}/projects?${qs}` : `${API_BASE}/projects`;
    return tryFetch(url).then((json) => {
      if (json) return json;
      // Build flat list from local data
      const all = [];
      Object.entries(LOCAL_PROJECTS).forEach(([fid, projs]) => {
        const member = LOCAL_FACULTY.find((f) => f.id === parseInt(fid));
        projs.forEach((p) =>
          all.push({ ...p, facultyId: parseInt(fid), facultyName: member?.name, dept: member?.dept })
        );
      });
      const result = params.status ? all.filter((p) => p.status === params.status) : all;
      return { count: result.length, data: result };
    });
  },

  /** Get all projects for a specific faculty member. */
  getProjectsByFaculty(facultyId) {
    return tryFetch(`${API_BASE}/projects/faculty/${facultyId}`).then((json) => {
      if (json) return json;
      const member   = LOCAL_FACULTY.find((f) => f.id === facultyId);
      const projects = LOCAL_PROJECTS[facultyId] || [];
      return { faculty: member, count: projects.length, data: projects };
    });
  },
};
