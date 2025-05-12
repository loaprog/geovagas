document.addEventListener('DOMContentLoaded', async function() {
    try {
        const userData = JSON.parse(localStorage.getItem('userData'));
        if (!userData?.id) {
            window.location.href = '/login_profissional';
            return;
        }

        const id = userData.id;
        
        const requestBody = { id: String(id) };  // Garante que o ID seja string
        
        const response = await fetch('/api/progress_cv_by_id/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)  // Envia o objeto como JSON
        });

        
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error("Erro da API:", errorData);  // Log detalhado do erro
            throw new Error(errorData?.message || `HTTP ${response.status}`);
        }

        const data = await response.json();

        if (data?.progress !== undefined) {
            document.querySelector('.progress-percentage').textContent = `${data.progress}%`;
            document.querySelector('.progress-fill').style.width = `${data.progress}%`;
        }
    } catch (error) {
        console.error("Erro completo:", error);
        document.querySelector('.progress-percentage').textContent = "Erro";
        document.querySelector('.progress-fill').style.width = "0%";
    }
});