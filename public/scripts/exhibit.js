const DATA_URL = '/data/town_gown_exhibit_records_enriched.json';
const SUMMARY_URL = '/data/town_gown_exhibit_analysis_summary.json';
const IDLE_RESET_MS = 105000;
const IDLE_WARNING_MS = 2400;
const EDITOR_FORM_WORD_RE = /\b(dart|darts|pat|pats)\b/gi;

const topicIcons = {
  housing_landlords_apartments: '/assets/generated/icon-housing.svg',
  streets_traffic_pedestrians: '/assets/generated/icon-crosswalk.svg',
  neighbors_parties_student_behavior: '/assets/generated/icon-porch.svg',
  community_service_mutual_aid: '/assets/generated/icon-service.svg',
  transit_buses_mobility: '/assets/generated/icon-bus.svg',
  parking_towing_cars: '/assets/generated/icon-parking.svg',
  local_business_restaurants: '/assets/generated/icon-storefront.svg',
  police_public_safety_services: '/assets/generated/icon-callbox.svg',
  downtown_arts_events: '/assets/generated/icon-downtown.svg',
  campus_expansion_boundary_construction: '/assets/generated/icon-boundary.svg',
  civic_identity_media_reputation: '/assets/generated/icon-newspaper.svg',
  weather_environment: '/assets/generated/icon-weather.svg',
  other_unspecified: '/assets/generated/icon-town-gown.svg',
};

const topicObjects = {
  housing_landlords_apartments: { station: 'Mailbox wall', object: 'mailbox wall', note: 'rent notes, hallway repairs, and leases with a pulse' },
  streets_traffic_pedestrians: { station: 'Crosswalk', object: 'crosswalk', note: 'painted stripes, near misses, brake lights, and side-eye' },
  neighbors_parties_student_behavior: { station: 'Porch light', object: 'porch light', note: 'noise, trash, parties, neighbors, and the morning after' },
  community_service_mutual_aid: { station: 'Volunteer table', object: 'volunteer table', note: 'sign-up sheets, food drives, kids, care, and civic gratitude' },
  transit_buses_mobility: { station: 'Bus stop', object: 'bus stop', note: 'routes, drivers, schedules, shelter, and shared dependence' },
  parking_towing_cars: { station: 'Parking tag', object: 'parking tag', note: 'permits, tows, dents, alarms, lots, and cold asphalt' },
  local_business_restaurants: { station: 'Storefront', object: 'storefront', note: 'registers, late-night food, bars, malls, and local patience' },
  police_public_safety_services: { station: 'Police call box', object: 'police call box', note: 'sirens, services, public safety, and institutional trust' },
  downtown_arts_events: { station: 'Show flyer', object: 'show flyer', note: 'downtown stages, galleries, music, festivals, and borrowed streets' },
  campus_expansion_boundary_construction: { station: 'Boundary fence', object: 'boundary fence', note: 'construction dust, campus edges, and moving lines' },
  civic_identity_media_reputation: { station: 'Newsstand', object: 'newsstand', note: 'reputation, student media, local identity, and who gets to define whom' },
  weather_environment: { station: 'Weather window', object: 'weather window', note: 'snow, storms, heat, mud, and the outdoors having opinions' },
  other_unspecified: { station: 'Odd drawer', object: 'odd drawer', note: 'miscellaneous civic shrapnel, still worth opening' },
};

const wordBreezeStopwords = new Set([
  'about', 'after', 'again', 'against', 'all', 'also', 'and', 'any', 'are', 'because', 'been', 'being', 'between',
  'but', 'can', 'could', 'did', 'does', 'for', 'from', 'get', 'had', 'has', 'have', 'her', 'here', 'him', 'his',
  'how', 'into', 'its', 'jmu', 'just', 'like', 'more', 'not', 'now', 'our', 'out', 'over', 'people', 'really',
  'should', 'some', 'students', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these', 'they', 'this',
  'through', 'town', 'university', 'was', 'were', 'what', 'when', 'where', 'which', 'who', 'why', 'with', 'would',
  'your', 'you', 'pat', 'pats', 'dart', 'darts', 'breeze',
]);

const state = {
  records: [],
  summary: null,
  filtered: [],
  year: 'all',
  classYear: 'all',
  era: 'all',
  topic: 'all',
  kind: 'all',
  search: '',
  gameRecord: null,
  gameChallengeText: '',
  gameKindGuess: '',
  gameTopicGuess: '',
  activeRecordId: null,
  editorEligibleRecords: [],
  editorWithheldRecords: [],
  stringGraph: null,
  selectedStringTheme: '',
  wordBreezeTerm: '',
};

const els = {
  year: document.querySelector('#year-filter'),
  era: document.querySelector('#era-filter'),
  topic: document.querySelector('#topic-filter'),
  kind: document.querySelector('#kind-filter'),
  search: document.querySelector('#search-filter'),
  reset: document.querySelector('#reset-filters'),
  dartRack: document.querySelector('#dart-rack'),
  patRack: document.querySelector('#pat-rack'),
  timeline: document.querySelector('#floor-timeline'),
  topicDoors: document.querySelector('#topic-doors'),
  currentTitle: document.querySelector('#current-view-title'),
  currentSummary: document.querySelector('#current-view-summary'),
  viewMeters: document.querySelector('#view-meters'),
  featuredCards: document.querySelector('#featured-cards'),
  classWindowChip: document.querySelector('#class-window-chip'),
  wordBreeze: document.querySelector('#word-breeze'),
  wordBreezeCloud: document.querySelector('#word-breeze-cloud'),
  wordBreezeList: document.querySelector('#word-breeze-list'),
  drawer: document.querySelector('#record-drawer'),
  drawerContent: document.querySelector('#drawer-content'),
  shelf: document.querySelector('#reading-shelf'),
  networkBoard: document.querySelector('#network-board'),
  networkEdges: document.querySelector('#network-edges'),
  networkNodes: document.querySelector('#network-nodes'),
  stringSummary: document.querySelector('#string-summary'),
  stringYears: document.querySelector('#string-years'),
  returnCorridor: document.querySelector('#return-corridor'),
  useStringTheme: document.querySelector('#use-string-theme'),
  clearStringTheme: document.querySelector('#clear-string-theme'),
  sendCorridor: document.querySelector('#send-corridor'),
  gameText: document.querySelector('#game-text'),
  gamePoolNote: document.querySelector('#game-pool-note'),
  gameResult: document.querySelector('#game-result'),
  gameRelated: document.querySelector('#game-related'),
  gameTopicGuess: document.querySelector('#game-topic-guess'),
  revealGameCard: document.querySelector('#reveal-game-card'),
  newGameCard: document.querySelector('#new-game-card'),
  threshold: document.querySelector('.threshold'),
  kioskEnter: document.querySelector('#kiosk-enter'),
  startOver: document.querySelector('#start-over'),
  presentationMode: document.querySelector('#presentation-mode'),
  corridorPan: document.querySelector('#corridor-pan'),
  walkButtons: document.querySelectorAll('[data-walk]'),
  idleOverlay: document.querySelector('#idle-overlay'),
  railButtons: document.querySelectorAll('[data-rail-target]'),
  chapterSections: document.querySelectorAll('[data-chapter]'),
  classTrayToggle: document.querySelector('#class-tray-toggle'),
  classTray: document.querySelector('#class-tray'),
  classYear: document.querySelector('#class-year'),
  classYearOutput: document.querySelector('#class-year-output'),
  classYearGo: document.querySelector('#class-year-go'),
  classYearBack: document.querySelector('#class-year-back'),
  classYearForward: document.querySelector('#class-year-forward'),
  classYearClear: document.querySelector('#class-year-clear'),
};

let idleTimer = null;
let idleResetTimer = null;
let panDrag = null;
let railObserver = null;

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(dateString) {
  if (!dateString) return 'Undated';
  const date = new Date(`${dateString}T00:00:00`);
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

function pluralize(count, singular, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function shorten(text = '', length = 170) {
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > length ? `${clean.slice(0, length - 1)}...` : clean;
}

function normalize(value = '') {
  return String(value).toLowerCase().normalize('NFKD');
}

function dateSort(a, b) {
  return String(a.date).localeCompare(String(b.date)) || a.id - b.id;
}

function recordSearchBlob(record) {
  return normalize([
    record.text_full,
    record.snippet,
    record.primary_topic_label,
    ...(record.topic_tag_labels || []),
    ...(record.entities || []),
    record.target_short,
    record.target_long,
    record.sender_short,
    record.sender_long,
    record.source?.newspaper,
    record.source?.pl2_pdf,
  ].filter(Boolean).join(' '));
}

function classWindowYears(classYear = state.classYear) {
  if (classYear === 'all') return [];
  const end = Math.min(2026, Math.max(1991, Number(classYear) || 1991));
  const start = Math.max(1991, end - 3);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}

function classWindowLabel(classYear = state.classYear) {
  const years = classWindowYears(classYear);
  if (!years.length) return '';
  const end = years[years.length - 1];
  const range = years.length === 1 ? `${years[0]}` : `${years[0]}–${end}`;
  return `Class of ${end}: ${range}`;
}

function editorChallenge(record) {
  const original = String(record.text_full || '').replace(/\s+/g, ' ').trim();
  let maskCount = 0;
  const masked = original
    .replace(EDITOR_FORM_WORD_RE, () => {
      maskCount += 1;
      return '[form hidden]';
    })
    .replace(/^\s*(?:a|an|the)\s+\[form hidden\]\s+(to|for)\s+/i, (_, prep) => `${prep.charAt(0).toUpperCase()}${prep.slice(1)} `)
    .replace(/^\s*\[form hidden\]\s+(to|for)\s+/i, (_, prep) => `${prep.charAt(0).toUpperCase()}${prep.slice(1)} `)
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = (masked.match(/[a-zA-Z]{3,}/g) || []).length;
  const hiddenShare = masked.length ? (maskCount * '[form hidden]'.length) / masked.length : 1;
  return {
    text: masked,
    maskCount,
    playable: masked.length >= 60 && wordCount >= 10 && maskCount <= 4 && hiddenShare <= 0.28,
  };
}

function isEditorEligible(record) {
  return editorChallenge(record).playable;
}

function getEditorPool() {
  const visibleEligible = state.filtered.filter(isEditorEligible);
  return visibleEligible.length ? visibleEligible : state.editorEligibleRecords;
}

function getTopicLabel(topicValue) {
  if (topicValue === 'all') return 'All topics';
  return state.summary?.topics?.find((topic) => topic.topic === topicValue)?.label || topicValue;
}

function getKindLabel(kind) {
  if (kind === 'DART') return 'Darts only';
  if (kind === 'PAT') return 'Pats only';
  return 'Darts and Pats';
}

function getKindNoun(kind) {
  return kind === 'PAT' ? 'Pat' : 'Dart';
}

function topicMatches(record, topicValue) {
  if (topicValue === 'all') return true;
  return record.primary_topic === topicValue || (record.topic_tags || []).includes(topicValue);
}

function filterRecords() {
  const query = normalize(state.search).trim();
  const activeClassYears = classWindowYears();
  state.filtered = state.records.filter((record) => {
    const yearOk = activeClassYears.length
      ? activeClassYears.includes(Number(record.year))
      : state.year === 'all' || String(record.year) === state.year;
    const eraOk = state.era === 'all' || record.era === state.era;
    const topicOk = topicMatches(record, state.topic);
    const kindOk = state.kind === 'all' || record.kind === state.kind;
    const searchOk = !query || record._search.includes(query);
    return yearOk && eraOk && topicOk && kindOk && searchOk;
  }).sort(dateSort);
}

function updateControlsFromState() {
  els.year.value = state.year;
  els.era.value = state.era;
  els.topic.value = state.topic;
  els.kind.value = state.kind;
  els.search.value = state.search;
  if (state.classYear !== 'all') syncClassYear(state.classYear);
  updateClassWindowChip();
}

function applyState(patch = {}) {
  const nextPatch = { ...patch };
  if (Object.hasOwn(nextPatch, 'classYear') && nextPatch.classYear !== 'all') {
    nextPatch.year = 'all';
  }
  if (Object.hasOwn(nextPatch, 'year') && nextPatch.year !== 'all') {
    nextPatch.classYear = 'all';
  }
  Object.assign(state, nextPatch);
  updateControlsFromState();
  filterRecords();
  renderAll();
}

function populateControls() {
  const years = [...new Set(state.records.map((record) => record.year).filter(Boolean))].sort((a, b) => a - b);
  els.year.innerHTML = '<option value="all">All years</option>' + years.map((year) => `<option value="${year}">${year}</option>`).join('');

  const eras = state.summary.eras || [];
  els.era.innerHTML = '<option value="all">All eras</option>' + eras.map((era) => `<option value="${escapeHtml(era.era)}">${escapeHtml(era.era)} · ${era.count}</option>`).join('');

  const topics = state.summary.topics || [];
  const topicOptions = topics.map((topic) => `<option value="${escapeHtml(topic.topic)}">${escapeHtml(topic.label)} · ${topic.darts} D / ${topic.pats} P</option>`).join('');
  els.topic.innerHTML = '<option value="all">All topics</option>' + topicOptions;
  els.gameTopicGuess.innerHTML = '<option value="">Choose a topic</option>' + topicOptions.replaceAll(' · ', ' - ');
}

function renderStats() {
  const total = state.filtered.length;
  const darts = state.filtered.filter((record) => record.kind === 'DART').length;
  const pats = state.filtered.filter((record) => record.kind === 'PAT').length;
  const patShare = total ? Math.round((pats / total) * 100) : 0;
  const dartShare = total ? Math.round((darts / total) * 100) : 0;
  const mood = total === 0 ? 'quiet' : Math.abs(darts - pats) <= Math.max(2, total * 0.12) ? 'mixed' : darts > pats ? 'dart-heavy' : 'pat-heavy';

  const titleParts = [];
  if (state.classYear !== 'all') titleParts.push(classWindowLabel());
  if (state.year !== 'all') titleParts.push(state.year);
  if (state.era !== 'all') titleParts.push(state.era);
  if (state.topic !== 'all') titleParts.push(getTopicLabel(state.topic));
  if (state.kind !== 'all') titleParts.push(getKindLabel(state.kind));

  els.currentTitle.textContent = titleParts.length ? titleParts.join(' / ') : 'All town-gown Darts & Pats';
  els.currentSummary.textContent = `The hallway is ${mood}${state.search ? ` around “${state.search}”` : ''}: ${darts} sharp notes, ${pats} warm notes, ${total} openable cards.`;
  els.viewMeters.innerHTML = `
    <div class="view-meter"><b>${total}</b><span>cards</span></div>
    <div class="view-meter view-meter--dart"><b>${dartShare}%</b><span>Darts</span></div>
    <div class="view-meter view-meter--pat"><b>${patShare}%</b><span>Pats</span></div>
  `;
}

function makeRecordCard(record, options = {}) {
  const { compact = false, depth = 0 } = options;
  const kindClass = record.kind === 'PAT' ? 'record-card--pat' : 'record-card--dart';
  const emoji = record.kind === 'PAT' ? '🤲' : '🎯';
  const tilt = ((record.id * 17) % 9) - 4;
  const depthStep = depth % 7;
  const topic = escapeHtml(record.primary_topic_label || 'Town-gown moment');
  return `
    <button class="record-card ${kindClass} ${compact ? 'record-card--compact' : ''}" style="--tilt: ${tilt / 2}deg; --depth-step: ${depthStep}" data-record-id="${record.id}" type="button" aria-label="Open ${escapeHtml(getKindNoun(record.kind))} from ${escapeHtml(formatDate(record.date))}: ${topic}">
      <span class="record-card__meta">
        <span class="record-card__kind">${emoji} ${escapeHtml(record.kind)}</span>
        <time datetime="${escapeHtml(record.date || '')}">${escapeHtml(formatDate(record.date))}</time>
      </span>
      <span class="record-card__topic">${topic}</span>
      <span class="record-card__text">${escapeHtml(shorten(record.text_full, compact ? 150 : 230))}</span>
    </button>
  `;
}

function renderWalls() {
  const darts = state.filtered.filter((record) => record.kind === 'DART');
  const pats = state.filtered.filter((record) => record.kind === 'PAT');
  const wallSort = (a, b) => (b.tone_intensity || 0) - (a.tone_intensity || 0) || dateSort(a, b);

  els.dartRack.innerHTML = darts.length ? [...darts].sort(wallSort).slice(0, 4).map((record, index) => makeRecordCard(record, { depth: index })).join('') : '<p class="empty-note">No Darts in this view.</p>';
  els.patRack.innerHTML = pats.length ? [...pats].sort(wallSort).slice(0, 4).map((record, index) => makeRecordCard(record, { depth: index })).join('') : '<p class="empty-note">No Pats in this view.</p>';
}

function renderFeaturedCards() {
  if (!els.featuredCards) return;
  const featured = [...state.filtered]
    .sort((a, b) => (b.tone_intensity || 0) - (a.tone_intensity || 0) || dateSort(a, b))
    .slice(0, 4);

  els.featuredCards.innerHTML = featured.length ? featured.map((record, index) => makeRecordCard(record, { compact: true, depth: index })).join('') : '<p class="empty-note">No featured cards in this view.</p>';
}

function yearMoodClass(year) {
  if (year.dart_share >= 0.62) return 'year-tile--dart';
  if (year.pat_share >= 0.62) return 'year-tile--pat';
  return 'year-tile--mixed';
}

function renderTimeline() {
  const maxCount = Math.max(...state.summary.yearly.map((year) => year.count));
  els.timeline.innerHTML = state.summary.yearly.map((year, index) => {
    const isActive = state.year === String(year.year);
    const scale = 0.76 + (year.count / maxCount) * 1.05;
    const patPct = Math.round((year.pat_share || 0) * 100);
    const dartPct = Math.round((year.dart_share || 0) * 100);
    const dartPower = (0.32 + (year.dart_share || 0) * 0.58).toFixed(2);
    const patPower = (0.34 + (year.pat_share || 0) * 0.56).toFixed(2);
    return `
      <button class="year-tile ${yearMoodClass(year)} ${isActive ? 'is-active' : ''}" data-year="${year.year}" style="--pat-pct:${patPct}%;--dart-pct:${dartPct}%;--dart-power:${dartPower};--pat-power:${patPower};--count-scale:${scale};--floor-step:${index}" type="button" title="${year.year}: ${year.count} records; ${year.darts} Darts, ${year.pats} Pats. Dominant topic: ${escapeHtml(year.dominant_topic || 'mixed')}">
        <small>${year.year}</small>
        <span>${year.darts}D / ${year.pats}P</span>
      </button>
    `;
  }).join('');
}

function renderTopicDoors() {
  const topics = state.summary.topics || [];
  const visibleTopics = topics.slice(0, 7);
  const activeTopic = topics.find((topic) => topic.topic === state.topic);
  if (activeTopic && !visibleTopics.some((topic) => topic.topic === activeTopic.topic)) visibleTopics.push(activeTopic);

  els.topicDoors.innerHTML = visibleTopics.map((topic, index) => {
    const active = state.topic === topic.topic;
    const icon = topicIcons[topic.topic] || topicIcons.other_unspecified;
    const prop = topicObjects[topic.topic] || topicObjects.other_unspecified;
    const patShare = Math.round((topic.pat_share || 0) * 100);
    const objectClass = `topic-door--${escapeHtml(prop.object.replaceAll(' ', '-'))}`;
    return `
      <button class="topic-door ${objectClass} ${active ? 'is-active' : ''}" style="--icon-url:url('${icon}');--pat-share:${patShare}%;--door-step:${index}" data-topic="${escapeHtml(topic.topic)}" type="button" aria-label="Filter by ${escapeHtml(topic.label)}. ${topic.darts} Darts and ${topic.pats} Pats.">
        <span class="topic-door__object">${escapeHtml(prop.station)}</span>
        <strong>${escapeHtml(topic.label)}</strong>
        <span class="topic-door__counts">${topic.count} records · ${topic.darts} D / ${topic.pats} P</span>
        <span class="topic-door__note">${escapeHtml(prop.note)}</span>
        <span class="topic-door__ratio" aria-hidden="true"><i></i></span>
      </button>
    `;
  }).join('');
}

function renderShelf() {
  const mixed = [...state.filtered].sort((a, b) => {
    const intensity = (b.tone_intensity || 0) - (a.tone_intensity || 0);
    return intensity || dateSort(a, b);
  }).slice(0, 12);
  els.shelf.innerHTML = mixed.length ? mixed.map((record, index) => makeRecordCard(record, { compact: true, depth: index })).join('') : '<p class="empty-note">No readable cards in this filter yet.</p>';
}

function tokenizeBreezeText(record) {
  const text = [
    record.text_full,
    record.primary_topic_label,
    ...(record.topic_tag_labels || []),
    ...(record.entities || []),
  ].filter(Boolean).join(' ');
  return normalize(text)
    .replaceAll('&', ' ')
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .map((word) => word.replace(/^-+|-+$/g, ''))
    .filter((word) => word.length >= 4 && !wordBreezeStopwords.has(word) && !/^\d+$/.test(word));
}

function breezeWordLabel(word) {
  return word
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('-');
}

function wordBreezeItems() {
  const counts = new Map();
  state.filtered.forEach((record) => {
    const uniqueWords = new Set(tokenizeBreezeText(record));
    uniqueWords.forEach((word) => counts.set(word, (counts.get(word) || 0) + 1));
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 10)
    .map(([word, count], index) => ({ word, count, label: breezeWordLabel(word), level: (index % 5) + 1 }));
}

function renderWordBreeze() {
  if (!els.wordBreezeCloud) return;
  const items = wordBreezeItems();
  els.wordBreezeCloud.innerHTML = items.length ? items.map((item) => `
    <button class="word-breeze__word word-breeze__word--${item.level}" data-breeze-term="${escapeHtml(item.word)}" type="button" aria-label="Show cards mentioning ${escapeHtml(item.label)}">
      ${escapeHtml(item.label)}
    </button>
  `).join('') : '<span class="word-breeze__empty">The air is briefly still.</span>';
}

function renderWordBreezeList(term) {
  if (!els.wordBreezeList) return;
  const matches = state.filtered
    .filter((record) => tokenizeBreezeText(record).includes(term))
    .slice(0, 8);

  if (!matches.length) {
    els.wordBreezeList.hidden = true;
    els.wordBreezeList.innerHTML = '';
    return;
  }

  els.wordBreezeList.hidden = false;
  els.wordBreezeList.innerHTML = `
    <div class="word-breeze__drawer">
      <div>
        <strong>${escapeHtml(breezeWordLabel(term))}</strong>
        <span>${matches.length} nearby ${pluralize(matches.length, 'card')}</span>
      </div>
      <button class="word-breeze__close" type="button" data-breeze-close aria-label="Close Word Breeze list">Close</button>
      <div class="word-breeze__matches">
        ${matches.map((record) => makeRelatedChip(record)).join('')}
      </div>
    </div>
  `;
}

function renderGamePoolNote() {
  if (!els.gamePoolNote) return;
  els.gamePoolNote.textContent = 'Some cards are held out or masked because they give away their own form.';
}

function renderAll() {
  renderStats();
  renderWalls();
  renderTimeline();
  renderTopicDoors();
  renderFeaturedCards();
  renderShelf();
  renderWordBreeze();
  if (state.wordBreezeTerm) renderWordBreezeList(state.wordBreezeTerm);
  renderGamePoolNote();
}

function sourceLine(record) {
  const source = record.source || {};
  const pieces = [
    source.newspaper || 'The Breeze',
    source.pl2_pdf ? `PDF ${source.pl2_pdf}` : null,
    source.page_in_breeze ? `Breeze p. ${source.page_in_breeze}` : null,
    source.page_in_pdf ? `PDF p. ${source.page_in_pdf}` : null,
  ].filter(Boolean);
  return pieces.join(' · ');
}

function findRecord(id) {
  return state.records.find((record) => String(record.id) === String(id));
}

function getVisibleRecords() {
  return state.filtered.length ? state.filtered : state.records;
}

function getDrawerNavigation(record) {
  const visible = getVisibleRecords();
  const index = visible.findIndex((item) => item.id === record.id);
  if (index === -1) {
    return { visible, index: 0, previous: null, next: null };
  }
  return {
    visible,
    index,
    previous: visible[(index - 1 + visible.length) % visible.length],
    next: visible[(index + 1) % visible.length],
  };
}

function uniqueRecords(records) {
  const seen = new Set();
  return records.filter((record) => {
    if (seen.has(record.id)) return false;
    seen.add(record.id);
    return true;
  });
}

function relatedRecords(record) {
  const entitySet = new Set(record.entities || []);
  const sameTopic = state.records
    .filter((candidate) => candidate.id !== record.id && candidate.primary_topic === record.primary_topic)
    .sort((a, b) => Math.abs((a.year || 0) - (record.year || 0)) - Math.abs((b.year || 0) - (record.year || 0)) || dateSort(a, b));

  const sameYear = state.records
    .filter((candidate) => candidate.id !== record.id && candidate.year === record.year)
    .sort((a, b) => (a.kind === record.kind ? 1 : 0) - (b.kind === record.kind ? 1 : 0) || dateSort(a, b));

  const sameEntity = state.records
    .filter((candidate) => candidate.id !== record.id && (candidate.entities || []).some((entity) => entitySet.has(entity)))
    .sort(dateSort);

  return {
    topic: uniqueRecords(sameTopic).slice(0, 4),
    year: uniqueRecords(sameYear).slice(0, 4),
    entity: uniqueRecords(sameEntity).slice(0, 4),
  };
}

function renderRelatedGroup(title, records) {
  if (!records.length) return '';
  return `
    <section class="related-group" aria-label="${escapeHtml(title)}">
      <h3>${escapeHtml(title)}</h3>
      <div class="related-chips">${records.map((item) => makeRelatedChip(item)).join('')}</div>
    </section>
  `;
}

function makeRelatedChip(record) {
  const kindClass = record.kind === 'PAT' ? 'related-chip--pat' : 'related-chip--dart';
  const kind = getKindNoun(record.kind);
  return `
    <button class="related-chip ${kindClass}" data-record-id="${record.id}" type="button" aria-label="Open related ${escapeHtml(kind)} from ${escapeHtml(formatDate(record.date))}">
      <span>${escapeHtml(kind)} · ${escapeHtml(formatDate(record.date))}</span>
      <strong>${escapeHtml(record.primary_topic_label || 'Town-gown note')}</strong>
      <small>${escapeHtml(shorten(record.text_full, 96))}</small>
    </button>
  `;
}

function renderDrawer(record) {
  const kindIsPat = record.kind === 'PAT';
  const navigation = getDrawerNavigation(record);
  const related = relatedRecords(record);
  const positionText = navigation.visible.length ? `${navigation.index + 1} of ${navigation.visible.length} in this view` : 'Not in current view';
  state.activeRecordId = record.id;

  els.drawerContent.innerHTML = `
    <article class="drawer-card ${kindIsPat ? 'drawer-card--pat' : 'drawer-card--dart'}">
      <header class="drawer-card__header">
        <span class="drawer-card__badge ${kindIsPat ? 'drawer-card__badge--pat' : ''}">${kindIsPat ? '🤲 PAT' : '🎯 DART'} · ${escapeHtml(formatDate(record.date))}</span>
        <div class="drawer-nav" aria-label="Move through open cards">
          <button class="button button--drawer button--ghost" data-drawer-prev="${navigation.previous?.id || ''}" type="button" ${navigation.previous ? '' : 'disabled'}>Previous</button>
          <span>${escapeHtml(positionText)}</span>
          <button class="button button--drawer button--ghost" data-drawer-next="${navigation.next?.id || ''}" type="button" ${navigation.next ? '' : 'disabled'}>Next</button>
        </div>
      </header>
      <h2 id="drawer-title">${escapeHtml(record.primary_topic_label || 'Town-gown note')}</h2>
      <blockquote>${escapeHtml(record.text_full)}</blockquote>
      <dl class="drawer-meta">
        <div><dt>Date</dt><dd>${escapeHtml(formatDate(record.date))}</dd></div>
        <div><dt>Type</dt><dd>${escapeHtml(getKindNoun(record.kind))}</dd></div>
        <div><dt>Era</dt><dd>${escapeHtml(record.era || 'Unknown')}</dd></div>
        <div><dt>Primary topic</dt><dd>${escapeHtml(record.primary_topic_label || 'Unknown')}</dd></div>
        <div><dt>Topic tags</dt><dd>${escapeHtml((record.topic_tag_labels || []).join(', ') || 'None tagged')}</dd></div>
        <div><dt>Entities</dt><dd>${escapeHtml((record.entities || []).join(', ') || 'None tagged')}</dd></div>
        <div><dt>Target</dt><dd>${escapeHtml(record.target_short || record.target_long || 'Not parsed')}</dd></div>
        <div><dt>Sender</dt><dd>${escapeHtml(record.sender_short || record.sender_long || 'Not parsed')}</dd></div>
        <div><dt>Source</dt><dd>${escapeHtml(sourceLine(record))}</dd></div>
        <div><dt>Record ID</dt><dd>${escapeHtml(record.id)}</dd></div>
      </dl>
      <div class="pills" aria-label="Topic tags">
        ${(record.topic_tag_labels || []).map((label) => `<span class="pill">${escapeHtml(label)}</span>`).join('')}
      </div>
      <div class="related-drawer">
        ${renderRelatedGroup('Related by topic', related.topic)}
        ${renderRelatedGroup(`Related from ${record.year}`, related.year)}
        ${renderRelatedGroup('Related by entity', related.entity)}
      </div>
    </article>
  `;

  if (typeof els.drawer.showModal === 'function' && !els.drawer.open) {
    els.drawer.showModal();
  } else {
    els.drawer.setAttribute('open', 'open');
  }
}

function makeGameCard() {
  const pool = getEditorPool();
  if (!pool.length) {
    state.gameRecord = null;
    state.gameChallengeText = '';
    els.gameText.textContent = 'No playable card is available in this view.';
    els.gameResult.textContent = 'Try clearing a filter or opening the full drawer.';
    els.gameRelated.innerHTML = '';
    updateGameRevealState();
    return;
  }

  state.gameRecord = pool[Math.floor(Math.random() * pool.length)];
  const challenge = editorChallenge(state.gameRecord);
  state.gameChallengeText = challenge.text;
  state.gameKindGuess = '';
  state.gameTopicGuess = '';
  els.gameText.textContent = state.gameChallengeText || 'No card available.';
  renderGamePoolNote();
  els.gameResult.textContent = 'Choose a form and a topic. No points. Just interpretation with ink on its fingers.';
  els.gameRelated.innerHTML = '';
  els.gameTopicGuess.value = '';
  document.querySelectorAll('[data-guess]').forEach((button) => {
    button.setAttribute('aria-pressed', 'false');
    button.classList.add('button--ghost');
  });
  updateGameRevealState();
}

function updateGameRevealState() {
  els.revealGameCard.disabled = !(state.gameKindGuess && state.gameTopicGuess && state.gameRecord);
}

function revealGameGuess() {
  const record = state.gameRecord;
  if (!record) return;
  const sameKind = state.gameKindGuess === record.kind;
  const sameTopic = topicMatches(record, state.gameTopicGuess);
  const kindVerdict = sameKind ? 'You matched the published form' : 'Your form reading differs from the published card';
  const topicVerdict = sameTopic ? 'and your topic guess belongs in the same hallway station' : 'and your topic guess opens a neighboring civic door';
  const related = relatedRecords(record);

  els.gameText.textContent = record.text_full || state.gameChallengeText;
  els.gameResult.innerHTML = `
    ${escapeHtml(kindVerdict)}, ${escapeHtml(topicVerdict)}. It appeared as a <strong>${escapeHtml(record.kind)}</strong> on ${escapeHtml(formatDate(record.date))}, tagged as <strong>${escapeHtml(record.primary_topic_label)}</strong>.
    <button class="button button--small button--ghost" data-record-id="${record.id}" type="button">Open this card</button>
  `;
  els.gameRelated.innerHTML = `
    <div class="game-related__grid">
      ${renderRelatedGroup('After the reveal: same topic', related.topic.slice(0, 3))}
      ${renderRelatedGroup('After the reveal: same year', related.year.slice(0, 3))}
    </div>
  `;
}

function hashLabel(label) {
  let hash = 0;
  for (const char of label) hash = ((hash << 5) - hash) + char.charCodeAt(0);
  return Math.abs(hash);
}

function recordThemeIds(record) {
  return [...new Set([
    record.primary_topic,
    ...(record.topic_tags || []),
  ].filter(Boolean))];
}

function addRelatedWeight(related, a, b, amount) {
  if (!a || !b || a === b) return;
  if (!related.has(a)) related.set(a, new Map());
  if (!related.has(b)) related.set(b, new Map());
  related.get(a).set(b, (related.get(a).get(b) || 0) + amount);
  related.get(b).set(a, (related.get(b).get(a) || 0) + amount);
}

function buildStringGraph() {
  const themes = new Map((state.summary.topics || []).map((topic) => [topic.topic, {
    id: topic.topic,
    label: topic.label,
    count: topic.count,
    darts: topic.darts,
    pats: topic.pats,
  }]));
  const recordsByTheme = new Map();
  const related = new Map();
  const entityThemes = new Map();

  state.records.forEach((record) => {
    const themesForRecord = recordThemeIds(record).filter((themeId) => themes.has(themeId));
    themesForRecord.forEach((themeId) => {
      if (!recordsByTheme.has(themeId)) recordsByTheme.set(themeId, []);
      recordsByTheme.get(themeId).push(record);
    });

    for (let index = 0; index < themesForRecord.length; index += 1) {
      for (let next = index + 1; next < themesForRecord.length; next += 1) {
        addRelatedWeight(related, themesForRecord[index], themesForRecord[next], 2);
      }
    }

    (record.entities || []).forEach((entity) => {
      if (!entityThemes.has(entity)) entityThemes.set(entity, new Set());
      themesForRecord.forEach((themeId) => entityThemes.get(entity).add(themeId));
    });
  });

  entityThemes.forEach((themeSet) => {
    const themeIds = [...themeSet];
    for (let index = 0; index < themeIds.length; index += 1) {
      for (let next = index + 1; next < themeIds.length; next += 1) {
        addRelatedWeight(related, themeIds[index], themeIds[next], 0.35);
      }
    }
  });

  const topThemes = [...themes.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, 12);
  return { themes, recordsByTheme, related, topThemes };
}

function stringRecordsForTheme(themeId) {
  return [...(state.stringGraph?.recordsByTheme.get(themeId) || [])].sort((a, b) => (b.tone_intensity || 0) - (a.tone_intensity || 0) || dateSort(a, b));
}

function relatedThemesFor(themeId) {
  const related = state.stringGraph?.related.get(themeId) || new Map();
  return [...related.entries()]
    .map(([id, weight]) => ({ ...state.stringGraph.themes.get(id), weight }))
    .filter((theme) => theme.id)
    .sort((a, b) => b.weight - a.weight || b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 10);
}

function sideArcPosition(index, total, side) {
  const ratio = total <= 1 ? 0.5 : index / (total - 1);
  const wave = Math.sin(ratio * Math.PI);
  return {
    x: side === 'left' ? 12 + wave * 2 : 88 - wave * 2,
    y: 40 + ratio * 31,
  };
}

function relatedPosition(index) {
  const slots = [
    { x: 20, y: 12 },
    { x: 38, y: 9 },
    { x: 62, y: 9 },
    { x: 80, y: 12 },
    { x: 28, y: 26 },
    { x: 45, y: 22 },
    { x: 55, y: 22 },
    { x: 72, y: 26 },
  ];
  return slots[index % slots.length];
}

function stringRecordNode(record, index, total, side) {
  const position = sideArcPosition(index, total, side);
  const kindClass = record.kind === 'PAT' ? 'string-node--pat' : 'string-node--dart';
  const kind = getKindNoun(record.kind);
  return {
    x: position.x,
    y: position.y,
    edge: side === 'left' ? 'dart' : 'pat',
    html: `
      <button class="string-node string-node--record ${kindClass}" style="left:${position.x}%;top:${position.y}%;--tilt:${((record.id * 13) % 9) - 4}deg" data-string-record-id="${record.id}" type="button" aria-label="Open ${escapeHtml(kind)} from ${escapeHtml(formatDate(record.date))}">
        <span>${escapeHtml(kind)} · ${escapeHtml(formatDate(record.date))}</span>
        <strong>${escapeHtml(shorten(record.text_full, 72))}</strong>
      </button>
    `,
  };
}

function stringThemeNode(theme, index) {
  const position = relatedPosition(index);
  return {
    x: position.x,
    y: position.y,
    edge: 'theme',
    html: `
      <button class="string-node string-node--theme" style="left:${position.x}%;top:${position.y}%;--tilt:${(hashLabel(theme.id) % 9) - 4}deg" data-string-theme="${escapeHtml(theme.id)}" type="button" aria-label="Center ${escapeHtml(theme.label)} in Follow the Strings">
        <strong>${escapeHtml(theme.label)}</strong>
        <span>${theme.count} records / ${theme.darts} Darts / ${theme.pats} Pats</span>
      </button>
    `,
  };
}

function renderNetwork() {
  if (!state.stringGraph) return;
  const selectedTheme = state.stringGraph.themes.get(state.selectedStringTheme) || state.stringGraph.topThemes[0];
  if (!selectedTheme) return;
  state.selectedStringTheme = selectedTheme.id;

  const records = stringRecordsForTheme(selectedTheme.id);
  const darts = records.filter((record) => record.kind === 'DART').slice(0, 6);
  const pats = records.filter((record) => record.kind === 'PAT').slice(0, 6);
  const relatedThemes = selectedTheme.id === state.stringGraph.topThemes[0]?.id
    ? state.stringGraph.topThemes.filter((theme) => theme.id !== selectedTheme.id).slice(0, 8)
    : relatedThemesFor(selectedTheme.id).slice(0, 8);
  const nodes = [
    ...darts.map((record, index) => stringRecordNode(record, index, darts.length, 'left')),
    ...pats.map((record, index) => stringRecordNode(record, index, pats.length, 'right')),
    ...relatedThemes.map((theme, index) => stringThemeNode(theme, index)),
  ];

  els.stringSummary.innerHTML = `
    <div class="string-board__center-pin" aria-hidden="true"></div>
    <button class="string-node string-node--center" data-string-theme="${escapeHtml(selectedTheme.id)}" type="button" aria-current="true">
      <span>Centered theme</span>
      <strong>${escapeHtml(selectedTheme.label)}</strong>
      <small>${selectedTheme.count} records / ${selectedTheme.darts} Darts / ${selectedTheme.pats} Pats</small>
    </button>
  `;
  els.networkNodes.innerHTML = nodes.map((node) => node.html).join('');
  els.networkEdges.setAttribute('viewBox', '0 0 100 100');
  els.networkEdges.innerHTML = nodes.map((node) => {
    const color = node.edge === 'pat' ? '#cbb677' : node.edge === 'theme' ? '#2f6f7e' : '#450084';
    const width = node.edge === 'theme' ? 0.34 : 0.52;
    return `<line x1="50" y1="42" x2="${node.x}" y2="${node.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-opacity="0.64" />`;
  }).join('');

  const years = [...records.reduce((map, record) => {
    if (record.year) map.set(record.year, (map.get(record.year) || 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => a[0] - b[0]);
  const topYears = years.length > 18 ? [...years].sort((a, b) => b[1] - a[1]).slice(0, 18).sort((a, b) => a[0] - b[0]) : years;
  const maxYearCount = Math.max(...topYears.map(([, count]) => count), 1);
  els.stringYears.innerHTML = topYears.map(([year, count]) => `<span style="--year-weight:${Math.max(0.18, count / maxYearCount).toFixed(2)}">${year}</span>`).join('');

  if (els.useStringTheme) {
    els.useStringTheme.textContent = `Also show “${selectedTheme.label}” in the corridor`;
  }
}

function handleNetworkClick(event) {
  const recordNode = event.target.closest('[data-string-record-id]');
  if (recordNode) {
    const record = findRecord(recordNode.dataset.stringRecordId);
    if (record) renderDrawer(record);
    return;
  }

  const themeNode = event.target.closest('[data-string-theme]');
  if (!themeNode) return;
  const themeId = themeNode.dataset.stringTheme;
  if (themeId && state.stringGraph?.themes.has(themeId)) {
    state.selectedStringTheme = themeId;
    renderNetwork();
  }
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function scrollToElement(element) {
  element?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

function resetCorridorPan() {
  if (!els.corridorPan) return;
  els.corridorPan.scrollTo({ left: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

function getChapterElement(targetId) {
  return document.querySelector(`[data-chapter="${targetId}"]`) || document.getElementById(targetId);
}

function setActiveChapter(targetId) {
  els.railButtons.forEach((button) => {
    const isActive = button.dataset.railTarget === targetId;
    button.classList.toggle('is-active', isActive);
    if (isActive) {
      button.setAttribute('aria-current', 'true');
    } else {
      button.removeAttribute('aria-current');
    }
  });
}

function bindMemoryRail() {
  if (!els.railButtons.length) return;

  els.railButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const targetId = button.dataset.railTarget;
      const target = getChapterElement(targetId);
      if (!target) return;
      setActiveChapter(targetId);
      scrollToElement(target);
      if (targetId === 'walk-years') {
        window.requestAnimationFrame(() => els.corridorPan?.focus({ preventScroll: true }));
      }
    });
  });

  if ('IntersectionObserver' in window) {
    railObserver = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visible[0]?.target?.dataset?.chapter) {
        setActiveChapter(visible[0].target.dataset.chapter);
      }
    }, {
      root: null,
      threshold: [0.2, 0.45, 0.68],
      rootMargin: '-22% 0px -48% 0px',
    });

    els.chapterSections.forEach((section) => railObserver.observe(section));
  }
}

function syncClassYear(year = els.classYear?.value || '2004') {
  if (!els.classYear || !els.classYearOutput) return;
  const min = Number(els.classYear.min);
  const max = Number(els.classYear.max);
  const numericYear = Math.min(max, Math.max(min, Number(year) || min));
  els.classYear.value = String(numericYear);
  els.classYearOutput.value = classWindowLabel(numericYear);
  els.classYearOutput.textContent = classWindowLabel(numericYear);
}

function updateClassWindowChip() {
  if (!els.classWindowChip) return;
  if (state.classYear === 'all') {
    els.classWindowChip.hidden = true;
    els.classWindowChip.textContent = '';
    return;
  }

  const label = classWindowLabel();
  els.classWindowChip.hidden = false;
  els.classWindowChip.textContent = label;
  els.classWindowChip.setAttribute('aria-label', `${label}. Tap to change class years.`);
}

function setClassTrayOpen(open) {
  if (!els.classTray || !els.classTrayToggle) return;
  els.classTray.hidden = !open;
  els.classTrayToggle.setAttribute('aria-expanded', String(open));
  els.classTrayToggle.classList.toggle('is-open', open);
  if (open) window.requestAnimationFrame(() => els.classYear?.focus({ preventScroll: true }));
}

function nudgeClassYear(delta) {
  if (!els.classYear) return;
  syncClassYear(Number(els.classYear.value) + delta);
}

function focusYearTile(year) {
  window.requestAnimationFrame(() => {
    const tile = els.timeline?.querySelector(`[data-year="${year}"]`);
    if (!tile) return;

    if (els.corridorPan) {
      const tileRect = tile.getBoundingClientRect();
      const panRect = els.corridorPan.getBoundingClientRect();
      const leftDelta = tileRect.left - panRect.left - ((panRect.width - tileRect.width) / 2);
      els.corridorPan.scrollBy({ left: leftDelta, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    tile.focus({ preventScroll: true });
  });
}

function jumpToClassYear() {
  if (!els.classYear) return;
  const classYear = els.classYear.value;
  applyState({ classYear });
  setClassTrayOpen(false);
  setActiveChapter('walk-years');
  scrollToElement(document.querySelector('#walk-years'));
  focusYearTile(classYear);
}

function clearClassYear() {
  applyState({ classYear: 'all' });
  setClassTrayOpen(false);
  setActiveChapter('walk-years');
  scrollToElement(document.querySelector('#walk-years'));
}

function useSelectedStringThemeInCorridor() {
  if (!state.selectedStringTheme) return;
  applyState({ topic: state.selectedStringTheme });
  setActiveChapter('walk-years');
  scrollToElement(document.querySelector('#walk-years'));
}

function clearStringThemeFromCorridor() {
  applyState({ topic: 'all' });
  setActiveChapter('walk-years');
  scrollToElement(document.querySelector('#walk-years'));
}

function startOver({ showOverlay = false } = {}) {
  if (els.drawer?.open) els.drawer.close();
  setClassTrayOpen(false);
  applyState({ year: 'all', classYear: 'all', era: 'all', topic: 'all', kind: 'all', search: '' });
  makeGameCard();
  resetCorridorPan();
  window.history.replaceState(null, '', `${window.location.origin}${window.location.pathname}${window.location.search}`);

  if (showOverlay) {
    els.idleOverlay.hidden = false;
    window.clearTimeout(idleResetTimer);
    idleResetTimer = window.setTimeout(() => {
      els.idleOverlay.hidden = true;
      window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
      resetIdleTimer();
    }, IDLE_WARNING_MS);
    return;
  }

  els.idleOverlay.hidden = true;
  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
}

function enterCorridor() {
  scrollToElement(document.querySelector('#walk-years'));
  resetCorridorPan();
}

function walkCorridor(direction) {
  if (!els.corridorPan) return;
  const sign = direction === 'left' ? -1 : 1;
  const distance = Math.max(360, els.corridorPan.clientWidth * 0.62);
  els.corridorPan.scrollBy({ left: sign * distance, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  els.corridorPan.focus({ preventScroll: true });
}

function isInteractiveTarget(target) {
  return Boolean(target.closest('button, a, input, select, textarea, summary, [role="button"]'));
}

function bindCorridorDrag() {
  if (!els.corridorPan) return;

  els.corridorPan.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'touch' || isInteractiveTarget(event.target)) return;
    panDrag = {
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: els.corridorPan.scrollLeft,
    };
    els.corridorPan.classList.add('is-dragging');
    els.corridorPan.setPointerCapture?.(event.pointerId);
  });

  els.corridorPan.addEventListener('pointermove', (event) => {
    if (!panDrag || panDrag.pointerId !== event.pointerId) return;
    event.preventDefault();
    els.corridorPan.scrollLeft = panDrag.scrollLeft - (event.clientX - panDrag.startX);
  });

  const endDrag = (event) => {
    if (!panDrag || panDrag.pointerId !== event.pointerId) return;
    els.corridorPan.classList.remove('is-dragging');
    els.corridorPan.releasePointerCapture?.(event.pointerId);
    panDrag = null;
  };

  els.corridorPan.addEventListener('pointerup', endDrag);
  els.corridorPan.addEventListener('pointercancel', endDrag);
}

async function togglePresentationMode() {
  const canFullscreen = Boolean(document.documentElement.requestFullscreen);
  try {
    if (canFullscreen && !document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else if (document.fullscreenElement && document.exitFullscreen) {
      await document.exitFullscreen();
    } else {
      document.body.classList.toggle('is-presentation-mode');
      updatePresentationButton();
    }
  } catch (error) {
    document.body.classList.toggle('is-presentation-mode');
    updatePresentationButton();
  }
}

function updatePresentationButton() {
  const active = Boolean(document.fullscreenElement) || document.body.classList.contains('is-presentation-mode');
  els.presentationMode.textContent = active ? 'Exit Presentation' : 'Presentation Mode';
  els.presentationMode.setAttribute('aria-pressed', String(active));
}

function resetIdleTimer() {
  if (!els.idleOverlay) return;
  window.clearTimeout(idleTimer);
  window.clearTimeout(idleResetTimer);
  if (!els.idleOverlay.hidden) els.idleOverlay.hidden = true;
  idleTimer = window.setTimeout(() => startOver({ showOverlay: true }), IDLE_RESET_MS);
}

function bindIdleReset() {
  ['touchstart', 'pointerdown', 'keydown', 'scroll', 'mousemove'].forEach((eventName) => {
    window.addEventListener(eventName, resetIdleTimer, { passive: true });
  });
  resetIdleTimer();
}

function bindEvents() {
  els.year.addEventListener('change', (event) => applyState({ year: event.target.value }));
  els.era.addEventListener('change', (event) => applyState({ era: event.target.value }));
  els.topic.addEventListener('change', (event) => applyState({ topic: event.target.value }));
  els.kind.addEventListener('change', (event) => applyState({ kind: event.target.value }));
  els.search.addEventListener('input', (event) => applyState({ search: event.target.value }));
  els.reset.addEventListener('click', () => applyState({ year: 'all', classYear: 'all', era: 'all', topic: 'all', kind: 'all', search: '' }));
  els.startOver.addEventListener('click', () => startOver());
  els.kioskEnter.addEventListener('click', enterCorridor);
  els.presentationMode.addEventListener('click', togglePresentationMode);
  document.addEventListener('fullscreenchange', updatePresentationButton);
  els.classTrayToggle?.addEventListener('click', () => setClassTrayOpen(els.classTray?.hidden));
  els.classWindowChip?.addEventListener('click', () => setClassTrayOpen(true));
  els.classYear?.addEventListener('input', (event) => syncClassYear(event.target.value));
  els.classYearGo?.addEventListener('click', jumpToClassYear);
  els.classYearBack?.addEventListener('click', () => nudgeClassYear(-1));
  els.classYearForward?.addEventListener('click', () => nudgeClassYear(1));
  els.classYearClear?.addEventListener('click', clearClassYear);
  els.returnCorridor?.addEventListener('click', () => {
    setActiveChapter('walk-years');
    scrollToElement(document.querySelector('#walk-years'));
  });
  els.useStringTheme?.addEventListener('click', () => {
    useSelectedStringThemeInCorridor();
    if (els.sendCorridor) els.sendCorridor.open = false;
  });
  els.clearStringTheme?.addEventListener('click', () => {
    clearStringThemeFromCorridor();
    if (els.sendCorridor) els.sendCorridor.open = false;
  });
  els.walkButtons.forEach((button) => {
    button.addEventListener('click', () => walkCorridor(button.dataset.walk));
  });
  els.corridorPan.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') walkCorridor('left');
    if (event.key === 'ArrowRight') walkCorridor('right');
  });
  bindCorridorDrag();

  document.addEventListener('click', (event) => {
    const breezeTerm = event.target.closest('[data-breeze-term]');
    if (breezeTerm) {
      state.wordBreezeTerm = breezeTerm.dataset.breezeTerm;
      renderWordBreezeList(state.wordBreezeTerm);
      return;
    }

    if (event.target.closest('[data-breeze-close]')) {
      state.wordBreezeTerm = '';
      els.wordBreezeList.hidden = true;
      els.wordBreezeList.innerHTML = '';
      return;
    }

    const drawerPrevious = event.target.closest('[data-drawer-prev]');
    const drawerNext = event.target.closest('[data-drawer-next]');
    const drawerTarget = drawerPrevious?.dataset.drawerPrev || drawerNext?.dataset.drawerNext;
    if (drawerTarget) {
      const record = findRecord(drawerTarget);
      if (record) renderDrawer(record);
      return;
    }

    const recordButton = event.target.closest('[data-record-id]');
    if (recordButton) {
      const record = findRecord(recordButton.dataset.recordId);
      if (record) renderDrawer(record);
      return;
    }

    const yearTile = event.target.closest('[data-year]');
    if (yearTile) {
      applyState({ year: String(yearTile.dataset.year) });
      return;
    }

    const topicDoor = event.target.closest('[data-topic]');
    if (topicDoor) applyState({ topic: topicDoor.dataset.topic });
  });

  els.networkNodes.addEventListener('click', handleNetworkClick);
  els.newGameCard.addEventListener('click', makeGameCard);
  els.revealGameCard.addEventListener('click', revealGameGuess);
  els.gameTopicGuess.addEventListener('change', (event) => {
    state.gameTopicGuess = event.target.value;
    updateGameRevealState();
  });

  document.querySelectorAll('[data-guess]').forEach((button) => {
    button.addEventListener('click', () => {
      state.gameKindGuess = button.dataset.guess;
      document.querySelectorAll('[data-guess]').forEach((item) => {
        const selected = item === button;
        item.setAttribute('aria-pressed', String(selected));
        item.classList.toggle('button--ghost', !selected);
      });
      updateGameRevealState();
    });
  });

  els.drawer.addEventListener('keydown', (event) => {
    if (!state.activeRecordId || (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight')) return;
    const record = findRecord(state.activeRecordId);
    if (!record) return;
    const navigation = getDrawerNavigation(record);
    const target = event.key === 'ArrowLeft' ? navigation.previous : navigation.next;
    if (target) renderDrawer(target);
  });

  window.addEventListener('resize', () => window.requestAnimationFrame(renderNetwork));
  bindMemoryRail();
  bindIdleReset();
}

async function init() {
  try {
    const [recordsResponse, summaryResponse] = await Promise.all([fetch(DATA_URL), fetch(SUMMARY_URL)]);
    if (!recordsResponse.ok || !summaryResponse.ok) throw new Error('Could not load exhibit data.');

    state.records = (await recordsResponse.json()).map((record) => ({
      ...record,
      _search: recordSearchBlob(record),
    })).sort(dateSort);
    state.summary = await summaryResponse.json();
    state.editorEligibleRecords = state.records.filter(isEditorEligible);
    state.editorWithheldRecords = state.records.filter((record) => !isEditorEligible(record));
    state.stringGraph = buildStringGraph();
    state.selectedStringTheme = state.stringGraph.topThemes[0]?.id || '';

    populateControls();
    bindEvents();
    filterRecords();
    renderAll();
    renderNetwork();
    makeGameCard();
  } catch (error) {
    console.error(error);
    els.currentSummary.textContent = 'The exhibit data failed to load. Check that the JSON files are in /public/data/.';
  }
}

init();
