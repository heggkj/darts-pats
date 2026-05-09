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
  return clean.length > length ? `${clean.slice(0, length - 1)}…` : clean;
}

function normalize(value = '') {
  return String(value).toLowerCase().normalize('NFKD');
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
  });
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
  els.topic.innerHTML = '<option value="all">All topics</option>' + topics.map((topic) => `<option value="${escapeHtml(topic.topic)}">${escapeHtml(topic.label)} · ${topic.count}</option>`).join('');
}

function renderStats() {
  const total = state.filtered.length;
  const darts = state.filtered.filter((record) => record.kind === 'DART').length;
  const pats = state.filtered.filter((record) => record.kind === 'PAT').length;
  const patShare = total ? Math.round((pats / total) * 100) : 0;
  const dartShare = total ? Math.round((darts / total) * 100) : 0;

  const titleParts = [];
  if (state.year !== 'all') titleParts.push(state.year);
  if (state.era !== 'all') titleParts.push(state.era);
  if (state.topic !== 'all') titleParts.push(getTopicLabel(state.topic));
  if (state.kind !== 'all') titleParts.push(getKindLabel(state.kind));

  els.currentTitle.textContent = titleParts.length ? titleParts.join(' / ') : 'All town-gown Darts & Pats';
  els.currentSummary.textContent = `Showing ${total} ${pluralize(total, 'record')} from The Breeze. This view contains ${darts} ${pluralize(darts, 'Dart')} and ${pats} ${pluralize(pats, 'Pat')}${state.search ? ` matching “${state.search}”` : ''}.`;
  els.viewMeters.innerHTML = `
    <div class="view-meter"><b>${total}</b><span>records</span></div>
    <div class="view-meter"><b>${dartShare}%</b><span>Dart share</span></div>
    <div class="view-meter"><b>${patShare}%</b><span>Pat share</span></div>
  `;
}

function makeRecordCard(record, compact = false) {
  const kindClass = record.kind === 'PAT' ? 'record-card--pat' : 'record-card--dart';
  const emoji = record.kind === 'PAT' ? '🤲' : '🎯';
  const tilt = ((record.id * 17) % 9) - 4;
  return `
    <button class="record-card ${kindClass}" style="--tilt: ${tilt / 2}deg" data-record-id="${record.id}" type="button">
      <span class="record-card__meta">
        <span class="record-card__kind">${emoji} ${escapeHtml(record.kind)}</span>
        <time datetime="${escapeHtml(record.date || '')}">${escapeHtml(formatDate(record.date))}</time>
      </span>
      <span class="record-card__topic">${escapeHtml(record.primary_topic_label || 'Town-gown moment')}</span>
      <span class="record-card__text">${escapeHtml(shorten(record.text_full, compact ? 150 : 230))}</span>
    </button>
  `;
}

function renderWalls() {
  const darts = state.filtered.filter((record) => record.kind === 'DART').sort((a, b) => String(a.date).localeCompare(String(b.date)));
  const pats = state.filtered.filter((record) => record.kind === 'PAT').sort((a, b) => String(a.date).localeCompare(String(b.date)));

  els.dartRack.innerHTML = darts.length ? darts.map((record) => makeRecordCard(record)).join('') : '<p class="empty-note">No Darts in this view.</p>';
  els.patRack.innerHTML = pats.length ? pats.map((record) => makeRecordCard(record)).join('') : '<p class="empty-note">No Pats in this view.</p>';
}

function renderTimeline() {
  const maxCount = Math.max(...state.summary.yearly.map((year) => year.count));
  els.timeline.innerHTML = state.summary.yearly.map((year) => {
    const isActive = state.year === String(year.year);
    const patAlpha = 0.16 + (year.pat_share * 0.66);
    const dartAlpha = 0.16 + (year.dart_share * 0.54);
    const scale = 0.72 + (year.count / maxCount) * 0.98;
    return `
      <button class="year-tile ${isActive ? 'is-active' : ''}" data-year="${year.year}" style="--pat-alpha:${patAlpha};--dart-alpha:${dartAlpha};min-height:${4.3 * scale}rem" type="button" title="${year.year}: ${year.count} records; ${year.darts} Darts, ${year.pats} Pats">
        <small>${year.year}</small>
        <span>${year.count}</span>
      </button>
    `;
  }).join('');
}

function renderTopicDoors() {
  els.topicDoors.innerHTML = state.summary.topics.map((topic) => {
    const active = state.topic === topic.topic;
    const icon = topicIcons[topic.topic] || topicIcons.other_unspecified;
    const patShare = Math.round((topic.pat_share || 0) * 100);
    return `
      <button class="topic-door ${active ? 'is-active' : ''}" style="--icon-url:url('${icon}');--pat-share:${patShare}%" data-topic="${escapeHtml(topic.topic)}" type="button">
        <strong>${escapeHtml(topic.label)}</strong>
        <span>${topic.count} records · ${topic.darts} D / ${topic.pats} P</span>
        <span class="topic-door__ratio" aria-hidden="true"><i></i></span>
      </button>
    `;
  }).join('');
}

function renderShelf() {
  const mixed = [...state.filtered].sort((a, b) => {
    const intensity = (b.tone_intensity || 0) - (a.tone_intensity || 0);
    return intensity || String(a.date).localeCompare(String(b.date));
  }).slice(0, 9);
  els.shelf.innerHTML = mixed.length ? mixed.map((record) => makeRecordCard(record, true)).join('') : '<p class="empty-note">No readable cards in this filter yet.</p>';
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

function renderDrawer(record) {
  const kindIsPat = record.kind === 'PAT';
  const related = state.records
    .filter((candidate) => candidate.id !== record.id && (candidate.primary_topic === record.primary_topic || candidate.year === record.year))
    .sort((a, b) => {
      const sameTopicA = a.primary_topic === record.primary_topic ? 0 : 1;
      const sameTopicB = b.primary_topic === record.primary_topic ? 0 : 1;
      return sameTopicA - sameTopicB || String(a.date).localeCompare(String(b.date));
    })
    .slice(0, 4);

  els.drawerContent.innerHTML = `
    <article class="drawer-card ${kindIsPat ? 'drawer-card--pat' : 'drawer-card--dart'}">
      <span class="drawer-card__badge ${kindIsPat ? 'drawer-card__badge--pat' : ''}">${kindIsPat ? '🤲 PAT' : '🎯 DART'} · ${escapeHtml(formatDate(record.date))}</span>
      <h2 id="drawer-title">${escapeHtml(record.primary_topic_label || 'Town-gown note')}</h2>
      <blockquote>${escapeHtml(record.text_full)}</blockquote>
      <dl class="drawer-meta">
        <div><dt>Date</dt><dd>${escapeHtml(formatDate(record.date))}</dd></div>
        <div><dt>Era</dt><dd>${escapeHtml(record.era || 'Unknown')}</dd></div>
        <div><dt>Topic</dt><dd>${escapeHtml(record.primary_topic_label || 'Unknown')}</dd></div>
        <div><dt>Entities</dt><dd>${escapeHtml((record.entities || []).join(', ') || 'None tagged')}</dd></div>
        <div><dt>Target</dt><dd>${escapeHtml(record.target_short || record.target_long || 'Not parsed')}</dd></div>
        <div><dt>Sender</dt><dd>${escapeHtml(record.sender_short || record.sender_long || 'Not parsed')}</dd></div>
        <div><dt>Source</dt><dd>${escapeHtml(sourceLine(record))}</dd></div>
        <div><dt>Record ID</dt><dd>${escapeHtml(record.id)}</dd></div>
      </dl>
      <div class="pills" aria-label="Topic tags">
        ${(record.topic_tag_labels || []).map((label) => `<span class="pill">${escapeHtml(label)}</span>`).join('')}
      </div>
      ${related.length ? `
        <h3 style="margin-top:1.3rem;font-size:1.35rem;">Nearby cards</h3>
        <div class="shelf">${related.map((item) => makeRecordCard(item, true)).join('')}</div>
      ` : ''}
    </article>
  `;

  if (typeof els.drawer.showModal === 'function') {
    els.drawer.showModal();
  } else {
    els.drawer.setAttribute('open', 'open');
  }
}

function findRecord(id) {
  return state.records.find((record) => String(record.id) === String(id));
}

function makeGameCard() {
  const pool = state.filtered.length ? state.filtered : state.records;
  state.gameRecord = pool[Math.floor(Math.random() * pool.length)];
  els.gameText.textContent = state.gameRecord?.text_full || 'No card available.';
  els.gameResult.textContent = 'Choose a side. No points. Just interpretation.';
}

function revealGameGuess(guess) {
  const record = state.gameRecord;
  if (!record) return;
  const same = guess === record.kind;
  const verdict = same ? 'You matched the published form.' : 'Good tension: your reading differs from the published form.';
  els.gameResult.innerHTML = `${verdict} It appeared as a <strong>${record.kind}</strong> on ${escapeHtml(formatDate(record.date))}, tagged here as <strong>${escapeHtml(record.primary_topic_label)}</strong>. <button class="button button--small button--ghost" data-record-id="${record.id}" type="button">Open this card</button>`;
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
    const recordButton = event.target.closest('[data-record-id]');
    if (recordButton) {
      const record = findRecord(recordButton.dataset.recordId);
      if (record) renderDrawer(record);
    }

    const yearTile = event.target.closest('[data-year]');
    if (yearTile) applyState({ year: String(yearTile.dataset.year) });

    const topicDoor = event.target.closest('[data-topic]');
    if (topicDoor) applyState({ topic: topicDoor.dataset.topic });
  });

  els.networkNodes.addEventListener('click', handleNetworkClick);
  els.newGameCard.addEventListener('click', makeGameCard);
  document.querySelectorAll('[data-guess]').forEach((button) => {
    button.addEventListener('click', () => revealGameGuess(button.dataset.guess));
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
    }));
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
