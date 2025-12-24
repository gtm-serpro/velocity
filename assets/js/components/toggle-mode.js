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


/**
 * components/autocomplete.js
 * Gerencia o autocomplete dos campos com sugestões
 */

const Autocomplete = (function() {
    'use strict';

    // Configuração
    const config = {
        solrBaseUrl: 'https://eprocesso-buscador.receita.fazenda/solr/eprocesso',
        limit: 20,
        minLength: 2,
        delay: 300,
        cache: {}
    };

    // Timers para debounce
    const timers = {};

    /**
     * Carrega sugestões para um campo
     * @param {HTMLElement} input - Elemento do input
     */
    function load(input) {
        if (!input || !input.value) return;

        const fieldName = input.name || input.id;
        const query = input.value.trim();

        // Ignora se muito curto
        if (query.length < config.minLength) return;

        // Debounce: cancela timer anterior e cria novo
        if (timers[fieldName]) {
            clearTimeout(timers[fieldName]);
        }

        timers[fieldName] = setTimeout(function() {
            fetchSuggestions(input, fieldName, query);
        }, config.delay);
    }

    /**
     * Busca sugestões no Solr
     * @param {HTMLElement} input - Elemento do input
     * @param {string} fieldName - Nome do campo
     * @param {string} query - Termo de busca
     */
    function fetchSuggestions(input, fieldName, query) {
        // Verifica cache
        const cacheKey = fieldName + ':' + query;
        if (config.cache[cacheKey]) {
            applySuggestions(input, config.cache[cacheKey]);
            return;
        }

        // Campo especial para busca geral
        const solrField = (fieldName === 'q') ? 'conteudo_txt' : fieldName;

        // Monta URL
        const url = config.solrBaseUrl + '/terms' +
                    '?limit=' + config.limit +
                    '&terms.prefix=' + encodeURIComponent(query) +
                    '&terms.sort=count' +
                    '&omitHeader=true' +
                    '&terms.fl=' + solrField;

        console.log('Autocomplete: Buscando sugestões para', fieldName);

        // Faz requisição
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    const suggestions = parseSuggestions(response, solrField);
                    
                    // Adiciona ao cache
                    config.cache[cacheKey] = suggestions;
                    
                    applySuggestions(input, suggestions);
                } catch (error) {
                    console.error('Autocomplete: Erro ao processar resposta', error);
                }
            }
        };

        xhr.send();
    }

    /**
     * Processa resposta do Solr e extrai sugestões
     * @param {Object} response - Resposta do Solr
     * @param {string} field - Nome do campo
     * @return {Array} Lista de sugestões
     */
    function parseSuggestions(response, field) {
        const suggestions = [];
        
        if (response.terms && response.terms[field]) {
            const terms = response.terms[field];
            
            // A resposta vem como [termo1, count1, termo2, count2, ...]
            for (let i = 0; i < terms.length; i += 2) {
                suggestions.push(terms[i]);
            }
        }

        return suggestions;
    }

    /**
     * Aplica sugestões ao campo usando jQuery UI Autocomplete
     * @param {HTMLElement} input - Elemento do input
     * @param {Array} suggestions - Lista de sugestões
     */
    function applySuggestions(input, suggestions) {
        if (!input || !window.$ || !$.fn.autocomplete) {
            console.warn('Autocomplete: jQuery UI não disponível');
            return;
        }

        const $input = $(input);

        // Inicializa ou atualiza autocomplete
        if ($input.data('ui-autocomplete')) {
            $input.autocomplete('option', 'source', suggestions);
        } else {
            $input.autocomplete({
                source: suggestions,
                minLength: config.minLength,
                delay: 0, // Delay já foi aplicado no debounce
                select: function(event, ui) {
                    console.log('Autocomplete: Selecionado', ui.item.value);
                }
            });

            // Ajusta z-index dos elementos autocomplete
            setTimeout(function() {
                $('[id^="ui-id-"]').css('z-index', 9999);
            }, 100);
        }
    }

    /**
     * Limpa o cache de sugestões
     * @param {string} fieldName - Nome do campo (opcional)
     */
    function clearCache(fieldName) {
        if (fieldName) {
            // Limpa cache de um campo específico
            Object.keys(config.cache).forEach(function(key) {
                if (key.startsWith(fieldName + ':')) {
                    delete config.cache[key];
                }
            });
        } else {
            // Limpa todo o cache
            config.cache = {};
        }

        console.log('Autocomplete: Cache limpo');
    }

    /**
     * Configura opções do autocomplete
     * @param {Object} options - Opções a serem alteradas
     */
    function configure(options) {
        Object.assign(config, options);
    }

    // API pública
    return {
        load,
        clearCache,
        configure
    };
})();