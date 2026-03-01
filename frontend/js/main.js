/**
 * main.js — App entry point.
 * Fetches initial data, wires up all event listeners, and boots the UI.
 */

document.addEventListener("DOMContentLoaded", () => {
  // ── Initial data load ──────────────────────────────────────
  showGridLoading();

  api
    .getFaculty()
    .then(({ data }) => {
      state.allFaculty = data;
      renderCards();
    })
    .catch((err) => {
      document.getElementById("facultyGrid").innerHTML = `
        <div class="empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <h3>Could not load faculty</h3>
          <p>${err.message}</p>
        </div>`;
      document.getElementById("resultCount").textContent = "Error";
    });

  // ── Navbar events ──────────────────────────────────────────

  // Brand click → back to directory
  document.getElementById("navBrand").addEventListener("click", closeProjects);

  // Search
  document
    .getElementById("searchInput")
    .addEventListener("input", onSearchInput);

  // Department filter button
  document
    .getElementById("filterBtn")
    .addEventListener("click", toggleFilterDropdown);

  // Department checkboxes
  document
    .querySelectorAll("#filterDropdown input[type=checkbox]")
    .forEach((cb) => cb.addEventListener("change", onDeptCheckboxChange));

  // Bookmark toggle
  document
    .getElementById("bookmarkToggle")
    .addEventListener("click", toggleBookmarkView);

  // All Projects button
  document
    .getElementById("allProjectsBtn")
    .addEventListener("click", openAllProjects);

  // ── Projects page events ───────────────────────────────────

  document.getElementById("backBtn").addEventListener("click", closeProjects);

  // Keyboard: Escape closes the projects page
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeProjects();
  });
});
