document.addEventListener('DOMContentLoaded', function() {
    const vagaModal = document.getElementById('vagaModal');
    const openVagaBtn = document.getElementById('abrirModalVaga');
    const closeVagaModal = document.getElementById('closeVagaModal');
    const termosVagaCheckbox = document.querySelector('input[name="termos_vaga"]');
    const submitVagaBtn = document.getElementById('submitVagaBtn');
    const vagaForm = document.getElementById('vaga-form');
    
    // Lista de campos obrigatórios (ajustada para os campos atuais no HTML)
    const requiredVagaFields = [
        'empresa', 'email_empresa', 'telefone_empresa', 
        'titulo_vaga', 'cidade', 'estado',
        'descricao', 'como_candidatar'
    ];
    
    // Iniciar botão desativado (cinza)
    submitVagaBtn.disabled = true;
    submitVagaBtn.classList.add('btn-disabled');
    
    // Função para verificar se todos os campos estão preenchidos
    function checkVagaFormCompletion() {
        // Verificar campos de texto obrigatórios
        const textFieldsValid = requiredVagaFields.every(id => {
            const field = document.getElementById(id);
            return field && field.value.trim() !== '';
        });
        
        // Verificar checkbox de termos
        const termosValid = termosVagaCheckbox.checked;
        
        return textFieldsValid && termosValid;
    }
    
    // Função para atualizar o estado do botão
    function updateVagaSubmitButton() {
        const isComplete = checkVagaFormCompletion();
        
        submitVagaBtn.disabled = !isComplete;
        if (isComplete) {
            submitVagaBtn.classList.remove('btn-disabled');
            submitVagaBtn.classList.add('btn-primary');
        } else {
            submitVagaBtn.classList.remove('btn-primary');
            submitVagaBtn.classList.add('btn-disabled');
        }
    }
    
    // Função para validar o formulário e mostrar erros
    function validateVagaForm() {
        let isValid = true;
        let firstInvalidElement = null;
        
        // Validar campos de texto obrigatórios
        requiredVagaFields.forEach(id => {
            const field = document.getElementById(id);
            const errorSpan = document.createElement('span');
            errorSpan.className = 'error-message';
            errorSpan.style.color = 'red';
            errorSpan.style.fontSize = '12px';
            errorSpan.style.display = 'block';
            errorSpan.style.marginTop = '5px';
            
            // Remover mensagens de erro anteriores
            const existingError = field.parentNode.querySelector('.error-message');
            if (existingError) {
                field.parentNode.removeChild(existingError);
            }
            
            if (!field.value.trim()) {
                errorSpan.textContent = 'Preencha este campo.';
                field.parentNode.appendChild(errorSpan);
                field.style.borderColor = 'red';
                
                if (!firstInvalidElement) {
                    firstInvalidElement = field;
                }
                isValid = false;
            } else {
                field.style.borderColor = '#ddd';
            }
        });
        
        // Validar checkbox de termos
        const termosContainer = termosVagaCheckbox.closest('.termos');
        const existingTermosError = termosContainer.querySelector('.error-message');
        if (existingTermosError) {
            termosContainer.removeChild(existingTermosError);
        }
        
        if (!termosVagaCheckbox.checked) {
            const termosError = document.createElement('span');
            termosError.className = 'error-message';
            termosError.style.color = 'red';
            termosError.style.fontSize = '12px';
            termosError.style.display = 'block';
            termosError.style.marginTop = '5px';
            termosError.textContent = 'Você deve confirmar as informações.';
            termosContainer.appendChild(termosError);
            
            if (!firstInvalidElement) {
                firstInvalidElement = termosVagaCheckbox;
            }
            isValid = false;
        }
        
        // Rolar até o primeiro erro
        if (!isValid && firstInvalidElement) {
            firstInvalidElement.scrollIntoView({
                behavior: 'smooth',
                block: 'center'
            });
        }
        
        return isValid;
    }
    
    // Adicionar listeners para todos os campos
    vagaForm.addEventListener('input', updateVagaSubmitButton);
    vagaForm.addEventListener('change', updateVagaSubmitButton);
    
    // Adicionar listener para o checkbox de termos
    termosVagaCheckbox.addEventListener('change', updateVagaSubmitButton);
    
    // Abrir modal
    if (openVagaBtn) {
        openVagaBtn.addEventListener('click', function(e) {
            e.preventDefault();
            vagaModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Fechar modal
    if (closeVagaModal) {
        closeVagaModal.addEventListener('click', function() {
            vagaModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Fechar ao clicar fora do conteúdo
    if (vagaModal) {
        vagaModal.addEventListener('click', function(e) {
            if (e.target === vagaModal) {
                vagaModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && vagaModal.classList.contains('active')) {
            vagaModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
    // Máscara para telefone
    const telefoneEmpresaInput = document.getElementById('telefone_empresa');
    if (telefoneEmpresaInput) {
        telefoneEmpresaInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 11) value = value.substring(0, 11);
            
            if (value.length > 0) {
                value = value.replace(/^(\d{2})(\d)/g, '($1) $2');
                if (value.length > 10) {
                    value = value.replace(/(\d)(\d{4})$/, '$1-$2');
                } else {
                    value = value.replace(/(\d)(\d{4})/, '$1-$2');
                }
            }
            
            e.target.value = value;
        });
    }
    
    // Envio do formulário
    if (vagaForm) {
        vagaForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Impedir múltiplos envios
            if (submitVagaBtn.disabled) return;

            // Validar o formulário
            if (validateVagaForm()) {
                console.log('Validação do formulário de vaga passou');

                // Desativa o botão para evitar múltiplos envios
                submitVagaBtn.disabled = true;
                submitVagaBtn.textContent = "Enviando...";
                submitVagaBtn.classList.add('btn-disabled');

                try {
                    // Criar objeto com os dados no formato esperado pelo endpoint
                    const vagaData = {
                        title: document.getElementById('titulo_vaga').value,
                        company_name: document.getElementById('empresa').value,
                        location: `${document.getElementById('cidade').value}, ${document.getElementById('estado').value}`,
                        description: document.getElementById('descricao').value,
                        application_link: document.getElementById('como_candidatar').value,
                        suggested_by_email: document.getElementById('email_empresa').value,
                        full_description: document.getElementById('descricao').value,
                        location_stay: document.getElementById('estado').value,
                        whatsapp: document.getElementById('telefone_empresa').value,
                    };

                    console.log('Dados da vaga:', vagaData);

                    // Enviar para a API
                    console.log('Iniciando envio para a API...');
                    const response = await fetch('/api/job-suggestions', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(vagaData)
                    });
                    
                    if (!response.ok) {
                        console.error('Erro na resposta da API:', response.status, response.statusText);
                        const errorText = await response.text();
                        console.error('Detalhes do erro:', errorText);
                        throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
                    }
                    
                    const result = await response.json();
                    console.log('Resposta JSON da API:', result);
                    
                    // Mostrar mensagem de sucesso
                    Swal.fire({
                        title: 'Sucesso!',
                        text: 'Vaga cadastrada com sucesso! Em breve ela será publicada em nosso site.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#42B14B',
                        customClass: {
                            popup: 'custom-swal-popup'
                        }
                    });

                    // Resetar formulário
                    this.reset();
                    vagaModal.classList.remove('active');
                    document.body.style.overflow = 'auto';
                    
                    // Resetar o estado do botão
                    submitVagaBtn.disabled = true;
                    submitVagaBtn.classList.remove('btn-primary');
                    submitVagaBtn.classList.add('btn-disabled');
                    termosVagaCheckbox.checked = false;
                    submitVagaBtn.textContent = "PUBLICAR VAGA";
                    
                    console.log('Processo de envio concluído com sucesso');
                    
                } catch (error) {
                    console.error('Erro no bloco try-catch:', error);
                    console.error('Stack trace:', error.stack);
                    
                    Swal.fire({
                        title: 'Erro!',
                        text: 'Ocorreu um erro ao cadastrar a vaga. Por favor, tente novamente.',
                        icon: 'error',
                        confirmButtonText: 'OK',
                        confirmButtonColor: '#e74c3c'
                    });
                    submitVagaBtn.disabled = false;
                    submitVagaBtn.textContent = "PUBLICAR VAGA";
                    submitVagaBtn.classList.remove('btn-disabled');
                    submitVagaBtn.classList.add('btn-primary');
                }
            } else {
                console.log('Validação do formulário falhou');
                submitVagaBtn.disabled = false;
            }
        });
    }
});