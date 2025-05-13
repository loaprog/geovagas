    document.addEventListener("DOMContentLoaded", function() {
        fetch('/job_exclusive')  // Substitua pela URL real do seu endpoint
            .then(response => response.json())
            .then(data => {
                const container = document.getElementById('vagas-container');
                container.innerHTML = ''; // Limpa caso já exista algo

                data.forEach(vaga => {
                    const vagaHTML = `
                        <div class="vaga-card">
                            <h4 class="vaga-title">${vaga.vaga_nome}</h4>
                            <p class="vaga-empresa"><strong>Empresa:</strong> ${vaga.empresa}</p>
                            <p class="vaga-localizacao"><strong>Local:</strong> ${vaga.cidade} / ${vaga.estado}</p>
                            <p class="vaga-tags"><strong>Tags:</strong> ${vaga.tags.join(', ')}</p>
                            <p class="vaga-data"><strong>Postada:</strong> ${vaga.postada_ha}</p>
                            <a href="${vaga.link}" target="_blank" class="vaga-link">Acesse</a>
                        </div>
                    `;
                    container.innerHTML += vagaHTML;
                });
            })
            .catch(error => {
                console.error("Erro ao carregar vagas:", error);
            });
    });
