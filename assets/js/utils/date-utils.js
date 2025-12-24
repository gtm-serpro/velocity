// ============================================
// assets/js/utils/date-utils.js
// ============================================
/**
 * utils/date-utils.js
 * Utilitários para manipulação de datas
 */

const DateUtils = (function() {
    'use strict';

    /**
     * Formata data para o formato Solr (ISO 8601)
     * @param {string} dateString - Data no formato YYYY-MM-DD
     * @param {boolean} isEndOfDay - Se true, adiciona horário 23:59:59
     * @return {string} Data formatada
     */
    function toSolrFormat(dateString, isEndOfDay) {
        if (!dateString) return null;

        const time = isEndOfDay ? '23:59:59Z' : '00:00:00Z';
        return dateString + 'T' + time;
    }

    /**
     * Obtém a data atual no formato YYYY-MM-DD
     * @return {string} Data atual
     */
    function getToday() {
        return new Date().toISOString().slice(0, 10);
    }

    /**
     * Valida se uma data é válida
     * @param {string} dateString - Data no formato YYYY-MM-DD
     * @return {boolean} True se válida
     */
    function isValid(dateString) {
        if (!dateString) return false;
        
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Compara duas datas
     * @param {string} date1 - Primeira data
     * @param {string} date2 - Segunda data
     * @return {number} -1 se date1 < date2, 0 se iguais, 1 se date1 > date2
     */
    function compare(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        
        if (d1 < d2) return -1;
        if (d1 > d2) return 1;
        return 0;
    }

    /**
     * Formata data para exibição (DD/MM/YYYY HH:MM)
     * @param {string} dateString - Data no formato ISO
     * @return {string} Data formatada
     */
    function formatDisplay(dateString) {
        if (!dateString) return '';

        // Extrai partes da data ISO (2024-01-15T10:30:00Z)
        const day = dateString.substring(8, 10);
        const month = dateString.substring(5, 7);
        const year = dateString.substring(0, 4);
        const time = dateString.substring(11, 16);

        return day + '/' + month + '/' + year + ' ' + time;
    }

    // API pública
    return {
        toSolrFormat: toSolrFormat,
        getToday: getToday,
        isValid: isValid,
        compare: compare,
        formatDisplay: formatDisplay
    };
})();