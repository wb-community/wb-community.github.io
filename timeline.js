(function() {
    const state = {
        entries: [],
        filter: 'all',
        query: '',
        newestFirst: true
    };

    const els = {};

    document.addEventListener('DOMContentLoaded', function() {
        els.stream = document.getElementById('timelineStream');
        els.highlights = document.getElementById('timelineHighlights');
        els.years = document.getElementById('timelineYears');
        els.stats = document.getElementById('timelineStats');
        els.search = document.getElementById('timelineSearch');
        els.filters = Array.from(document.querySelectorAll('.timeline-filter'));

        if (!els.stream) {
            return;
        }

        bindTimelineControls();
        loadTimeline();
    });

    function bindTimelineControls() {
        els.search.addEventListener('input', function(event) {
            state.query = event.target.value.trim().toLowerCase();
            renderTimeline();
        });

        els.search.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                els.search.value = '';
                state.query = '';
                renderTimeline();
            }
        });

        els.filters.forEach(button => {
            button.addEventListener('click', function() {
                state.filter = button.dataset.filter;
                els.filters.forEach(item => item.classList.toggle('active', item === button));
                renderTimeline();
            });
        });
    }

    async function loadTimeline() {
        try {
            const response = await fetch('data/timeline.json');
            if (!response.ok) {
                throw new Error(`Timeline data request failed: ${response.status}`);
            }
            const data = await response.json();
            state.entries = normalizeEntries(data.entries || []);
            renderTimeline();
        } catch (error) {
            els.stream.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">[ ! ]</div>
                    <div class="no-results-text">Timeline data could not be loaded.</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">${escapeHtml(error.message)}</div>
                </div>
            `;
        }
    }

    function normalizeEntries(entries) {
        return entries
            .map(entry => ({
                ...entry,
                sortTime: Date.parse(entry.releaseDate || '') || 0,
                year: (entry.releaseDate || 'Unknown').slice(0, 4),
                monthKey: (entry.releaseDate || 'Unknown').slice(0, 7)
            }))
            .sort((a, b) => b.sortTime - a.sortTime || a.title.localeCompare(b.title));
    }

    function renderTimeline() {
        const visible = getFilteredEntries();
        renderStats(visible);
        renderHighlights(visible);
        renderYears(visible);
        renderStream(visible);
    }

    function getFilteredEntries() {
        return state.entries.filter(entry => {
            if (!passesFilter(entry)) {
                return false;
            }

            if (!state.query) {
                return true;
            }

            const searchText = [
                entry.title,
                entry.description,
                entry.releaseDate,
                entry.type,
                entry.priority,
                ...(entry.tags || []),
                ...flattenContent(entry.content)
            ].join(' ').toLowerCase();

            return searchText.includes(state.query);
        });
    }

    function passesFilter(entry) {
        if (state.filter === 'all') {
            return true;
        }

        if (state.filter === 'high') {
            return entry.priority === 'high';
        }

        if (['map', 'weapon'].includes(state.filter)) {
            return hasTag(entry, `${state.filter}_release`);
        }

        if (state.filter === 'event') {
            return entry.type === 'event' || hasTag(entry, 'event') || hasTag(entry, 'official_event');
        }

        return entry.type === state.filter;
    }

    function renderStats(visible) {
        const years = new Set(visible.map(entry => entry.year));
        const highCount = visible.filter(entry => entry.priority === 'high').length;
        els.stats.innerHTML = `
            <div><strong>${visible.length}</strong><span>Entries</span></div>
            <div><strong>${highCount}</strong><span>High Priority</span></div>
            <div><strong>${years.size}</strong><span>Years</span></div>
        `;
    }

    function renderHighlights(visible) {
        const highlights = visible
            .filter(entry => entry.priority === 'high')
            .slice(0, 4);

        if (highlights.length === 0) {
            els.highlights.innerHTML = '<div class="timeline-empty-note">No priority entries match the current filter.</div>';
            return;
        }

        els.highlights.innerHTML = highlights.map(entry => `
            <button class="timeline-highlight-card" type="button" data-entry-id="${escapeHtml(entry.id)}">
                <span>${formatDate(entry.releaseDate)}</span>
                <strong>${escapeHtml(entry.title)}</strong>
                <small>${labelForType(entry)}</small>
            </button>
        `).join('');

        els.highlights.querySelectorAll('.timeline-highlight-card').forEach(card => {
            card.addEventListener('click', function() {
                const target = document.getElementById(`entry-${card.dataset.entryId}`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    const details = target.querySelector('.timeline-entry-details');
                    const toggle = target.querySelector('.timeline-entry-toggle');
                    if (details && toggle && !details.classList.contains('visible')) {
                        setEntryExpanded(details, toggle, true);
                    }
                }
            });
        });
    }

    function renderYears(visible) {
        const counts = new Map();
        visible.forEach(entry => counts.set(entry.year, (counts.get(entry.year) || 0) + 1));
        const years = Array.from(counts.keys()).sort((a, b) => Number(b) - Number(a));

        els.years.innerHTML = years.map(year => `
            <button type="button" class="timeline-year-link" data-year="${escapeHtml(year)}">
                <span>${escapeHtml(year)}</span>
                <strong>${counts.get(year)}</strong>
            </button>
        `).join('');

        els.years.querySelectorAll('.timeline-year-link').forEach(button => {
            button.addEventListener('click', function() {
                const target = document.getElementById(`year-${button.dataset.year}`);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            });
        });
    }

    function renderStream(visible) {
        if (visible.length === 0) {
            els.stream.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">[ / ]</div>
                    <div class="no-results-text">No timeline entries match.</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">Try another filter or search term.</div>
                </div>
            `;
            return;
        }

        const byYear = groupBy(visible, entry => entry.year);
        const years = Object.keys(byYear).sort((a, b) => Number(b) - Number(a));

        els.stream.innerHTML = years.map(year => {
            const entries = byYear[year];
            const byMonth = groupBy(entries, entry => entry.monthKey);
            const months = Object.keys(byMonth).sort((a, b) => b.localeCompare(a));

            return `
                <section class="timeline-year-section" id="year-${escapeHtml(year)}">
                    <div class="timeline-year-heading">
                        <h2>${escapeHtml(year)}</h2>
                        <span>${entries.length} ${entries.length === 1 ? 'entry' : 'entries'}</span>
                    </div>
                    ${months.map(month => renderMonthGroup(month, byMonth[month])).join('')}
                </section>
            `;
        }).join('');

        els.stream.querySelectorAll('.timeline-entry-toggle').forEach(button => {
            button.addEventListener('click', function() {
                const details = button.closest('.timeline-entry').querySelector('.timeline-entry-details');
                setEntryExpanded(details, button, !details.classList.contains('visible'));
            });
        });
    }

    function renderMonthGroup(monthKey, entries) {
        return `
            <section class="timeline-month">
                <div class="timeline-month-label">
                    <span>${escapeHtml(formatMonth(monthKey))}</span>
                    <strong>${entries.length}</strong>
                </div>
                <div class="timeline-entry-list">
                    ${entries.map(renderEntry).join('')}
                </div>
            </section>
        `;
    }

    function renderEntry(entry) {
        const showImage = shouldShowImage(entry);
        const images = getEntryImages(entry);
        const detailClass = showImage ? 'has-media' : 'no-media';
        const eventBadge = entry.type !== 'event' && hasTag(entry, 'event')
            ? '<span class="timeline-badge event-badge">Event</span>'
            : '';
        return `
            <article class="timeline-entry priority-${escapeHtml(entry.priority)} type-${escapeHtml(entry.type)}" id="entry-${escapeHtml(entry.id)}">
                <button class="timeline-entry-toggle" type="button" aria-expanded="false">
                    <span class="timeline-entry-date">${escapeHtml(formatDay(entry.releaseDate))}</span>
                    <span class="timeline-entry-main">
                        <span class="timeline-entry-title">${escapeHtml(entry.title)}</span>
                        <span class="timeline-entry-summary">${escapeHtml(entry.description || '')}</span>
                    </span>
                    <span class="timeline-entry-badges">
                        <span class="timeline-badge">${escapeHtml(labelForType(entry))}</span>
                        ${eventBadge}
                        ${entry.priority === 'high' ? '<span class="timeline-badge priority-badge">Priority</span>' : ''}
                    </span>
                </button>
                <div class="timeline-entry-details ${detailClass}">
                    ${showImage ? `
                        <div class="timeline-entry-media-grid">
                            ${images.map(image => `
                                <figure class="timeline-entry-media">
                                    <img src="${escapeHtml(image.url)}" alt="${escapeHtml(image.alt || entry.title)}" loading="lazy">
                                </figure>
                            `).join('')}
                        </div>
                    ` : ''}
                    <div class="timeline-entry-body">
                        <p>${escapeHtml(entry.description || '')}</p>
                        ${renderReleaseItems(entry)}
                        ${renderContent(entry)}
                        ${renderTags(entry)}
                    </div>
                </div>
            </article>
        `;
    }

    function renderContent(entry) {
        const items = flattenContent(entry.content).slice(0, 12);
        if (items.length === 0) {
            return '';
        }

        return `
            <ul class="timeline-content-list">
                ${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}
            </ul>
        `;
    }

    function renderReleaseItems(entry) {
        const items = entry.releaseItems || [];
        if (items.length === 0) {
            return '';
        }

        return `
            <div class="timeline-release-items" aria-label="Release items">
                ${items.map(item => `
                    <span>
                        <small>${escapeHtml(labelForReleaseKind(item.kind))}</small>
                        ${escapeHtml(item.name)}
                    </span>
                `).join('')}
            </div>
        `;
    }

    function renderTags(entry) {
        const tags = (entry.tags || []).filter(tag => tag !== 'update');
        if (tags.length === 0) {
            return '';
        }

        return `
            <div class="timeline-tags">
                ${tags.slice(0, 8).map(tag => `<span>${escapeHtml(tag.replace(/_/g, ' '))}</span>`).join('')}
            </div>
        `;
    }

    function shouldShowImage(entry) {
        const images = getEntryImages(entry);
        if (images.length === 0) {
            return false;
        }

        if (entry.type === 'community_project') {
            return true;
        }

        const tags = entry.tags || [];
        return entry.type === 'version_update' && entry.priority === 'high' && (tags.includes('map_release') || tags.includes('weapon_release'));
    }

    function getEntryImages(entry) {
        if (Array.isArray(entry.images) && entry.images.length > 0) {
            return entry.images.filter(image => image && image.url);
        }

        if (entry.image && entry.image.url) {
            return [entry.image];
        }

        return [];
    }

    function hasTag(entry, tag) {
        return (entry.tags || []).includes(tag);
    }

    function setEntryExpanded(details, toggle, expanded) {
        details.classList.toggle('visible', expanded);
        toggle.setAttribute('aria-expanded', String(expanded));
    }

    function flattenContent(content) {
        if (!content) {
            return [];
        }

        if (typeof content === 'string') {
            return [content];
        }

        return content
            .map(item => {
                if (typeof item === 'string') {
                    return item;
                }
                if (item && typeof item === 'object') {
                    return item.content || item.text || '';
                }
                return '';
            })
            .filter(Boolean);
    }

    function groupBy(items, getKey) {
        return items.reduce((acc, item) => {
            const key = getKey(item);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {});
    }

    function labelForType(entry) {
        const labels = {
            version_update: 'Update',
            event: 'Event',
            community_project: 'Project'
        };
        return labels[entry.type] || entry.type;
    }

    function labelForReleaseKind(kind) {
        const labels = {
            map: 'Map',
            map_update: 'Map update',
            weapon: 'Weapon',
            mode: 'Mode',
            vehicle: 'Vehicle',
            platform: 'Platform',
            feature: 'Feature'
        };
        return labels[kind] || kind;
    }

    function formatDate(value) {
        const date = parseDate(value);
        if (!date) {
            return value || 'Unknown';
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function formatMonth(value) {
        const date = parseDate(`${value}-01`);
        if (!date) {
            return value || 'Unknown';
        }
        return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }

    function formatDay(value) {
        const date = parseDate(value);
        if (!date) {
            return value || '--';
        }
        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }

    function parseDate(value) {
        if (!value) {
            return null;
        }
        const timestamp = Date.parse(`${value}T00:00:00`);
        return Number.isNaN(timestamp) ? null : new Date(timestamp);
    }

    function cssEscape(value) {
        if (window.CSS && CSS.escape) {
            return CSS.escape(value);
        }
        return value.replace(/[^a-zA-Z0-9_-]/g, '\\\\$&');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text == null ? '' : String(text);
        return div.innerHTML;
    }
})();
