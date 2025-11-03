const player = document.getElementById("player");
const albumArt = document.getElementById("album-art");
const songName = document.getElementById("song-name");
const songArtist = document.getElementById("song-artist");
const playPauseButton = document.getElementById("play-pause-button");
const prevButton = document.getElementById("prev-button");
const nextButton = document.getElementById("next-button");
const shuffleButton = document.getElementById("shuffle-button");
const loopButton = document.getElementById("loop-button");
let show = false;
const seekBar = document.getElementById("seek-bar");
let isShuffle = false;
let isLoop = false;

let playlist = [];
let backup = [];
let previousSongs = [];
let currentSongIndex = 0;
let playlistEnded = false;
let play_id = 0;
check = 0;
// Index where the next "Add to Queue" insertion should occur
let nextInsertIndex = 0;

// Drag state for queue reordering
let _queueDragSrcIndex = null;
let _queueInsertLineEl = null;
let _queueInsertInfo = { index: null, after: false };

function renderRedirected(action) {
  console.log("Redirected action:", action);
  if (action === "") return;
  openURL("/html/" + action, { push: true });
}
document.addEventListener("DOMContentLoaded", () => {
  console.log("DOMContentLoaded");
  try {
    const el = document.getElementById("greeting");
    const action = el?.dataset?.redirected ?? "";
    if (action) renderRedirected(action);
  } catch (_) {}
});

window.mobileCheck = function () {
  let check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    )
      check = true;
  })(navigator.userAgent || navigator.vendor || window.opera);
  if (check == true) {
    window.location.replace("/app");
  }
};

window.onload = window.mobileCheck;
function show_modal() {
  const modal = document.getElementById("myModal");
  const modalInstance =
    bootstrap.Modal.getInstance(modal) || new bootstrap.Modal(modal);
  modalInstance.show();
}
let newstatus = localStorage.getItem("new_status");
if (newstatus != "true") {
  localStorage.removeItem("new_status");
  localStorage.setItem("new_status", "true");
  show_modal();
}
function clear() {
  localStorage.clear();
}

// Lightweight debounce helper
function debounce(fn, delay) {
  let t;
  return function (...args) {
    clearTimeout(t);
    t = setTimeout(() => fn.apply(this, args), delay);
  };
}

// Build initials from a name (2 letters)
function initials(name) {
  if (!name) return "?";
  const parts = String(name).trim().split(/\s+/).filter(Boolean);
  const letters = (parts[0]?.[0] || "") + (parts[1]?.[0] || "");
  return letters.toUpperCase() || String(name)[0].toUpperCase();
}

// Simple ranking: exact > startsWith > includes
function scoreSong(song, termLc) {
  const name = String(song?.name || "").toLowerCase();
  const artist = String(song?.artist || "").toLowerCase();
  if (!termLc) return 0;
  if (name === termLc || artist === termLc) return 1000;
  if (name.startsWith(termLc) || artist.startsWith(termLc)) return 900;
  if (name.includes(termLc)) return 700;
  if (artist.includes(termLc)) return 600;
  return 0;
}
function togglePlaylistShare(playlistId) {
  fetch(`/api/toggle_playlist_share?id=${playlistId}`)
    .then((r) => r.json())
    .then((data) => {
      if (data.shared) {
        alert("Playlist is now shared.");
      } else {
        alert("Playlist is no longer shared.");
      }
    })
    .catch((err) => console.error("Error toggling share:", err));
}

// HTML escape to prevent injection when rendering playlist names
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Render the actions dropdown (Add to Queue, Add to Playlist...)
function renderActionDropdown(songId) {
  return `
    <div class="dropdown-center">
      <button class="btn btn-secondary btn-sm dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false" style="background-color: #121212;"></button>
      <ul class="dropdown-menu dropdown-menu-dark playlist-menu" data-song-id="${songId}">
        <li class="px-3 text-muted"><small>Loading…</small></li>
      </ul>
    </div>`;
}

// Fetch playlists once and cache
// Cache playlists fetch promise globally to avoid TDZ issues on early invocations
window._playlistsPromise = window._playlistsPromise || null;
function fetchPlaylistsOnce() {
  if (window._playlistsPromise) return window._playlistsPromise;
  window._playlistsPromise = fetch("/api/playlist_actions")
    .then((r) => {
      if (!r.ok) throw new Error("Failed to fetch playlists");
      return r.json();
    })
    .then((data) => (Array.isArray(data?.playlist) ? data.playlist : []))
    .catch((err) => {
      console.error("Playlists fetch error:", err);
      return [];
    });
  return window._playlistsPromise;
}

function buildPlaylistMenuItems(songId, lists) {
  const items = (lists || [])
    .map((lst) => {
      const id = Array.isArray(lst) ? lst[0] : lst?.id ?? lst?.[0];
      const name = Array.isArray(lst)
        ? lst[1]
        : lst?.name ?? lst?.[1] ?? "Playlist";
      return `<li><a class="dropdown-item" onclick="add_deleteSong(${songId}, ${id})">${escapeHtml(
        name
      )}</a></li>`;
    })
    .join("");
  return `
    <li><a class="dropdown-item" onclick="addQueue(${songId})">Add to Queue</a></li>
    <li><hr class="dropdown-divider" style="background-color: white;"></li>
    ${items}
  `;
}

function populatePlaylistDropdowns() {
  fetchPlaylistsOnce().then((lists) => {
    document.querySelectorAll(".playlist-menu").forEach((ul) => {
      const songId = ul.getAttribute("data-song-id");
      ul.innerHTML = buildPlaylistMenuItems(songId, lists);
    });
  });
}

function searchAuto() {
  const input = document.getElementById("searchInput");
  const lang = document.getElementById("lang");
  const root = document.getElementById("searchResults");
  const topSongsGrid = document.getElementById("topSongsGrid");
  const topSection = document.getElementById("topSection");
  const songsSection = document.getElementById("songsSection");
  const artistsSection = document.getElementById("artistsSection");
  const songsResults = document.getElementById("songsResults");
  const artistsRow = document.getElementById("artistsRow");
  const loading = document.getElementById("searchLoading");
  const emptyState = document.getElementById("emptyState");

  if (!input || !lang || !root) return;

  let currentController = null;
  let activeIndex = -1; // for keyboard navigation

  function showLoading(show) {
    if (loading) loading.style.display = show ? "block" : "none";
  }
  function showSections(showSongs, showArtists, showTop) {
    if (topSongsGrid)
      topSongsGrid.style.display = showSongs || showTop ? "block" : "none";
    if (songsSection) songsSection.style.display = showSongs ? "block" : "none";
    if (artistsSection)
      artistsSection.style.display = showArtists ? "block" : "none";
  }
  function showEmpty() {
    if (emptyState) emptyState.style.display = "block";
    showSections(false, false, false);
  }
  function hideEmpty() {
    if (emptyState) emptyState.style.display = "none";
  }

  function resetActive() {
    activeIndex = -1;
    document
      .querySelectorAll("#searchResults .result-item")
      .forEach((el) => el.classList.remove("active"));
  }
  function setActive(idx) {
    const items = Array.from(
      document.querySelectorAll("#searchResults .result-item")
    );
    items.forEach((el) => el.classList.remove("active"));
    if (items.length === 0) return;
    activeIndex = (idx + items.length) % items.length;
    items[activeIndex].classList.add("active");
    items[activeIndex].scrollIntoView({ block: "nearest" });
  }
  function activateCurrent() {
    const items = Array.from(
      document.querySelectorAll("#searchResults .result-item")
    );
    if (activeIndex >= 0 && activeIndex < items.length) {
      const btn = items[activeIndex].querySelector("button[data-action]");
      if (btn) btn.click();
    }
  }

  const performSearch = async () => {
    const term = input.value.trim();
    resetActive();
    if (!term) {
      showLoading(false);
      showEmpty();
      return;
    }

    // Prepare
    hideEmpty();
    showLoading(true);
    if (songsResults) songsResults.innerHTML = "";
    if (artistsRow) artistsRow.innerHTML = "";
    if (topSection) topSection.innerHTML = "";

    // Abort previous
    if (currentController) {
      try {
        currentController.abort();
      } catch (_) {}
    }
    currentController = new AbortController();
    const signal = currentController.signal;

    const searchTerm = encodeURIComponent(term);
    const langValue = encodeURIComponent(lang.value);

    try {
      const tasks = [];
      let songsData = [];
      let artistsData = [];

      if (lang.value !== "artist") {
        tasks.push(
          fetch(`/search_api?search=${searchTerm}&lang=${langValue}`, {
            signal,
          })
            .then((r) => {
              if (!r.ok) throw new Error("songs fetch failed");
              return r.json();
            })
            .then((d) => {
              songsData = d || [];
            })
        );
      }

      tasks.push(
        fetch(`/get/artist/list?term=${searchTerm}`, { signal })
          .then((r) => {
            if (!r.ok) throw new Error("artists fetch failed");
            return r.json();
          })
          .then((d) => {
            artistsData = d || [];
          })
      );

      await Promise.all(tasks);

      // Deduplicate songs by name+artist (case-insensitive)
      const seen = new Set();
      const dedupSongs = [];
      for (const song of songsData || []) {
        if (!song || !song.name || !song.artist) continue;
        const key = `${String(song.name).toLowerCase()}|${String(
          song.artist
        ).toLowerCase()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        dedupSongs.push(song);
      }

      // Rank songs and choose top + next 4 (excluding top)
      const termLc = term.toLowerCase();
      const ranked = dedupSongs
        .map((s) => ({ s, sc: scoreSong(s, termLc) }))
        .sort((a, b) => b.sc - a.sc)
        .map((x) => x.s);

      let topSong = ranked[0] || null;

      // We'll fill top card later after artist fallback logic; prepare side list now
      const sideSongs = topSong ? ranked.slice(1, 5) : ranked.slice(0, 4);
      const songsHtml = sideSongs.reduce((acc, s) => {
        const id = s.id;
        const name = s.name;
        const artist = s.artist;
        const artHtml = s.image
          ? `<img class="song-art" src="${s.image}" alt="">`
          : `<span class="song-art icon"><i class=\"fa-solid fa-music\"></i></span>`;
        acc += `
          <li class="data-track list-group-item d-flex align-items-center justify-content-between greyish-back text-white result-item" data-track data-song-id="${id}" data-artist="${artist}" data-name="${name}" draggable="true" ondragstart="onSongRowDragStart(event)" ondragend="onSongRowDragEnd(event)" aria-grabbed="false" role="option">
            <div class="ms-1 me-auto d-flex align-items-center" style="gap:10px;">
              ${artHtml}
              <div>
                <div class="fw-bold" style="line-height:1.1;">${name}</div>
                <small class="text-muted">${artist}</small>
              </div>
            </div>
          </li>`;
        return acc;
      }, "");

      const artistsHtml = (artistsData || []).reduce((acc, artist) => {
        if (!artist) return acc;
        const safeArtist = String(artist);
        acc += `
                                    <div class="artist-pill result-item">
                                        <div class="artist-avatar" title="${safeArtist}">${initials(
          safeArtist
        )}</div>
                                        <button data-action="open-artist" onclick="openURL('/html/artist?artist=${encodeURIComponent(
                                          safeArtist
                                        )}')" class="btn btn-sm btn-outline-light" style="background-color: transparent; border-color: rgba(255,255,255,0.2);">${safeArtist}</button>
                                    </div>`;
        return acc;
      }, "");

      if (songsResults) songsResults.innerHTML = songsHtml;
      if (artistsRow) artistsRow.innerHTML = artistsHtml;

      // Top result heuristic (prefer song topSong; else artist)
      let top = null;
      if (topSong) {
        top = { type: "song", data: topSong };
      }
      if (!top && (artistsData || []).length) {
        top = { type: "artist", data: artistsData[0] };
      }

      let topHtml = "";
      if (top) {
        if (top.type === "song") {
          const s = top.data;
          const name = s.name;
          const artist = s.artist;
          const id = s.id;
          const art = s.image
            ? `<img src="${s.image}" alt="">`
            : `<i class="fa-solid fa-music"></i>`;
          topHtml = `
                                            <div class="top-card result-item data-track" data-track data-song-id="${id}" data-artist="${artist}" data-name="${name}" draggable="true" ondragstart="onSongRowDragStart(event)" ondragend="onSongRowDragEnd(event)" aria-grabbed="false" role="option">
                                                                <div class="art">${art}</div>
                                                <div class="flex-grow-1">
                                                    <div class="text-muted mb-1" style="letter-spacing:.08em; text-transform:uppercase; font-size:.75rem;">Top result</div>
                                                    <div class="h4 fw-bold mb-1" style="line-height:1.1;">${name}</div>
                                                    <div class="text-muted">${artist} • Song</div>
                                                </div>
                                            </div>`;
        } else {
          const a = String(top.data);
          topHtml = `
                                            <div class="top-card result-item">
                                                <div class="art" style="border-radius:50%; background: linear-gradient(135deg,#1DB954,#8FE9A5); color:#111;">${initials(
                                                  a
                                                )}</div>
                                                <div class="flex-grow-1">
                                                    <div class="text-muted mb-1" style="letter-spacing:.08em; text-transform:uppercase; font-size:.75rem;">Top result</div>
                                                    <div class="h4 fw-bold mb-1" style="line-height:1.1;">${a}</div>
                                                    <div class="text-muted">Artist</div>
                                                </div>
                                                <div>
                                                    <button data-action="open-artist" class="btn btn-outline-light" onclick="openURL('/html/artist?artist=${encodeURIComponent(
                                                      a
                                                    )}')">Open</button>
                                                </div>
                                            </div>`;
        }
      }
      if (topSection) topSection.innerHTML = topHtml;

      // Now that dropdown shells are in the DOM, populate them from API
      populatePlaylistDropdowns();

      const hasSongs = Boolean(songsHtml);
      const hasArtists = Boolean(artistsHtml);
      const hasTop = Boolean(topHtml);
      showSections(hasSongs, hasArtists, hasTop);
      if (!hasSongs && !hasArtists) {
        if (root) root.scrollTop = 0;
        showEmpty();
      }
    } catch (err) {
      if (err?.name !== "AbortError") {
        console.error("Search error:", err);
        showEmpty();
      }
    } finally {
      showLoading(false);
    }
  };

  const debounced = debounce(performSearch, 200);

  // Listen for search and filter changes
  input.addEventListener("input", debounced);
  lang.addEventListener("change", debounced);

  // Keyboard navigation from input
  input.addEventListener("keydown", (e) => {
    const items = Array.from(
      document.querySelectorAll("#searchResults .result-item")
    );
    if (!items.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(activeIndex + 1);
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(activeIndex - 1);
    }
    if (e.key === "Enter") {
      if (activeIndex === -1) setActive(0);
      activateCurrent();
    }
  });

  // Initial state
  showEmpty();
}

// --- Lightweight SPA navigation (History API) ---
// Contract:
// - openURL(url, opts?): loads partial HTML into #main and optionally push/replace history
// - Intercepts internal <a> clicks inside #main
// - Handles browser back/forward via popstate
// - Restores scroll position of #main

function setMainContent(html) {
  const main = document.getElementById("main");
  if (!main) return;
  main.innerHTML = html;
  // Initialize any dynamic behaviors required by injected views
  try {
    initStrippedEnhancements && initStrippedEnhancements();
  } catch (e) {}
  // Reinitialize Bootstrap tooltips for newly injected content
  try {
    initTooltips && initTooltips();
  } catch (_) {}
}

// --- Queue reordering helpers ---
function _moveArrayItem(arr, from, to) {
  if (from === to) return;
  if (from < 0 || to < 0 || from >= arr.length || to > arr.length) return;
  const item = arr.splice(from, 1)[0];
  arr.splice(to, 0, item);
}
function _queueCanDrag(plIndex) {
  // Only allow dragging items after the currently playing index
  return Number(plIndex) > Number(currentSongIndex);
}
function _ensureInsertLine() {
  if (_queueInsertLineEl && _queueInsertLineEl.isConnected)
    return _queueInsertLineEl;
  const el = document.createElement("div");
  el.className = "queue-insert-line";
  _queueInsertLineEl = el;
  return el;
}
function _hideInsertLine() {
  try {
    if (_queueInsertLineEl && _queueInsertLineEl.parentNode) {
      _queueInsertLineEl.parentNode.removeChild(_queueInsertLineEl);
    }
  } catch (_) {}
  _queueInsertInfo = { index: null, after: false };
}
function _showInsertLineForCard(card, placeAfter) {
  const line = _ensureInsertLine();
  const parent = card?.parentNode;
  if (!parent) return;
  if (placeAfter) {
    parent.insertBefore(line, card.nextSibling);
  } else {
    parent.insertBefore(line, card);
  }
  const idx = Number(card?.getAttribute("data-pl-index") || -1);
  _queueInsertInfo = { index: idx, after: !!placeAfter };
}
function onQueueDragStart(e) {
  const card = e.currentTarget;
  const from = Number(card?.getAttribute("data-pl-index") || -1);
  if (!_queueCanDrag(from)) {
    e.preventDefault();
    return;
  }
  _queueDragSrcIndex = from;
  try {
    if (e.dataTransfer) {
      e.dataTransfer.setData("text/plain", String(from));
      e.dataTransfer.effectAllowed = "move";
    }
  } catch (_) {}
  card.classList.add("dragging");
}
function onQueueDragEnd(e) {
  const card = e.currentTarget;
  card?.classList?.remove("dragging");
  _queueDragSrcIndex = null;
  _hideInsertLine();
}
function onQueueDragOver(e) {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
  const queueItem =
    (e.target.closest && e.target.closest(".queue-item")) || null;
  const container = document.getElementById("queue");
  if (!queueItem) {
    const items = container
      ? Array.from(container.querySelectorAll(".queue-item"))
      : [];
    const last = items[items.length - 1];
    if (last) _showInsertLineForCard(last, true);
    return;
  }
  const rect = queueItem.getBoundingClientRect();
  const relY = e.clientY - rect.top;
  const placeAfter = relY > rect.height / 2;

  const targetIdx = Number(queueItem.getAttribute("data-pl-index") || -1);
  if (placeAfter) {
    if (targetIdx + 1 <= currentSongIndex) {
      const firstUpNext = container?.querySelector(".queue-item");
      if (firstUpNext) {
        _showInsertLineForCard(firstUpNext, false);
        return;
      }
    }
  } else {
    if (targetIdx <= currentSongIndex) {
      const firstUpNext = container?.querySelector(".queue-item");
      if (firstUpNext) {
        _showInsertLineForCard(firstUpNext, false);
        return;
      }
    }
  }
  _showInsertLineForCard(queueItem, placeAfter);
}
function onQueueDragEnter(e) {
  onQueueDragOver(e);
}
function onQueueDragLeave(e) {
  // keep line visible while moving between siblings
}
function onQueueDrop(e) {
  e.preventDefault();
  try {
    let toIndex = null;
    if (_queueInsertInfo.index != null) {
      toIndex = _queueInsertInfo.after
        ? Number(_queueInsertInfo.index) + 1
        : Number(_queueInsertInfo.index);
    }
    if (toIndex == null || !Number.isInteger(toIndex)) {
      const target =
        (e.target.closest && e.target.closest(".queue-item")) || null;
      if (target) toIndex = Number(target.getAttribute("data-pl-index") || -1);
    }
    const fromIndex = _queueDragSrcIndex;
    if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex)) {
      _hideInsertLine();
      return;
    }
    if (toIndex <= currentSongIndex) toIndex = currentSongIndex + 1;
    if (fromIndex < toIndex) toIndex = toIndex - 1;

    _moveArrayItem(playlist, fromIndex, toIndex);
    updateQueueUI();
  } catch (err) {
    console.error("Queue drop failed:", err);
  } finally {
    _hideInsertLine();
  }
}

function openURL(url, opts = {}) {
  const { push = true, replace = false, restoreScrollTop } = opts;
  const main = document.getElementById("main");
  const prevScroll = main ? main.scrollTop : 0;
  fetch(url, { credentials: "same-origin" })
    .then((response) => response.text())
    .then((html) => {
      setMainContent(html);
      // Page-specific bootstraps
      if (url === "/html/search") {
        try {
          searchAuto();
        } catch (_) {}
      }

      // Update history state
      // Normalize history URL: strip leading "/html" so address bar shows "/pagename"
      if (typeof url === "string" && url.startsWith("/html/")) {
        url = url.replace(/^\/html/, "");
      }
      const state = { url, scrollTop: 0 };
      if (replace) {
        history.replaceState(state, "", url);
      } else if (push) {
        history.pushState(state, "", url);
      }

      // Scroll handling
      if (typeof restoreScrollTop === "number" && main) {
        // Restore saved position when navigating via popstate
        main.scrollTop = restoreScrollTop;
      } else if (main) {
        // Reset scroll to top for new navigation
        main.scrollTop = 0;
      }
    })
    .catch((error) => console.error("Error fetching HTML:", error));
}

// Initialize initial history state and popstate/back/forward support
(function setupSpaHistory() {
  const main = document.getElementById("main");
  // Seed initial state once
  if (!history.state || !history.state.url) {
    const initialUrl = window.location.pathname + window.location.search;
    history.replaceState(
      { url: initialUrl, scrollTop: main ? main.scrollTop : 0 },
      "",
      window.location.href
    );
  }

  // Update current entry's scrollTop as the user scrolls the main container
  if (main) {
    main.addEventListener(
      "scroll",
      () => {
        const st = main.scrollTop;
        const cur = history.state || {};
        if (typeof st === "number") {
          try {
            history.replaceState(
              { ...cur, scrollTop: st },
              "",
              window.location.href
            );
          } catch (_) {}
        }
      },
      { passive: true }
    );
  }

  // Handle browser back/forward
  window.addEventListener("popstate", (e) => {
    const st = e.state || {};
    const targetUrl =
      st.url || window.location.pathname + window.location.search;
    const scrollTop = typeof st.scrollTop === "number" ? st.scrollTop : 0;
    // Load without pushing a new entry; restore saved scroll
    openURL(targetUrl, {
      push: false,
      replace: true,
      restoreScrollTop: scrollTop,
    });
  });
})();

// Intercept internal links inside #main to navigate without full reload
document.addEventListener("click", (ev) => {
  // Ignore modified clicks and non-primary buttons
  if (
    ev.defaultPrevented ||
    ev.button !== 0 ||
    ev.metaKey ||
    ev.ctrlKey ||
    ev.shiftKey ||
    ev.altKey
  )
    return;

  // Find anchor
  let a = ev.target;
  while (a && a.tagName !== "A") a = a.parentElement;
  if (!a) return;

  // If anchor is marked to skip SPA, let it pass
  if (a.hasAttribute("data-no-spa")) return;

  // Must be same-origin and not targetting new window
  const href = a.getAttribute("href");
  if (!href || a.target === "_blank") return;
  // Only intercept app-internal paths (start with '/')
  if (!href.startsWith("/")) return;

  // Only intercept clicks that occur within the main area or explicitly opt-in via data-spa
  const main = document.getElementById("main");
  const withinMain = main && (main === a || main.contains(a));
  const explicitSpa = a.hasAttribute("data-spa");
  if (!withinMain && !explicitSpa) return;

  ev.preventDefault();
  openURL(href, { push: true });
});

// Expose optional custom back/forward handlers for toolbar buttons
window.goBack = function () {
  history.back();
};
window.goForward = function () {
  history.forward();
};

function setStatus() {
  check = document.querySelector("body").getAttribute("check");
}
// Fetch playlist data

//     <tr>
//     <td><a class="btn btn-outline-secondary btn-sm" role="button" aria-disabled="true" href="/play?p={{song['id']}}"><i class="fa-solid fa-circle-play"></i></a></td>
//     <td>{{song['name']}}</td>
//     <td>{{song['artist']}}</td>
//     <td>
//   </tr>

function calculateTotalDuration(playlist) {
  // Sum the duration of all songs in the playlist
  const totalSeconds = playlist.reduce(
    (total, song) => total + song.duration,
    0
  );

  // Convert total seconds to hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Construct the duration string
  let totalduration;
  if (hours === 0) {
    totalduration = `about ${minutes} min`;
  } else {
    totalduration = `about ${hours} hours and ${minutes} min`;
  }

  return totalduration;
}
// Refresh queue-related UI (queue list and optional total duration)
function updateQueueUI() {
  try {
    const container = document.getElementById("queue");
    if (container) displayQueue();
    const durEl = document.getElementById("totalduration");
    if (durEl) durEl.textContent = calculateTotalDuration(playlist);
  } catch (_) {}
}
function displayQueue() {
  const container = document.getElementById("queue");
  // Clear previous content
  if (!container) return;
  container.innerHTML = "";
  // remove any stale insert line when re-rendering
  try {
    _hideInsertLine();
  } catch (_) {}
  if (!playlist.length) return;

  // Clamp nextInsertIndex within bounds relative to currentSongIndex
  try {
    nextInsertIndex = Math.min(
      Math.max(currentSongIndex + 1, Number(nextInsertIndex) || 0),
      playlist.length
    );
  } catch (_) {}

  // Now Playing section
  const now = playlist[currentSongIndex];
  container.innerHTML += `
    <h5><b>Now Playing: </b></h5>
    <div class="card greyish-back p-0" style="text-align: start;" data-pl-index="${currentSongIndex}">
      <div class="card-body p-1">
        <img src="${now.image}" alt="" style="width:25px; border-radius: 5px;">
        <button style="text-align: left; background-color: transparent; color: white; border-style: none; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 90%;">${now.name}</button>
        <br>
        <span style="color: gray; font-size: smaller; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 95%;">${now.artist}</span>
      </div>
    </div>`;

  // Up Next section
  if (currentSongIndex < playlist.length - 1) {
    container.innerHTML += `
      <br>
      <h5><b>Up Next: </b></h5>
    `;

    for (let index = currentSongIndex + 1; index < playlist.length; index++) {
      const song = playlist[index];
      container.innerHTML += `
        <div class="card greyish-back p-0 queue-item" style="text-align: start;" 
             data-pl-index="${index}"
             draggable="true" ondragstart="onQueueDragStart(event)" ondragend="onQueueDragEnd(event)" ondragover="onQueueDragOver(event)" ondragenter="onQueueDragEnter(event)" ondragleave="onQueueDragLeave(event)" ondrop="onQueueDrop(event)">
          <div class="card-body p-1">
            <img src="${song.image}" alt="" style="width:25px; border-radius: 5px;">
            <button style="text-align: left; background-color: transparent; color: white; border-style: none; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 90%;">${song.name}</button>
            <br>
            <span style="color: gray; font-size: smaller; display: inline-block; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 95%;">${song.artist}</span>
          </div>
        </div>`;
    }
  }
}

function loadCurrentSong() {
  if (playlist.length === 0) return;

  const song = playlist[currentSongIndex];
  console.log("Loading song:", song);
  albumArt.src = song.image;
  songName.textContent = song.name;
  songArtist.textContent = song.artist;
  player.src = song.url;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: song.name,
      artist: song.artist,
      album: "DhanTune",
      artwork: [{ src: song.image, sizes: "96x96", type: "image/jpeg" }],
    });
  } catch (_) {}
  updateQueueUI();
}
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

function playSong() {
  player.play();
  playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
}

function pauseSong() {
  player.pause();
  playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
}

function playPause() {
  if (player.paused) {
    playSong();
  } else {
    pauseSong();
  }
}
function shuffleToggle() {
  if (isShuffle === false) {
    isShuffle = true;
    // Shuffle only the upcoming songs, keep the current one fixed
    if (playlist.length > currentSongIndex + 1) {
      const head = playlist.slice(0, currentSongIndex + 1);
      const tail = playlist.slice(currentSongIndex + 1);
      shuffleArray(tail);
      playlist = head.concat(tail);
    }
    // Ensure subsequent adds go after the current track
    nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
    loadCurrentSong();
    setTimeout(() => {
      playPause();
      console.log("starting song");
    }, 10);

    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    shuffleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="width:25px; height: 25px; fill: green;">
  <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
  <path d="M467.8 98.4C479.8 93.4 493.5 96.2 502.7 105.3L566.7 169.3C572.7 175.3 576.1 183.4 576.1 191.9C576.1 200.4 572.7 208.5 566.7 214.5L502.7 278.5C493.5 287.7 479.8 290.4 467.8 285.4C455.8 280.4 448 268.9 448 256L448 224L416 224C405.9 224 396.4 228.7 390.4 236.8L358 280L318 226.7L339.2 198.4C357.3 174.2 385.8 160 416 160L448 160L448 128C448 115.1 455.8 103.4 467.8 98.4zM218 360L258 413.3L236.8 441.6C218.7 465.8 190.2 480 160 480L96 480C78.3 480 64 465.7 64 448C64 430.3 78.3 416 96 416L160 416C170.1 416 179.6 411.3 185.6 403.2L218 360zM502.6 534.6C493.4 543.8 479.7 546.5 467.7 541.5C455.7 536.5 448 524.9 448 512L448 480L416 480C385.8 480 357.3 465.8 339.2 441.6L185.6 236.8C179.6 228.7 170.1 224 160 224L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L160 160C190.2 160 218.7 174.2 236.8 198.4L390.4 403.2C396.4 411.3 405.9 416 416 416L448 416L448 384C448 371.1 455.8 359.4 467.8 354.4C479.8 349.4 493.5 352.2 502.7 361.3L566.7 425.3C572.7 431.3 576.1 439.4 576.1 447.9C576.1 456.4 572.7 464.5 566.7 470.5L502.7 534.5z"/>
  <!-- Active indicator dot -->
  <circle cx="320" cy="580" r="30" fill="green"/>
</svg>`;
  } else {
    isShuffle = false;
    playPlaylist(play_id);
    previousSongs = [];
    currentSongIndex = 0;
    loadCurrentSong();
    setTimeout(() => {
      playPause();
      console.log("starting song");
    }, 10);
    playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    shuffleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" style="width:25px; height: 25px; fill: #007bff;">
  <!--!Font Awesome Free v7.1.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
  <path d="M467.8 98.4C479.8 93.4 493.5 96.2 502.7 105.3L566.7 169.3C572.7 175.3 576.1 183.4 576.1 191.9C576.1 200.4 572.7 208.5 566.7 214.5L502.7 278.5C493.5 287.7 479.8 290.4 467.8 285.4C455.8 280.4 448 268.9 448 256L448 224L416 224C405.9 224 396.4 228.7 390.4 236.8L358 280L318 226.7L339.2 198.4C357.3 174.2 385.8 160 416 160L448 160L448 128C448 115.1 455.8 103.4 467.8 98.4zM218 360L258 413.3L236.8 441.6C218.7 465.8 190.2 480 160 480L96 480C78.3 480 64 465.7 64 448C64 430.3 78.3 416 96 416L160 416C170.1 416 179.6 411.3 185.6 403.2L218 360zM502.6 534.6C493.4 543.8 479.7 546.5 467.7 541.5C455.7 536.5 448 524.9 448 512L448 480L416 480C385.8 480 357.3 465.8 339.2 441.6L185.6 236.8C179.6 228.7 170.1 224 160 224L96 224C78.3 224 64 209.7 64 192C64 174.3 78.3 160 96 160L160 160C190.2 160 218.7 174.2 236.8 198.4L390.4 403.2C396.4 411.3 405.9 416 416 416L448 416L448 384C448 371.1 455.8 359.4 467.8 354.4C479.8 349.4 493.5 352.2 502.7 361.3L566.7 425.3C572.7 431.3 576.1 439.4 576.1 447.9C576.1 456.4 572.7 464.5 566.7 470.5L502.7 534.5z"/>
  <!-- Active indicator dot -->
</svg>`;
    shuffleButton.style.color = "#007bff";
  }
  previousSongs = [];
  playlistEnded = false;
  updateQueueUI();
}
function loopToggle() {
  if (isLoop === false) {
    isLoop = true;
    loopButton.style.color = "green";
  } else {
    isLoop = false;
    loopButton.style.color = "#007bff";
  }
}

function nextSong() {
  if (playlist.length === 0) return;
  // mark current as played
  try {
    const curId = playlist[currentSongIndex]?.id;
    if (curId !== undefined) previousSongs.push(String(curId));
  } catch (_) {}

  // Move index forward
  if (currentSongIndex < playlist.length - 1) {
    currentSongIndex += 1;
    // reset insertion point to be right after the new current
    nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
    playlistEnded = false;
    loadCurrentSong();
    playSong();
  } else {
    // We were at the end
    playlistEnded = true;
    if (isLoop) {
      currentSongIndex = 0;
      nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
      loadCurrentSong();
      playSong();
    } else {
      pauseSong();
    }
  }
  updateQueueUI();
}

function prevSong() {
  if (playlist.length === 0) return;
  if (previousSongs.length) previousSongs.pop();
  currentSongIndex = (currentSongIndex - 1 + playlist.length) % playlist.length;
  nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
  playlistEnded = false; // Reset flag as we are navigating within the playlist
  loadCurrentSong();
  playSong();
  updateQueueUI();
}

// Update seek bar as the song plays
player.addEventListener("timeupdate", () => {
  if (!isFinite(player.duration) || player.duration <= 0) return;
  const percent = (player.currentTime / player.duration) * 100;
  seekBar.value = isFinite(percent) ? percent : 0;
});

// Change song position when seek bar is adjusted
seekBar.addEventListener("input", () => {
  const newTime = (seekBar.value / 100) * player.duration;
  player.currentTime = newTime;
});

player.addEventListener("ended", () => {
  // On song end, either advance or stop based on loop/end-of-queue
  if (isLoop) {
    setTimeout(nextSong, 100);
    return;
  }
  const atEnd = currentSongIndex >= playlist.length - 1;
  if (playlist.length <= 1 || atEnd) {
    playlistEnded = true;
    pauseSong();
  } else {
    setTimeout(nextSong, 100);
  }
});

playPauseButton.addEventListener("click", playPause);
nextButton.addEventListener("click", nextSong);
prevButton.addEventListener("click", prevSong);
shuffleButton.addEventListener("click", shuffleToggle);
loopButton.addEventListener("click", loopToggle);
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") {
    if (player.paused) {
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    }
    if (!player.paused) {
      playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    }
  }
});

if (check == 0 || check == 1) {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setActionHandler("play", () => {
      // Handle play action
      player.play();
    });

    navigator.mediaSession.setActionHandler("pause", () => {
      // Handle pause action
      player.pause();
    });
    if (check == 0) {
      navigator.mediaSession.setActionHandler("previoustrack", () => {
        // Handle previous track action
        prevSong();
      });

      navigator.mediaSession.setActionHandler("nexttrack", () => {
        // Handle next track action
        nextSong();
      });
    }
  }
  setInterval(() => {
    if (player.paused) {
      playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
    } else {
      playPauseButton.innerHTML = '<i class="fas fa-pause"></i>';
    }
  }, 200);
}

function myFunction() {
  var x = document.getElementById("object1");
  var y = document.getElementById("object2");
  if (show == false) {
    x.className = x.className.replace(" hide1", " show1");
    y.className = y.className.replace(" hide1", " show2");

    show = true;
  } else {
    x.className = x.className.replace(" show1", " hide1");
    y.className = y.className.replace(" show2", " hide1");

    show = false;
  }
}

function playPlaylist(id, shuffle = false) {
  check = 0;
  fetch(`/playlist_data?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      playlist = data;
      previousSongs = [];

      if (isShuffle === true) {
        shuffleArray(playlist);
      } else if (shuffle === true) {
        shuffleButton.style.color = "green";
        shuffleArray(playlist);
      }
      playlistEnded = false;
      currentSongIndex = 0;
      nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
      loadCurrentSong();
      setTimeout(() => {
        playPause();
        console.log("starting song");
      }, 10);
      updateQueueUI();
    });
}

function startSong(id) {
  check = 1;
  isShuffle = false;

  playPauseButton.innerHTML = '<i class="fas fa-play"></i>';
  shuffleButton.style.color = "#007bff";
  fetch(`/song_data?id=${id}`)
    .then((response) => response.json())
    .then((data) => {
      playlist = data;
      previousSongs = [];
      playlistEnded = false;
      currentSongIndex = 0;
      nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
      loadCurrentSong();
      setTimeout(() => {
        playPause();
        console.log("starting song");
      }, 1000);
      updateQueueUI();
    });
}

function add_deleteSong(song, list, reload) {
  const encodedSong = encodeURIComponent(song);
  const encodedList = encodeURIComponent(list);

  fetch(`/add?song=${encodedSong}&list=${encodedList}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((data) => {
      console.log(data);
      if (data.trim() === "true" || data.trim() === "false") {
        if (reload) {
          openURL(`/html/playlist?p=${encodedList}`);
        }
      }
      if (data.trim() === "true") {
        show_notify("Song added", 5000);
      }
      if (data.trim() === "false") {
        show_notify("Song removed", 5000);
        (function () {
          const id = "removeConfirmModal";
          let wrapper = document.getElementById(id);

          if (!wrapper) {
            wrapper = document.createElement("div");
            wrapper.id = id;
            wrapper.innerHTML = `
              <div class="modal fade" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog modal-dialog-centered" role="document">
                  <div class="modal-content bg-dark text-white">
                    <div class="modal-header">
                      <h5 class="modal-title">Removed from playlist. Undo?</h5>
                      <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div class="modal-footer">
                      <button type="button" class="btn btn-outline-light btn-undo">Undo</button>
                      <button type="button" class="btn btn-danger" data-bs-dismiss="modal">Close</button>
                    </div>
                  </div>
                </div>
              </div>
            `;
            document.body.appendChild(wrapper);
          } else {
            const msg = wrapper.querySelector(".rm-msg");
            if (msg)
              msg.textContent =
                "The song was removed. Would you like to undo this action?";
          }

          const modalEl = wrapper.querySelector(".modal");
          const bsModal =
            bootstrap.Modal.getInstance(modalEl) ||
            new bootstrap.Modal(modalEl);

          const oldBtn = wrapper.querySelector(".btn-undo");
          const newBtn = oldBtn.cloneNode(true);
          oldBtn.parentNode.replaceChild(newBtn, oldBtn);

          newBtn.addEventListener("click", () => {
            fetch(`/add?song=${encodedSong}&list=${encodedList}`)
              .then((res) => res.text())
              .then((text) => {
                if (String(text).trim() === "true") {
                  show_notify("Restored", 3000);
                } else {
                  show_notify("Could not restore", 3000);
                }
                if (reload) {
                  openURL(`/html/playlist?p=${encodedList}`);
                }
              })
              .catch(() => {
                show_notify("Could not restore", 3000);
              })
              .finally(() => bsModal.hide());
          });

          bsModal.show();
        })();
      }
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

function show_notify(message, time) {
  const notify = document.getElementById("notify");
  notify.style.backgroundImage = "linear-gradient(#E91E63, #6A3CE8)";

  notify.style.display = "block";
  notify.innerText = message;
  setTimeout(() => {
    notify.innerText = "";
    notify.style.display = "none";
  }, time);
}

function tooltip(message) {
  const notify = document.getElementById("notify");
  notify.style.backgroundImage = "linear-gradient(#69B9EF, #6A3CE8)";
  // notify.style.backgroundColor = 'black'

  notify.style.display = "block";
  notify.innerText = message;
}

function playlist_tooltip(message) {
  const notify = document.getElementById("notify");
  notify.style.backgroundImage = "linear-gradient(#0A2C4D, #20A8CD)";
  notify.style.display = "block";
  notify.innerText = message;
}

function tooltipClose() {
  const notify = document.getElementById("notify");
  notify.innerText = "";
  notify.style.display = "none";
}

function addQueue(song_id) {
  const wasEmpty = playlist.length === 0;
  fetch(`/song_data?id=${song_id}`)
    .then((response) => response.json())
    .then((data) => {
      // Insert new song right after the current one, maintaining order of multiple adds
      const song = data[0];
      if (wasEmpty) {
        playlist.push(song);
      } else {
        const insertAt = Math.min(
          Math.max(Number(nextInsertIndex) || currentSongIndex + 1, 0),
          playlist.length
        );
        playlist.splice(insertAt, 0, song);
        nextInsertIndex = Math.min(insertAt + 1, playlist.length);
      }
      backup.push(data[0]);
      check = 0;
      tooltip("Added to Queue");
      setTimeout(() => {
        tooltipClose();
      }, 2000);
      if (wasEmpty) {
        currentSongIndex = 0;
        nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
        playlistEnded = false;
        loadCurrentSong();
        playSong();
      } else if (playlistEnded) {
        // New items after end: allow advancing
        playlistEnded = false;
      }
      updateQueueUI();
    });
}

function findSongIndex(id_Song) {
  return playlist.findIndex((song) => song.id == id_Song);
}

function playfromPlaylist(type, playlist_id, song_id) {
  console.log("Playling from Playlist: ", playlist_id, song_id);
  check = 0;

  if (type === "artist") {
    console.log(type);
    console.log(playlist_id);
    console.log(song_id);
    console.log("Fetching artist playlist");
    fetch(`/api/artist?artist=${encodeURIComponent(playlist_id)}`)
      .then((response) => response.json())
      .then((data) => {
        console.log("Artist playlist data:", data);
        playlist = data;
        previousSongs = [];

        if (isShuffle === true) {
          shuffleArray(playlist);
        }
        let index = findSongIndex(song_id);
        currentSongIndex = index;
        nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
        loadCurrentSong();
        setTimeout(() => {
          playPause();
          console.log("starting song");
        }, 10);
        playlistEnded = false;
        updateQueueUI();
      });
    return;
  } else {
    fetch(`/playlist_data?id=${playlist_id}`)
      .then((response) => response.json())
      .then((data) => {
        playlist = data;
        previousSongs = [];

        if (isShuffle === true) {
          shuffleArray(playlist);
        }
        let index = findSongIndex(song_id);
        currentSongIndex = index;
        nextInsertIndex = Math.min(currentSongIndex + 1, playlist.length);
        loadCurrentSong();
        setTimeout(() => {
          playPause();
          console.log("starting song");
        }, 10);
        playlistEnded = false;
        updateQueueUI();
      });
  }
}

// --- Stripped views: lightweight enhancements bootstrap ---
// We load templates via openURL() by setting innerHTML; inline <script> won't run.
// This initializer wires up per-page features (like playlist context menu) after content injection.
window._strippedEnhancementsInit = window._strippedEnhancementsInit || false;

// Unified context menu for playlists and tracks
function setupUnifiedContextMenu() {
  if (window._unifiedCtxInit) return;
  window._unifiedCtxInit = true;

  // Create a single menu root
  const menu = document.createElement("div");
  menu.id = "unifiedCtxMenu";
  menu.className = "ctx-menu";
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-hidden", "true");
  menu.style.display = "none";
  document.body.appendChild(menu);

  let current = null; // { kind: 'playlist'|'track', data: {...}, anchorRect?: DOMRect }

  function hideMenu() {
    menu.style.display = "none";
    menu.setAttribute("aria-hidden", "true");
    current = null;
  }
  function showMenuAt(x, y) {
    const pad = 8;
    menu.style.display = "block";
    menu.setAttribute("aria-hidden", "false");
    const rect = menu.getBoundingClientRect();
    let left = x,
      top = y;
    if (left + rect.width + pad > window.innerWidth)
      left = Math.max(pad, window.innerWidth - rect.width - pad);
    if (top + rect.height + pad > window.innerHeight)
      top = Math.max(pad, window.innerHeight - rect.height - pad);
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function buildMenu(kind, data) {
    // kind: 'playlist' | 'track'
    if (kind === "playlist") {
      const id = data.id;
      menu.innerHTML = `
        <button class="ctx-item" role="menuitem" data-action="pl-open"><i class="fa-solid fa-play"></i> Open</button>
        <button class="ctx-item" role="menuitem" data-action="pl-copy"><i class="fa-solid fa-link"></i> Copy link</button>
        <hr class="ctx-sep" />
        <button class="ctx-item" role="menuitem" data-action="pl-delete" style="color:#ff6b6b;"><i class="fa-solid fa-trash"></i> Delete</button>
      `;
      return;
    }
    if (kind === "track") {
      menu.innerHTML = `
        <button class="ctx-item" role="menuitem" data-action="tr-play"><i class="fa-solid fa-circle-play"></i> Play</button>
        <button class="ctx-item" role="menuitem" data-action="tr-add"><i class="fa-solid fa-plus"></i> Add to playlist…</button>
        <button class="ctx-item" role="menuitem" data-action="tr-remove"><i class="fa-solid fa-minus"></i> Remove from this playlist</button>
        <hr class="ctx-sep" />
      `;
      return;
    }
    if (kind === "track-artist") {
      menu.innerHTML = `
        <button class="ctx-item" role="menuitem" data-action="tr-play-artist"><i class="fa-solid fa-circle-play"></i> Play</button>
        <button class="ctx-item" role="menuitem" data-action="tr-add"><i class="fa-solid fa-plus"></i> Add to playlist…</button>
        <button class="ctx-item" role="menuitem" data-action="tr-remove"><i class="fa-solid fa-minus"></i> Remove from this playlist</button>
        <hr class="ctx-sep" />
      `;
      return;
    }
    menu.innerHTML = "";
  }

  // Render inline submenu for adding the current track to a playlist
  function renderTrackAddSubmenu(songId) {
    // Initial loading state
    menu.innerHTML = `
      <div class="ctx-item" style="cursor:default; opacity:.9;">
        <i class="fa-solid fa-list"></i>
        <strong>Add to playlist</strong>
      </div>
      <hr class="ctx-sep" />
      <button class="ctx-item" role="menuitem" data-back="track"><i class="fa-solid fa-arrow-left"></i> Back</button>
      <div class="ctx-item" style="cursor:default; opacity:.8;">Loading…</div>
    `;
    fetchPlaylistsOnce().then((lists) => {
      const items = (lists || [])
        .map((lst) => {
          const id = Array.isArray(lst) ? lst[0] : lst?.id ?? lst?.[0];
          const name = Array.isArray(lst)
            ? lst[1]
            : lst?.name ?? lst?.[1] ?? "Playlist";
          return `<button class="ctx-item" role="menuitem" data-pl-pick="${id}"><i class="fa-solid fa-folder-plus"></i> ${escapeHtml(
            name
          )}</button>`;
        })
        .join("");
      menu.innerHTML = `
        <div class="ctx-item" style="cursor:default; opacity:.9;">
          <i class="fa-solid fa-list"></i>
          <strong>Add to playlist</strong>
        </div>
        <hr class="ctx-sep" />
        <button class="ctx-item" role="menuitem" data-back="track"><i class="fa-solid fa-arrow-left"></i> Back</button>
        ${
          items ||
          `<div class="ctx-item" style="cursor:default; opacity:.8;">No playlists found</div>`
        }
      `;
      // Persist song id so the submenu click handler can access it
      menu.dataset.songId = String(songId);
    });
  }

  function copyText(txt) {
    if (navigator.clipboard?.writeText)
      return navigator.clipboard.writeText(txt).catch(() => {});
    // Fallback
    const ta = document.createElement("textarea");
    ta.value = txt;
    ta.style.position = "fixed";
    ta.style.left = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
    } catch (_) {}
    document.body.removeChild(ta);
    return Promise.resolve();
  }

  function handleAction(action) {
    if (!current) return;
    console.log("Handling action:", action, "for", current);
    const kind = current.kind;
    const d = current.data || {};
    if (kind === "playlist") {
      if (action === "pl-open") openURL(`/html/playlist?p=${d.id}`);
      if (action === "pl-copy")
        copyText(`${location.origin}/html/playlist?p=${d.id}`);
      if (action === "pl-delete") {
        const plId = String(d.id);
        fetch(`/del_playlist?id=${plId}`, { method: "GET" })
          .then(() => {
            // Remove from sidebar immediately
            try {
              const btn = document.querySelector(
                `[data-playlist-id="${CSS.escape(plId)}"]`
              );
              if (btn && btn.parentElement) btn.parentElement.removeChild(btn);
            } catch (_) {}
            // Invalidate cached playlist actions so menus refresh
            window._playlistsPromise = null;
            // Refresh the playlists view in main area
            openURL("/html/your_playlists");
          })
          .catch(() => {
            // Still attempt UI refresh
            try {
              const btn = document.querySelector(
                `[data-playlist-id="${CSS.escape(plId)}"]`
              );
              if (btn && btn.parentElement) btn.parentElement.removeChild(btn);
            } catch (_) {}
            window._playlistsPromise = null;
            openURL("/html/your_playlists");
          });
      }
      return;
    }
    if (kind === "track" || kind === "track-artist") {
      const playId = Number(
        document.getElementById("page-data")?.dataset.playId || 0
      );
      const songId = Number(d.id);
      if (action === "tr-play") playfromPlaylist("playlist", playId, songId);
      if (action === "tr-play-artist")
        playfromPlaylist("artist", d.searchedArtist, songId);
      if (action === "tr-remove") add_deleteSong(songId, playId, true);
      if (action === "tr-add") {
        renderTrackAddSubmenu(songId);
        return; // keep menu open while submenu is shown
      }
      if (action === "tr-artist" && d.artist) {
        window.location.href = `/search?query=${d.artist}`;
      }
      if (action === "tr-details") {
        alert(d.name || "Song");
      }
      return;
    }
  }

  function findTarget(el) {
    const pl = el.closest?.(".playlist-card");
    if (pl) {
      return {
        kind: "playlist",
        data: {
          id: pl.getAttribute("data-pl-id"),
          name: pl.getAttribute("data-pl-name"),
        },
        rect: pl.getBoundingClientRect(),
      };
    }
    const tr = el.closest?.(".data-track");
    if (tr) {
      return {
        kind: "track",
        data: {
          id: tr.getAttribute("data-song-id"),
          name: tr.getAttribute("data-name"),
          artist: tr.getAttribute("data-artist"),
        },
        rect: tr.getBoundingClientRect(),
      };
    }
    const tr2 = el.closest?.(".data-track-artist");
    if (tr2) {
      console.log("Found track-artist target");
      return {
        kind: "track-artist",
        data: {
          id: tr2.getAttribute("data-song-id"),
          name: tr2.getAttribute("data-name"),
          artist: tr2.getAttribute("data-artist"),
          searchedArtist: tr2.getAttribute("data-searched-artist"),
        },
        rect: tr2.getBoundingClientRect(),
      };
    }
    return null;
  }

  // Open on right-click only for our targets
  document.addEventListener("contextmenu", (e) => {
    const tgt = findTarget(e.target);
    if (!tgt) return; // allow native for others
    e.preventDefault();
    current = tgt;
    buildMenu(tgt.kind, tgt.data);
    showMenuAt(e.clientX, e.clientY);
  });

  // Open via dedicated trigger button inside target
  document.addEventListener("click", (e) => {
    const btn = e.target.closest?.("[data-menu-trigger]");
    if (!btn) return;
    const tgt = findTarget(btn);
    if (!tgt) return;
    current = tgt;
    buildMenu(tgt.kind, tgt.data);
    const r = btn.getBoundingClientRect();
    showMenuAt(r.left, r.bottom + 6);
  });

  // Handle menu clicks and click-away
  document.addEventListener(
    "click",
    (e) => {
      if (
        menu.style.display === "block" &&
        !e.target.closest?.("#unifiedCtxMenu")
      ) {
        hideMenu();
        return;
      }
      // Handle playlist pick in inline submenu
      const pick = e.target.closest?.("#unifiedCtxMenu [data-pl-pick]");
      if (pick) {
        const playlistId = Number(pick.getAttribute("data-pl-pick"));
        const songId = Number(menu.dataset.songId || current?.data?.id || 0);
        if (playlistId && songId) {
          const playId = Number(
            document.getElementById("page-data")?.dataset.playId || 0
          );
          if (playId == playlistId) {
            reload = true;
          } else {
            reload = false;
          }
          // If we're on a playlist page (playId truthy), reload to reflect changes
          add_deleteSong(songId, playlistId, reload);
        }
        hideMenu();
        return;
      }

      // Back from submenu to the track's main menu
      const backBtn = e.target.closest?.("#unifiedCtxMenu [data-back]");
      if (backBtn && current?.kind === "track") {
        buildMenu("track", current.data);
        return;
      }

      const item = e.target.closest?.("#unifiedCtxMenu [data-action]");
      if (!item) return;
      const action = item.getAttribute("data-action");
      handleAction(action);
      if (!(current?.kind === "track" && action === "tr-add")) hideMenu();
    },
    true
  );

  // Keyboard: Shift+F10 / ContextMenu on focused target, Esc to close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") hideMenu();
    if ((e.shiftKey && e.key === "F10") || e.key === "ContextMenu") {
      const focused = document.activeElement;
      const tgt = findTarget(focused || document.body);
      if (tgt) {
        current = tgt;
        buildMenu(tgt.kind, tgt.data);
        const r = tgt.rect;
        showMenuAt(r.left + r.width - 12, r.top + 24);
        e.preventDefault();
      }
    }
  });

  // Prevent native menu on top of our menu
  menu.addEventListener("contextmenu", (e) => e.preventDefault());
}

// --- Drag & Drop: Song row drag payload helpers ---
function onSongRowDragStart(e) {
  try {
    const row =
      e.currentTarget?.closest?.(".data-track, .data-track-artist") ||
      e.target?.closest?.(".data-track, .data-track-artist");
    if (!row) return;
    const songId = row.getAttribute("data-song-id");
    const name = row.getAttribute("data-name") || "";
    const artist = row.getAttribute("data-artist") || "";
    if (e.dataTransfer) {
      // Basic payload for generic targets
      e.dataTransfer.setData("text/plain", String(songId || ""));
      // Rich payload for our app targets
      e.dataTransfer.setData(
        "application/json",
        JSON.stringify({ type: "song", id: Number(songId), name, artist })
      );
      e.dataTransfer.effectAllowed = "copyMove";
      const dragPreview = document.createElement("div");
      dragPreview.style.position = "absolute";
      dragPreview.style.top = "-1000px";
      dragPreview.style.pointerEvents = "none";
      dragPreview.style.background = "#222";
      dragPreview.style.color = "#fff";
      dragPreview.style.padding = "8px 16px";
      dragPreview.style.borderRadius = "6px";
      dragPreview.style.fontSize = "1rem";
      dragPreview.innerText = name + " – " + artist;
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 10, 10);
      setTimeout(() => document.body.removeChild(dragPreview), 0);
    }
    row.classList.add("dragging");
    row.setAttribute("aria-grabbed", "true");
  } catch (_) {}
}

function onSongRowDragEnd(e) {
  try {
    const row =
      e.currentTarget?.closest?.(".data-track") ||
      e.target.closest?.(".data-track");
    if (!row) return;
    row.classList.remove("dragging");
    row.setAttribute("aria-grabbed", "false");
  } catch (_) {}
}

function initStrippedEnhancements() {
  // Initialize features that require DOM after content swap
  setupUnifiedContextMenu();
  initPlaylistPageEnhancements();
  initPlaylistFilter();
  try {
    initTooltips();
  } catch (_) {}
  try {
    initPlaylistIconPicker();
  } catch (_) {}
  try {
    syncSidebarIconOnInit();
  } catch (_) {}
}

// Ensure the unified menu is available on initial page load as well
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setupUnifiedContextMenu();
      initPlaylistPageEnhancements();
      initPlaylistFilter();
    });
  } else {
    setupUnifiedContextMenu();
    initPlaylistPageEnhancements();
    initPlaylistFilter();
  }
}

// --- Drag & Drop: Sidebar playlist icon drop handlers ---
function onPlaylistDragOver(e) {
  // Allow drop
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = "copy";
  // Show playlist name tooltip above the drag image (mouse pointer)
  const el = e.currentTarget || e.target;
  const playlistName = el?.getAttribute("data-bs-title") || "Playlist";
  // Use mouse position from dragover event
  const mouseX = e.clientX || 0;
  const mouseY = e.clientY || 0;
  const x = mouseX;
  const y = mouseY - 36; // 36px above pointer (drag image)
  let existing = document.getElementById("playlist-drop-tooltip");
  if (existing) {
    existing.style.left = x + "px";
    existing.style.top = y + "px";
    existing.innerText = playlistName;
  } else {
    const tooltipEl = document.createElement("div");
    tooltipEl.id = "playlist-drop-tooltip";
    tooltipEl.className = "playlist-drop-tooltip";
    tooltipEl.innerText = playlistName;
    Object.assign(tooltipEl.style, {
      position: "fixed",
      left: x + "px",
      top: y + "px",
      padding: "6px 10px",
      background: "rgba(0,0,0,0.85)",
      color: "#fff",
      borderRadius: "6px",
      pointerEvents: "none",
      zIndex: 9999,
      fontSize: "15",
      whiteSpace: "nowrap",

      transform: "translateY(-50%)",
    });
    document.body.appendChild(tooltipEl);
  }
}

function onPlaylistDragEnter(e) {
  const el = e.currentTarget || e.target;
  el?.classList?.add("drop-hover");
}

function onPlaylistDragLeave(e) {
  const el = e.currentTarget || e.target;
  el?.classList?.remove("drop-hover");
  const tooltip = document.getElementById("playlist-drop-tooltip");
  if (tooltip) tooltip.remove();
  tooltipClose();
}

function onPlaylistDrop(e) {
  e.preventDefault();
  const el = e.currentTarget || e.target;
  el?.classList?.remove("drop-hover");
  const tooltip = document.getElementById("playlist-drop-tooltip");
  if (tooltip) tooltip.remove();
  try {
    const playlistId = Number(el?.getAttribute("data-playlist-id") || 0);
    if (!playlistId) return;
    let songId = 0;
    const dt = e.dataTransfer;
    if (dt) {
      // Prefer our richer JSON payload
      const json = dt.getData("application/json");
      if (json) {
        try {
          const payload = JSON.parse(json);
          if (payload && payload.type === "song" && payload.id)
            songId = Number(payload.id);
        } catch (_) {}
      }
      if (!songId) {
        const txt = dt.getData("text/plain");
        if (txt) songId = Number(txt);
      }
    }
    if (!songId) return;

    // If user drops onto the playlist they are currently viewing, reload to reflect change
    const currentPlayId = Number(
      document.getElementById("page-data")?.dataset.playId || 0
    );
    const reload = currentPlayId && currentPlayId === playlistId;
    add_deleteSong(songId, playlistId, reload);
  } catch (err) {
    console.error("Drop failed:", err);
  }
}

// --- New Playlist creation (moved from inline template) ---
function initPlaylistPageEnhancements() {
  try {
    const rootEl = document.getElementById("pl-root");
    if (!rootEl) return; // Only on playlist listing page
    const initial = rootEl.dataset ? rootEl.dataset.initialCount : "0";
    window.playlistCount = parseInt(initial || "0", 10) || 0;
  } catch (_) {}
}

// --- Icon Picker (FontAwesome Iconpicker) integration for play.html ---
function loadScriptOnce(src, checkFn) {
  return new Promise((resolve, reject) => {
    try {
      if (checkFn && checkFn()) return resolve();
    } catch (_) {}
    const s = document.createElement("script");
    s.src = src;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}
function loadCssOnce(href) {
  if ([...document.styleSheets].some((ss) => ss.href && ss.href.includes(href)))
    return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = href;
  document.head.appendChild(l);
}
// Ensure Font Awesome CSS is available (FA5, covers 'fas'/'far'/'fab')
function ensureFontAwesomeCss() {
  loadCssOnce(
    "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
  );
}
// Ensure the icon list data is available
function ensureFaIconListLoaded() {
  return loadScriptOnce("/static/fa-icons.js", () =>
    Array.isArray(window.FA_ICON_LIST)
  );
}
// On playlist page load, fetch current icon and sync the sidebar button
function syncSidebarIconOnInit(icon) {}
function initPlaylistIconPicker() {
  const modalEl = document.getElementById("iconPickerModal");
  const inputEl = document.getElementById("playlistIconInput");
  const gridEl = document.getElementById("iconGrid");
  const searchEl = document.getElementById("iconSearch");
  const styleEl = document.getElementById("iconStyleFilter");
  const previewEl = document.getElementById("iconPreview");
  const openBtn = document.getElementById("btnEditIcon");
  const saveBtn = document.getElementById("savePlaylistIcon");
  if (
    !modalEl ||
    !inputEl ||
    !openBtn ||
    !saveBtn ||
    !gridEl ||
    !searchEl ||
    !styleEl ||
    !previewEl
  )
    return; // not on this page

  ensureFontAwesomeCss();

  let ALL_ICONS = [];
  let filtered = [];
  let selected = "";
  let lastRenderedQuery = "";
  let lastRenderedStyle = "all";

  function setSelected(cls) {
    selected = cls || "";
    inputEl.value = selected;
    try {
      previewEl.className = selected || "fas fa-music";
    } catch (_) {}
    // highlight
    const prevSel = gridEl.querySelector(".icon-item.selected");
    if (prevSel) prevSel.classList.remove("selected");
    if (!selected) return;
    const el = gridEl.querySelector(`[data-icon="${CSS.escape(selected)}"]`);
    if (el) el.classList.add("selected");
  }

  function matchesStyle(icon, style) {
    if (style === "all") return true;
    return icon.startsWith(style + " ");
  }

  function matchesQuery(icon, q) {
    if (!q) return true;
    const qlc = q.toLowerCase();
    return icon.toLowerCase().includes(qlc);
  }

  function renderGrid(force = false) {
    const q = searchEl.value.trim();
    const style = styleEl.value;
    if (!force && q === lastRenderedQuery && style === lastRenderedStyle)
      return;
    lastRenderedQuery = q;
    lastRenderedStyle = style;
    filtered = (ALL_ICONS || []).filter(
      (c) => matchesStyle(c, style) && matchesQuery(c, q)
    );
    gridEl.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const cls of filtered) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "icon-item";
      btn.setAttribute("data-icon", cls);
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", selected === cls ? "true" : "false");
      const [stylePart, namePart] = cls.split(/\s+/, 2);
      btn.innerHTML = `<i class="${cls}"></i>`;
      if (selected === cls) btn.classList.add("selected");
      btn.addEventListener("click", () => setSelected(cls));
      frag.appendChild(btn);
    }
    gridEl.appendChild(frag);
  }

  // Open/Close handlers (custom modal)
  function openIconPicker() {
    modalEl.classList.add("is-open");
    modalEl.setAttribute("aria-hidden", "false");
    document.body.dataset.modalOpen = "1";
    document.body.style.overflow = "hidden";
    const playId = Number(
      document.getElementById("page-data")?.dataset.playId || 0
    );
    const fetchCurrent = playId
      ? fetch(`/api/playlist/icon?id=${encodeURIComponent(playId)}`)
          .then((r) => r.json())
          .catch(() => ({}))
      : Promise.resolve({});
    Promise.all([ensureFaIconListLoaded(), fetchCurrent])
      .then(([, j]) => {
        ALL_ICONS = Array.isArray(window.FA_ICON_LIST)
          ? window.FA_ICON_LIST
          : [];
        // Fill input from server if available
        const serverIcon = j && j.success && j.icon ? String(j.icon) : "";
        if (serverIcon) inputEl.value = serverIcon;
        const current = (inputEl.value || "").trim();
        setSelected(current || "");
        renderGrid(true);
        setTimeout(() => {
          try {
            searchEl.focus();
          } catch (_) {}
        }, 50);
      })
      .catch(() => {
        ALL_ICONS = [];
        gridEl.innerHTML =
          '<div style="padding:8px; color:#aaa;">Could not load icon list.</div>';
      });
  }
  function closeIconPicker() {
    modalEl.classList.remove("is-open");
    modalEl.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    delete document.body.dataset.modalOpen;
  }
  window.openIconPicker = openIconPicker;
  window.closeIconPicker = closeIconPicker;

  openBtn.addEventListener("click", openIconPicker);
  modalEl.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeIconPicker();
  });
  searchEl.addEventListener("input", () => renderGrid());
  styleEl.addEventListener("change", () => renderGrid(true));

  // Save selection to backend
  saveBtn.addEventListener("click", async () => {
    try {
      const playId = Number(
        document.getElementById("page-data")?.dataset.playId || 0
      );
      const value = (inputEl.value || "").trim();
      if (!playId || !value) {
        alert("Pick an icon first.");
        return;
      }
      const res = await fetch(
        `/api/playlist/icon?id=${encodeURIComponent(
          playId
        )}&icon=${encodeURIComponent(value)}`,
        { method: "GET" }
      );
      const json = await res.json().catch(() => ({}));
      if (res.ok && json && json.success) {
        playlist_tooltip("Icon updated");
        setTimeout(tooltipClose, 1500);
        // Live update sidebar icon, if present
        try {
          const btn = document.querySelector(
            `[data-playlist-id="${CSS.escape(String(playId))}"] i`
          );
          if (btn) btn.className = value;
        } catch (_) {}
        closeIconPicker();
      } else {
        alert(json?.error || "Could not update icon");
      }
    } catch (err) {
      alert("Could not update icon");
    }
  });
}

async function createNewPlaylist(btn) {
  try {
    if (btn) {
      btn.disabled = true;
      const orig = btn.innerText;
      btn.dataset.origText = orig;
      btn.innerText = "Creating…";
    }

    const nextNum = (window.playlistCount || 0) + 1;
    const name = `Playlist #${nextNum}`;

    const res = await fetch(`/new_playlist?name=${encodeURIComponent(name)}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      credentials: "same-origin",
    });

    if (!res.ok) throw new Error(`Request failed with status ${res.status}`);
    const data = await res.json();
    if (data && data.success && data.id) {
      window.playlistCount = nextNum;
      // Invalidate playlist action cache so menus pick up new list
      window._playlistsPromise = null;
      // Navigate to the newly created playlist

      const _w3_sidebar = document.getElementById("w3-sidebar");
      if (_w3_sidebar) {
        console.log("Adding new playlist to sidebar");
        const html = `
        <button
          data-bs-toggle="tooltip"
          data-bs-placement="right"
          data-bs-title="${name}"
          onclick="openURL('/html/playlist?p=${data.id}')"
          class="w3-bar-item w3-button w3-large"
          style="text-align: center;"
          data-playlist-id="${data.id}"
          ondragover="event.preventDefault(); this.classList.add('drop-hover'); onPlaylistDragOver(event, this)"
          ondragenter="event.preventDefault(); this.classList.add('drop-hover'); onPlaylistDragEnter(event, this)"
          ondragleave="this.classList.remove('drop-hover'); onPlaylistDragLeave(event, this)"
          ondrop="event.preventDefault(); this.classList.remove('drop-hover'); onPlaylistDrop(event, this)"
        >
          <i class="fa-solid fa-music"></i>
        </button>`;
        _w3_sidebar.insertAdjacentHTML("beforeend", html);
        // Initialize tooltip for the newly inserted button
        try {
          const btnEl = _w3_sidebar.querySelector(
            `[data-playlist-id="${CSS.escape(String(data.id))}"]`
          );
          if (btnEl && window.bootstrap?.Tooltip) {
            if (bootstrap.Tooltip.getInstance(btnEl)) {
              bootstrap.Tooltip.getInstance(btnEl).dispose();
            }
            bootstrap.Tooltip.getOrCreateInstance(btnEl);
          }
        } catch (_) {}
      }
      playlist_tooltip("Created: " + name);
    } else {
      throw new Error("Playlist creation failed");
    }
  } catch (err) {
    console.error(err);
    alert("Could not create playlist. Please try again.");
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerText = btn.dataset.origText || "New";
    }
  }
}

// Initialize or refresh Bootstrap tooltips across the document or within a root element
function initTooltips(root) {
  const scope = root instanceof Element ? root : document;
  if (!window.bootstrap || !bootstrap.Tooltip) return;
  const nodes = scope.querySelectorAll('[data-bs-toggle="tooltip"]');
  nodes.forEach((el) => {
    try {
      // Dispose any previous instance to avoid duplicates
      const existing = bootstrap.Tooltip.getInstance(el);
      if (existing) existing.dispose();
      bootstrap.Tooltip.getOrCreateInstance(el);
    } catch (_) {}
  });
}

// Initialize per-playlist page filtering (search input filters rows by title/artist)
function initPlaylistFilter() {
  try {
    const input = document.getElementById("playlist-search");
    if (!input) return; // Not on playlist play view
    const clearBtn = document.getElementById("playlist-search-clear");
    const tbody = document.querySelector("table.tracklist tbody");
    if (!tbody) return;
    const rows = Array.from(tbody.querySelectorAll("tr.data-track"));
    const noResults = document.getElementById("no-results-row");

    const doFilter = () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      rows.forEach((row) => {
        const name = row.getAttribute("data-name") || "";
        const artist = row.getAttribute("data-artist") || "";
        const text = (name + " " + artist).toLowerCase();
        const match = !q || text.includes(q);
        row.style.display = match ? "" : "none";
        if (match) visible++;
      });
      if (noResults) noResults.style.display = visible === 0 ? "" : "none";
    };

    const listener = debounce(doFilter, 80);
    // Avoid duplicate listeners if content is re-initialized
    if (input._plFilterListener) {
      input.removeEventListener("input", input._plFilterListener);
    }
    input._plFilterListener = listener;
    input.addEventListener("input", listener);
    if (clearBtn) {
      clearBtn.onclick = () => {
        input.value = "";
        doFilter();
        input.focus();
      };
    }
    // Initialize state once
    doFilter();
  } catch (_) {}
}

// --- Hover scroll for overflowing text (song title/artist) ---
(function hoverScrollInit() {
  function enableHoverScroll(el, pxPerSec = 30) {
    let rafId = null;
    let lastTs = 0;
    let offset = 0;
    let dir = 1; // 1 -> right, -1 -> left
    let edgePause = 0; // seconds to pause at edge
    const speed = Math.max(10, Number(pxPerSec) || 30); // px per second
    const pauseAtEdgesSec = 0.25; // small pause at ends for readability

    function step(ts) {
      if (!lastTs) lastTs = ts;
      const dt = (ts - lastTs) / 1000;
      lastTs = ts;
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) {
        cancelAnimationFrame(rafId);
        rafId = null;
        return;
      }

      if (edgePause > 0) {
        edgePause -= dt;
        rafId = requestAnimationFrame(step);
        return;
      }

      offset += dir * speed * dt;
      if (offset >= max) {
        offset = max;
        dir = -1; // bounce back
        edgePause = pauseAtEdgesSec;
      } else if (offset <= 0) {
        offset = 0;
        dir = 1; // go forward again
        edgePause = pauseAtEdgesSec;
      }
      el.scrollLeft = offset;
      rafId = requestAnimationFrame(step);
    }

    function onEnter() {
      try {
        cancelAnimationFrame(rafId);
      } catch (_) {}
      lastTs = 0;
      offset = el.scrollLeft || 0;
      dir = 1;
      edgePause = 0;
      if (el.scrollWidth > el.clientWidth) {
        rafId = requestAnimationFrame(step);
      }
    }
    function onLeave() {
      try {
        cancelAnimationFrame(rafId);
      } catch (_) {}
      rafId = null;
      lastTs = 0;
      offset = 0;
      dir = 1;
      edgePause = 0;
      // Smoothly reset back to start
      try {
        el.scrollTo({ left: 0, behavior: "smooth" });
      } catch (_) {
        el.scrollLeft = 0;
      }
    }

    // Ensure required styles
    el.style.whiteSpace = el.style.whiteSpace || "nowrap";
    el.style.overflow = el.style.overflow || "hidden";

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
  }

  function setup() {
    const ids = ["song-name", "song-artist"];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el && !el._hoverScrollInit) {
        el._hoverScrollInit = true;
        enableHoverScroll(el, 50);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", setup);
  } else {
    setup();
  }
})();
