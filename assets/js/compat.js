// assets/js/compat.js
// Funções globais para compatibilidade com código legado

window.loadValues = function(input) {
    if (typeof Autocomplete !== 'undefined') {
        Autocomplete.load(input);
    }
};

window.toggleMode = function(element) {
    if (typeof ToggleMode !== 'undefined') {
        ToggleMode.toggle(element);
    }
};

window.openAdvancedFilters = function() {
    if (typeof AdvancedFilters !== 'undefined') {
        AdvancedFilters.open();
    }
};