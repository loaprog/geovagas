// Variável global para armazenar os dados do currículo
let cvData = {};

document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Primeiro, carregamos os dados do currículo
        await loadCvData();
        
        // Depois preenchemos os campos
        fillCvFields();
        
        // Configurar placeholders
        setupPlaceholders();
        
        // Configuração dos eventos e modais
        setupEventListeners();
        
    } catch (error) {
        console.error("Erro ao carregar dados do currículo:", error);
    }
});

// Função para carregar os dados do currículo
async function loadCvData() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.id) {
        window.location.href = '/login_profissional';
        return;
    }

    const id = userData.id;
    const requestBody = { id: String(id) };
    
    const response = await fetch('/api/progress_cv_by_id/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    cvData = data;
    
    // Atualizar progresso
    if (data?.progress !== undefined) {
        document.querySelector('.progress-percentage').textContent = `${data.progress}%`;
        document.querySelector('.progress-fill').style.width = `${data.progress}%`;
    }
}

// Função para configurar os placeholders
function setupPlaceholders() {
    const editableElements = document.querySelectorAll('[data-placeholder]');
    
    editableElements.forEach(element => {
        const placeholder = element.getAttribute('data-placeholder');
        
        // Se o elemento estiver vazio, mostra o placeholder
        if (!element.textContent.trim() || element.textContent === placeholder) {
            element.textContent = placeholder;
            element.classList.add('placeholder-text');
        }
        
        element.addEventListener('focus', function() {
            if (this.classList.contains('placeholder-text')) {
                this.textContent = '';
                this.classList.remove('placeholder-text');
            }
            this.style.backgroundColor = '#f8f9fa';
            this.style.padding = '2px 5px';
            this.style.borderRadius = '3px';
        });
        
        element.addEventListener('blur', function() {
            if (!this.textContent.trim()) {
                this.textContent = placeholder;
                this.classList.add('placeholder-text');
            }
            this.style.backgroundColor = 'transparent';
            this.style.padding = '2px 5px';
        });
    });
}

// Função para preencher os campos do currículo
function fillCvFields() {
    const studentData = cvData.student_data || {};
    
    // Preencher nome
    document.getElementById('user-name-cv').textContent = cvData.student_name || 'Nome do Usuário';
    
    // Preencher cargo desejado
    const desiredJobEl = document.querySelector('#user-desired-job .cv-value');
    const desiredJob = studentData.cargo_desejado?.replace(' (não preenchido)', '').trim();
    desiredJobEl.textContent = desiredJob || desiredJobEl.getAttribute('data-placeholder');
    if (!desiredJob) desiredJobEl.classList.add('placeholder-text');
    
    // Preencher localização
    const locationEl = document.querySelector('#user-location .cv-value');
    const cidade = studentData.cidade?.replace(' (preenchido)', '').replace(' (não preenchido)', '').trim() || '';
    const estado = studentData.estado?.replace(' (preenchido)', '').replace(' (não preenchido)', '').trim() || '';
    locationEl.textContent = (cidade && estado) ? `${cidade}, ${estado}` : locationEl.getAttribute('data-placeholder');
    if (!(cidade && estado)) locationEl.classList.add('placeholder-text');
    
    // Preencher telefone
    const phoneEl = document.querySelector('#user-phone .cv-value');
    const phone = studentData.telefone?.replace(' (preenchido)', '').replace(' (não preenchido)', '').trim();
    phoneEl.textContent = phone || phoneEl.getAttribute('data-placeholder');
    if (!phone) phoneEl.classList.add('placeholder-text');
    
    // Preencher bio
    const bioEl = document.getElementById('user-bio');
    const bio = studentData.bio?.replace(' (não preenchido)', '').trim();
    bioEl.textContent = bio || bioEl.getAttribute('data-placeholder');
    if (!bio) bioEl.classList.add('placeholder-text');
    
    // Preencher foto
    const avatarUrl = studentData.foto_path?.replace(' (preenchido)', '').trim() || 
                     'https://ui-avatars.com/api/?name=' + encodeURIComponent(cvData.student_name || 'Usuário') + '&background=4a90e2&color=fff';
    document.getElementById('modal-avatar-cv').src = avatarUrl;
    
    // Preencher habilidades técnicas
    setSkillLevel('qgis-skill', studentData.qgis);
    setSkillLevel('arcgis-skill', studentData.arcgis);
    setSkillLevel('autocad-skill', studentData.autocad);
    setSkillLevel('python-skill', studentData.python);
    
    // Preencher habilidades complementares
    setSkillLevel('ingles-skill', studentData.ingles);
    setSkillLevel('oratoria-skill', studentData.oratoria);
    setSkillLevel('entrevista-skill', studentData.entrevista);
    
    // Configurar documentos
    if (studentData.curriculo && !studentData.curriculo.includes('não preenchido')) {
        document.querySelector('.document-section:nth-child(1) .yes-btn').click();
        document.getElementById('cv-file-name').textContent = 'Currículo enviado';
    }
}

// Função auxiliar para definir nível de habilidade
function setSkillLevel(elementId, skillValue) {
    if (skillValue) {
        const value = skillValue.replace(' (não preenchido)', '').toLowerCase();
        document.getElementById(elementId).value = value || 'sem_experiencia';
    }
}

// Função para configurar os event listeners
function setupEventListeners() {
    // Elementos do modal
    const recruiterModal = document.getElementById('recruiter-modal');
    const previewCvBtn = document.getElementById('preview-cv-btn');
    const closeModalBtn = document.getElementById('close-recruiter-modal');
    const editCvBtn = document.getElementById('edit-cv-btn');
    const saveCvBtn = document.getElementById('save-cv-btn');
    
    // Elementos editáveis do currículo
    const editableElements = document.querySelectorAll('[data-placeholder]');
    const skillSelects = document.querySelectorAll('.skill-level');
    const fileInputs = document.querySelectorAll('input[type="file"]');
    const docButtons = document.querySelectorAll('.doc-btn');
    
    // Estado inicial - modo edição inativo
    let isEditMode = false;
    
    // Função para alternar entre modos
    function toggleEditMode(enableEdit) {
        isEditMode = enableEdit;
        
        if (enableEdit) {
            // Modo edição
            editCvBtn.style.display = 'none';
            saveCvBtn.style.display = 'inline-block';
            previewCvBtn.classList.remove('active-mode');
            
            // Tornar elementos editáveis
            editableElements.forEach(el => {
                el.contentEditable = true;
                if (el.classList.contains('placeholder-text')) {
                    el.textContent = '';
                    el.classList.remove('placeholder-text');
                }
            });
            
            // Habilitar selects de habilidades
            skillSelects.forEach(select => {
                select.disabled = false;
            });
            
            // Habilitar inputs de arquivo
            fileInputs.forEach(input => {
                input.disabled = false;
            });
            
            // Habilitar botões de documento
            docButtons.forEach(btn => {
                btn.disabled = false;
            });
        } else {
            // Modo visualização
            editCvBtn.style.display = 'inline-block';
            saveCvBtn.style.display = 'none';
            
            // Tornar elementos não editáveis
            editableElements.forEach(el => {
                el.contentEditable = false;
                if (!el.textContent.trim()) {
                    el.textContent = el.getAttribute('data-placeholder');
                    el.classList.add('placeholder-text');
                }
            });
            
            // Desabilitar selects de habilidades
            skillSelects.forEach(select => {
                select.disabled = true;
            });
            
            // Desabilitar inputs de arquivo
            fileInputs.forEach(input => {
                input.disabled = true;
            });
            
            // Desabilitar botões de documento
            docButtons.forEach(btn => {
                btn.disabled = true;
            });
        }
    }
    
    // Inicializar no modo visualização
    toggleEditMode(false);
    
    // Evento para botão de edição
    editCvBtn.addEventListener('click', function() {
        toggleEditMode(true);
    });

    // Evento para botão de salvar
    saveCvBtn.addEventListener('click', function() {
        // Coletar dados para salvar
        const skillLevels = {};
        skillSelects.forEach(select => {
            skillLevels[select.id] = select.value;
        });

        const userData = {
            name: document.getElementById('user-name-cv').textContent,
            desiredJob: getFieldValue('#user-desired-job .cv-value', 'Qual cargo você deseja?'),
            location: getFieldValue('#user-location .cv-value', 'Cidade, Estado'),
            phone: getFieldValue('#user-phone .cv-value', 'Telefone'),
            bio: getFieldValue('#user-bio', 'Fale um pouco sobre você...'),
            skills: skillLevels
        };

        // Aqui você pode enviar userData para o backend
        console.log('Dados a serem salvos:', userData);

        // Voltar para modo visualização
        toggleEditMode(false);
        
        // Mostrar mensagem de sucesso
        alert('Alterações salvas com sucesso!');
    });
    
    // Função auxiliar para obter valor do campo (ignora placeholder)
    function getFieldValue(selector, placeholder) {
        const element = document.querySelector(selector);
        return element.textContent === placeholder ? '' : element.textContent;
    }
    
    // Restante dos event listeners (modal, etc.)
    // [Seu código existente para o modal e outros eventos]
}

// Adicionar estilos para os placeholders
const style = document.createElement('style');
style.textContent = `
    .placeholder-text {
        color: #999 !important;
        font-style: italic;
        padding: 2px 5px;
    }
    [contenteditable="true"] {
        min-width: 50px;
    }
    [contenteditable="true"]:focus {
        background-color: #f8f9fa;
        padding: 2px 5px;
        border-radius: 3px;
        outline: none;
    }
`;
document.head.appendChild(style);