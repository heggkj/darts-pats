const DATA_URL = '/data/town_gown_exhibit_records_enriched.json';
const SUMMARY_URL = '/data/town_gown_exhibit_analysis_summary.json';

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

const state = {
  records: [],
  summary: null,
  filtered: [],
  year: 'all',
  era: 'all',
  topic: 'all',
  kind: 'all',
  search: '',
  gameRecord: null,
  gameKindGuess: '',
  gameTopicGuess: '',
  activeRecordId: null,
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
  drawer: document.querySelector('#record-drawer'),
  drawerContent: document.querySelector('#drawer-content'),
  shelf: document.querySelector('#reading-shelf'),
  networkBoard: document.querySelector('#network-board'),
  networkEdges: document.querySelector('#network-edges'),
  networkNodes: document.querySelector('#network-nodes'),
  gameText: document.querySelector('#game-text'),
  gameResult: document.querySelector('#game-result'),
  gameRelated: document.querySelector('#game-related'),
  gameTopicGuess: document.querySelector('#game-topic-guess'),
  revealGameCard: document.querySelector('#reveal-game-card'),
  newGameCard: document.querySelector('#new-game-card'),
};

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
  state.filtered = state.records.filter((record) => {
    const yearOk = state.year === 'all' || String(record.year) === state.year;
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
}

function applyState(patch = {}) {
  Object.assign(state, patch);
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
  if (state.year !== 'all') titleParts.push(state.year);
  if (state.era !== 'all') titleParts.push(state.era);
  if (state.topic !== 'all') titleParts.push(getTopicLabel(state.topic));
  if (state.kind !== 'all') titleParts.push(getKindLabel(state.kind));

  els.currentTitle.textContent = titleParts.length ? titleParts.join(' / ') : 'All town-gown Darts & Pats';
  els.currentSummary.textContent = `Showing ${total} ${pluralize(total, 'record')} from The Breeze: ${darts} ${pluralize(darts, 'Dart')} and ${pats} ${pluralize(pats, 'Pat')}. The hallway mood is ${mood}${state.search ? ` for “${state.search}”` : ''}.`;
  els.viewMeters.innerHTML = `
    <div class="view-meter"><b>${total}</b><span>openable cards</span></div>
    <div class="view-meter view-meter--dart"><b>${dartShare}%</b><span>Dart share</span></div>
    <div class="view-meter view-meter--pat"><b>${patShare}%</b><span>Pat share</span></div>
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

  els.dartRack.innerHTML = darts.length ? darts.map((record, index) => makeRecordCard(record, { depth: index })).join('') : '<p class="empty-note">No Darts in this view. The wall is listening, which is ominous.</p>';
  els.patRack.innerHTML = pats.length ? pats.map((record, index) => makeRecordCard(record, { depth: index })).join('') : '<p class="empty-note">No Pats in this view. Warmth has left the hallway for a minute.</p>';
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
  els.topicDoors.innerHTML = state.summary.topics.map((topic, index) => {
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

function renderAll() {
  renderStats();
  renderWalls();
  renderTimeline();
  renderTopicDoors();
  renderShelf();
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
      <div class="shelf shelf--related">${records.map((item, index) => makeRecordCard(item, { compact: true, depth: index })).join('')}</div>
    </section>
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
          <button class="button button--small button--ghost" data-drawer-prev="${navigation.previous?.id || ''}" type="button" ${navigation.previous ? '' : 'disabled'}>Previous</button>
          <span>${escapeHtml(positionText)}</span>
          <button class="button button--small button--ghost" data-drawer-next="${navigation.next?.id || ''}" type="button" ${navigation.next ? '' : 'disabled'}>Next</button>
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
  const pool = state.filtered.length ? state.filtered : state.records;
  state.gameRecord = pool[Math.floor(Math.random() * pool.length)];
  state.gameKindGuess = '';
  state.gameTopicGuess = '';
  els.gameText.textContent = state.gameRecord?.text_full || 'No card available.';
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

function networkSelection() {
  const nodes = state.summary.network.nodes;
  const topics = nodes.filter((node) => node.type === 'topic').sort((a, b) => b.count - a.count);
  const entities = nodes.filter((node) => node.type === 'entity').sort((a, b) => b.count - a.count).slice(0, 16);
  const sentiments = nodes.filter((node) => node.type === 'sentiment');
  return [...sentiments, ...topics, ...entities];
}

function computeNetworkPositions(selectedNodes) {
  const positions = new Map();
  const topics = selectedNodes.filter((node) => node.type === 'topic');
  const entities = selectedNodes.filter((node) => node.type === 'entity');

  selectedNodes.filter((node) => node.type === 'sentiment').forEach((node) => {
    positions.set(node.id, node.label === 'DART' ? { x: 17, y: 52 } : { x: 83, y: 52 });
  });

  topics.forEach((node, index) => {
    const angle = (index / topics.length) * Math.PI * 2 - Math.PI / 2;
    positions.set(node.id, {
      x: 50 + Math.cos(angle) * 28,
      y: 50 + Math.sin(angle) * 34,
    });
  });

  entities.forEach((node, index) => {
    const angle = (index / entities.length) * Math.PI * 2 + Math.PI / 8;
    const jitter = (hashLabel(node.label) % 9) - 4;
    positions.set(node.id, {
      x: 50 + Math.cos(angle) * (38 + jitter),
      y: 50 + Math.sin(angle) * (41 - jitter / 2),
    });
  });

  return positions;
}

function renderNetwork() {
  const selectedNodes = networkSelection();
  const selectedIds = new Set(selectedNodes.map((node) => node.id));
  const positions = computeNetworkPositions(selectedNodes);

  els.networkNodes.innerHTML = selectedNodes.map((node) => {
    const position = positions.get(node.id) || { x: 50, y: 50 };
    const tilt = ((hashLabel(node.id) % 9) - 4) / 2;
    return `
      <button class="network-node network-node--${escapeHtml(node.type)}" style="left:${position.x}%;top:${position.y}%;--tilt:${tilt}deg" data-node-id="${escapeHtml(node.id)}" data-node-label="${escapeHtml(node.label)}" data-node-type="${escapeHtml(node.type)}" type="button" title="${escapeHtml(node.label)} · ${node.count} records">
        ${escapeHtml(node.label)}
      </button>
    `;
  }).join('');

  const rect = els.networkBoard.getBoundingClientRect();
  const width = rect.width || 1000;
  const height = rect.height || 600;
  els.networkEdges.setAttribute('viewBox', `0 0 ${width} ${height}`);

  const edges = state.summary.network.edges
    .filter((edge) => selectedIds.has(edge.source) && selectedIds.has(edge.target))
    .sort((a, b) => a.count - b.count);

  els.networkEdges.innerHTML = edges.map((edge) => {
    const source = positions.get(edge.source);
    const target = positions.get(edge.target);
    if (!source || !target) return '';
    const x1 = (source.x / 100) * width;
    const y1 = (source.y / 100) * height;
    const x2 = (target.x / 100) * width;
    const y2 = (target.y / 100) * height;
    const strokeWidth = Math.min(8, 1 + Math.sqrt(edge.count) * 0.58);
    const opacity = Math.min(0.62, 0.14 + edge.count / 140);
    return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#450084" stroke-width="${strokeWidth}" stroke-opacity="${opacity}" />`;
  }).join('');
}

function handleNetworkClick(event) {
  const node = event.target.closest('.network-node');
  if (!node) return;
  const type = node.dataset.nodeType;
  const label = node.dataset.nodeLabel;
  const id = node.dataset.nodeId;

  if (type === 'sentiment') {
    applyState({ kind: label === 'DART' ? 'DART' : 'PAT' });
    document.querySelector('#corridor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (type === 'topic') {
    const topic = state.summary.topics.find((item) => `topic:${item.label}` === id || item.label === label);
    if (topic) applyState({ topic: topic.topic });
    document.querySelector('#corridor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    return;
  }

  if (type === 'entity') {
    applyState({ search: label });
    document.querySelector('#corridor')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function bindEvents() {
  els.year.addEventListener('change', (event) => applyState({ year: event.target.value }));
  els.era.addEventListener('change', (event) => applyState({ era: event.target.value }));
  els.topic.addEventListener('change', (event) => applyState({ topic: event.target.value }));
  els.kind.addEventListener('change', (event) => applyState({ kind: event.target.value }));
  els.search.addEventListener('input', (event) => applyState({ search: event.target.value }));
  els.reset.addEventListener('click', () => applyState({ year: 'all', era: 'all', topic: 'all', kind: 'all', search: '' }));

  document.addEventListener('click', (event) => {
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
