/**
 * projects.js — Full-page projects view.
 * Handles open/close and rendering of per-faculty and all-faculty project pages.
 */

/** Open the projects page for a specific faculty member. */
function openFacultyProjects(facultyId) {
  state.currentFacultyId = facultyId;

  const page = document.getElementById("projectsPage");
  const body = document.getElementById("projectsBody");
  const title = document.getElementById("projectsTitle");

  // Show page immediately with a loader
  title.innerHTML = "Projects — <span>Loading…</span>";
  body.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Fetching projects…</p>
    </div>`;
  page.classList.add("open");
  page.scrollTop = 0;

  api
    .getProjectsByFaculty(facultyId)
    .then(({ faculty, data: projects }) => {
      // Cache project count on faculty object so the card can show it
      const f = state.allFaculty.find((x) => x.id === facultyId);
      if (f) f.projectCount = projects.length;

      title.innerHTML = `Projects — <span>${faculty.name}</span>`;
      body.innerHTML = buildFacultyProjectsHTML(faculty, projects);
    })
    .catch((err) => {
      body.innerHTML = `<p style="padding:40px;color:var(--terracotta)">Error loading projects: ${err.message}</p>`;
    });
}

/** Open the projects page showing all faculty and their projects. */
function openAllProjects() {
  const page = document.getElementById("projectsPage");
  const body = document.getElementById("projectsBody");
  const title = document.getElementById("projectsTitle");

  title.innerHTML = "Projects — <span>All Faculty</span>";
  body.innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading all projects…</p>
    </div>`;
  page.classList.add("open");
  page.scrollTop = 0;

  // Fetch all projects then group by faculty
  api
    .getAllProjects()
    .then(({ data: allProjects }) => {
      // Group by facultyId
      const groups = {};
      allProjects.forEach((p) => {
        if (!groups[p.facultyId]) groups[p.facultyId] = [];
        groups[p.facultyId].push(p);
      });

      const groupsHTML = state.allFaculty
        .filter((f) => groups[f.id] && groups[f.id].length > 0)
        .map((f) => buildFacultyGroupHTML(f, groups[f.id]))
        .join("");

      body.innerHTML = `
        <div class="projects-section-title" style="margin-bottom:40px;">
          All Research &amp; Student Projects
        </div>
        ${groupsHTML}`;
    })
    .catch((err) => {
      body.innerHTML = `<p style="padding:40px;color:var(--terracotta)">Error: ${err.message}</p>`;
    });
}

/** Close the projects page and return to the directory. */
function closeProjects() {
  document.getElementById("projectsPage").classList.remove("open");
  state.currentFacultyId = null;
}

// ── HTML builders ────────────────────────────────────────────

function buildFacultyProjectsHTML(faculty, projects) {
  const deptKey = faculty.dept.toLowerCase();
  return `
    <div class="proj-faculty-hero">
      <div class="proj-faculty-photo">${faculty.emoji || "👤"}</div>
      <div>
        <div class="proj-faculty-name">${faculty.name}</div>
        <div class="proj-faculty-sub">${faculty.title} · ${faculty.deptLabel}</div>
        <span class="proj-count-badge">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
            <rect x="2" y="3" width="20" height="14" rx="2"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
          ${projects.length} Registered Project${projects.length !== 1 ? "s" : ""}
        </span>
      </div>
    </div>
    <div class="projects-section-title">Research &amp; Student Projects</div>
    <div class="projects-grid">
      ${projects.map((p) => buildProjectCardHTML(p, deptKey)).join("")}
    </div>`;
}

function buildFacultyGroupHTML(faculty, projects) {
  const deptKey = faculty.dept.toLowerCase();
  return `
    <div class="faculty-group">
      <div class="faculty-group-header">
        <span class="faculty-group-emoji">${faculty.emoji || "👤"}</span>
        <div>
          <div class="faculty-group-name">${faculty.name}</div>
          <div class="faculty-group-sub">${faculty.title} · ${faculty.deptLabel}</div>
        </div>
      </div>
      <div class="projects-grid">
        ${projects.map((p) => buildProjectCardHTML(p, deptKey)).join("")}
      </div>
    </div>`;
}

function buildProjectCardHTML(p, deptKey) {
  const statusLabels = {
    ongoing:   "Ongoing",
    completed: "Completed",
    open:      "Open for Students",
  };

  const tags = (p.tags || [])
    .map((t) => `<span class="proj-tag">${t}</span>`)
    .join("");

  const studentsHTML =
    p.students > 0
      ? `<div class="proj-students">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
             <circle cx="9" cy="7" r="4"/>
             <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
             <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
           </svg>
           ${p.students} student${p.students !== 1 ? "s" : ""}
         </div>`
      : `<div class="proj-students open-slot">Open — join now</div>`;

  return `
  <div class="project-card proj-${deptKey}">
    <div class="proj-status ${p.status}">${statusLabels[p.status] || p.status}</div>
    <div class="proj-title">${p.title}</div>
    <div class="proj-desc">${p.desc}</div>
    <div class="proj-tags">${tags}</div>
    <div class="proj-meta">
      ${studentsHTML}
      <span>${p.year}</span>
    </div>
  </div>`;
}
