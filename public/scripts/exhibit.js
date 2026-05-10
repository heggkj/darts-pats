const DATA_URL = '/data/town_gown_exhibit_records_enriched.json';
const SUMMARY_URL = '/data/town_gown_exhibit_analysis_summary.json';
const IDLE_RESET_MS = 105000;
const IDLE_WARNING_MS = 2400;
const EDITOR_FORM_WORD_RE = /\b(dart|darts|pat|pats)\b/gi;
const EDITOR_REDACTION_TOKEN = '__EDITOR_FORM_REDACTION__';
const ATTRACTOR_CARD_LENGTH = 180;
const ATTRACTOR_HARSH_LANGUAGE_RE = /\b(fuck|shit|bitch|asshole|bastard|slut|whore|kill|killed|hate|hated|hateful|idiot|moron|stupid|dumb|loser|shut up|go away)\b/i;
const APP_VERSION = 'phase-10e-final-ui-polish';
const DISPLAY_ARTIFACT_RE = new RegExp(String.raw`\s*\[` + ['form', 'hidden'].join(String.raw`\s+`) + String.raw`\]\s*`, 'gi');
const ATTRACTOR_FIRST_RELEASE_MS = 8000;
const ATTRACTOR_MIN_REST_MS = 3500;
const ATTRACTOR_BALLOON_FLIGHT_MS = 6000;
const ATTRACTOR_CLIPPING_FADE_MS = 900;

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
  'your', 'you', 'pat', 'pats', 'dart', 'darts', 'breeze', 'sent', 'send', 'sends', 'sending',
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
  gameRevealed: false,
  activeRecordId: null,
  editorEligibleRecords: [],
  editorWithheldRecords: [],
  stringGraph: null,
  selectedStringTheme: '',
  wordBreezeTerm: '',
  longArgumentYear: '',
  longArgumentEra: 'all',
  isAttractorActive: true,
  attractorPool: [],
  attractorIndex: 0,
  currentChapter: 'threshold',
  lastResetAt: '',
};

const els = {
  body: document.body,
  main: document.querySelector('#top'),
  memoryRail: document.querySelector('.memory-rail'),
  skipLink: document.querySelector('.skip-link'),
  attractor: document.querySelector('#attractor-mode'),
  attractorEnter: document.querySelector('#attractor-enter'),
  attractorScene: document.querySelector('#attractor-scene'),
  attractorBalloon: document.querySelector('#attractor-balloon'),
  attractorCardLayer: document.querySelector('#attractor-card-layer'),
  dartRack: document.querySelector('#dart-rack'),
  patRack: document.querySelector('#pat-rack'),
  timeline: document.querySelector('#floor-timeline'),
  topicDoors: document.querySelector('#topic-doors'),
  currentTitle: document.querySelector('#current-view-title'),
  currentSummary: document.querySelector('#current-view-summary'),
  viewMeters: document.querySelector('#view-meters'),
  featuredCards: document.querySelector('#featured-cards'),
  activeFilterPills: document.querySelector('#active-filter-pills'),
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
  gameText: document.querySelector('#game-text'),
  gameFieldset: document.querySelector('.game-fieldset'),
  gameChoicePrompt: document.querySelector('#game-choice-prompt'),
  gamePoolNote: document.querySelector('#game-pool-note'),
  gameRelated: document.querySelector('#game-related'),
  longArgumentEras: document.querySelector('#long-argument-eras'),
  longArgumentYears: document.querySelector('#long-argument-years'),
  longArgumentWindow: document.querySelector('#long-argument-window'),
  longArgumentThemes: document.querySelector('#long-argument-themes'),
  longArgumentCards: document.querySelector('#long-argument-cards'),
  revealGameCard: document.querySelector('#reveal-game-card'),
  newGameCard: document.querySelector('#new-game-card'),
  threshold: document.querySelector('.threshold'),
  kioskEnter: document.querySelector('#kiosk-enter'),
  presentationMode: document.querySelector('#presentation-mode'),
  corridorPan: document.querySelector('#corridor-pan'),
  corridorLeftWall: document.querySelector('.wall--left'),
  corridorRightWall: document.querySelector('.wall--right'),
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
  diagnosticsHotspot: document.querySelector('#diagnostics-hotspot'),
  diagnosticsPanel: document.querySelector('#operator-diagnostics'),
  diagnosticsClose: document.querySelector('#diagnostics-close'),
  diagnosticsReadout: document.querySelector('#diagnostics-readout'),
};

let idleTimer = null;
let idleResetTimer = null;
let idleReturnInProgress = false;
let panDrag = null;
let railObserver = null;
let corridorEdgeFrame = null;
let diagnosticsTapCount = 0;
let diagnosticsTapTimer = null;
let diagnosticsInterval = null;
let classTrayOpenedAt = 0;
let classTrayInitialized = false;

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

function cleanDisplayText(text = '') {
  return String(text || '')
    .replace(DISPLAY_ARTIFACT_RE, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function shorten(text = '', length = 170) {
  const clean = cleanDisplayText(text).replace(/\s+/g, ' ').trim();
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

function classWindowChoiceLabel(classYear = state.classYear) {
  const years = classWindowYears(classYear);
  if (!years.length) return '';
  const end = years[years.length - 1];
  const range = years.length === 1 ? `${years[0]}` : `${years[0]} - ${end}`;
  return `Class of ${end} (${range})`;
}

function editorChallenge(record) {
  const original = cleanDisplayText(record.text_full || '').replace(/\s+/g, ' ').trim();
  let maskCount = 0;
  const masked = cleanDisplayText(original
    .replace(EDITOR_FORM_WORD_RE, () => {
      maskCount += 1;
      return ` ${EDITOR_REDACTION_TOKEN} `;
    }))
    .replace(new RegExp(EDITOR_REDACTION_TOKEN, 'g'), '????')
    .replace(/\(\s+(\?{4})\s+\)/g, '($1)')
    .replace(/\s+([,.;:!])/g, '$1')
    .replace(/\s+\)/g, ')')
    .replace(/\(\s+/g, '(')
    .replace(/\s+/g, ' ')
    .trim();

  const wordCount = (masked.match(/[a-zA-Z]{3,}/g) || []).length;
  const hiddenShare = masked.length ? (maskCount * 4) / masked.length : 1;
  return {
    text: masked,
    maskCount,
    playable: masked.length >= 60 && wordCount >= 10 && maskCount <= 4 && hiddenShare <= 0.28,
  };
}

function isEditorEligible(record) {
  return editorChallenge(record).playable;
}

function attractorText(record) {
  return cleanDisplayText(record.text_full || record.text || record.summary || record.snippet || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function decadeBucket(year) {
  const numericYear = Number(year) || 0;
  if (numericYear < 2000) return '1990s';
  if (numericYear < 2010) return '2000s';
  if (numericYear < 2020) return '2010s';
  return '2020s';
}

function isAttractorCandidate(record) {
  const text = attractorText(record);
  if (!record.kind || !record.year || !record.primary_topic_label || text.length < 80 || text.length > 520) return false;
  if (ATTRACTOR_HARSH_LANGUAGE_RE.test(text)) return false;
  const words = text.match(/[a-zA-Z]{3,}/g) || [];
  if (words.length < 12 || words.length > 95) return false;
  const punctuation = (text.match(/[.!?]/g) || []).length;
  return punctuation >= 1 || words.length <= 45;
}

function buildAttractorPool() {
  const candidates = state.records
    .filter(isAttractorCandidate)
    .sort((a, b) => Math.abs(attractorText(a).length - 190) - Math.abs(attractorText(b).length - 190) || dateSort(a, b));
  const grouped = candidates.reduce((map, record) => {
    const key = `${decadeBucket(record.year)}:${record.kind}`;
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(record);
    return map;
  }, new Map());

  const balanced = [];
  ['1990s', '2000s', '2010s', '2020s'].forEach((decade) => {
    ['DART', 'PAT'].forEach((kind) => {
      balanced.push(...(grouped.get(`${decade}:${kind}`) || []).slice(0, 8));
    });
  });

  const seen = new Set();
  const pool = balanced
    .concat(candidates)
    .filter((record) => {
      if (seen.has(record.id)) return false;
      seen.add(record.id);
      return true;
    })
    .slice(0, 72)
    .sort(dateSort);

  return pool.length ? pool : state.records.slice(0, 24);
}

function attractorPoolStats() {
  const pool = state.attractorPool || [];
  const byKind = pool.reduce((counts, record) => {
    counts[record.kind] = (counts[record.kind] || 0) + 1;
    return counts;
  }, { DART: 0, PAT: 0 });
  const byDecade = pool.reduce((counts, record) => {
    const decade = decadeBucket(record.year);
    counts[decade] = (counts[decade] || 0) + 1;
    return counts;
  }, {});
  return {
    total: pool.length,
    darts: byKind.DART || 0,
    pats: byKind.PAT || 0,
    decades: byDecade,
    fullArchive: state.records.length,
  };
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
  if (state.classYear !== 'all') syncClassYear(state.classYear);
  renderActiveFilterPills();
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
  els.currentSummary.textContent = `The hallway is ${mood}: ${darts} sharp notes, ${pats} warm notes, ${total} openable cards.`;
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
  const wallLimit = isKioskPortraitLayout() ? 3 : 4;

  els.dartRack.innerHTML = darts.length ? [...darts].sort(wallSort).slice(0, wallLimit).map((record, index) => makeRecordCard(record, { depth: index })).join('') : '<p class="empty-note">No Darts in this view.</p>';
  els.patRack.innerHTML = pats.length ? [...pats].sort(wallSort).slice(0, wallLimit).map((record, index) => makeRecordCard(record, { depth: index })).join('') : '<p class="empty-note">No Pats in this view.</p>';
}

function renderFeaturedCards() {
  if (!els.featuredCards) return;
  const featuredLimit = isKioskPortraitLayout() ? 3 : 4;
  const featured = [...state.filtered]
    .sort((a, b) => (b.tone_intensity || 0) - (a.tone_intensity || 0) || dateSort(a, b))
    .slice(0, featuredLimit);

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
  els.gamePoolNote.textContent = 'Some cards are masked because they name their own form.';
}

function eraYears(eraLabel = '') {
  const match = String(eraLabel).match(/(\d{4})\D+(\d{4})/);
  if (!match) return [];
  const start = Number(match[1]);
  const end = Number(match[2]);
  return state.summary.yearly
    .map((year) => year.year)
    .filter((year) => year >= start && year <= end);
}

function longArgumentYears() {
  if (state.longArgumentYear) return [Number(state.longArgumentYear)];
  if (state.longArgumentEra !== 'all') return eraYears(state.longArgumentEra);
  return classWindowYears().length ? classWindowYears() : state.summary.yearly.map((year) => year.year);
}

function longArgumentRecords() {
  const years = new Set(longArgumentYears());
  if (!years.size) return state.records;
  return state.records.filter((record) => years.has(Number(record.year)));
}

function longArgumentLabel(years) {
  if (state.longArgumentYear) return `${state.longArgumentYear}`;
  if (state.longArgumentEra !== 'all') return state.longArgumentEra;
  if (state.classYear !== 'all') return classWindowLabel();
  const first = years[0];
  const last = years[years.length - 1];
  return first && last ? `${first}–${last}` : 'All years';
}

function renderLongArgument() {
  if (!els.longArgumentYears || !state.summary?.yearly?.length) return;
  const activeYears = longArgumentYears();
  const activeYearSet = new Set(activeYears);
  const classYears = new Set(classWindowYears());
  const records = longArgumentRecords();
  const total = records.length;
  const darts = records.filter((record) => record.kind === 'DART').length;
  const pats = records.filter((record) => record.kind === 'PAT').length;
  const maxYearCount = Math.max(...state.summary.yearly.map((year) => year.count));
  const label = longArgumentLabel(activeYears);
  const mood = total === 0
    ? 'quiet'
    : Math.abs(darts - pats) <= Math.max(2, total * 0.12)
      ? 'split almost down the middle'
      : darts > pats
        ? 'tilted toward Darts'
        : 'tilted toward Pats';

  if (els.longArgumentEras) {
    const eraButtons = [
      { era: 'all', label: 'All years' },
      ...state.summary.eras.map((era) => ({ era: era.era, label: era.era })),
    ];
    els.longArgumentEras.innerHTML = eraButtons.map((item) => `
      <button class="long-argument-era ${state.longArgumentEra === item.era && !state.longArgumentYear ? 'is-active' : ''}" data-long-era="${escapeHtml(item.era)}" type="button" aria-pressed="${state.longArgumentEra === item.era && !state.longArgumentYear}">
        ${escapeHtml(item.label)}
      </button>
    `).join('');
  }

  els.longArgumentWindow.innerHTML = `
    <div>
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(mood)}</strong>
    </div>
    <dl>
      <div><dt>Cards</dt><dd>${total}</dd></div>
      <div><dt>Darts</dt><dd>${darts}</dd></div>
      <div><dt>Pats</dt><dd>${pats}</dd></div>
    </dl>
    ${classYears.size ? `<p>${escapeHtml(classWindowLabel())} is marked along the rail.</p>` : ''}
  `;

  els.longArgumentYears.innerHTML = state.summary.yearly.map((year) => {
    const active = activeYearSet.has(Number(year.year));
    const classWindow = classYears.has(Number(year.year));
    const patPct = Math.round((year.pat_share || 0) * 100);
    const dartPct = Math.round((year.dart_share || 0) * 100);
    const scale = 0.38 + (year.count / maxYearCount) * 0.62;
    return `
      <button class="argument-year ${yearMoodClass(year)} ${active ? 'is-active' : ''} ${classWindow ? 'is-class-window' : ''}" data-long-year="${year.year}" style="--pat-pct:${patPct}%;--dart-pct:${dartPct}%;--count-scale:${scale}" type="button" aria-pressed="${state.longArgumentYear === String(year.year)}" aria-label="${year.year}: ${year.darts} Darts and ${year.pats} Pats. ${classWindow ? 'Inside the active Class-of window.' : ''}">
        <span class="argument-year__date">${year.year}</span>
        <span class="argument-year__stack" aria-hidden="true"><i></i></span>
        <span class="argument-year__counts">${year.darts}D / ${year.pats}P</span>
      </button>
    `;
  }).join('');

  const themeCounts = new Map();
  records.forEach((record) => {
    const key = record.primary_topic_label || 'Town-gown note';
    const item = themeCounts.get(key) || { label: key, count: 0, darts: 0, pats: 0 };
    item.count += 1;
    item[record.kind === 'PAT' ? 'pats' : 'darts'] += 1;
    themeCounts.set(key, item);
  });
  const topThemes = [...themeCounts.values()]
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
    .slice(0, 4);

  els.longArgumentThemes.innerHTML = `
    <h3>Themes moving through this stretch</h3>
    <div>
      ${topThemes.map((theme) => `
        <article class="argument-theme-card">
          <strong>${escapeHtml(theme.label)}</strong>
          <span>${theme.count} cards · ${theme.darts} D / ${theme.pats} P</span>
        </article>
      `).join('') || '<p class="empty-note">No themes in this stretch yet.</p>'}
    </div>
  `;

  const representative = [...records]
    .sort((a, b) => (b.tone_intensity || 0) - (a.tone_intensity || 0) || dateSort(a, b))
    .slice(0, 4);
  els.longArgumentCards.innerHTML = `
    <h3>Open a card from this stretch</h3>
    <div class="related-chips">${representative.map((record) => makeRelatedChip(record)).join('') || '<p class="empty-note">No cards in this stretch yet.</p>'}</div>
  `;
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
  renderLongArgument();
}

function sourceLine(record) {
  return `The Breeze · Record #${record.id}`;
}

function usefulMetadataValue(value) {
  const text = String(value || '').trim();
  return text && !/^(not parsed|unknown|none tagged)$/i.test(text);
}

function archiveDetails(record) {
  const details = [
    ['Source', sourceLine(record)],
    ['Era', record.era],
    ['Sender', record.sender_short || record.sender_long],
    ['Target', record.target_short || record.target_long],
  ];
  return details.filter(([, value]) => usefulMetadataValue(value));
}

function renderArchiveDetails(record) {
  const details = archiveDetails(record);
  if (!details.length) return '';
  return `
    <dl class="archive-details" aria-label="Archive details">
      ${details.map(([label, value]) => `
        <div>
          <dt>${escapeHtml(label)}</dt>
          <dd>${escapeHtml(value)}</dd>
        </div>
      `).join('')}
    </dl>
  `;
}

function renderPillRow(label, values) {
  const cleanValues = [...new Set((values || []).filter(usefulMetadataValue))];
  if (!cleanValues.length) return '';
  return `
    <div class="pills pills--labeled" aria-label="${escapeHtml(label)}">
      <strong>${escapeHtml(label)}:</strong>
      ${cleanValues.map((value) => `<span class="pill">${escapeHtml(value)}</span>`).join('')}
    </div>
  `;
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
      <blockquote>${escapeHtml(cleanDisplayText(record.text_full))}</blockquote>
      ${renderArchiveDetails(record)}
      ${renderPillRow('Tags', record.topic_tag_labels)}
      ${renderPillRow('Entities', record.entities)}
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
  state.gameRevealed = false;
  if (!pool.length) {
    state.gameRecord = null;
    state.gameChallengeText = '';
    state.gameKindGuess = '';
    els.gameText.textContent = 'No playable card is available in this view.';
    els.gameRelated.innerHTML = '<p class="empty-note">Try clearing a filter or opening the full drawer.</p>';
    resetGameChoiceButtons();
    updateGameRevealState();
    return;
  }

  state.gameRecord = pool[Math.floor(Math.random() * pool.length)];
  const challenge = editorChallenge(state.gameRecord);
  state.gameChallengeText = challenge.text;
  state.gameKindGuess = '';
  els.gameText.textContent = state.gameChallengeText || 'No card available.';
  renderGamePoolNote();
  els.gameRelated.innerHTML = '';
  resetGameChoiceButtons();
  updateGameRevealState();
}

function gameChoiceButtons() {
  return Array.from(document.querySelectorAll('[data-guess]'));
}

function setGameChoicePromptVisible(visible) {
  if (els.gameChoicePrompt) els.gameChoicePrompt.hidden = !visible;
  els.gameFieldset?.classList.toggle('is-choice-made', !visible);
}

function resetGameChoiceButtons() {
  setGameChoicePromptVisible(true);
  gameChoiceButtons().forEach((button) => {
    const label = getKindNoun(button.dataset.guess);
    button.textContent = label;
    button.setAttribute('aria-pressed', 'false');
    button.removeAttribute('aria-disabled');
    button.setAttribute('aria-label', `Choose ${label}`);
    button.classList.add('button--ghost');
    button.classList.remove('is-choice-selected', 'is-choice-correct', 'is-choice-incorrect', 'is-choice-revealed');
  });
}

function updateGameChoiceSelection() {
  setGameChoicePromptVisible(!state.gameKindGuess);
  document.querySelectorAll('[data-guess]').forEach((button) => {
    const selected = button.dataset.guess === state.gameKindGuess;
    const label = getKindNoun(button.dataset.guess);
    button.textContent = label;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', selected ? `${label} selected` : `Choose ${label}`);
    button.classList.toggle('button--ghost', !selected);
    button.classList.toggle('is-choice-selected', selected);
    button.classList.remove('is-choice-correct', 'is-choice-incorrect', 'is-choice-revealed');
  });
}

function updateGameChoiceReveal() {
  const record = state.gameRecord;
  if (!record) return;
  setGameChoicePromptVisible(false);
  gameChoiceButtons().forEach((button) => {
    const guess = button.dataset.guess;
    const label = getKindNoun(guess);
    const selected = guess === state.gameKindGuess;
    const correct = guess === record.kind;
    const incorrectSelected = selected && !correct;
    const icon = correct ? '✓' : incorrectSelected ? '×' : '';
    button.textContent = icon ? `${icon} ${label}` : label;
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-disabled', 'true');
    button.setAttribute('aria-label', correct
      ? `${label}, The Breeze printed form`
      : incorrectSelected
        ? `${label}, your selected reading differs`
        : label);
    button.classList.toggle('button--ghost', !selected && !correct);
    button.classList.toggle('is-choice-selected', selected);
    button.classList.toggle('is-choice-correct', correct);
    button.classList.toggle('is-choice-incorrect', incorrectSelected);
    button.classList.add('is-choice-revealed');
  });
}

function updateGameRevealState() {
  els.revealGameCard.disabled = state.gameRevealed || !(state.gameKindGuess && state.gameRecord);
}

function revealGameGuess() {
  const record = state.gameRecord;
  if (!record) return;
  const sameKind = state.gameKindGuess === record.kind;
  const kindVerdict = sameKind
    ? 'You matched how The Breeze printed it.'
    : 'Your reading differs from the published form.';
  const related = relatedRecords(record);
  const kindLabel = getKindNoun(record.kind);

  state.gameRevealed = true;
  els.gameText.textContent = cleanDisplayText(record.text_full) || state.gameChallengeText;
  updateGameChoiceReveal();
  updateGameRevealState();
  els.gameRelated.innerHTML = `
    <div class="game-reveal">
      <span class="game-reveal__badge ${sameKind ? 'game-reveal__badge--matched' : 'game-reveal__badge--different'}">${sameKind ? '✓ Matched' : '× Different reading'}</span>
      <p class="game-reveal__summary">${escapeHtml(kindVerdict)}</p>
      <p>The Breeze printed this as a <strong>${escapeHtml(kindLabel)}</strong> on ${escapeHtml(formatDate(record.date))}.</p>
      <p>Main theme: <strong>${escapeHtml(record.primary_topic_label || 'Town-gown note')}</strong>.</p>
      ${renderPillRow('Tags', record.topic_tag_labels)}
      <button class="button button--small button--ghost" data-record-id="${record.id}" type="button">Open this card</button>
    </div>
    <div class="game-related__grid">
      ${renderRelatedGroup('Same topic', related.topic.slice(0, 3))}
      ${renderRelatedGroup(`Same year: ${record.year}`, related.year.slice(0, 3))}
      ${renderRelatedGroup('Same entity', related.entity.slice(0, 3))}
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
  if (isPortraitLayout()) {
    const ratio = total <= 1 ? 0.5 : index / (total - 1);
    return {
      x: 22 + ratio * 56,
      y: side === 'left' ? 52 + (index % 2) * 5 : 70 + (index % 2) * 5,
    };
  }

  const ratio = total <= 1 ? 0.5 : index / (total - 1);
  const wave = Math.sin(ratio * Math.PI);
  return {
    x: side === 'left' ? 12 + wave * 2 : 88 - wave * 2,
    y: 40 + ratio * 31,
  };
}

function relatedPosition(index) {
  if (isPortraitLayout()) {
    const slots = [
      { x: 20, y: 30 },
      { x: 50, y: 29 },
      { x: 80, y: 30 },
      { x: 28, y: 39 },
      { x: 50, y: 41 },
      { x: 72, y: 39 },
    ];
    return slots[index % slots.length];
  }

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
  const portrait = isPortraitLayout();
  const kioskPortrait = isKioskPortraitLayout();
  els.networkBoard?.classList.toggle('is-portrait-layout', portrait);
  els.networkBoard?.classList.toggle('is-kiosk-portrait-layout', kioskPortrait);

  const records = stringRecordsForTheme(selectedTheme.id);
  const recordLimit = kioskPortrait ? 3 : portrait ? 4 : 6;
  const relatedLimit = kioskPortrait ? 6 : portrait ? 7 : 8;
  const darts = records.filter((record) => record.kind === 'DART').slice(0, recordLimit);
  const pats = records.filter((record) => record.kind === 'PAT').slice(0, recordLimit);
  const relatedThemes = selectedTheme.id === state.stringGraph.topThemes[0]?.id
    ? state.stringGraph.topThemes.filter((theme) => theme.id !== selectedTheme.id).slice(0, relatedLimit)
    : relatedThemesFor(selectedTheme.id).slice(0, relatedLimit);
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
    return `<line x1="50" y1="${portrait ? 18 : 42}" x2="${node.x}" y2="${node.y}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-opacity="${kioskPortrait ? 0.18 : portrait ? 0.38 : 0.64}" />`;
  }).join('');

  const years = [...records.reduce((map, record) => {
    if (record.year) map.set(record.year, (map.get(record.year) || 0) + 1);
    return map;
  }, new Map()).entries()].sort((a, b) => a[0] - b[0]);
  const topYears = years.length > 18 ? [...years].sort((a, b) => b[1] - a[1]).slice(0, 18).sort((a, b) => a[0] - b[0]) : years;
  const maxYearCount = Math.max(...topYears.map(([, count]) => count), 1);
  els.stringYears.innerHTML = topYears.map(([year, count]) => `<span style="--year-weight:${Math.max(0.18, count / maxYearCount).toFixed(2)}">${year}</span>`).join('');

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

function nextAttractorRecord() {
  if (!state.attractorPool.length) return null;
  const record = state.attractorPool[state.attractorIndex % state.attractorPool.length];
  state.attractorIndex += 1;
  return record;
}

function renderAttractorClipping(record, { staticCard = false } = {}) {
  if (!els.attractorCardLayer || !record) return;
  const kind = getKindNoun(record.kind);
  const topic = record.primary_topic_label || 'Town-gown note';
  const excerpt = shorten(attractorText(record), ATTRACTOR_CARD_LENGTH);
  const tilt = ((record.id * 19) % 9) - 4;
  els.attractorCardLayer.innerHTML = `
    <button class="attractor-clipping attractor-clipping--${record.kind === 'PAT' ? 'pat' : 'dart'} ${staticCard ? 'is-static' : ''}" style="--clip-tilt:${tilt / 2}deg" data-attractor-record-id="${record.id}" type="button" aria-label="Enter the exhibit from a ${escapeHtml(kind)} clipping from ${escapeHtml(record.year)}">
      <span>${escapeHtml(kind)} · ${escapeHtml(record.year)}</span>
      <strong>${escapeHtml(topic)}</strong>
      <p>${escapeHtml(excerpt)}</p>
      <small>Touch to explore the archive</small>
    </button>
  `;
}

function setInertWhileAttracting(active) {
  [els.main, els.memoryRail].forEach((element) => {
    if (!element) return;
    if (active) {
      element.setAttribute('inert', '');
      element.setAttribute('aria-hidden', 'true');
    } else {
      element.removeAttribute('inert');
      element.removeAttribute('aria-hidden');
    }
  });
}

const AttractorMode = {
  timers: [],
  isBound: false,

  clearTimers() {
    this.timers.forEach((timer) => window.clearTimeout(timer));
    this.timers = [];
    els.attractorBalloon?.classList.remove('is-rising');
    els.attractorCardLayer?.querySelector('.attractor-clipping')?.classList.remove('is-fading');
  },

  queue(callback, delay) {
    const timer = window.setTimeout(callback, delay);
    this.timers.push(timer);
    return timer;
  },

  init() {
    if (this.isBound || !els.attractor) return;
    this.isBound = true;
    const exit = () => this.deactivate();

    els.attractorEnter?.addEventListener('click', exit);
    els.attractor?.addEventListener('click', (event) => {
      if (event.target.closest('#attractor-enter, [data-attractor-record-id]')) return;
      exit();
    });
    els.attractorScene?.addEventListener('click', exit);
    els.attractorScene?.addEventListener('keydown', (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      event.preventDefault();
      exit();
    });
    els.attractorCardLayer?.addEventListener('click', (event) => {
      if (!event.target.closest('[data-attractor-record-id]')) return;
      exit();
    });
  },

  activate({ resetScroll = true, focusEntry = true } = {}) {
    if (!els.attractor) return;
    this.clearTimers();
    idleReturnInProgress = false;
    state.isAttractorActive = true;
    window.clearTimeout(idleTimer);
    window.clearTimeout(idleResetTimer);
    document.documentElement.classList.add('is-attractor-active');
    els.body.classList.add('is-attractor-active');
    els.attractor.hidden = false;
    els.idleOverlay.hidden = true;
    setInertWhileAttracting(true);
    if (resetScroll) window.scrollTo({ top: 0, behavior: 'auto' });
    if (focusEntry) window.requestAnimationFrame(() => els.attractorEnter?.focus({ preventScroll: true }));
    this.startAnimation();
  },

  deactivate() {
    if (!els.attractor || !state.isAttractorActive) return;
    this.clearTimers();
    idleReturnInProgress = false;
    state.isAttractorActive = false;
    document.documentElement.classList.remove('is-attractor-active');
    els.body.classList.remove('is-attractor-active');
    els.attractor.hidden = true;
    setInertWhileAttracting(false);
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    window.requestAnimationFrame(() => els.kioskEnter?.focus({ preventScroll: true }));
    resetIdleTimer();
  },

  startAnimation() {
    const firstRecord = nextAttractorRecord();
    if (!firstRecord) return;
    if (prefersReducedMotion()) {
      renderAttractorClipping(firstRecord, { staticCard: true });
      return;
    }
    renderAttractorClipping(firstRecord, { staticCard: true });
    this.scheduleNextCycle(ATTRACTOR_FIRST_RELEASE_MS);
  },

  fadeCurrentClipping(callback) {
    const clipping = els.attractorCardLayer?.querySelector('.attractor-clipping');
    if (!clipping || prefersReducedMotion()) {
      callback();
      return;
    }
    clipping.classList.add('is-fading');
    this.queue(callback, ATTRACTOR_CLIPPING_FADE_MS);
  },

  scheduleNextCycle(delay) {
    this.queue(() => {
      if (!state.isAttractorActive) return;
      this.fadeCurrentClipping(() => this.runCycle());
    }, delay);
  },

  runCycle() {
    if (!state.isAttractorActive || prefersReducedMotion()) return;
    const record = nextAttractorRecord();
    if (!record || !els.attractorBalloon) return;
    const palette = record.kind === 'PAT'
      ? { fill: '#c9b062', accent: '#fff2bd', edge: '#8e7634', shadow: 'rgba(105, 80, 30, 0.26)' }
      : { fill: '#6d45a0', accent: '#d9c6ef', edge: '#3f2365', shadow: 'rgba(48, 30, 65, 0.28)' };
    const horizontal = 18 + ((record.id * 17) % 61);
    els.attractorBalloon.style.setProperty('--balloon-x', `${horizontal}vw`);
    els.attractorBalloon.style.setProperty('--balloon-drift', `${((record.id % 2) ? 1 : -1) * (3 + (record.id % 5))}vw`);
    els.attractorBalloon.style.setProperty('--balloon-fill', palette.fill);
    els.attractorBalloon.style.setProperty('--balloon-accent', palette.accent);
    els.attractorBalloon.style.setProperty('--balloon-edge', palette.edge);
    els.attractorBalloon.style.setProperty('--balloon-shadow', palette.shadow);
    els.attractorBalloon.classList.remove('is-rising');
    void els.attractorBalloon.offsetWidth;
    els.attractorBalloon.classList.add('is-rising');
    this.queue(() => {
      renderAttractorClipping(record);
      els.attractorBalloon?.classList.remove('is-rising');
      this.scheduleNextCycle(ATTRACTOR_MIN_REST_MS + ((state.attractorIndex % 4) * 1000));
    }, ATTRACTOR_BALLOON_FLIGHT_MS);
  },
};

function installLocalTestHooks() {
  if (!['localhost', '127.0.0.1'].includes(window.location.hostname)) return;
  window.__DARTS_PATS_TEST__ = {
    showAttractor: () => AttractorMode.activate(),
    exitAttractor: () => AttractorMode.deactivate(),
    enterExhibit: () => AttractorMode.deactivate(),
    triggerIdleReset: () => startOver({ showOverlay: true }),
    showIdleOverlay: () => {
      els.idleOverlay.hidden = false;
    },
    hideIdleOverlay: () => {
      els.idleOverlay.hidden = true;
    },
    resetInteractiveState,
    attractorPoolStats,
    renderAttractorClipping: () => renderAttractorClipping(nextAttractorRecord() || state.attractorPool[0]),
    fadeAttractorClipping: () => AttractorMode.fadeCurrentClipping(() => {}),
    runAttractorCycle: () => AttractorMode.runCycle(),
    setAttractorBirdState: (stateName = '') => {
      els.attractor?.classList.toggle('is-showing-bird-takeoff', stateName === 'takeoff');
    },
    showNewsstandMoment: () => {
      els.attractor?.classList.add('is-showing-newsstand-moment');
    },
    hideNewsstandMoment: () => {
      els.attractor?.classList.remove('is-showing-newsstand-moment');
    },
    selectLongArgumentYear: (year = 2007) => {
      AttractorMode.deactivate();
      state.longArgumentYear = String(year);
      state.longArgumentEra = 'all';
      applyState({ year: state.longArgumentYear });
      scrollToElement(document.querySelector('#reflection-wall'));
    },
    selectLongArgumentEra: (era = '2000–2009') => {
      AttractorMode.deactivate();
      state.longArgumentYear = '';
      state.longArgumentEra = era;
      renderLongArgument();
      scrollToElement(document.querySelector('#reflection-wall'));
    },
    applyState,
    openClassTray: (year) => {
      AttractorMode.deactivate();
      if (year) syncClassYear(year);
      setClassTrayOpen(true);
    },
    setClassYear: (year = 2004) => {
      AttractorMode.deactivate();
      applyState({ classYear: String(year) });
      setClassTrayOpen(false);
    },
    clearClassYear,
    scrollToSection: (targetId) => {
      AttractorMode.deactivate();
      const target = getChapterElement(targetId) || document.getElementById(targetId);
      setActiveChapter(targetId);
      target?.scrollIntoView({ behavior: 'auto', block: 'start' });
      updateCorridorEdgeButtons();
    },
    selectStringTheme: (index = 1) => {
      AttractorMode.deactivate();
      const theme = state.stringGraph?.topThemes?.[index] || state.stringGraph?.topThemes?.[0];
      if (theme) {
        state.selectedStringTheme = theme.id;
        renderNetwork();
      }
      return theme?.label || '';
    },
    openDrawer: (index = 0) => {
      AttractorMode.deactivate();
      const record = (state.filtered.length ? state.filtered : state.records)[index] || state.records[0];
      if (record) renderDrawer(record);
    },
    closeDrawer: () => {
      if (els.drawer?.open) els.drawer.close();
    },
    newEditorCard: () => {
      AttractorMode.deactivate();
      makeGameCard();
    },
    getEditorCardKind: () => state.gameRecord?.kind || '',
    revealEditorCard: () => {
      AttractorMode.deactivate();
      if (!state.gameRecord) makeGameCard();
      state.gameKindGuess = state.gameRecord?.kind || 'DART';
      updateGameChoiceSelection();
      revealGameGuess();
    },
    revealEditorCardWithGuess: (guess = 'DART') => {
      AttractorMode.deactivate();
      if (!state.gameRecord) makeGameCard();
      state.gameKindGuess = guess;
      updateGameChoiceSelection();
      revealGameGuess();
    },
    openDiagnostics: () => setDiagnosticsOpen(true),
    closeDiagnostics: () => setDiagnosticsOpen(false),
  };
}

function scrollToElement(element) {
  element?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
}

function resetCorridorPan() {
  if (!els.corridorPan) return;
  els.corridorPan.scrollTo({ left: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  window.requestAnimationFrame(updateCorridorEdgeButtons);
}

function corridorSideIsVisible(sideElement) {
  if (!els.corridorPan || !sideElement) return true;
  const panRect = els.corridorPan.getBoundingClientRect();
  const sideRect = sideElement.getBoundingClientRect();
  const visibleWidth = Math.max(0, Math.min(sideRect.right, panRect.right) - Math.max(sideRect.left, panRect.left));
  return visibleWidth / Math.max(1, sideRect.width) >= 0.48;
}

function setCorridorButtonHidden(button, hidden) {
  button.classList.toggle('is-hidden', hidden);
  button.disabled = hidden;
  button.setAttribute('aria-hidden', String(hidden));
}

function updateCorridorEdgeButtons() {
  if (!els.corridorPan || !els.walkButtons.length) return;
  const pan = els.corridorPan;
  const gutter = 8;
  const leftWallVisible = corridorSideIsVisible(els.corridorLeftWall);
  const rightWallVisible = corridorSideIsVisible(els.corridorRightWall);

  els.walkButtons.forEach((button) => {
    const buttonWidth = button.offsetWidth || 68;
    const left = button.dataset.walk === 'right'
      ? pan.scrollLeft + pan.clientWidth - buttonWidth - gutter
      : pan.scrollLeft + gutter;
    button.style.left = `${Math.max(pan.scrollLeft + gutter, left)}px`;
    button.style.right = 'auto';
    setCorridorButtonHidden(button, button.dataset.walk === 'left' ? leftWallVisible : rightWallVisible);
  });
}

function queueCorridorEdgeUpdate() {
  if (corridorEdgeFrame) return;
  corridorEdgeFrame = window.requestAnimationFrame(() => {
    corridorEdgeFrame = null;
    updateCorridorEdgeButtons();
  });
}

function isPortraitLayout() {
  return window.matchMedia('(orientation: portrait)').matches;
}

function isKioskPortraitLayout() {
  return window.matchMedia('(orientation: portrait) and (min-width: 768px) and (min-height: 1200px)').matches;
}

function getChapterElement(targetId) {
  return document.querySelector(`[data-chapter="${targetId}"]`) || document.getElementById(targetId);
}

function setActiveChapter(targetId) {
  state.currentChapter = targetId;
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
  const label = classWindowChoiceLabel(numericYear);
  els.classYearOutput.value = label;
  els.classYearOutput.textContent = label;
  if (els.classYearGo) els.classYearGo.textContent = 'Show your years';
}

function activeTimeFilter() {
  if (state.classYear !== 'all') {
    const years = classWindowYears();
    const classYear = years[years.length - 1];
    return {
      type: 'class',
      classYear,
      startYear: years[0],
      endYear: classYear,
      label: classWindowLabel(),
      clearLabel: `Clear Class of ${classYear} memory window`,
    };
  }
  if (state.year !== 'all') {
    return {
      type: 'year',
      year: Number(state.year),
      label: `Year: ${state.year}`,
      clearLabel: `Clear year ${state.year} filter`,
    };
  }
  return null;
}

function activeThemeFilter() {
  if (state.topic === 'all') return null;
  const label = getTopicLabel(state.topic);
  return {
    type: 'topic',
    topic: state.topic,
    label: `Theme: ${label}`,
    clearLabel: `Clear theme ${label} filter`,
  };
}

function activeCorridorFilters() {
  const filters = [];
  const time = activeTimeFilter();
  const theme = activeThemeFilter();
  if (time) filters.push(time);
  if (theme) filters.push(theme);
  if (state.era !== 'all') {
    filters.push({
      type: 'era',
      label: `Era: ${state.era}`,
      clearLabel: `Clear era ${state.era} filter`,
    });
  }
  if (state.kind !== 'all') {
    const label = state.kind === 'dart' ? 'Darts' : 'Pats';
    filters.push({
      type: 'kind',
      label: `Form: ${label}`,
      clearLabel: `Clear ${label} filter`,
    });
  }
  return filters;
}

function renderActiveFilterPills() {
  if (!els.activeFilterPills) return;
  const filters = activeCorridorFilters();
  if (!filters.length) {
    els.activeFilterPills.hidden = true;
    els.activeFilterPills.innerHTML = '';
    return;
  }

  els.activeFilterPills.hidden = false;
  els.activeFilterPills.innerHTML = filters.map((filter) => `
    <button class="active-filter-pill active-filter-pill--${escapeHtml(filter.type)}" data-clear-filter="${escapeHtml(filter.type)}" type="button" aria-label="${escapeHtml(filter.clearLabel)}">
      <span>${escapeHtml(filter.label)}</span>
      <span class="active-filter-pill__x" aria-hidden="true">×</span>
    </button>
  `).join('') + (filters.length > 1 ? `
    <button class="active-filter-pill active-filter-pill--clear-all" data-clear-filter="all" type="button" aria-label="Clear all Memory Corridor filters">Clear all</button>
  ` : '');
}

function setClassTrayOpen(open) {
  if (!els.classTray || !els.classTrayToggle) return;
  if (open) {
    if (state.classYear !== 'all') {
      syncClassYear(state.classYear);
    } else if (!classTrayInitialized) {
      syncClassYear(2000);
    }
    classTrayInitialized = true;
  }
  els.classTray.hidden = !open;
  els.classTrayToggle.setAttribute('aria-expanded', String(open));
  els.classTrayToggle.classList.toggle('is-open', open);
  if (open) classTrayOpenedAt = window.performance.now();
}

function eventIsInsideClassTray(event) {
  return Boolean(
    event.target.closest('#class-tray')
    || event.target.closest('#class-tray-toggle')
    || event.target.closest('#active-filter-pills')
  );
}

function closeClassTrayFromOutside(event) {
  if (!els.classTray || els.classTray.hidden || eventIsInsideClassTray(event)) return;
  setClassTrayOpen(false);
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

function closeWordBreezePanel() {
  if (els.wordBreezeList) {
    els.wordBreezeList.hidden = true;
    els.wordBreezeList.innerHTML = '';
  }
  state.wordBreezeTerm = '';
}

function clearAllCorridorFilters({ scroll = true } = {}) {
  state.longArgumentYear = '';
  state.longArgumentEra = 'all';
  closeWordBreezePanel();
  applyState({ year: 'all', classYear: 'all', era: 'all', topic: 'all', kind: 'all', search: '' });
  setClassTrayOpen(false);
  if (scroll) {
    setActiveChapter('walk-years');
    scrollToElement(document.querySelector('#walk-years'));
  }
}

function clearCorridorFilter(filterType) {
  if (filterType === 'all' || filterType === 'class' || filterType === 'year') {
    clearAllCorridorFilters();
    return;
  }

  const patch = {};
  if (filterType === 'topic') patch.topic = 'all';
  if (filterType === 'era') {
    patch.era = 'all';
    state.longArgumentEra = 'all';
  }
  if (filterType === 'kind') patch.kind = 'all';
  closeWordBreezePanel();
  applyState(patch);
  setClassTrayOpen(false);
  setActiveChapter('walk-years');
  scrollToElement(document.querySelector('#walk-years'));
}

function closeTransientPanels() {
  if (els.drawer?.open) els.drawer.close();
  setClassTrayOpen(false);
  closeWordBreezePanel();
  state.activeRecordId = null;
}

function resetInteractiveState() {
  closeTransientPanels();
  state.selectedStringTheme = state.stringGraph?.topThemes?.[0]?.id || '';
  clearAllCorridorFilters({ scroll: false });
  renderNetwork();
  makeGameCard();
  resetCorridorPan();
  setActiveChapter('threshold');
  window.history.replaceState(null, '', `${window.location.origin}${window.location.pathname}${window.location.search}`);
}

function startOver({ showOverlay = false } = {}) {
  state.lastResetAt = new Date().toLocaleString();
  resetInteractiveState();

  if (showOverlay) {
    idleReturnInProgress = true;
    window.clearTimeout(idleTimer);
    window.clearTimeout(idleResetTimer);
    els.idleOverlay.hidden = false;
    idleResetTimer = window.setTimeout(() => {
      idleReturnInProgress = false;
      els.idleOverlay.hidden = true;
      AttractorMode.activate();
    }, IDLE_WARNING_MS);
    return;
  }

  idleReturnInProgress = false;
  els.idleOverlay.hidden = true;
  AttractorMode.activate();
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
  queueCorridorEdgeUpdate();
}

function isInteractiveTarget(target) {
  return Boolean(target.closest('button, a, input, summary, [role="button"]'));
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
  if (!els.presentationMode) return;
  const active = Boolean(document.fullscreenElement) || document.body.classList.contains('is-presentation-mode');
  els.presentationMode.textContent = active ? 'Exit Presentation' : 'Presentation Mode';
  els.presentationMode.setAttribute('aria-pressed', String(active));
}

function resetIdleTimer() {
  if (!els.idleOverlay) return;
  if (idleReturnInProgress) return;
  window.clearTimeout(idleTimer);
  window.clearTimeout(idleResetTimer);
  if (!els.idleOverlay.hidden) els.idleOverlay.hidden = true;
  if (state.isAttractorActive) return;
  idleTimer = window.setTimeout(() => startOver({ showOverlay: true }), IDLE_RESET_MS);
}

function bindIdleReset() {
  ['touchstart', 'pointerdown', 'keydown', 'scroll', 'mousemove'].forEach((eventName) => {
    window.addEventListener(eventName, resetIdleTimer, { passive: true });
  });
  resetIdleTimer();
}

function diagnosticsRows() {
  const orientation = window.matchMedia('(orientation: portrait)').matches ? 'portrait' : 'landscape';
  const pointer = window.matchMedia('(pointer: coarse)').matches ? 'coarse' : 'fine';
  const hover = window.matchMedia('(hover: none)').matches ? 'none' : 'available';
  const reducedMotion = prefersReducedMotion() ? 'reduce' : 'no preference';
  const idleStatus = state.isAttractorActive
    ? 'attractor active / idle loop paused'
    : idleReturnInProgress
      ? 'return overlay running'
      : idleTimer
        ? `${Math.round(IDLE_RESET_MS / 1000)}s timer armed`
        : 'not armed';

  return [
    ['Version', APP_VERSION],
    ['Build commit', document.documentElement.dataset.buildCommit || 'not embedded'],
    ['Viewport', `${window.innerWidth} x ${window.innerHeight}`],
    ['Orientation', orientation],
    ['Pointer / hover', `${pointer} pointer / hover ${hover}`],
    ['Reduced motion', reducedMotion],
    ['Records loaded', state.records.length],
    ['Attractor pool', state.attractorPool.length],
    ['Current filters', `year ${state.year}; class ${state.classYear}; era ${state.era}; topic ${state.topic}; form ${state.kind}`],
    ['Idle timer', idleStatus],
    ['Current section', state.isAttractorActive ? 'The Breeze Parade' : state.currentChapter],
    ['Last reset', state.lastResetAt || 'not yet in this session'],
  ];
}

function updateDiagnostics() {
  if (!els.diagnosticsReadout) return;
  els.diagnosticsReadout.innerHTML = diagnosticsRows().map(([label, value]) => `
    <div>
      <dt>${escapeHtml(label)}</dt>
      <dd>${escapeHtml(value)}</dd>
    </div>
  `).join('');
}

function setDiagnosticsOpen(open) {
  if (!els.diagnosticsPanel) return;
  els.diagnosticsPanel.hidden = !open;
  if (open) {
    updateDiagnostics();
    diagnosticsInterval = window.setInterval(updateDiagnostics, 1000);
    window.requestAnimationFrame(() => els.diagnosticsClose?.focus({ preventScroll: true }));
  } else {
    window.clearInterval(diagnosticsInterval);
    diagnosticsInterval = null;
  }
}

function registerDiagnosticsTap() {
  diagnosticsTapCount += 1;
  window.clearTimeout(diagnosticsTapTimer);
  diagnosticsTapTimer = window.setTimeout(() => {
    diagnosticsTapCount = 0;
  }, 2200);

  if (diagnosticsTapCount >= 7) {
    diagnosticsTapCount = 0;
    setDiagnosticsOpen(els.diagnosticsPanel?.hidden);
  }
}

function bindDiagnostics() {
  els.diagnosticsHotspot?.addEventListener('click', registerDiagnosticsTap);
  els.diagnosticsClose?.addEventListener('click', () => setDiagnosticsOpen(false));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !els.diagnosticsPanel?.hidden) {
      setDiagnosticsOpen(false);
      return;
    }
    if (event.key.toLowerCase() === 'd' && event.altKey && event.shiftKey) {
      event.preventDefault();
      setDiagnosticsOpen(els.diagnosticsPanel?.hidden);
    }
  });
  window.addEventListener('resize', () => {
    if (!els.diagnosticsPanel?.hidden) updateDiagnostics();
  });
}

function bindEvents() {
  AttractorMode.init();
  els.skipLink?.addEventListener('click', (event) => {
    if (!state.isAttractorActive) return;
    event.preventDefault();
    AttractorMode.deactivate();
    window.requestAnimationFrame(() => scrollToElement(document.querySelector('#walk-years')));
  });
  els.reset?.addEventListener('click', () => clearAllCorridorFilters());
  els.startOver?.addEventListener('click', () => startOver());
  els.kioskEnter.addEventListener('click', enterCorridor);
  els.presentationMode?.addEventListener('click', togglePresentationMode);
  document.addEventListener('fullscreenchange', updatePresentationButton);
  els.classTrayToggle?.addEventListener('click', () => setClassTrayOpen(els.classTray?.hidden));
  els.classYear?.addEventListener('input', (event) => syncClassYear(event.target.value));
  els.classYearGo?.addEventListener('click', jumpToClassYear);
  els.classYearBack?.addEventListener('click', () => nudgeClassYear(-1));
  els.classYearForward?.addEventListener('click', () => nudgeClassYear(1));
  els.classYearClear?.addEventListener('click', () => clearAllCorridorFilters());
  window.addEventListener('scroll', () => {
    if (window.performance.now() - classTrayOpenedAt < 650) return;
    if (!els.classTray?.hidden) setClassTrayOpen(false);
  }, { passive: true });
  els.walkButtons.forEach((button) => {
    button.addEventListener('click', () => walkCorridor(button.dataset.walk));
  });
  els.corridorPan.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') walkCorridor('left');
    if (event.key === 'ArrowRight') walkCorridor('right');
  });
  els.corridorPan.addEventListener('scroll', queueCorridorEdgeUpdate, { passive: true });
  bindCorridorDrag();

  document.addEventListener('click', (event) => {
    closeClassTrayFromOutside(event);

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

    const clearFilter = event.target.closest('[data-clear-filter]');
    if (clearFilter) {
      clearCorridorFilter(clearFilter.dataset.clearFilter);
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

    const longArgumentYear = event.target.closest('[data-long-year]');
    if (longArgumentYear) {
      state.longArgumentYear = String(longArgumentYear.dataset.longYear);
      state.longArgumentEra = 'all';
      applyState({ year: state.longArgumentYear });
      return;
    }

    const longArgumentEra = event.target.closest('[data-long-era]');
    if (longArgumentEra) {
      state.longArgumentYear = '';
      state.longArgumentEra = longArgumentEra.dataset.longEra || 'all';
      renderLongArgument();
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

  document.querySelectorAll('[data-guess]').forEach((button) => {
    button.addEventListener('click', () => {
      if (state.gameRevealed) return;
      state.gameKindGuess = button.dataset.guess;
      updateGameChoiceSelection();
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

  window.addEventListener('resize', () => {
    window.requestAnimationFrame(() => {
      renderAll();
      renderNetwork();
    });
    queueCorridorEdgeUpdate();
  });
  bindMemoryRail();
  bindIdleReset();
  bindDiagnostics();
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
    state.attractorPool = buildAttractorPool();
    state.stringGraph = buildStringGraph();
    state.selectedStringTheme = state.stringGraph.topThemes[0]?.id || '';

    bindEvents();
    filterRecords();
    renderAll();
    renderNetwork();
    makeGameCard();
    updateCorridorEdgeButtons();
    AttractorMode.activate({ resetScroll: false, focusEntry: false });
    installLocalTestHooks();
  } catch (error) {
    console.error(error);
    els.currentSummary.textContent = 'The exhibit data failed to load. Check that the JSON files are in /public/data/.';
  }
}

init();
