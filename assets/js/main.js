// ============================================
// assets/js/main.js
// ============================================
/**
 * main.js
 * Script principal da aplicação
 * Inicializa todos os módulos
 */

(function() {
    'use strict';

    /**
     * Inicializa a aplicação
     */
    function init() {
        console.log('eProcesso Buscador: Inicializando...');

        // Inicializar módulos
        if (typeof SearchForm !== 'undefined') {
            SearchForm.init();
        }

        if (typeof AdvancedFilters !== 'undefined') {
            AdvancedFilters.init();
        }

        // Configurar autocomplete se disponível
        if (typeof Autocomplete !== 'undefined') {
            Autocomplete.configure({
                minLength: 2,
                limit: 20,
                delay: 300
            });
        }

        console.log('eProcesso Buscador: Pronto!');
    }

    // Inicializar quando DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();