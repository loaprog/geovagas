// Toggle senha
document.querySelectorAll('.toggle-password').forEach(function(toggle) {
    toggle.addEventListener('click', function () {
        const input = this.previousElementSibling;
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        this.classList.toggle('fa-eye-slash');
    });
});

// Validação do tamanho da foto
document.getElementById('foto').addEventListener('change', function() {
    const file = this.files[0];
    if (file && file.size > 2 * 1024 * 1024) {
        showError('O arquivo deve ter no máximo 2MB.');
        this.value = "";
    }
});

// Validação em tempo real para nome e senha
document.getElementById('nome').addEventListener('input', function() {
    validateField(this, 5, 'nome-error');
});

document.getElementById('senha').addEventListener('input', function() {
    validateField(this, 6, 'senha-error');
});

function validateField(field, minLength, errorId) {
    const errorElement = document.getElementById(errorId);
    if (field.value.length < minLength && field.value.length > 0) {
        errorElement.style.display = 'block';
        field.classList.add('input-error');
    } else {
        errorElement.style.display = 'none';
        field.classList.remove('input-error');
    }
}

// Função para mostrar erros com SweetAlert2
function showError(message) {
    Swal.fire({
        title: 'Erro!',
        text: message,
        icon: 'error',
        confirmButtonText: 'OK',
        showClass: {
            popup: 'animate__animated animate__fadeInDown'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOutUp'
        }
    });
}

// Função para mostrar sucesso com SweetAlert2
function showSuccess(message) {
    Swal.fire({
        title: 'Sucesso!',
        text: message,
        icon: 'success',
        confirmButtonText: 'OK',
        showClass: {
            popup: 'animate__animated animate__bounceIn'
        },
        hideClass: {
            popup: 'animate__animated animate__fadeOut'
        }
    }).then((result) => {
        if (result.isConfirmed) {
            window.location.href = 'login_profissional';
        }
    });
}

// Envio do formulário
document.getElementById('registerForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    // Validar campos antes de enviar
    const nome = document.getElementById('nome');
    const senha = document.getElementById('senha');
    
    if (nome.value.length < 5) {
        showError('O nome deve ter pelo menos 5 caracteres');
        document.getElementById('nome-error').style.display = 'block';
        nome.classList.add('input-error');
        return;
    }
    
    if (senha.value.length < 6) {
        showError('A senha deve ter pelo menos 6 caracteres');
        document.getElementById('senha-error').style.display = 'block';
        senha.classList.add('input-error');
        return;
    }
    
    // Mostrar loading com SweetAlert2
    Swal.fire({
        title: 'Processando...',
        html: 'Estamos cadastrando seus dados',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
    
    // Criar FormData para enviar os dados (incluindo o arquivo)
    const formData = new FormData();
    formData.append('nome', nome.value);
    formData.append('email', document.getElementById('email').value);
    formData.append('senha', senha.value);
    formData.append('telefone', document.getElementById('telefone').value);
    formData.append('cidade', document.getElementById('cidade').value);
    formData.append('estado', document.getElementById('estado').value);
    
    // Adicionar a foto se existir
    const fotoInput = document.getElementById('foto');
    if (fotoInput.files.length > 0) {
        formData.append('foto', fotoInput.files[0]);
    }
    
    // Enviar para o endpoint
    fetch('/register_user/', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            return response.json().then(err => { throw err; });
        }
        return response.json();
    })
    .then(data => {
        Swal.close();
        showSuccess('Cadastro realizado com sucesso!');
    })
    .catch(error => {
        Swal.close();
        console.error('Erro:', error);
        showError(error.message || 'Erro ao cadastrar. Por favor, tente novamente.');
    });
});

// Máscara para telefone
document.getElementById('telefone').addEventListener('input', function(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.substring(0, 11);
    
    if (value.length > 0) {
        value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
        if (value.length > 10) {
            value = value.replace(/(\d)(\d{4})$/, '$1-$2');
        }
    }
    
    e.target.value = value;
});
