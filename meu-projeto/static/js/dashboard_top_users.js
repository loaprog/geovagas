// dashboard_top_users.js
document.addEventListener('DOMContentLoaded', function() {
    fetchTopUsers();
});

function fetchTopUsers() {
    fetch('/top_users')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao buscar os usuários');
            }
            return response.json();
        })
        .then(users => {
            populateTopUsers(users);
        })
        .catch(error => {
            console.error('Erro:', error);
            const usersList = document.querySelector('.users-list');
            usersList.innerHTML = '<div class="error-message">Não foi possível carregar os usuários</div>';
        });
}

function populateTopUsers(users) {
    const usersList = document.querySelector('.users-list');
    usersList.innerHTML = ''; // Limpa a lista atual

    // Adiciona classes de cor para os primeiros colocados
    const rankClasses = ['gold', 'silver', 'bronze'];
    
    users.forEach((user, index) => {
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        
        const rankSpan = document.createElement('span');
        rankSpan.className = `user-rank ${index < 3 ? rankClasses[index] : ''}`;
        rankSpan.textContent = index + 1;
        
        const userIcon = document.createElement('img');
        userIcon.alt = user.name;
        userIcon.className = 'user-icon';
        
        // Configura os handlers de erro para a imagem
        userIcon.onerror = function() {
            console.error('Erro ao carregar imagem de perfil:', userIcon.src);
            setFallbackAvatar(userIcon, user.name);
        };
        
        // Tenta carregar a foto do usuário
        if (user.foto_path) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            
            img.onload = function() {
                userIcon.src = this.src;
            };
            
            img.onerror = function() {
                setFallbackAvatar(userIcon, user.name);
            };
            
            // Verifica se é uma URL direta de imagem
            if (user.foto_path.match(/\.(jpeg|jpg|gif|png|webp)(\?.*)?$/i)) {
                img.src = user.foto_path;
            } else {
                // Usa a URL formatada do Google Drive
                const formattedUrl = formatGoogleDriveUrl(user.foto_path);
                console.log('Tentando carregar:', formattedUrl);
                img.src = formattedUrl;
            }
        } else {
            setFallbackAvatar(userIcon, user.name);
        }
        
        const userName = document.createElement('span');
        userName.className = 'user-name';
        userName.textContent = user.name;
        
        const userPoints = document.createElement('span');
        userPoints.className = 'user-points';
        userPoints.textContent = user.xp_user;
        
        userItem.appendChild(rankSpan);
        userItem.appendChild(userIcon);
        userItem.appendChild(userName);
        userItem.appendChild(userPoints);
        
        usersList.appendChild(userItem);
    });
}

// Função para definir um avatar fallback
function setFallbackAvatar(imgElement, name) {
    const initials = getInitials(name);
    const fallbackUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=4a90e2&color=fff&size=64`;
    console.warn('Usando fallback para:', name);
    imgElement.src = fallbackUrl;
}

// Função para obter iniciais do nome
function getInitials(name) {
    if (!name) return 'US';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// Função para formatar URLs do Google Drive
function formatGoogleDriveUrl(url) {
    const fileId = url.match(/[-\w]{25,}/); // Extrai o ID do arquivo
    if (fileId) {
        // Use o proxy do Google Drive ou seu próprio backend
        return `https://lh3.googleusercontent.com/d/${fileId[0]}=s500?authuser=0`;
        // Alternativa: usar seu próprio endpoint de proxy se configurado
        // return `/api/drive-proxy?id=${fileId[0]}`;
    }
    return url;
}