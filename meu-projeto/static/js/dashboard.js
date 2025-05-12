document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
        window.location.href = '/login_profissional';
        return;
    }

    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-email').textContent = userData.email;
    document.getElementById('page-title').innerHTML = `Bem-vindo, <span>${userData.name.split(' ')[0]}</span>`;

    const avatar = document.getElementById('user-avatar');

    function getInitials(name) {
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function setFallbackAvatar(name) {
        const initials = getInitials(name);
        const fallbackUrl = `https://ui-avatars.com/api/?name=${initials}&background=4a90e2&color=fff`;
        console.warn('Imagem de perfil falhou ao carregar. Usando fallback:', fallbackUrl);
        avatar.src = fallbackUrl;
    }

    // Configura os handlers de erro primeiro
    avatar.onerror = function() {
        console.error('Erro ao carregar imagem de perfil:', avatar.src);
        setFallbackAvatar(userData.name);
    };

    avatar.onload = function() {
        console.log('Imagem de perfil carregada com sucesso:', avatar.src);
    };

    if (userData.photo_url) {
        // Verifica se já é uma URL direta de imagem
        if (userData.photo_url.match(/\.(jpeg|jpg|gif|png)$/) !== null) {
            console.log('URL de imagem direta:', userData.photo_url);
            avatar.src = userData.photo_url;
        } else {
            // Formata URL do Google Drive
            const formattedUrl = formatGoogleDriveUrl(userData.photo_url);
            console.log('URL da imagem de perfil (formatada):', formattedUrl);
            
            // Adiciona timestamp para evitar cache
            avatar.src = formattedUrl + '&t=' + new Date().getTime();
        }
    } else {
        console.warn('Nenhuma photo_url fornecida. Usando avatar padrão.');
        setFallbackAvatar(userData.name);
    }

    // Restante do seu código...
});

// Função melhorada para formatar URLs do Google Drive
function formatGoogleDriveUrl(url) {
    // Se já for uma URL direta de visualização, retorna como está
    if (url.includes('uc?export=view')) return url;
    
    // Extrai o ID do arquivo de diferentes formatos de URL do Google Drive
    let fileId;
    const match1 = url.match(/\/d\/([^\/]+)/);
    const match2 = url.match(/id=([^&]+)/);
    const match3 = url.match(/\/file\/d\/([^\/]+)/);
    
    if (match1 && match1[1]) fileId = match1[1];
    else if (match2 && match2[1]) fileId = match2[1];
    else if (match3 && match3[1]) fileId = match3[1];
    
    if (fileId) {
        return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    // Se não conseguir extrair o ID, retorna a URL original
    return url;
}