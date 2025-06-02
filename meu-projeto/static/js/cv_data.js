let cvData = {};

document.addEventListener('DOMContentLoaded', async function() {
    try {
        await loadCvData();
        fillCvFields();
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

    const response = await fetch('/api/progress_cv_by_id/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: String(userData.id) })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    cvData = data;

    if (data?.progress !== undefined) {
        document.querySelector('.progress-percentage').textContent = `${data.progress}%`;
        document.querySelector('.progress-fill').style.width = `${data.progress}%`;
    }
}

// Função para preencher os campos com os dados carregados
function fillCvFields() {
    const studentData = cvData.student_data || {};

    console.log('Dados recebidos do servidor:', studentData); // Adicione esta linha

    document.querySelector('#user-desired-job .cv-value').textContent = clean(studentData.cargo_desejado) || 'Qual cargo você deseja?';
    document.querySelector('#user-location .cv-value').textContent = clean(studentData.cidade) || 'Cidade';
    document.getElementById('user-state').value = clean(studentData.estado) || '';
    document.querySelector('#user-phone .cv-value').textContent = clean(studentData.telefone) || 'Telefone';
    document.getElementById('user-bio').textContent = clean(studentData.bio) || 'Fale um pouco sobre você...';

    const avatarUrl = clean(studentData.foto_path) || `https://ui-avatars.com/api/?name=${encodeURIComponent(cvData.student_name || 'Usuário')}&background=4a90e2&color=fff`;
    document.getElementById('modal-avatar-cv').src = avatarUrl;

    setSkillLevel('qgis-skill', studentData.qgis);
    setSkillLevel('arcgis-skill', studentData.arcgis);
    setSkillLevel('autocad-skill', studentData.autocad);
    setSkillLevel('python-skill', studentData.python);
    setSkillLevel('ingles-skill', studentData.ingles);
    setSkillLevel('oratoria-skill', studentData.oratoria);
    setSkillLevel('entrevista-skill', studentData.entrevista);

    if (studentData.curriculo && !studentData.curriculo.includes('não preenchido')) {
        document.querySelector('.document-section:nth-child(1) .yes-btn').click();
        document.getElementById('cv-file-name').textContent = 'Currículo enviado';
    }
    if (studentData.portfolio && !studentData.portfolio.includes('não preenchido')) {
        document.querySelector('.document-section:nth-child(2) .yes-btn').click();
        document.getElementById('portfolio-file-name').textContent = 'Portfólio enviado';
    }
}

// Helpers
function clean(text) {
    return text?.replace(/ \(não preenchido\)| \(preenchido\)/g, '').trim();
}

function setSkillLevel(elementId, skillValue) {
    if (skillValue) {
        const value = clean(skillValue).toLowerCase();
        document.getElementById(elementId).value = value || 'sem_experiencia';
    }
}
