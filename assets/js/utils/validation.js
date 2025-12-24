// ============================================
// assets/js/utils/validation.js
// ============================================
/**
 * utils/validation.js
 * Utilitários para validação de inputs
 */

const ValidationUtils = (function() {
    'use strict';

    /**
     * Valida CPF
     * @param {string} cpf - CPF a ser validado
     * @return {boolean} True se válido
     */
    function isValidCPF(cpf) {
        if (!cpf) return false;

        // Remove caracteres não numéricos
        cpf = cpf.replace(/[^\d]/g, '');

        // Valida tamanho
        if (cpf.length !== 11) return false;

        // Valida se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;

        // Validação dos dígitos verificadores
        var sum = 0;
        var remainder;

        for (var i = 1; i <= 9; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (var i = 1; i <= 10; i++) {
            sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
        }

        remainder = (sum * 10) % 11;
        if (remainder === 10 || remainder === 11) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    }

    /**
     * Formata CPF (XXX.XXX.XXX-XX)
     * @param {string} cpf - CPF a ser formatado
     * @return {string} CPF formatado
     */
    function formatCPF(cpf) {
        if (!cpf) return '';

        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return cpf;

        return cpf.substring(0, 3) + '.' +
               cpf.substring(3, 6) + '.' +
               cpf.substring(6, 9) + '-' +
               cpf.substring(9, 11);
    }

    /**
     * Valida se é um número
     * @param {string} value - Valor a ser validado
     * @return {boolean} True se é número
     */
    function isNumeric(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }

    /**
     * Valida formato de moeda
     * @param {string} value - Valor a ser validado
     * @return {boolean} True se é válido
     */
    function isCurrency(value) {
        if (!value) return false;
        
        // Remove pontos de milhares e substitui vírgula por ponto
        var normalized = value.replace(/\./g, '').replace(',', '.');
        
        return isNumeric(normalized);
    }

    /**
     * Formata valor monetário
     * @param {string|number} value - Valor a ser formatado
     * @return {string} Valor formatado
     */
    function formatCurrency(value) {
        if (!value) return '0,00';

        var number = typeof value === 'string' ? parseFloat(value) : value;
        
        return number.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    // API pública
    return {
        isValidCPF: isValidCPF,
        formatCPF: formatCPF,
        isNumeric: isNumeric,
        isCurrency: isCurrency,
        formatCurrency: formatCurrency
    };
})();