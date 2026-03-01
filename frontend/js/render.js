/**
 * render.js — Builds and injects faculty card HTML into the grid.
 * Reads from state.allFaculty and applies current filters.
 */

/** Apply all active filters and re-render the grid. */
function renderCards() {
  const grid = document.getElementById("facultyGrid");
  const countEl = document.getElementById("resultCount");

  // Filter
  const q = state.searchQuery.toLowerCase();
  state.filtered = state.allFaculty.filter((f) => {
    const matchSearch =
      !q ||
      f.name.toLowerCase().includes(q) ||
      f.dept.toLowerCase().includes(q) ||
      f.deptLabel.toLowerCase().includes(q) ||
      f.title.toLowerCase().includes(q);

    const matchDept =
      state.activeDepts.size === 0 || state.activeDepts.has(f.dept);

    const matchBookmark = !state.showBookmarked || state.bookmarks.has(f.id);

    return matchSearch && matchDept && matchBookmark;
  });

  countEl.textContent = `${state.filtered.length} Faculty`;

  if (state.filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <h3>No faculty found</h3>
        <p>Try adjusting your search or filters.</p>
      </div>`;
    return;
  }

  grid.innerHTML = state.filtered.map(buildCardHTML).join("");
}

/** Build the HTML string for a single faculty card. */
function buildCardHTML(f, i) {
  const saved     = state.bookmarks.has(f.id);
  const deptKey   = f.dept.toLowerCase();
  const delay     = Math.min(i * 0.05, 0.4);

  const freeSlots = (f.free || [])
    .map((s) => `<span class="avail-slot">${s}</span>`)
    .join("");
  const busySlots = (f.busy || [])
    .map((s) => `<span class="avail-slot busy">${s}</span>`)
    .join("");

  // Project count is embedded in the card footer label;
  // actual count is fetched lazily when the projects page opens.
  // We store it on the faculty object after first fetch.
  const projLabel = f.projectCount !== undefined
    ? `${f.projectCount} Project${f.projectCount !== 1 ? "s" : ""}`
    : "View Projects";

  return `
  <div class="faculty-card" style="animation-delay:${delay}s">
    <div class="card-dept-strip dept-${deptKey}"></div>

    <button
      class="card-bookmark ${saved ? "saved" : ""}"
      onclick="toggleBookmark(${f.id})"
      aria-label="${saved ? "Remove bookmark" : "Bookmark"}"
    >
      <svg viewBox="0 0 24 24" fill="${saved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2">
        <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
      </svg>
    </button>

    <div class="card-head">
      <div class="faculty-photo">${f.emoji || "👤"}</div>
      <div class="card-head-info">
        <div class="faculty-name">${f.name}</div>
        <div class="faculty-title">${f.title}</div>
        <span class="dept-badge badge-${deptKey}">${f.deptLabel}</span>
      </div>
    </div>

    <div class="card-body">
      <div class="info-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.49 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.41 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.38a16 16 0 0 0 5.67 5.67l.76-.76a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 21 15.5z"/>
        </svg>
        ${f.phone}
      </div>
      <div class="info-row">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
          <polyline points="22,6 12,13 2,6"/>
        </svg>
        <a href="mailto:${f.email}">${f.email}</a>
      </div>
    </div>

    <div class="avail-section">
      <div class="avail-label">Free Timings</div>
      <div class="avail-slots">${freeSlots}${busySlots}</div>
    </div>

    <div class="card-footer">
      <button class="btn-projects" onclick="openFacultyProjects(${f.id})">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13">
          <rect x="2" y="3" width="20" height="14" rx="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
        ${projLabel}
      </button>
      <button class="btn-view" onclick="openFacultyProjects(${f.id})">View →</button>
    </div>
  </div>`;
}

/** Show a loading skeleton in the grid. */
function showGridLoading() {
  document.getElementById("facultyGrid").innerHTML = `
    <div class="loading-state">
      <div class="loading-spinner"></div>
      <p>Loading faculty…</p>
    </div>`;
}
