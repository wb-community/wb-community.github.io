document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('searchInput');
    const projectsGrid = document.getElementById('projectsGrid');
    const filterInfo = document.getElementById('filterInfo');

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
        const header = document.createElement('div');
        header.className = 'category-header';
        header.style.background = `linear-gradient(135deg, ${categoryColor}, ${adjustBrightness(categoryColor, 20)})`;
        
        const title = document.createElement('h2');
        title.className = 'category-title';
        title.textContent = category;
        
        const toggle = document.createElement('div');
        toggle.className = 'category-toggle';
        toggle.textContent = '−';
        
        header.appendChild(title);
        header.appendChild(toggle);
        
        const projectsContainer = document.createElement('div');
        projectsContainer.className = 'category-projects visible';
        
        projects.forEach(project => {
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
            'WB Stats Sites': '#ff6b9d',
            'WB Discord Bots': '#6366f1',
            'WB APIs & Endpoints': '#10b981',
            'WB Mods': '#f59e0b',
            'WB Tools & Utilities': '#8b5cf6',
            'WB Community Sites': '#06b6d4'
        };
        return colors[category] || '#3b82f6';
    }

    function createProjectCard(project) {
        const card = document.createElement('div');
        card.className = 'project-card';
        card.setAttribute('data-category', project.category);

        const statusClass = `status-${project.status.toLowerCase()}`;
        const categoryColor = getCategoryColor(project.category);
        
        const isGitHubCard = project.image && project.image.includes('github-readme-stats');
        const imageClass = isGitHubCard ? 'project-image github-card' : 'project-image';
        
        let imageElement;
        if (!project.image) {
            imageElement = `<div class="project-image placeholder-box"><span class="image-placeholder">[ IMAGE PLACEHOLDER ]</span></div>`;
        } else {
            imageElement = `<div class="${imageClass}"><img src="${project.image}" alt="${project.name}" loading="lazy" /></div>`;
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
                <span class="project-category" style="background: linear-gradient(135deg, ${categoryColor}, ${adjustBrightness(categoryColor, 20)});">${escapeHtml(project.category)}</span>
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
