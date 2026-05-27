// ==========================================================================
// 1. CONFIGURACIÓN INICIAL
// ==========================================================================
const API_KEY = 'fa3ef31ea0b78236a43a91a3b9af300c'; // ¡Pon tu clave real aquí!
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500'; 
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original'; 

// Elementos del DOM (Las 3 Vistas principales)
const heroSection = document.getElementById('hero-section');
const randomSection = document.getElementById('random-section');
const exploreSection = document.getElementById('explore-section');

// Elementos de Contenido
const resultsContainer = document.getElementById('results-container');
const randomShowcase = document.getElementById('random-showcase-container');
const viewTitle = document.getElementById('view-title');
let currentHeroMovieId = null; 

// ==========================================================================
// 2. INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarHero();
    cargarGeneros();
});

// ==========================================================================
// 3. NAVEGACIÓN SPA (Control de pestañas invisibles)
// ==========================================================================
function mostrarVistaPrincipal() {
    heroSection.classList.remove('hidden');
    randomSection.classList.add('hidden');
    exploreSection.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarVistaRandom() {
    heroSection.classList.add('hidden');
    exploreSection.classList.add('hidden');
    randomSection.classList.remove('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function mostrarVistaExplorador(titulo) {
    heroSection.classList.add('hidden');
    randomSection.classList.add('hidden');
    exploreSection.classList.remove('hidden');
    viewTitle.textContent = titulo;
    resultsContainer.innerHTML = '<div class="empty-state"><h3>Cargando...</h3></div>';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Botones para volver al inicio
document.getElementById('logo').addEventListener('click', mostrarVistaPrincipal);
const botonesVolver = document.querySelectorAll('.btn-volver');
botonesVolver.forEach(btn => btn.addEventListener('click', mostrarVistaPrincipal));

// ==========================================================================
// 4. BÚSQUEDA Y SUGERENCIAS EN VIVO (Películas y Series)
// ==========================================================================
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');
let timeoutSugerencias;

// Evento que se dispara cada vez que escribes una letra
searchInput.addEventListener('input', (e) => {
    clearTimeout(timeoutSugerencias); // Evita saturar la API (Debounce)
    const query = e.target.value.trim();
    
    if (query.length < 3) {