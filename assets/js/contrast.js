// ============================================
// assets/js/contrast.js
// ============================================
/**
 * contrast.js
 * Controle de tema de alto contraste
 */

const ContrastControl = (function() {
    'use strict';

    var STORAGE_KEY = 'eprocesso_high_contrast';
    var CONTRAST_CLASS = 'high-contrast';

    /**
     * Inicializa o controle de contraste
     */
    function init() {
        // Verifica preferência salva
        var isHighContrast = localStorage.getItem(STORAGE_KEY) === 'true';
        
        if (isHighContrast) {
            enable();
        }

        // Adiciona listener para mudanças de preferência do sistema
        if (window.matchMedia) {
            window.matchMedia('(prefers-contrast: high)').addListener(function(e) {
                if (e.matches) {
                    enable();
                }
            });
        }

        console.log('ContrastControl: Inicializado');
    }

    /**
     * Ativa modo de alto contraste
     */
    function enable() {
        document.body.classList.add(CONTRAST_CLASS);
        localStorage.setItem(STORAGE_KEY, 'true');
        console.log('ContrastControl: Alto contraste ativado');
    }

    /**
     * Desativa modo de alto contraste
     */
    function disable() {
        document.body.classList.remove(CONTRAST_CLASS);
        localStorage.setItem(STORAGE_KEY, 'false');
        console.log('ContrastControl: Alto contraste desativado');
    }

    /**
     * Alterna modo de alto contraste
     */
    function toggle() {
        if (document.body.classList.contains(CONTRAST_CLASS)) {
            disable();
        } else {
            enable();
        }
    }

    /**
     * Verifica se alto contraste está ativo
     */
    function isEnabled() {
        return document.body.classList.contains(CONTRAST_CLASS);
    }

    // API pública
    return {
        init: init,
        enable: enable,
        disable: disable,
        toggle: toggle,
        isEnabled: isEnabled
    };
})();

// Auto-inicializar
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ContrastControl.init);
} else {
    ContrastControl.init();
}