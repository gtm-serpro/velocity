/**
 * components/autocomplete.js
 * Gerencia o autocomplete dos campos com sugestões
 * 
 * COMPORTAMENTO:
 * 1. Ao CLICAR (focus) no campo → mostra TODOS os valores do domínio
 * 2. Conforme o usuário DIGITA → filtra os valores (client-side)
 * 3. Os valores são carregados UMA VEZ e cacheados
 * 
 * Isso permite ao usuário visualizar o padrão do conteúdo
 * (maiúsculo/minúsculo, nomenclatura, etc.) antes de digitar.
 */

const Autocomplete = (function() {
    'use strict';

    // Configuração
    // URL configurável: usa variável global se definida, senão usa caminho relativo
    var config = {
        solrBaseUrl: window.SOLR_BASE_URL || '/solr/eprocesso',
        limit: 100,  // Aumentado para pegar mais valores do domínio
        minLength: 0 // Permite abrir sem digitar nada
    };

    // Cache dos valores por campo (carrega uma vez, usa sempre)
    var valuesCache = {};
    
    // Controle de campos já inicializados
    var initializedFields = {};

    /**
     * Inicializa o autocomplete para um campo
     * Carrega os valores do domínio e configura o jQuery UI Autocomplete
     * 
     * @param {HTMLElement} input - Elemento do input
     */
    function init(input) {
        if (!input) return;
        
        var fieldName = input.name || input.id;
        
        // Evita inicializar duas vezes
        if (initializedFields[fieldName]) {
            return;
        }
        
        // Marca como inicializado
        initializedFields[fieldName] = true;
        
        // Carrega valores do domínio (se ainda não estiver no cache)
        if (!valuesCache[fieldName]) {
            loadDomainValues(fieldName, function(values) {
                valuesCache[fieldName] = values;
                setupAutocomplete(input, values);
            });
        } else {
            setupAutocomplete(input, valuesCache[fieldName]);
        }
    }

    /**
     * Carrega TODOS os valores do domínio de um campo via Solr Terms API
     * Não usa prefix, pega todos os valores ordenados por frequência
     * 
     * @param {string} fieldName - Nome do campo
     * @param {Function} callback - Função chamada com os valores
     */
    function loadDomainValues(fieldName, callback) {
        var xhr = new XMLHttpRequest();
        var solrField = fieldName;

        // Campo especial para busca geral
        if (fieldName === 'q') {
            solrField = 'conteudo_txt';
        }

        // URL SEM terms.prefix para pegar TODOS os valores
        var url = config.solrBaseUrl + '/terms' +
                  '?terms.fl=' + solrField +
                  '&terms.limit=' + config.limit +
                  '&terms.sort=count' +  // Ordena por frequência (mais usados primeiro)
                  '&omitHeader=true' +
                  '&wt=json';

        console.log('Autocomplete: Carregando domínio de', fieldName);

        xhr.open('GET', url, true);
        
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        var response = JSON.parse(xhr.responseText);
                        var values = [];
                        
                        // Processa resposta do Solr Terms
                        // Formato: { terms: { campo: [termo1, count1, termo2, count2, ...] } }
                        if (response.terms && response.terms[solrField]) {
                            var terms = response.terms[solrField];
                            for (var i = 0; i < terms.length; i += 2) {
                                values.push(terms[i]);
                            }
                        }
                        
                        console.log('Autocomplete: Carregados', values.length, 'valores para', fieldName);
                        callback(values);
                        
                    } catch (error) {
                        console.error('Autocomplete: Erro ao processar resposta', error);
                        callback([]);
                    }
                } else {
                    console.error('Autocomplete: Erro HTTP', xhr.status);
                    callback([]);
                }
            }
        };

        xhr.send();
    }

    /**
     * Configura o jQuery UI Autocomplete com filtragem client-side
     * 
     * @param {HTMLElement} input - Elemento do input
     * @param {Array} allValues - Todos os valores do domínio
     */
    function setupAutocomplete(input, allValues) {
        // Verifica se jQuery UI está disponível
        if (!window.$ || !$.fn.autocomplete) {
            console.warn('Autocomplete: jQuery UI não disponível');
            return;
        }

        var $input = $(input);

        // Configura autocomplete com filtragem client-side
        $input.autocomplete({
            // Source é uma função que filtra os valores
            source: function(request, response) {
                var term = request.term.toLowerCase();
                
                if (!term) {
                    // Se não digitou nada, mostra todos (limitado a 20 para performance)
                    response(allValues.slice(0, 20));
                } else {
                    // Filtra valores que CONTÊM o termo (não apenas começam com)
                    var filtered = allValues.filter(function(value) {
                        return value.toLowerCase().indexOf(term) !== -1;
                    });
                    response(filtered.slice(0, 20));
                }
            },
            minLength: 0, // Permite abrir sem digitar
            delay: 0,     // Sem delay (filtragem é local)
            
            // Ao selecionar um item
            select: function(event, ui) {
                $input.val(ui.item.value);
                $input.trigger('change');
                return false;
            },
            
            // Ao focar em um item (navegação por teclado)
            focus: function(event, ui) {
                return false; // Não preenche o input ao navegar
            }
        });

        // IMPORTANTE: Abre o autocomplete ao clicar/focar no campo
        $input.on('focus', function() {
            // Pequeno delay para garantir que o autocomplete está pronto
            setTimeout(function() {
                $input.autocomplete('search', $input.val());
            }, 100);
        });
        
        // Também abre ao clicar (para casos onde já está focado)
        $input.on('click', function() {
            if (!$input.autocomplete('widget').is(':visible')) {
                $input.autocomplete('search', $input.val());
            }
        });

        // Ajusta z-index para funcionar dentro do dialog
        $input.autocomplete('widget').css('z-index', 10000);
        
        console.log('Autocomplete: Configurado para', input.name || input.id);
    }

    /**
     * Função legada para compatibilidade com onkeyup="loadValues(this)"
     * Agora apenas garante que o campo está inicializado
     * 
     * @param {HTMLElement} input - Elemento do input
     */
    function load(input) {
        // Se ainda não inicializou, inicializa agora
        var fieldName = input.name || input.id;
        if (!initializedFields[fieldName]) {
            init(input);
        }
        // Não precisa fazer mais nada - o jQuery UI Autocomplete
        // já está configurado para filtrar automaticamente
    }

    /**
     * Inicializa todos os campos com autocomplete na página
     * Deve ser chamado no document.ready
     */
    function initAll() {
        var fields = document.querySelectorAll('[data-autocomplete="true"], .ac_input');
        fields.forEach(function(field) {
            init(field);
        });
        console.log('Autocomplete: Inicializados', fields.length, 'campos');
    }

    /**
     * Limpa o cache de um campo específico
     * @param {string} fieldName - Nome do campo (opcional, se não informado limpa tudo)
     */
    function clearCache(fieldName) {
        if (fieldName) {
            delete valuesCache[fieldName];
            delete initializedFields[fieldName];
        } else {
            valuesCache = {};
            initializedFields = {};
        }
    }

    /**
     * Configura opções do autocomplete
     * @param {Object} options - Opções a serem alteradas
     */
    function configure(options) {
        if (options.solrBaseUrl) config.solrBaseUrl = options.solrBaseUrl;
        if (options.limit) config.limit = options.limit;
        if (options.minLength !== undefined) config.minLength = options.minLength;
    }

    // API pública
    return {
        init: init,
        initAll: initAll,
        load: load,  // Compatibilidade com código legado
        clearCache: clearCache,
        configure: configure
    };
})();

/**
 * Função global para compatibilidade com código legado
 * No template: onkeyup="loadValues(this)"
 * 
 * Agora funciona de forma diferente:
 * - Na primeira chamada, inicializa o autocomplete
 * - Nas chamadas seguintes, não faz nada (jQuery UI já filtra automaticamente)
 */
function loadValues(input) {
    Autocomplete.load(input);
}

/**
 * Inicialização automática quando o DOM estiver pronto
 */
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa todos os campos de autocomplete
    Autocomplete.initAll();
});
