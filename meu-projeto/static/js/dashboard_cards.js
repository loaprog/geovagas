function handleVagasData(data) {
    const userData = JSON.parse(localStorage.getItem('userData'));
    if (!userData?.id) {
        window.location.href = '/login_profissional';
        return;
    }

    const xpuser = userData.xp_user;
    const countjobs = data.contagem_total;

    const xpValueElement = document.getElementById('xpValue');
    if (xpValueElement) {
        xpValueElement.textContent = xpuser;
    }

    const levelElement = document.getElementById('countJobs');
    if (levelElement) {
        levelElement.textContent = countjobs;
    }
}

// Verifica se os dados já estão disponíveis
if (window.vagasData) {
    handleVagasData(window.vagasData);
} else {
    // Ou espera pelo evento
    document.addEventListener('vagasDataReady', function (event) {
        handleVagasData(event.detail);
    });
}