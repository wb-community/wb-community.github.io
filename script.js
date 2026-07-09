document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const projectsGrid = document.getElementById('projectsGrid');
    const filterInfo = document.getElementById('filterInfo');
    const themeToggle = document.getElementById('themeToggle');

    // Theme logic
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            let theme = document.documentElement.getAttribute('data-theme');
            if (theme === 'dark') {
                document.documentElement.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }

    if (!searchInput || !projectsGrid || !filterInfo || typeof projects === 'undefined') {
        return;
    }

    function renderProjects(filteredProjects) {
        projectsGrid.innerHTML = '';

        if (filteredProjects.length === 0) {
            projectsGrid.innerHTML = `
                <div class="no-results">
                    <div class="no-results-icon">[ / ]</div>
                    <div class="no-results-text">No projects found matching your search.</div>
                    <div style="font-size: 13px; color: var(--text-secondary);">Try adjusting your search terms or browse all categories.</div>
                </div>
            `;
            return;
        }

        const groupedByCategory = {};
        filteredProjects.forEach(project => {
            if (!groupedByCategory[project.category]) {
                groupedByCategory[project.category] = [];
            }
            groupedByCategory[project.category].push(project);
        });

        Object.keys(groupedByCategory).forEach(category => {
            const categorySection = createCategorySection(category, groupedByCategory[category]);
            projectsGrid.appendChild(categorySection);
        });
    }

    function createCategorySection(category, projects) {
        const section = document.createElement('div');
        section.className = 'category-section';
        
        const categoryColor = getCategoryColor(category);
        section.style.setProperty('--category-color', categoryColor);

        const header = document.createElement('div');
        header.className = 'category-header';
        
        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category;

        const count = document.createElement('span');
        count.className = 'category-count';
        count.textContent = `${projects.length} ${projects.length === 1 ? 'entry' : 'entries'}`;
        
        const toggle = document.createElement('div');
        toggle.className = 'category-toggle';
        toggle.textContent = '−';
        
        header.appendChild(title);
        header.appendChild(count);
        header.appendChild(toggle);
        
        const projectsContainer = document.createElement('div');
        projectsContainer.className = 'category-projects visible';
        
        sortProjectsByStatus(projects).forEach(project => {
            const card = createProjectCard(project);
            projectsContainer.appendChild(card);
        });
        
        header.addEventListener('click', function() {
            projectsContainer.classList.toggle('visible');
            toggle.textContent = projectsContainer.classList.contains('visible') ? '−' : '+';
        });
        
        section.appendChild(header);
        section.appendChild(projectsContainer);
        
        return section;
    }

    function getCategoryColor(category) {
        const colors = {
            'WB Stats Sites': '#c9482f',
            'WB Discord Bots': '#4f7f90',
            'WB APIs & Endpoints': '#5d7a36',
            'WB Mods': '#d59b2d',
            'WB Tools & Utilities': '#8a5a2b',
            'WB Community Sites': '#b5526c'
        };
        return colors[category] || '#566c7a';
    }

    function sortProjectsByStatus(projects) {
        const statusOrder = {
            active: 0,
            maintenance: 1,
            removed: 2
        };

        return [...projects].sort((a, b) => {
            const aRank = statusOrder[a.status.toLowerCase()] ?? 99;
            const bRank = statusOrder[b.status.toLowerCase()] ?? 99;

            if (aRank !== bRank) {
                return aRank - bRank;
            }

            return a.name.localeCompare(b.name);
        });
    }

    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-category', project.category);

        const statusClass = `status-${project.status.toLowerCase()}`;
        const categoryColor = getCategoryColor(project.category);
        card.style.setProperty('--category-color', categoryColor);
        
        const githubMeta = getGitHubMeta(project);
        
        let imageElement;
        if (githubMeta) {
            imageElement = `
                <div class="project-image github-card" aria-label="${escapeHtml(githubMeta.label)}">
                    <div class="github-preview">
                        <svg class="github-mark" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
                            <path d="M8 .2a8 8 0 0 0-2.5 15.6c.4.1.5-.2.5-.4v-1.4c-2.2.5-2.7-1-2.7-1-.4-.9-.9-1.1-.9-1.1-.7-.5.1-.5.1-.5.8.1 1.2.8 1.2.8.7 1.2 1.8.8 2.3.6.1-.5.3-.8.5-1-1.8-.2-3.6-.9-3.6-3.9 0-.9.3-1.6.8-2.2-.1-.2-.4-1 .1-2.1 0 0 .7-.2 2.2.8A7.7 7.7 0 0 1 8 3.7c.7 0 1.3.1 2 .3 1.5-1 2.2-.8 2.2-.8.4 1.1.2 1.9.1 2.1.5.6.8 1.3.8 2.2 0 3-1.8 3.7-3.6 3.9.3.3.5.7.5 1.5v2.4c0 .2.1.5.5.4A8 8 0 0 0 8 .2Z"></path>
                        </svg>
                        <div>
                            <span class="github-label">GitHub repository</span>
                            <strong>${escapeHtml(project.name)}</strong>
                            <span>${escapeHtml(githubMeta.repoPath)}</span>
                        </div>
                    </div>
                </div>
            `;
        } else if (!project.image) {
            imageElement = `<div class="project-image placeholder-box"><span class="image-placeholder">[ IMAGE PLACEHOLDER ]</span></div>`;
        } else {
            imageElement = `<div class="project-image"><img src="${project.image}" alt="${project.name}" loading="lazy" /></div>`;
        }
        
        let urlHost = '';
        try {
            if (project.link) {
                urlHost = new URL(project.link).hostname;
            }
        } catch (e) {
            urlHost = project.link;
        }
        
        const linkHtml = project.link ? `<a href="${project.link}" target="_blank" rel="noopener noreferrer" class="project-link" title="${project.link}">${escapeHtml(urlHost)}</a>` : '';
        
        card.innerHTML = `
            ${imageElement}
            <div class="project-header">
                <h3 class="project-title">${escapeHtml(project.name)}</h3>
                <span class="project-category">${escapeHtml(project.category)}</span>
            </div>
            <div class="project-meta">
                <span class="project-status ${statusClass}">${escapeHtml(project.status)}</span>
                <span class="project-creator">By ${escapeHtml(project.creator)}</span>
            </div>
            <p class="project-description">${escapeHtml(project.shortDescription)}</p>
            <div class="project-details" data-project-id="${project.id}">
                <p>${escapeHtml(project.details)}</p>
            </div>
            <div class="project-footer">
                <button class="toggle-details" data-project-id="${project.id}">Details</button>
                ${linkHtml}
            </div>
        `;

        const toggleBtn = card.querySelector('.toggle-details');
        const detailsDiv = card.querySelector('.project-details');

        toggleBtn.addEventListener('click', function() {
            detailsDiv.classList.toggle('visible');
            toggleBtn.textContent = detailsDiv.classList.contains('visible') ? 'Hide' : 'Details';
        });

        return card;
    }

    function getGitHubMeta(project) {
        let repoPath = '';

        try {
            if (project.link) {
                const linkUrl = new URL(project.link);
                if (linkUrl.hostname === 'github.com' || linkUrl.hostname.endsWith('.github.com')) {
                    repoPath = linkUrl.pathname.replace(/^\/+/, '').split('/').slice(0, 2).join('/');
                }
            }

            if (!repoPath && project.image && project.image.includes('github-readme-stats')) {
                const imageUrl = new URL(project.image);
                const owner = imageUrl.searchParams.get('username');
                const repo = imageUrl.searchParams.get('repo');
                if (owner && repo) {
                    repoPath = `${owner}/${repo}`;
                }
            }
        } catch (e) {
            repoPath = '';
        }

        if (!repoPath) {
            return null;
        }

        return {
            repoPath,
            label: `GitHub repository preview for ${project.name}`
        };
    }

    function filterProjects(query) {
        const lowerQuery = query.toLowerCase().trim();

        if (!lowerQuery) {
            renderProjects(projects);
            filterInfo.textContent = '';
            return;
        }

        const filtered = projects.filter(project => {
            const nameMatch = project.name.toLowerCase().includes(lowerQuery);
            const categoryMatch = project.category.toLowerCase().includes(lowerQuery);
            const descriptionMatch = project.shortDescription.toLowerCase().includes(lowerQuery);
            const creatorMatch = project.creator.toLowerCase().includes(lowerQuery);
            
            return nameMatch || categoryMatch || descriptionMatch || creatorMatch;
        });

        renderProjects(filtered);

        if (filtered.length > 0) {
            filterInfo.textContent = `Showing ${filtered.length} of ${projects.length} projects`;
        }
    }

    searchInput.addEventListener('input', function(e) {
        filterProjects(e.target.value);
    });

    searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            searchInput.value = '';
            filterProjects('');
        }
    });

    renderProjects(projects);
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function adjustBrightness(color, percent) {
    const num = parseInt(color.replace("#",""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 +
        (G<255?G<1?0:G:255)*0x100 +
        (B<255?B<1?0:B:255))
        .toString(16).slice(1);
}
