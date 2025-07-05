document.addEventListener('DOMContentLoaded', function() {
    // Inicializar componentes
    const formSection = new FormSection();
    const tipsSection = new Tips();
    
    document.getElementById('formSection').innerHTML = formSection.render();
    document.getElementById('tipsSection').innerHTML = tipsSection.render();
    
    // Configurar event listeners después de que el DOM esté listo
    formSection.setupEventListeners();
});