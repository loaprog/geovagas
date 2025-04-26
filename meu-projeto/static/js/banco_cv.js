// Configuração do efeito de troca de palavras
var options = {
    strings: ["Tecnologia", "Inovação", "Topografia", "Desenvolvedor", "GIS", "Drones"],
    typeSpeed: 100,
    backSpeed: 100,
    backDelay: 1000,
    startDelay: 500,
    loop: true
};

var typed = new Typed("#dynamic-text", options);

// Modal do currículo
document.addEventListener('DOMContentLoaded', function() {
    const curriculoModal = document.getElementById('curriculoModal');
    const openCurriculoBtn = document.getElementById('openCurriculoBtn');
    const closeModal = document.getElementById('closeModal');
    const termosCheckbox = document.querySelector('input[name="termos"]');
    const submitBtn = document.querySelector('#curriculo-form button[type="submit"]');
    const form = document.getElementById('curriculo-form');
    
    // Lista de campos obrigatórios
    const requiredFields = [
        'nome', 'email', 'telefone', 'cidade', 'curriculo',
        'qgis', 'arcgis', 'autocad', 'python', 'ingles',
        'falar_publico', 'confiante_entrevista'
    ];
    
    // Iniciar botão desativado (cinza)
    submitBtn.disabled = true;
    submitBtn.classList.add('btn-disabled');
    
    // Função para verificar se todos os campos estão preenchidos
    function checkFormCompletion() {
        // Verificar campos de texto
        const textFieldsValid = ['nome', 'email', 'telefone', 'cidade'].every(id => {
            const field = document.getElementById(id);
            return field && field.value.trim() !== '';
        });
        
        // Verificar arquivo anexado
        const fileValid = document.getElementById('curriculo').files.length > 0;
        
        // Verificar radio buttons (habilidades)
        const radiosValid = ['qgis', 'arcgis', 'autocad', 'python', 'ingles', 'falar_publico', 'confiante_entrevista'].every(name => {
            return document.querySelector(`input[name="${name}"]:checked`) !== null;
        });
        
        // Verificar checkbox de termos
        const termosValid = termosCheckbox.checked;
        
        return textFieldsValid && fileValid && radiosValid && termosValid;
    }
    
    // Função para atualizar o estado do botão
    function updateSubmitButton() {
        const isComplete = checkFormCompletion();
        
        submitBtn.disabled = !isComplete;
        if (isComplete) {
            submitBtn.classList.remove('btn-disabled');
            submitBtn.classList.add('btn-primary');
        } else {
            submitBtn.classList.remove('btn-primary');
            submitBtn.classList.add('btn-disabled');
        }
    }
    
    // Função para validar o formulário e mostrar erros
    function validateForm() {
        let isValid = true;
        let firstInvalidElement = null;
        
        // Validar campos de texto
        ['nome', 'email', 'telefone', 'cidade'].forEach(id => {
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
        
        // Validar arquivo
        const fileField = document.getElementById('curriculo');
        const fileError = document.createElement('span');
        fileError.className = 'error-message';
        fileError.style.color = 'red';
        fileError.style.fontSize = '12px';
        fileError.style.display = 'block';
        fileError.style.marginTop = '5px';
        
        const existingFileError = fileField.parentNode.querySelector('.error-message');
        if (existingFileError) {
            fileField.parentNode.removeChild(existingFileError);
        }
        
        if (fileField.files.length === 0) {
            fileError.textContent = 'Anexe seu currículo.';
            fileField.parentNode.appendChild(fileError);
            fileField.style.borderColor = 'red';
            
            if (!firstInvalidElement) {
                firstInvalidElement = fileField;
            }
            isValid = false;
        } else {
            fileField.style.borderColor = '#ddd';
        }
        
        // Validar radio buttons (habilidades)
        ['qgis', 'arcgis', 'autocad', 'python', 'ingles', 'falar_publico', 'confiante_entrevista'].forEach(name => {
            const radioGroup = document.querySelectorAll(`input[name="${name}"]`);
            const container = radioGroup[0]?.closest('.skill-level');
            
            if (container) {
                // Remover mensagens de erro anteriores
                const existingError = container.querySelector('.error-message');
                if (existingError) {
                    container.removeChild(existingError);
                }
                
                const isChecked = Array.from(radioGroup).some(radio => radio.checked);
                
                if (!isChecked) {
                    const radioError = document.createElement('span');
                    radioError.className = 'error-message';
                    radioError.style.color = 'red';
                    radioError.style.fontSize = '12px';
                    radioError.style.display = 'block';
                    radioError.style.marginTop = '5px';
                    radioError.textContent = 'Selecione uma opção.';
                    container.appendChild(radioError);
                    
                    if (!firstInvalidElement) {
                        firstInvalidElement = radioGroup[0];
                    }
                    isValid = false;
                }
            }
        });
        
        // Validar checkbox de termos
        const termosContainer = termosCheckbox.closest('.termos');
        const existingTermosError = termosContainer.querySelector('.error-message');
        if (existingTermosError) {
            termosContainer.removeChild(existingTermosError);
        }
        
        if (!termosCheckbox.checked) {
            const termosError = document.createElement('span');
            termosError.className = 'error-message';
            termosError.style.color = 'red';
            termosError.style.fontSize = '12px';
            termosError.style.display = 'block';
            termosError.style.marginTop = '5px';
            termosError.textContent = 'Você deve aceitar os termos.';
            termosContainer.appendChild(termosError);
            
            if (!firstInvalidElement) {
                firstInvalidElement = termosCheckbox;
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
    form.addEventListener('input', updateSubmitButton);
    form.addEventListener('change', updateSubmitButton);
    
    // Adicionar listeners específicos para os radio buttons
    document.querySelectorAll('.skill-options input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', updateSubmitButton);
    });
    
    // Adicionar listener para o checkbox de termos
    termosCheckbox.addEventListener('change', updateSubmitButton);
    
    // Abrir modal
    if (openCurriculoBtn) {
        openCurriculoBtn.addEventListener('click', function(e) {
            e.preventDefault();
            curriculoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // Fechar modal
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            curriculoModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Fechar ao clicar fora do conteúdo
    if (curriculoModal) {
        curriculoModal.addEventListener('click', function(e) {
            if (e.target === curriculoModal) {
                curriculoModal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Fechar com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && curriculoModal.classList.contains('active')) {
            curriculoModal.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
    
// Envio do formulário
if (form) {
    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Impedir múltiplos envios
        if (submitBtn.disabled) return;

        // Validar o formulário
        if (validateForm()) {
            console.log('Validação do formulário passou');

            // Desativa o botão para evitar múltiplos envios
            submitBtn.disabled = true;
            submitBtn.textContent = "Enviando...";
            submitBtn.classList.add('btn-disabled');

            try {
                // Criar objeto FormData para enviar os dados multipart
                const formData = new FormData();
                
                // Adicionar campos de texto
                const nome = document.getElementById('nome').value;
                const email = document.getElementById('email').value;
                const telefone = document.getElementById('telefone').value;
                const cidade = document.getElementById('cidade').value;
                const estado = document.getElementById('estado').value;
                const cargo = document.getElementById('cargo').value;
                
                formData.append('nome', nome);
                formData.append('email', email);
                formData.append('telefone', telefone);
                formData.append('cidade', cidade);
                formData.append('estado', estado);
                formData.append('cargo', cargo);
                
                console.log('Campos de texto adicionados:', {nome, email, telefone, cidade, estado});
                
                // Adicionar habilidades (radio buttons)
                const qgis = document.querySelector('input[name="qgis"]:checked').value;
                const arcgis = document.querySelector('input[name="arcgis"]:checked').value;
                const autocad = document.querySelector('input[name="autocad"]:checked').value;
                const python = document.querySelector('input[name="python"]:checked').value;
                const ingles = document.querySelector('input[name="ingles"]:checked').value;
                const oratoria = document.querySelector('input[name="falar_publico"]:checked').value;
                const entrevista = document.querySelector('input[name="confiante_entrevista"]:checked').value;
                
                formData.append('qgis', qgis);
                formData.append('arcgis', arcgis);
                formData.append('autocad', autocad);
                formData.append('python', python);
                formData.append('ingles', ingles);
                formData.append('oratoria', oratoria);
                formData.append('entrevista', entrevista);
                
                console.log('Habilidades adicionadas:', {qgis, arcgis, autocad, python, ingles, oratoria, entrevista});
                
                // Adicionar arquivo do currículo
                const curriculoFile = document.getElementById('curriculo').files[0];
                formData.append('curriculo', curriculoFile);
                
                
                
                // Enviar para a API
                console.log('Iniciando envio para a API...');
                const response = await fetch('/api/curriculos', {
                    method: 'POST',
                    body: formData
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
                    text: 'Currículo enviado com sucesso! Em breve entraremos em contato.',
                    icon: 'success',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#42B14B',
                    customClass: {
                        popup: 'custom-swal-popup'
                    }
                });

                // Resetar formulário
                this.reset();
                curriculoModal.classList.remove('active');
                document.body.style.overflow = 'auto';
                
                // Resetar o estado do botão
                submitBtn.disabled = true;
                submitBtn.classList.remove('btn-primary');
                submitBtn.classList.add('btn-disabled');
                termosCheckbox.checked = false;
                
                console.log('Processo de envio concluído com sucesso');
                
            } catch (error) {
                console.error('Erro no bloco try-catch:', error);
                console.error('Stack trace:', error.stack);
                
                Swal.fire({
                    title: 'Erro!',
                    text: 'Ocorreu um erro ao enviar seu currículo. Por favor, tente novamente.',
                    icon: 'error',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#e74c3c'
                });
                submitBtn.textContent = "ENVIAR CURRÍCULO";
                submitBtn.classList.remove('btn-disabled');
                submitBtn.classList.add('btn-primary');
            }
        } else {
            console.log('Validação do formulário falhou');
            submitBtn.disabled = false;

        }
    });
}
    
    // Máscara para telefone
    const telefoneInput = document.getElementById('telefone');
    if (telefoneInput) {
        telefoneInput.addEventListener('input', function(e) {
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
});