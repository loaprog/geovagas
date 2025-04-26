let currentPage = 1;
const jobsPerPage = 12;
let allJobs = [];
let filteredJobs = [];
let isFiltered = false;

function isEmpty(value) {
    return !value || (typeof value === 'string' && value.trim().length === 0);
}

function formatDescription(description, maxLength = 150) {
    if (isEmpty(description)) return 'Descrição não disponível';
    if (description.length > maxLength) {
        return description.substring(0, maxLength) + '...';
    }
    return description;
}

function createJobCard(job) {
    return `
        <div class="job-card">
            <div class="job-header">
                <h3>${isEmpty(job.vaga_nome) ? 'Título não disponível' : job.vaga_nome}</h3>
            </div>
            <div class="job-meta">
                <span class="company"><i class="fas fa-building"></i> ${isEmpty(job.empresa) ? 'Empresa não informada' : job.empresa}</span>
                <span class="location"><i class="fas fa-map-marker-alt"></i> ${isEmpty(job.cidade) ? 'Local não informado' : job.cidade + (job.estado ? '/' + job.estado : '')}</span>
                <span class="type"><i class="fas fa-tags"></i> ${(!job.tags || job.tags.length === 0) ? 'Tags não informadas' : job.tags.join(', ')}</span>
            </div>
            <div class="job-description">
                <p>${formatDescription(job.descricao)}</p>
            </div>
            <div class="job-footer">
                <a href="/details/${job.vaga}" class="btn-primary">Ver Detalhes</a>
                <span class="post-date">${isEmpty(job.postada_ha) ? 'Postada recentemente' : job.postada_ha}</span>
            </div>
        </div>
    `;
}

function filterJobs() {
    const jobTerm = $("#job-search").val().toLowerCase().trim();
    const stateTerm = $("#state-search").val();

    if (isEmpty(jobTerm) && isEmpty(stateTerm)) {
        resetFilters();
        return;
    }

    if (!isEmpty(jobTerm)) {
        $("#job-search").addClass('filter-active');
    } else {
        $("#job-search").removeClass('filter-active');
    }
    
    if (!isEmpty(stateTerm)) {
        $("#state-search").addClass('filter-active');
    } else {
        $("#state-search").removeClass('filter-active');
    }

    filteredJobs = allJobs.filter(job => {
        const matchesJob = isEmpty(jobTerm) || 
                         (job.vaga_nome && job.vaga_nome.toLowerCase().includes(jobTerm)) ||
                         (job.descricao && job.descricao.toLowerCase().includes(jobTerm)) ||
                         (job.empresa && job.empresa.toLowerCase().includes(jobTerm)) ||
                         (job.tags && job.tags.some(tag => tag.toLowerCase().includes(jobTerm)));

        const matchesState = isEmpty(stateTerm) || 
                           (job.estado && job.estado.toUpperCase().trim() === stateTerm.toUpperCase().trim());

        return matchesJob && matchesState;
    });

    isFiltered = !isEmpty(jobTerm) || !isEmpty(stateTerm);
    currentPage = 1;
    renderJobsForCurrentPage();
}

function renderJobsForCurrentPage() {
    const container = document.getElementById('featured-jobs-container');
    const jobsToShow = isFiltered ? filteredJobs : allJobs;
    const startIndex = (currentPage - 1) * jobsPerPage;
    const endIndex = startIndex + jobsPerPage;
    const paginatedJobs = jobsToShow.slice(startIndex, endIndex);

    if (jobsToShow.length === 0) {
        container.innerHTML = `
            <div class="no-jobs">
                Nenhuma vaga encontrada com os critérios de busca.
            </div>
        `;
        document.getElementById('pagination-container').style.display = 'none';
    } else {
        container.innerHTML = paginatedJobs.map(job => createJobCard(job)).join('');
        document.getElementById('pagination-container').style.display = 'flex';
        renderPaginationControls();
    }
}

function resetFilters() {
    $("#job-search").val('');
    $("#state-search").val('');
    isFiltered = false;
    currentPage = 1;
    filteredJobs = [];
    renderJobsForCurrentPage();
    loadFeaturedJobs();
}

function renderPaginationControls() {
    const totalJobs = isFiltered ? filteredJobs.length : allJobs.length;
    const totalPages = Math.ceil(totalJobs / jobsPerPage);
    const pageNumbersContainer = document.getElementById('page-numbers');
    const prevButton = document.getElementById('prev-page');
    const nextButton = document.getElementById('next-page');

    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages || totalPages === 0;

    pageNumbersContainer.innerHTML = '';
    
    if (totalPages <= 1) return;

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        const firstPage = document.createElement('span');
        firstPage.className = 'page-number';
        firstPage.textContent = '1';
        firstPage.addEventListener('click', () => {
            currentPage = 1;
            renderJobsForCurrentPage();
        });
        pageNumbersContainer.appendChild(firstPage);

        if (startPage > 2) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('span');
        pageBtn.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            renderJobsForCurrentPage();
        });
        pageNumbersContainer.appendChild(pageBtn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('span');
            ellipsis.textContent = '...';
            pageNumbersContainer.appendChild(ellipsis);
        }

        const lastPage = document.createElement('span');
        lastPage.className = 'page-number';
        lastPage.textContent = totalPages;
        lastPage.addEventListener('click', () => {
            currentPage = totalPages;
            renderJobsForCurrentPage();
        });
        pageNumbersContainer.appendChild(lastPage);
    }
}

async function loadFeaturedJobs() {
    const container = document.getElementById('featured-jobs-container');
    
    try {
        container.innerHTML = `
            <div class="loading-jobs">
                <i class="fas fa-spinner fa-spin"></i> Carregando vagas em destaque...
            </div>
        `;

        const response = await fetch('/job-posts', {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) throw new Error(`Erro no servidor: ${response.status}`);

        allJobs = await response.json();
        currentPage = 1;
        renderJobsForCurrentPage();

    } catch (error) {
        console.error('Erro ao carregar vagas:', error);
        container.innerHTML = `
            <div class="error-loading">
                Não foi possível carregar as vagas
                <button onclick="loadFeaturedJobs()" class="retry-btn">Tentar novamente</button>
                <p class="error-detail">${error.message}</p>
            </div>
        `;
    }
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('featured-jobs-container')) {
        loadFeaturedJobs();
    }

    document.addEventListener('click', function (e) {
        if (e.target.classList.contains('view-details-btn')) {
            const jobId = e.target.getAttribute('data-id');
            window.location.href = `details?id=${jobId}`;
        }
    });

    document.getElementById('prev-page').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderJobsForCurrentPage();
        }
    });

    document.getElementById('next-page').addEventListener('click', () => {
        const totalJobs = isFiltered ? filteredJobs.length : allJobs.length;
        const totalPages = Math.ceil(totalJobs / jobsPerPage);
        if (currentPage < totalPages) {
            currentPage++;
            renderJobsForCurrentPage();
        }
    });

    document.getElementById('quick-search-btn').addEventListener('click', filterJobs);
    document.getElementById('reset-filters-btn').addEventListener('click', resetFilters);
    
    document.getElementById('job-search').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') filterJobs();
    });

    const jobTitles = [
        "Analista GIS", "Técnico em Topografia", "Desenvolvedor Python GIS",
        "Especialista em Sensoriamento Remoto", "Cartógrafo", "Analista de Geoprocessamento",
        "Engenheiro Agrimensor", "Geólogo", "Técnico em Meio Ambiente", "Especialista em Drones"
    ];
    
    $("#job-search").autocomplete({
        source: jobTitles,
        minLength: 2,
        delay: 100
    });
});

window.loadFeaturedJobs = loadFeaturedJobs;
window.filterJobs = filterJobs;
window.resetFilters = resetFilters;