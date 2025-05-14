document.addEventListener("DOMContentLoaded", function () {
    fetch('/job_exclusive')
        .then(response => response.json())
        .then(data => {
            window.vagasData = data;

            const event = new CustomEvent('vagasDataReady', { detail: data });
            document.dispatchEvent(event);
            
            const container = document.getElementById('vagas-container');
            container.innerHTML = ''; // Limpa o container antes de adicionar novas vagas

            data.vagas.forEach(vaga => {
                const card = document.createElement('div');
                card.classList.add('vaga-card');

                const titulo = document.createElement('h4');
                titulo.classList.add('vaga-title');
                titulo.textContent = vaga.vaga_nome;

                const empresa = document.createElement('p');
                empresa.classList.add('vaga-empresa');
                empresa.innerHTML = `<strong>Empresa:</strong> ${vaga.empresa}`;

                const local = document.createElement('p');
                local.classList.add('vaga-localizacao');
                local.innerHTML = `<strong>Local:</strong> ${vaga.cidade} / ${vaga.estado}`;

                const tags = document.createElement('p');
                tags.classList.add('vaga-tags');
                tags.innerHTML = `<strong>Tags:</strong> ${vaga.tags.join(', ')}`;

                const dataPostagem = document.createElement('p');
                dataPostagem.classList.add('vaga-data');
                dataPostagem.innerHTML = `<strong>Postada:</strong> ${vaga.postada_ha}`;

                const link = document.createElement('a');
                link.classList.add('vaga-link');
                link.href = vaga.link;
                link.target = "_blank";
                link.textContent = "Acesse";

                // Adiciona os elementos ao card
                card.appendChild(titulo);
                card.appendChild(empresa);
                card.appendChild(local);
                card.appendChild(tags);
                card.appendChild(dataPostagem);
                card.appendChild(link);

                // Adiciona o card ao container
                container.appendChild(card);
            });
        })
        .catch(error => {
            console.error("Erro ao carregar vagas:", error);
        });
});

