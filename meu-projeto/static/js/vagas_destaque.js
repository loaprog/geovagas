// Função para verificar se um valor é considerado vazio/não válido
function isEmpty(value) {
    return !value || value.trim().length <= 1;
}

// Função para formatar a descrição
function formatDescription(description, maxLength = 150) {
    if (isEmpty(description)) return 'Descrição não disponível';
    if (description.length > maxLength) {
        return description.substring(0, maxLength) + '...';
    }
    return description;
}

// Função para criar o HTML de uma vaga com verificações específicas
function createJobCard(job) {
    return `
        <div class="job-card">
            <div class="job-header">
                <h3>${isEmpty(job.vaga_nome) ? 'Título não disponível' : job.vaga_nome}</h3>
            </div>
            <div class="job-meta">
                <span class="company"><i class="fas fa-building"></i> ${isEmpty(job.empresa) ? 'Empresa não informada' : job.empresa}</span>
                <span class="location"><i class="fas fa-map-marker-alt"></i> ${isEmpty(job.cidade) ? 'Local não informado' : job.cidade}</span>
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

// Função principal para carregar as vagas em destaque
async function loadFeaturedJobs() {
    const container = document.getElementById('featured-jobs-container');
    
    try {
        // Mostrar estado de carregamento
        container.innerHTML = `
            <div class="loading-jobs">
                <i class="fas fa-spinner fa-spin"></i> Carregando vagas em destaque...
            </div>
        `;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
            console.warn('Timeout: Requisição demorando mais que 5 segundos');
            controller.abort();
        }, 5000);

        const response = await fetch('/job-posts?latest=true', {
            headers: {
                'Accept': 'application/json'
            },
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Verificar se a resposta foi bem sucedida
        if (!response.ok) {
            console.error('Erro na resposta:', response.status, response.statusText);
            throw new Error(`Erro no servidor: ${response.status}`);
        }

        const jobs = await response.json();
        console.log('Vagas recebidas:', jobs.length, 'vagas encontradas');
        console.debug('Dados completos:', jobs); // Log detalhado dos dados

        // Se não houver vagas
        if (!jobs || jobs.length === 0) {
            console.warn('Nenhuma vaga encontrada');
            container.innerHTML = `
                <div class="no-jobs">
                    Nenhuma vaga em destaque no momento. Volte mais tarde!
                </div>
            `;
            return;
        }

        // Renderizar as vagas
        container.innerHTML = jobs.map(job => createJobCard(job)).join('');
        console.log('Vagas renderizadas com sucesso!');

    } catch (error) {
        console.error('Erro ao carregar vagas:', error);
        
        let errorMessage = 'Não foi possível carregar as vagas';
        if (error.name === 'AbortError') {
            errorMessage = 'A requisição demorou muito. Verifique sua conexão';
            console.error('Timeout na requisição');
        } else if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Erro de conexão com o servidor';
            console.error('Falha na conexão com o servidor');
        }

        container.innerHTML = `
            <div class="error-loading">
                ${errorMessage}
                ${error.message ? `<p class="error-detail">${error.message}</p>` : ''}
               <button onclick="loadFeaturedJobs()" class="retry-btn">Tentar novamente</button>
            </div>
        `;
    }
}

// Carregar as vagas quando a página for carregada
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('featured-jobs-container')) {
        loadFeaturedJobs();
    } else {
        console.error('Container de vagas não encontrado na página');
    }
});

// Tornar a função acessível globalmente
window.loadFeaturedJobs = loadFeaturedJobs;
