document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
        window.location.href = '/login_profissional';
        return;
    }

    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-email').textContent = userData.email;
    document.getElementById('page-title').innerHTML = `Bem-vindo, <span>${userData.name.split(' ')[0]}</span>`;

    // Adicionar badges dos cursos se existirem
    const userBadgeContainer = document.getElementById('user-badge');
    if (userData.courses && userData.courses.length > 0) {
        // Limpa o container primeiro
        userBadgeContainer.innerHTML = '';
        
        // Adiciona cada curso como um badge
        userData.courses.forEach(course => {
            if (course.slug) {
                const courseBadge = document.createElement('span');
                courseBadge.className = 'course-badge';
                courseBadge.textContent = course.slug;
                userBadgeContainer.appendChild(courseBadge);
            }
        });
    }

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
        const img = new Image();
        img.crossOrigin = 'Anonymous';
        
        img.onload = function() {
            avatar.src = this.src;
            console.log('Imagem carregada com sucesso:', this.src);
        };
        
        img.onerror = function() {
            console.error('Falha ao carregar imagem, usando fallback');
            setFallbackAvatar(userData.name);
        };
        
        // Tenta primeiro com a URL direta
        if (userData.photo_url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
            img.src = userData.photo_url;
        } else {
            // Usa a URL formatada do Google Drive
            const formattedUrl = formatGoogleDriveUrl(userData.photo_url);
            console.log('Tentando carregar:', formattedUrl);
            img.src = formattedUrl;
        }
    } else {
        setFallbackAvatar(userData.name);
    }

    // Restante do seu código...
});

// Função melhorada para formatar URLs do Google Drive
function formatGoogleDriveUrl(url) {
    const fileId = url.match(/[-\w]{25,}/); // Extrai o ID do arquivo
    if (fileId) {
        // Use o proxy do Google Drive ou seu próprio backend
        return `https://lh3.googleusercontent.com/d/${fileId[0]}=s500?authuser=0`;
        // Ou crie um endpoint no seu backend:
        // return `/api/drive-proxy?id=${fileId[0]}`;
    }
    return url;
}

document.querySelector('.logout-btn').addEventListener('click', function() {
    localStorage.removeItem('userData');
    window.location.href = '/login_profissional';
});