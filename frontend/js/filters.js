/**
 * filters.js — Search, department filter, and bookmark logic.
 */

// ── Search ───────────────────────────────────────────────────

function onSearchInput(e) {
  state.searchQuery = e.target.value;
  renderCards();
}

// ── Department filter ────────────────────────────────────────

function toggleFilterDropdown() {
  const dd  = document.getElementById("filterDropdown");
  const btn = document.getElementById("filterBtn");
  dd.classList.toggle("open");
  btn.classList.toggle("active", dd.classList.contains("open") || state.activeDepts.size > 0);
}

function onDeptCheckboxChange() {
  const checkboxes = document.querySelectorAll(
    "#filterDropdown input[type=checkbox]"
  );
  state.activeDepts.clear();
  checkboxes.forEach((cb) => {
    if (cb.checked) state.activeDepts.add(cb.value);
  });

  document
    .getElementById("filterBtn")
    .classList.toggle("active", state.activeDepts.size > 0);

  renderActiveDeptTags();
  renderCards();
}

function removeFilter(dept) {
  state.activeDepts.delete(dept);
  document
    .querySelectorAll("#filterDropdown input[type=checkbox]")
    .forEach((cb) => {
      if (cb.value === dept) cb.checked = false;
    });
  document
    .getElementById("filterBtn")
    .classList.toggle("active", state.activeDepts.size > 0);
  renderActiveDeptTags();
  renderCards();
}

function renderActiveDeptTags() {
  const bar = document.getElementById("activeFilters");
  bar.innerHTML = [...state.activeDepts]
    .map(
      (d) => `
      <div class="filter-tag" onclick="removeFilter('${d}')">
        ${d}
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="18" y1="6" x2="6" y2="18"/>
          <line x1="6" y1="6" x2="18" y2="18"/>
        </svg>
      </div>`
    )
    .join("");
}

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!e.target.closest(".filter-wrap")) {
    document.getElementById("filterDropdown").classList.remove("open");
  }
});

// ── Bookmarks ────────────────────────────────────────────────

function toggleBookmark(facultyId) {
  if (state.bookmarks.has(facultyId)) {
    state.bookmarks.delete(facultyId);
  } else {
    state.bookmarks.add(facultyId);
  }
  renderCards();
}

function toggleBookmarkView() {
  state.showBookmarked = !state.showBookmarked;
  const btn = document.getElementById("bookmarkToggle");
  btn.classList.toggle("active", state.showBookmarked);
  btn.querySelector("svg path").setAttribute(
    "fill",
    state.showBookmarked ? "currentColor" : "none"
  );
  renderCards();
}
