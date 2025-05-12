document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login_api/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password
            })
        });

        const data = await response.json();

        if (data.success) {
            console.log('Login bem-sucedido. Usuario:', data.user);

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));

            switch(data.user.type) {
                case 'student':
                    console.log('Redirecionando para student-dashboard');
                    window.location.href = '/student_dashboard';
                    break;
                case 'company':
                    console.log('Redirecionando para company-dashboard');
                    window.location.href = '/company_dashboard';
                    break;
                case 'admin':
                    console.log('Redirecionando para admin-dashboard');
                    window.location.href = '/admin_dashboard';
                    break;
                default:
                    console.log('Redirecionando para tela inicial');
                    window.location.href = '/';
            }
        } else {
            console.warn('Falha no login:', data.message);
            Swal.fire({
                icon: 'error',
                title: 'Erro no login',
                text: data.message || 'Credenciais inválidas'
            });
        }
    } catch (error) {
        console.error('Erro durante a requisição:', error);
        Swal.fire({
            icon: 'error',
            title: 'Erro',
            text: 'Ocorreu um erro ao tentar fazer login'
        });
    }
});
