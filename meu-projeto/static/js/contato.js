document.addEventListener('DOMContentLoaded', function() {
    // Selecionar o formulário
    const contactForm = document.getElementById('contactForm');
    const submitButton = contactForm.querySelector('button[type="submit"]');
    
    // Selecionar todos os campos obrigatórios
    const requiredFields = contactForm.querySelectorAll('[required]');
    
    // Função para verificar se todos os campos estão preenchidos
    function checkFormValidity() {
        let allValid = true;
        
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                allValid = false;
            }
        });
        
        // Habilitar/desabilitar o botão com base na validação
        submitButton.disabled = !allValid;
        
        // Adicionar/remover classe para feedback visual
        if (allValid) {
            submitButton.classList.remove('disabled-btn');
            submitButton.classList.add('enabled-btn');
        } else {
            submitButton.classList.add('disabled-btn');
            submitButton.classList.remove('enabled-btn');
        }
    }
    
    // Adicionar event listeners para cada campo
    requiredFields.forEach(field => {
        field.addEventListener('input', checkFormValidity);
        field.addEventListener('change', checkFormValidity);
    });
    
    // Verificar o formulário ao carregar a página
    checkFormValidity();
    
    // Adicionar evento de envio do formulário
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Verificar novamente antes de enviar (redundância de segurança)
        let formIsValid = true;
        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                formIsValid = false;
                field.classList.add('error');
            } else {
                field.classList.remove('error');
            }
        });
        
        if (!formIsValid) {
            Swal.fire({
                title: 'Atenção!',
                text: 'Por favor, preencha todos os campos obrigatórios.',
                icon: 'warning',
                customClass: 'custom-swal-popup',
                confirmButtonColor: '#42B14B',
            });
            return;
        }
        
        // Coletar dados do formulário
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            subject: document.getElementById('subject').value,
            message: document.getElementById('message').value
        };
        
        // Enviar dados via fetch API (substitua pela sua URL de API)
        fetch('/api/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na requisição');
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                title: 'Sucesso!',
                text: 'Mensagem enviada com sucesso!',
                icon: 'success',
                customClass: 'custom-swal-popup',
                confirmButtonColor: '#42B14B',
            });
            contactForm.reset(); // Limpar o formulário
            checkFormValidity(); // Atualizar estado do botão
        })
        .catch(error => {
            console.error('Erro:', error);
            Swal.fire({
                title: 'Erro!',
                text: 'Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.',
                icon: 'error',
                customClass: 'custom-swal-popup',
                confirmButtonColor: '#42B14B',
            });
        });
    });
});