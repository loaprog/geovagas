// Abrir modal
document.querySelector('.forgot-password').addEventListener('click', function(e) {
    e.preventDefault();
    document.getElementById('forgotPasswordModal').style.display = 'block';
});

// Fechar modal
document.querySelector('.close-modal').addEventListener('click', function() {
    document.getElementById('forgotPasswordModal').style.display = 'none';
});

// Fechar ao clicar fora
window.addEventListener('click', function(event) {
    if (event.target == document.getElementById('forgotPasswordModal')) {
        document.getElementById('forgotPasswordModal').style.display = 'none';
    }
});

// Enviar formulário de recuperação
document.getElementById('recoveryForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('recoveryEmail').value;
    
    try {
        // Mostrar loading
        Swal.fire({
            title: 'Enviando...',
            html: 'Estamos processando sua solicitação',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });
        
        // Enviar para a API
        const response = await fetch('/recuperar_senha/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Sucesso
            Swal.fire({
                icon: 'success',
                title: 'Token enviado!',
                text: 'Enviamos um token para seu e-mail. Verifique sua caixa de entrada e lixo eletrônico.',
                confirmButtonText: 'OK'
            }).then(() => {
                // Redirecionar para a página de inserção do token
                window.location.href = 'redefinir_senha';
            });
        } else {
            // Erro
            throw new Error(data.message || 'Erro ao enviar token');
        }
    } catch (error) {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: error.message || 'Erro ao enviar token de recuperação. Tente novamente mais tarde.'
        });
    } finally {
        document.getElementById('forgotPasswordModal').style.display = 'none';
    }
});

// Validação do formulário de login (opcional)
document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();
    // Sua lógica de login aqui
});
