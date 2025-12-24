// ============================================
// assets/js/utils/solr-escape.js
// ============================================
/**
 * utils/solr-escape.js
 * Utilitários para escape de caracteres do Solr
 */

const SolrUtils = (function() {
    'use strict';

    /**
     * Escapa caracteres especiais para queries Solr
     * @param {string} value - Valor a ser escapado
     * @param {string} fieldName - Nome do campo (para tratamento especial)
     * @return {string} Valor escapado
     */
    function escape(value, fieldName) {
        if (!value) return '';

        // Campos especiais que precisam de tratamento diferente
        const specialFields = ['nome_unidade_atual_s', 'unidade_origem_s'];

        if (specialFields.indexOf(fieldName) !== -1) {
            // Para estes campos, escapa e converte espaços em "\ *"
            value = value.replace(/[-[\]{}()*+?.,\\^$|#]/g, '\\$&');
            return value.replace(/ /g, '\\ *');
        } else {
            // Para outros campos, escapa tudo incluindo espaços
            return value.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        }
    }

    /**
     * Remove escape de caracteres
     * @param {string} value - Valor a ser desescapado
     * @return {string} Valor desescapado
     */
    function unescape(value) {
        if (!value) return '';
        return value.replace(/\\(.)/g, '$1');
    }

    // API pública
    return {
        escape: escape,
        unescape: unescape
    };
})();