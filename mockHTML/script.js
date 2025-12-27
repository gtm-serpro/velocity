// select dropdown
const dropdown = document.getElementById('accessibilityDropdown');
const btn = document.getElementById('accessibilityBtn');

btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
    dropdown.classList.remove('open');
});

// limpar do search input
const searchInput = document.querySelector('.searchInput');
const searchWrapper = document.querySelector('.searchInputWraper');

searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 0) {
        searchWrapper.classList.add('hasValue');
    } else {
        searchWrapper.classList.remove('hasValue');
    }
});

// Limpar input ao clicar no X
document.querySelector('.searchCloseBtn').addEventListener('click', (e) => {
    e.preventDefault();
    searchInput.value = '';
    searchWrapper.classList.remove('hasValue');
    searchInput.focus();
});

// toggle sidebar
const sidebarBtn = document.getElementById('sidebarBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

sidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
});
