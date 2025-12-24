/**
 * components/toggle-mode.js
 * Gerencia os toggle switches de modo de busca (Contém/Não Contém/Igual)
 */

const ToggleMode = (function() {
    'use strict';

    // Configuração dos modos
    const modes = {
        contains: {
            next: 'excludes',
            icon: '✓',
            text: 'Contém',
            class: ''
        },
        excludes: {
            next: 'exact',
            icon: '✗',
            text: 'Não Contém',
            class: 'exclude'
        },
        exact: {
            next: 'contains',
            icon: '=',
            text: 'Igual',
            class: 'exact'
        }
    };

    /**
     * Alterna o modo de um toggle
     * @param {HTMLElement} element - Elemento do toggle
     */
    function toggle(element) {
        if (!element) return;

        const currentMode = element.dataset.mode || 'contains';
        const nextMode = modes[currentMode].next;
        const config = modes[nextMode];

        // Remove todas as classes de modo
        element.classList.remove('exclude', 'exact');

        // Aplica nova classe se necessário
        if (config.class) {
            element.classList.add(config.class);
        }

        // Atualiza data attribute
        element.dataset.mode = nextMode;

        // Atualiza ícone e texto
        const icon = element.querySelector('.toggle-icon');
        const text = element.querySelector('.toggle-text');

        if (icon) icon.textContent = config.icon;
        if (text) text.textContent = config.text;

        // Atualiza aria-label
        element.setAttribute('aria-label', 'Modo de busca: ' + config.text);

        console.log('ToggleMode: Alterado para', nextMode);
    }

    /**
     * Reseta um toggle para o modo padrão (contains)
     * @param {HTMLElement} element - Elemento do toggle
     */
    function reset(element) {
        if (!element) return;

        const config = modes.contains;

        element.classList.remove('exclude', 'exact');
        element.dataset.mode = 'contains';

        const icon = element.querySelector('.toggle-icon');
        const text = element.querySelector('.toggle-text');

        if (icon) icon.textContent = config.icon;
        if (text) text.textContent = config.text;

        element.setAttribute('aria-label', 'Modo de busca: ' + config.text);
    }

    /**
     * Obtém o modo atual de um toggle
     * @param {HTMLElement} element - Elemento do toggle
     * @return {string} Modo atual
     */
    function getMode(element) {
        return element ? (element.dataset.mode || 'contains') : 'contains';
    }

    /**
     * Define o modo de um toggle
     * @param {HTMLElement} element - Elemento do toggle
     * @param {string} mode - Modo desejado
     */
    function setMode(element, mode) {
        if (!element || !modes[mode]) return;

        // Reseta primeiro
        reset(element);

        // Se não for 'contains', alterna até chegar no modo desejado
        while (getMode(element) !== mode) {
            toggle(element);
        }
    }

    // API pública
    return {
        toggle,
        reset,
        getMode,
        setMode
    };
})();