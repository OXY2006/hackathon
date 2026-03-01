/**
 * state.js — Single source of truth for UI state.
 * All other modules read from and write to this object.
 */

const state = {
  /** Full faculty list as returned from the API */
  allFaculty: [],

  /** Currently displayed (filtered) faculty */
  filtered: [],

  /** Set of bookmarked faculty IDs */
  bookmarks: new Set(),

  /** Whether the Saved filter is active */
  showBookmarked: false,

  /** Set of active department filter strings e.g. "CSE", "ECE" */
  activeDepts: new Set(),

  /** Current search query string */
  searchQuery: "",

  /** ID of the faculty whose projects page is open (null = closed) */
  currentFacultyId: null,
};
