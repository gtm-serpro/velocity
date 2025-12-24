// ============================================
// assets/js/components/advanced-filters.js
// ============================================
/**
 * advanced-filters.js
 * Lógica do dialog de filtros avançados
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
            textInputs: '.dialog-box input[type="text"]',
            dateInputs: '.dialog-box input[type="date"]',
            toggles: '.toggle-switch'
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
            maximizeIcon: document.querySelector(config.selectors.maximizeIcon)
        };
    }

    /**
     * Vincula eventos
     */
    function bindEvents() {
        // Atalho de teclado: Escape fecha o dialog
        document.addEventListener('keydown', handleKeydown);

        // Atalho de teclado: F11 maximiza/restaura
        document.addEventListener('keydown', handleF11);
    }

    /**
     * Manipula teclas pressionadas
     */
    function handleKeydown(event) {
        if (event.key === 'Escape' && isOpen()) {
            close(event);
        }
    }

    /**
     * Manipula F11 para maximizar
     */
    function handleF11(event) {
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
        if (!elements.overlay || !elements.dialog) return;

        elements.overlay.classList.add(config.classes.active);
        elements.dialog.classList.add(config.classes.active);
        document.body.style.overflow = 'hidden';

        // Foca no primeiro campo
        setTimeout(function() {
            var firstInput = elements.dialog.querySelector('input[type="text"], input[type="date"]');
            if (firstInput) firstInput.focus();
        }, 100);

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

        if (!elements.dialog || !elements.maximizeIcon) return;

        var isMaximized = elements.dialog.classList.contains(config.classes.maximized);

        if (isMaximized) {
            elements.dialog.classList.remove(config.classes.maximized);
            elements.maximizeIcon.textContent = '⛶';
            elements.maximizeBtn.title = 'Maximizar';
            console.log('AdvancedFilters: Dialog restaurado');
        } else {
            elements.dialog.classList.add(config.classes.maximized);
            elements.maximizeIcon.textContent = '⛶';
            elements.maximizeBtn.title = 'Restaurar';
            console.log('AdvancedFilters: Dialog maximizado');
        }
    }

    /**
     * Limpa todos os filtros
     */
    function clearAll() {
        // Limpar inputs de texto
        var textInputs = document.querySelectorAll(config.selectors.textInputs);
        for (var i = 0; i < textInputs.length; i++) {
            textInputs[i].value = '';
        }

        // Limpar inputs de data
        var dateInputs = document.querySelectorAll(config.selectors.dateInputs);
        for (var i = 0; i < dateInputs.length; i++) {
            dateInputs[i].value = '';
        }

        // Resetar todos os toggles para "Contém"
        var toggles = document.querySelectorAll(config.selectors.toggles);
        for (var i = 0; i < toggles.length; i++) {
            if (toggles[i].dataset.mode !== 'contains') {
                ToggleMode.reset(toggles[i]);
            }
        }

        console.log('AdvancedFilters: Todos os filtros limpos');
    }

    /**
     * Aplica os filtros e executa a busca
     */
    function apply() {
        try {
            var filters = collectFilters();
            
            if (filters) {
                SearchForm.appendToQuery(filters);
                close();
                
                // Submit do formulário
                var submitBtn = document.querySelector('#querySubmit');
                if (submitBtn) submitBtn.click();
                
                console.log('AdvancedFilters: Filtros aplicados', filters);
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

        // Processar filtros de data
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
     * Valida CPF e Datas
     */
    function validateFilters() {
        const errors = [];
        
        // Validar CPF se preenchido
        const cpfInput = document.getElementById('cpf_responsavel_s');
        if (cpfInput && cpfInput.value && !ValidationUtils.isValidCPF(cpfInput.value)) {
            errors.push('CPF inválido');
        }
        
        // Validar datas
        const dateFields = ['dt_protocolo_tdt', 'dt_juntada_tdt'];
        dateFields.forEach(field => {
            const from = document.getElementById(field + '_from');
            const to = document.getElementById(field + '_to');
            if (from?.value && to?.value && from.value > to.value) {
                errors.push(`${field}: Data inicial maior que final`);
            }
        });
        
        return errors;
    }


    /**
     * Coleta filtros de data
     */
    function collectDateFilters(today) {
        var dateFields = [
            { id: 'dt_protocolo_tdt', label: 'Data Protocolo' },
            { id: 'dt_juntada_tdt', label: 'Data Juntada' },
            { id: 'dt_registro_tdt', label: 'Data Registro' },
            { id: 'dt_anexacao_tdt', label: 'Data Anexação' }
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
        var to = toInput && toInput.value ? toInput.value + 'T23:59:59Z' : today + 'T23:59:59Z';

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

        var valorFrom = fromInput ? fromInput.value || '*' : '*';
        var valorTo = toInput ? toInput.value || '*' : '*';

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

        for (var i = 0; i < textFields.length; i++) {
            var fieldId = textFields[i];
            var element = document.getElementById(fieldId);
            if (!element || !element.value.trim()) continue;

            var fieldValue = SolrUtils.escape(element.value.trim(), fieldId);
            var fieldGroup = element.closest('.field-group');
            var toggleSwitch = fieldGroup ? fieldGroup.querySelector('.toggle-switch') : null;
            var mode = toggleSwitch ? (toggleSwitch.dataset.mode || 'contains') : 'contains';

            if (mode === 'excludes') {
                result += '-' + fieldId + ':*' + fieldValue + '* ';
            } else if (mode === 'exact') {
                result += fieldId + ':"' + fieldValue + '" ';
            } else {
                result += fieldId + ':*' + fieldValue + '* ';
            }
        }

        return result;
    }

    // API pública
    return {
        init: init,
        open: open,
        close: close,
        toggleMaximize: toggleMaximize,
        clearAll: clearAll,
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