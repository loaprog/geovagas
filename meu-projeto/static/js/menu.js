document.addEventListener('DOMContentLoaded', function () {
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (!userData) {
        window.location.href = '/login_profissional';
        return;
    }

    // Atualizar informações básicas
    document.getElementById('user-name').textContent = userData.name;
    document.getElementById('user-email').textContent = userData.email;
                                                                          
    const userNameCv = document.getElementById('user-name-cv');
    if (userNameCv) {
        userNameCv.textContent = userData.name;
    }
    const pageTitle = document.getElementById('page-title');
    if (pageTitle) {
        pageTitle.innerHTML = `Bem-vindo, <span>${userData.name.split(' ')[0]}</span>`;
    }

    // Adicionar badges dos cursos
    const userBadgeContainer = document.getElementById('user-badge');
    if (userData.courses && userData.courses.length > 0) {
        userBadgeContainer.innerHTML = '';
        userData.courses.forEach(course => {
            if (course.slug) {
                const courseBadge = document.createElement('span');
                courseBadge.className = 'course-badge';
                courseBadge.textContent = course.slug;
                userBadgeContainer.appendChild(courseBadge);
            }
        });
    }

    // Funções auxiliares para o avatar
    function getInitials(name) {
        const parts = name.trim().split(' ');
        if (parts.length === 1) return parts[0][0].toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }

    function setFallbackAvatar(name) {
        const initials = getInitials(name);
        const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4a90e2&color=fff`;
        console.warn('Usando avatar fallback:', fallbackUrl);
        updateAllAvatars(fallbackUrl);
    }

    function updateAllAvatars(imageUrl) {
        const avatars = [
            document.getElementById('user-avatar'),
            document.getElementById('modal-avatar-cv'),
            document.getElementById('modal-avatar')
        ];

        avatars.forEach(avatar => {
            if (avatar) {
                avatar.src = imageUrl;
                avatar.onerror = () => {
                    console.error('Erro ao carregar imagem:', imageUrl);
                    setFallbackAvatar(userData.name);
                };
            }
        });
    }

    // Carregar a foto do usuário
    if (userData.photo_url) {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        img.onload = function() {
            updateAllAvatars(this.src);
            console.log('Imagem carregada com sucesso:', this.src);
        };

        img.onerror = function() {
            console.error('Falha ao carregar imagem, usando fallback');
            setFallbackAvatar(userData.name);
        };

        if (userData.photo_url.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
            img.src = userData.photo_url;
        } else {
            const formattedUrl = formatGoogleDriveUrl(userData.photo_url);
            console.log('Tentando carregar:', formattedUrl);
            img.src = formattedUrl;
        }
    } else {
        setFallbackAvatar(userData.name);
    }
});

function formatGoogleDriveUrl(url) {
    const fileId = url.match(/[-\w]{25,}/);
    if (fileId) {
        return `https://lh3.googleusercontent.com/d/${fileId[0]}=s500?authuser=0`;
    }
    return url;
}

document.querySelector('.logout-btn').addEventListener('click', function () {
    localStorage.removeItem('userData');
    window.location.href = '/login_profissional';
});