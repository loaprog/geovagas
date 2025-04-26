document.addEventListener('DOMContentLoaded', function() {
    // Configurar o botão de voltar PRIMEIRO, antes de qualquer verificação
    document.getElementById('back-button').addEventListener('click', function() {
        // Usando URL absoluta para garantir que sempre volte corretamente
        const baseUrl = window.location.origin;
        window.location.href = baseUrl + '/vagas';
    });

    // Pegar o ID da vaga da URL no formato /details/{id}
    const pathParts = window.location.pathname.split('/');
    const jobId = pathParts[pathParts.length - 1];
    
    if (!jobId) {
        showError("ID da vaga não encontrado na URL.");
        return; // Mesmo com erro, o botão voltar já está configurado
    }
    
    // Carregar os detalhes da vaga
    loadJobDetails(jobId);
});

// Restante do código permanece igual...
async function loadJobDetails(jobId) {
    const container = document.querySelector('.job-details-container');
    
    try {
        container.innerHTML = `
            <div class="loading-details">
                <i class="fas fa-spinner fa-spin"></i> Carregando detalhes da vaga...
            </div>
        `;

        console.log(`Buscando detalhes para vaga ID: ${jobId}`);
        const response = await fetch(`/job-posts/${jobId}`, {
            headers: {
                'Accept': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Erro na resposta:', errorText);
            throw new Error(`Erro no servidor: ${response.status}`);
        }

        const job = await response.json();
        console.log('Dados recebidos:', job);
        renderJobDetails(job);

    } catch (error) {
        console.error('Erro ao carregar detalhes da vaga:', error);
        showError(error.message);
    }
}

function renderJobDetails(job) {
    const container = document.querySelector('.job-details-container');
    
    // Formata a descrição para manter quebras de linha
    const formattedDescription = job.descricao ? job.descricao.replace(/\n/g, '<br>') : 'Descrição não disponível';
    const formattedHowToApply = job.como_candidatar ? job.como_candidatar.replace(/\n/g, '<br>') : 'Informações sobre como se candidatar não disponíveis';
    
    container.innerHTML = `
        <div class="job-details-header">
            <h1>${job.vaga_nome || 'Título não disponível'}</h1>
            <div class="job-meta-details">
                <span><i class="fas fa-building"></i> ${job.empresa || 'Empresa não informada'}</span>
                <span><i class="fas fa-map-marker-alt"></i> ${job.cidade || 'Local não informado'}${job.estado ? '/' + job.estado : ''}</span>
                <span><i class="fas fa-clock"></i> ${job.postada_ha || 'Postada recentemente'}</span>
            </div>
        </div>
        
        <div class="job-description-details">
            <h2>Descrição da Vaga</h2>
            <p>${formattedDescription}</p>
        </div>
        
        <div class="job-how-to-apply">
            <h2>Como se Candidatar</h2>
            <p>${formattedHowToApply}</p>
        </div>
    
    `;
}

function showError(message) {
    const container = document.querySelector('.job-details-container');
    
    container.innerHTML = `
        <div class="error-loading">
            Não foi possível carregar os detalhes da vaga
            <p class="error-detail">${message}</p>
            <button onclick="window.location.reload()" class="retry-btn">Tentar novamente</button>
        </div>
    `;
}