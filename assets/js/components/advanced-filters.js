/**
 * components/advanced-filters.js
 * Lógica do dialog de filtros avançados
 * 
 * MODIFICAÇÕES:
 * - Abre automaticamente ao entrar na página sem query string
 * - Campo de busca "q" dentro do dialog sincronizado com o header
 */

const AdvancedFilters = (function() {
    'use strict';

    // Configuração
    const config = {
        selectors: {
            overlay: '#dialogOverlay',
            dialog: '#dialogBox',
            dialogBody: '.dialog-body',
            maximizeBtn: '.dialog-maximize',
            maximizeIcon: '#maximizeIcon',
            textInputs: '.dialog-box input[type="text"]:not(#dialog-q)', // Exclui o campo q do dialog
            dateInputs: '.dialog-box input[type="date"]',
            toggles: '.toggle-switch',
            // Campos de busca principal (header e dialog)
            headerSearch: '#q',
            dialogSearch: '#dialog-q'
        },
        classes: {
            active: 'active',
            maximized: 'maximized'
        }
    };

    // Cache de elementos
    var elements = {};

    /**
     * Inicializa o módulo
     */
    function init() {
        cacheElements();
        bindEvents();
        setupSearchSync();
        setupSearchClearButton();
        setupSearchKeyboardShortcuts();
        
        // Verifica se deve abrir automaticamente
        checkAutoOpen();
        
        console.log('AdvancedFilters: Inicializado');
    }

    /**
     * Cacheia elementos do DOM
     */
    function cacheElements() {
        elements = {
            overlay: document.querySelector(config.selectors.overlay),
            dialog: document.querySelector(config.selectors.dialog),
            dialogBody: document.querySelector(config.selectors.dialogBody),
            maximizeBtn: document.querySelector(config.selectors.maximizeBtn),
            maximizeIcon: document.querySelector(config.selectors.maximizeIcon),
            headerSearch: document.querySelector(config.selectors.headerSearch),
            dialogSearch: document.querySelector(config.selectors.dialogSearch),
            dialogSearchClear: document.querySelector('#dialog-q-clear')
        };
    }

    /**
     * Vincula eventos
     */
    function bindEvents() {
        // Atalho de teclado: Escape fecha o dialog
        document.addEventListener('keydown', handleKeydown);
    }

    /**
     * Configura sincronização bidirecional entre campos de busca
     */
    function setupSearchSync() {
        if (!elements.headerSearch || !elements.dialogSearch) {
            console.warn('AdvancedFilters: Campos de busca não encontrados para sincronização');
            return;
        }

        // Quando digita no header, atualiza no dialog
        elements.headerSearch.addEventListener('input', function() {
            elements.dialogSearch.value = this.value;
        });

        // Quando digita no dialog, atualiza no header
        elements.dialogSearch.addEventListener('input', function() {
            elements.headerSearch.value = this.value;
        });

        // Sincroniza o valor inicial (se header já tem valor)
        if (elements.headerSearch.value) {
            elements.dialogSearch.value = elements.headerSearch.value;
        }

        console.log('AdvancedFilters: Sincronização de campos de busca configurada');
    }

    /**
     * Configura o botão de limpar o campo de busca
     */
    function setupSearchClearButton() {
        if (!elements.dialogSearch || !elements.dialogSearchClear) {
            console.warn('AdvancedFilters: Elementos do botão limpar não encontrados');
            return;
        }

        var input = elements.dialogSearch;
        var clearBtn = elements.dialogSearchClear;

        // Função para mostrar/ocultar o botão baseado no conteúdo
        function updateClearButtonVisibility() {
            if (input.value.trim().length > 0) {
                clearBtn.hidden = false;
                clearBtn.setAttribute('aria-hidden', 'false');
            } else {
                clearBtn.hidden = true;
                clearBtn.setAttribute('aria-hidden', 'true');
            }
        }

        // Atualiza visibilidade ao digitar
        input.addEventListener('input', updateClearButtonVisibility);

        // Também verifica no focus (caso valor já exista)
        input.addEventListener('focus', updateClearButtonVisibility);

        // Ação de limpar
        clearBtn.addEventListener('click', function(e) {
            e.preventDefault();
            clearSearchField();
            input.focus(); // Mantém o foco no campo
        });

        // Verifica estado inicial
        updateClearButtonVisibility();

        console.log('AdvancedFilters: Botão limpar configurado');
    }

    /**
     * Limpa o campo de busca (dialog e header)
     */
    function clearSearchField() {
        if (elements.dialogSearch) {
            elements.dialogSearch.value = '';
            // Dispara evento input para atualizar o botão de limpar
            elements.dialogSearch.dispatchEvent(new Event('input', { bubbles: true }));
        }
        if (elements.headerSearch) {
            elements.headerSearch.value = '';
        }
        
        // Anuncia para leitores de tela
        announceToScreenReader('Campo de busca limpo');
        
        console.log('AdvancedFilters: Campo de busca limpo');
    }

    /**
     * Configura atalhos de teclado para o campo de busca
     */
    function setupSearchKeyboardShortcuts() {
        if (!elements.dialogSearch) return;

        elements.dialogSearch.addEventListener('keydown', function(e) {
            // Enter - Aplica os filtros e busca
            if (e.key === 'Enter') {
                e.preventDefault();
                apply();
                return;
            }

            // Escape - Limpa o campo (se tiver texto) ou fecha o dialog (se vazio)
            if (e.key === 'Escape') {
                if (this.value.trim().length > 0) {
                    e.preventDefault();
                    e.stopPropagation(); // Evita que feche o dialog
                    clearSearchField();
                }
                // Se vazio, deixa o evento propagar para fechar o dialog
                return;
            }
        });

        console.log('AdvancedFilters: Atalhos de teclado configurados');
    }

    /**
     * Anuncia mensagem para leitores de tela (acessibilidade)
     */
    function announceToScreenReader(message) {
        var announcement = document.getElementById('sr-announcements');
        
        // Cria o elemento de anúncios se não existir
        if (!announcement) {
            announcement = document.createElement('div');
            announcement.id = 'sr-announcements';
            announcement.setAttribute('role', 'status');
            announcement.setAttribute('aria-live', 'polite');
            announcement.setAttribute('aria-atomic', 'true');
            announcement.className = 'sr-only';
            document.body.appendChild(announcement);
        }

        // Limpa e adiciona a mensagem
        announcement.textContent = '';
        setTimeout(function() {
            announcement.textContent = message;
        }, 100);
    }

    /**
     * Verifica se deve abrir o dialog automaticamente
     * Abre se não houver parâmetros de busca na URL
     */
    function checkAutoOpen() {
        var urlParams = new URLSearchParams(window.location.search);
        
        // Parâmetros que indicam que uma busca foi feita
        var hasQuery = urlParams.has('q') && urlParams.get('q').trim() !== '';
        var hasFilterQuery = urlParams.has('fq') && urlParams.get('fq').trim() !== '';
        
        // Se não tem busca nem filtros, abre o dialog automaticamente
        if (!hasQuery && !hasFilterQuery) {
            // Pequeno delay para garantir que o DOM está pronto
            setTimeout(function() {
                open();
                console.log('AdvancedFilters: Dialog aberto automaticamente (sem query na URL)');
            }, 100);
        }
    }

    /**
     * Manipula teclas pressionadas
     */
    function handleKeydown(event) {
        if (event.key === 'Escape' && isOpen()) {
            close(event);
        }
        if (event.key === 'F11' && isOpen()) {
            event.preventDefault();
            toggleMaximize(event);
        }
    }

    /**
     * Verifica se o dialog está aberto
     */
    function isOpen() {
        return elements.dialog && elements.dialog.classList.contains(config.classes.active);
    }

    /**
     * Abre o dialog
     */
    function open() {
        if (!elements.overlay || !elements.dialog) {
            cacheElements();
        }
        
        if (!elements.overlay || !elements.dialog) return;

        elements.overlay.classList.add(config.classes.active);
        elements.dialog.classList.add(config.classes.active);
        document.body.style.overflow = 'hidden';

        // Recacheia o botão de limpar (pode não existir na primeira carga)
        if (!elements.dialogSearchClear) {
            elements.dialogSearchClear = document.querySelector('#dialog-q-clear');
            if (elements.dialogSearchClear) {
                setupSearchClearButton();
            }
        }

        // Sincroniza o campo de busca ao abrir
        if (elements.headerSearch && elements.dialogSearch) {
            elements.dialogSearch.value = elements.headerSearch.value;
            // Dispara evento para atualizar o botão de limpar
            elements.dialogSearch.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Foca no campo de busca do dialog (prioridade) ou primeiro campo
        setTimeout(function() {
            if (elements.dialogSearch) {
                elements.dialogSearch.focus();
                // Seleciona todo o texto para facilitar substituição
                elements.dialogSearch.select();
            } else {
                var firstInput = elements.dialog.querySelector('input[type="text"], input[type="date"]');
                if (firstInput) firstInput.focus();
            }
        }, 100);

        // Anuncia abertura para leitores de tela
        announceToScreenReader('Dialog de filtros avançados aberto. Pressione Escape para fechar.');

        console.log('AdvancedFilters: Dialog aberto');
    }

    /**
     * Fecha o dialog
     */
    function close(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!elements.overlay || !elements.dialog) return;

        elements.overlay.classList.remove(config.classes.active);
        elements.dialog.classList.remove(config.classes.active);
        document.body.style.overflow = '';

        // Garante que o header está sincronizado ao fechar
        if (elements.headerSearch && elements.dialogSearch) {
            elements.headerSearch.value = elements.dialogSearch.value;
        }

        // Anuncia fechamento para leitores de tela
        announceToScreenReader('Dialog de filtros fechado');

        // Retorna o foco para o botão que abriu o dialog (se existir)
        var openButton = document.querySelector('[data-opens="filters-dialog"]');
        if (openButton) {
            openButton.focus();
        }

        console.log('AdvancedFilters: Dialog fechado');
    }

    /**
     * Alterna entre maximizado e normal
     */
    function toggleMaximize(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }

        if (!elements.dialog) return;

        elements.dialog.classList.toggle(config.classes.maximized);
        console.log('AdvancedFilters: Toggle maximizar');
    }

    /**
     * Limpa todos os filtros
     */
    function clearAll() {
        // Limpar inputs de texto (exceto o campo de busca principal do dialog)
        var textInputs = document.querySelectorAll(config.selectors.textInputs);
        textInputs.forEach(function(input) {
            input.value = '';
        });

        // Limpar inputs de data
        var dateInputs = document.querySelectorAll(config.selectors.dateInputs);
        dateInputs.forEach(function(input) {
            input.value = '';
        });

        // Resetar todos os toggles para "Contém"
        var toggles = document.querySelectorAll(config.selectors.toggles);
        toggles.forEach(function(toggle) {
            if (typeof ToggleMode !== 'undefined') {
                ToggleMode.reset(toggle);
            }
        });

        // NÃO limpa o campo de busca principal (q) - isso é intencional
        // O usuário pode querer manter o termo de busca e apenas limpar os filtros

        console.log('AdvancedFilters: Todos os filtros limpos');
    }

    /**
     * Limpa tudo incluindo o campo de busca
     */
    function clearAllIncludingSearch() {
        clearAll();
        
        // Limpa também o campo de busca
        if (elements.headerSearch) elements.headerSearch.value = '';
        if (elements.dialogSearch) elements.dialogSearch.value = '';
        
        console.log('AdvancedFilters: Todos os filtros e busca limpos');
    }

    /**
     * Aplica os filtros e executa a busca
     */
    function apply() {
        try {
            var filters = collectFilters();
            
            // Pega o valor do campo de busca (do dialog ou header)
            var searchQuery = '';
            if (elements.dialogSearch && elements.dialogSearch.value.trim()) {
                searchQuery = elements.dialogSearch.value.trim();
            } else if (elements.headerSearch && elements.headerSearch.value.trim()) {
                searchQuery = elements.headerSearch.value.trim();
            }

            // Garante que o header está atualizado
            if (elements.headerSearch && searchQuery) {
                elements.headerSearch.value = searchQuery;
            }

            if (filters || searchQuery) {
                // Adiciona filtros ao campo de busca principal
                if (filters && typeof SearchForm !== 'undefined') {
                    SearchForm.appendToQuery(filters);
                }
                
                close();
                
                // Submit do formulário
                var submitBtn = document.querySelector('#querySubmit');
                if (submitBtn) submitBtn.click();
                
                console.log('AdvancedFilters: Filtros aplicados', { query: searchQuery, filters: filters });
            } else {
                alert('Por favor, preencha ao menos um campo de busca ou filtro.');
            }
        } catch (error) {
            console.error('AdvancedFilters: Erro ao aplicar filtros', error);
            alert('Erro ao aplicar filtros: ' + error.message);
        }
    }

    /**
     * Coleta todos os filtros preenchidos
     */
    function collectFilters() {
        var searchValue = '';
        var today = new Date().toISOString().slice(0, 10);

        // Processar filtros de data (APENAS 2 CAMPOS AGORA)
        var dateFilters = collectDateFilters(today);
        if (dateFilters === 'error') return null;
        searchValue += dateFilters;

        // Processar valor do processo
        var valorFilter = collectValorFilter();
        searchValue += valorFilter;

        // Processar campos de texto
        var textFilters = collectTextFilters();
        searchValue += textFilters;

        return searchValue.trim();
    }

    /**
     * Coleta filtros de data
     * ATUALIZADO: Apenas dt_protocolo_tdt e dt_juntada_tdt
     */
    function collectDateFilters(today) {
        // REMOVIDOS: dt_registro_tdt e dt_anexacao_tdt
        var dateFields = [
            { id: 'dt_protocolo_tdt', label: 'Data do Protocolo do Processo' },
            { id: 'dt_juntada_tdt', label: 'Data da Juntada' }
        ];

        var result = '';

        for (var i = 0; i < dateFields.length; i++) {
            var field = dateFields[i];
            var range = buildDateRange(field.id, field.label, today);
            if (range === 'error') return 'error';
            result += range;
        }

        return result;
    }

    /**
     * Constrói um range de datas
     */
    function buildDateRange(prefix, label, today) {
        var fromInput = document.getElementById(prefix + '_from');
        var toInput = document.getElementById(prefix + '_to');

        if (!fromInput) return '';

        var from = fromInput.value ? fromInput.value + 'T00:00:00Z' : '';
        var to = toInput && toInput.value ? toInput.value + 'T23:59:59Z' : '';

        // Se apenas "De" foi preenchido, usa hoje como "Até"
        if (from && !to) {
            to = today + 'T23:59:59Z';
        }

        // Validação básica
        if (from && to && from > to) {
            alert(label + ': Data inicial não pode ser maior que data final');
            return 'error';
        }

        return from && to ? prefix + ':[' + from + ' TO ' + to + '] ' : '';
    }

    /**
     * Coleta filtro de valor do processo
     */
    function collectValorFilter() {
        var fromInput = document.getElementById('valor_processo_d_from');
        var toInput = document.getElementById('valor_processo_d_to');

        var valorFrom = fromInput && fromInput.value ? fromInput.value : '*';
        var valorTo = toInput && toInput.value ? toInput.value : '*';

        if (valorFrom !== '*' || valorTo !== '*') {
            return 'valor_processo_d:[' + valorFrom + ' TO ' + valorTo + '] ';
        }

        return '';
    }

    /**
     * Coleta filtros de campos de texto
     */
    function collectTextFilters() {
        var textFields = [
            'grupo_processo_s', 'tipo_processo_s', 'subtipo_processo_s', 'processo_s',
            'situacao_s', 'assuntos_objetos_s', 'tipo_documento_s', 'titulo_s',
            'numero_doc_principal_exp_s', 'tributo_act_s', 'unidade_origem_s',
            'equipe_origem_s', 'nome_unidade_atual_s', 'nome_equipe_atual_s',
            'ni_contribuinte_s', 'nome_contribuinte_s', 'cpf_responsavel_s',
            'nome_usuario_juntada_doc_s', 'nome_relator_drj_s', 'aleg_recurso_contrib_txt',
            'result_questdrj_nivel1_s', 'result_questdrj_nivel2_s'
        ];

        var result = '';

        textFields.forEach(function(fieldId) {
            var element = document.getElementById(fieldId);
            if (!element || !element.value.trim()) return;

            var fieldValue = element.value.trim();
            
            // Escapa caracteres especiais do Solr
            if (typeof SolrUtils !== 'undefined') {
                fieldValue = SolrUtils.escape(fieldValue, fieldId);
            }
            
            // Obtém o modo do toggle associado
            var fieldGroup = element.closest('.field-group');
            var toggleSwitch = fieldGroup ? fieldGroup.querySelector('.toggle-switch') : null;
            var mode = toggleSwitch ? (toggleSwitch.dataset.mode || 'contains') : 'contains';

            // Constrói a query baseado no modo
            if (mode === 'excludes') {
                result += '-' + fieldId + ':*' + fieldValue + '* ';
            } else if (mode === 'exact') {
                result += fieldId + ':"' + fieldValue + '" ';
            } else {
                result += fieldId + ':*' + fieldValue + '* ';
            }
        });

        return result;
    }

    // API pública
    return {
        init: init,
        open: open,
        close: close,
        toggleMaximize: toggleMaximize,
        clearAll: clearAll,
        clearAllIncludingSearch: clearAllIncludingSearch,
        clearSearchField: clearSearchField,
        apply: apply,
        isOpen: isOpen
    };
})();

// Auto-inicialização quando o DOM estiver pronto
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', AdvancedFilters.init);
} else {
    AdvancedFilters.init();
}
