/**
 * search-form.js
 * Lógica do formulário principal de busca
 */

const SearchForm = (function() {
    'use strict';

    // Configuração
    const config = {
        selectors: {
            form: '#query-form',
            queryInput: '#q',
            inputGroup: '.input-group',
            clearBtn: '.clear-input-btn',
            submitBtn: '#querySubmit'
        }
    };

    // Cache de elementos
    let elements = {};

    /**
     * Inicializa o módulo
     */
    function init() {
        cacheElements();
        bindEvents();
        updateClearButton();
        
        console.log('SearchForm: Inicializado');
    }

    /**
     * Cacheia elementos do DOM
     */
    function cacheElements() {
        elements = {
            form: document.querySelector(config.selectors.form),
            queryInput: document.querySelector(config.selectors.queryInput),
            inputGroup: document.querySelector(config.selectors.inputGroup),
            clearBtn: document.querySelector(config.selectors.clearBtn),
            submitBtn: document.querySelector(config.selectors.submitBtn)
        };
    }

    /**
     * Vincula eventos
     */
    function bindEvents() {
        if (!elements.form) return;

        // Submit do formulário
        elements.form.addEventListener('submit', handleSubmit);

        // Input no campo de busca
        if (elements.queryInput) {
            elements.queryInput.addEventListener('input', handleQueryInput);
            elements.queryInput.addEventListener('keydown', handleQueryKeydown);
        }
    }

    /**
     * Manipula o submit do formulário
     */
    function handleSubmit(event) {
        // Validação: se o campo estiver vazio, busca tudo
        if (elements.queryInput && !elements.queryInput.value.trim()) {
            elements.queryInput.value = '*:*';
        }

        console.log('SearchForm: Executando busca');
    }

    /**
     * Manipula input no campo de busca
     */
    function handleQueryInput() {
        updateClearButton();
    }

    /**
     * Manipula teclas pressionadas no campo de busca
     */
    function handleQueryKeydown(event) {
        // Enter: submete o formulário
        if (event.key === 'Enter') {
            event.preventDefault();
            elements.form.submit();
        }

        // Escape: limpa o campo
        if (event.key === 'Escape') {
            clearMainSearch();
        }
    }

    /**
     * Atualiza visibilidade do botão de limpar
     */
    function updateClearButton() {
        if (!elements.queryInput || !elements.inputGroup) return;

        if (elements.queryInput.value.trim()) {
            elements.inputGroup.classList.add('has-value');
        } else {
            elements.inputGroup.classList.remove('has-value');
        }
    }

    /**
     * Limpa o campo de busca principal
     */
    function clearMainSearch() {
        if (!elements.queryInput) return;

        elements.queryInput.value = '';
        elements.queryInput.focus();
        updateClearButton();

        console.log('SearchForm: Campo limpo');
    }

    /**
     * Obtém o valor atual da busca
     */
    function getQuery() {
        return elements.queryInput ? elements.queryInput.value.trim() : '';
    }

    /**
     * Define o valor da busca
     */
    function setQuery(value) {
        if (!elements.queryInput) return;

        elements.queryInput.value = value;
        updateClearButton();
    }

    /**
     * Adiciona termos à busca atual
     */
    function appendToQuery(terms) {
        if (!elements.queryInput) return;

        const currentQuery = elements.queryInput.value.trim();
        const newQuery = currentQuery ? `${currentQuery} ${terms}` : terms;
        
        setQuery(newQuery);
        
        console.log('SearchForm: Termos adicionados à busca');
    }

    // API pública
    return {
        init,
        clearMainSearch,
        getQuery,
        setQuery,
        appendToQuery,
        updateClearButton
    };
})();

// Polyfill para String.prototype.trim (IE8 e anteriores)
if (typeof String.prototype.trim !== 'function') {
    String.prototype.trim = function() {
        return this.replace(/^\s+|\s+$/g, '');
    };
}