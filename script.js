// ==========================================================================
// 1. CONFIGURACIÓN INICIAL
// ==========================================================================
const API_KEY = 'fa3ef31ea0b78236a43a91a3b9af300c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500'; 
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original'; 

const heroSection = document.getElementById('hero-section');
const randomSection = document.getElementById('random-section');
const exploreSection = document.getElementById('explore-section');
const resultsContainer = document.getElementById('results-container');
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');

// ==========================================================================
// 2. INICIALIZACIÓN
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
    cargarHero();
    cargarGeneros();
    
    // Eventos de Navegación
    document.getElementById('logo').addEventListener('click', mostrarVistaPrincipal);
    document.querySelectorAll('.btn-volver').forEach(btn => btn.addEventListener('click', mostrarVistaPrincipal));
    
    // Eventos de Plataformas
    document.querySelectorAll('.btn-platform').forEach(btn => {
        btn.addEventListener('click', () => {
            filtrarPorPlataforma(btn.getAttribute('data-id'), btn.getAttribute('data-name'));
        });
    });

    // Botón ¡Sorpréndeme!
    document.getElementById('btn-random').addEventListener('click', cargarRandom);
});

// ==========================================================================
// 3. FUNCIONES DE VISTA (NAVEGACIÓN)
// ==========================================================================
function mostrarVistaPrincipal() {
    heroSection.classList.remove('hidden');
    randomSection.classList.add('hidden');
    exploreSection.classList.add('hidden');
}

function mostrarVistaRandom() {
    heroSection.classList.add('hidden');
    exploreSection.classList.add('hidden');
    randomSection.classList.remove('hidden');
}

function mostrarVistaExplorador(titulo) {
    heroSection.classList.add('hidden');
    randomSection.classList.add('hidden');
    exploreSection.classList.remove('hidden');
    document.getElementById('view-title').textContent = titulo;
}

// ==========================================================================
// 4. LÓGICA PRINCIPAL (API)
// ==========================================================================

// Cargar Hero con el Top 1 de España
async function cargarHero() {
    const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=es-ES&region=ES`);
    const data = await res.json();
    const movie = data.results[0];
    document.getElementById('hero-title').textContent = movie.title;
    document.getElementById('hero-overview').textContent = movie.overview;
    heroSection.style.backgroundImage = `url(${IMG_ORIGINAL}${movie.backdrop_path})`;
}

// Cargar Géneros para el filtro
async function cargarGeneros() {
    const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`);
    const data = await res.json();
    const select = document.getElementById('genre-select');
    data.genres.forEach(g => {
        select.innerHTML += `<option value="${g.id}">${g.name}</option>`;
    });
}

// Filtrar por Plataforma (Netflix, Disney, etc)
async function filtrarPorPlataforma(id, name) {
    mostrarVistaExplorador(`Top en ${name}`);
    const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&watch_region=ES&with_watch_providers=${id}`);
    const data = await res.json();
    renderizarResultados(data.results);
}

// Lógica de "Sorpréndeme"
async function cargarRandom() {
    mostrarVistaRandom();
    const res = await fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&language=es-ES&page=${Math.floor(Math.random() * 10) + 1}`);
    const data = await res.json();
    const movie = data.results[Math.floor(Math.random() * data.results.length)];
    document.getElementById('random-showcase-container').innerHTML = `
        <img src="${IMG_URL}${movie.poster_path}" class="showcase-img">
        <div class="showcase-info">
            <h3>${movie.title}</h3>
            <p>${movie.overview}</p>
        </div>
    `;
}

// Renderizado de tarjetas
function renderizarResultados(items) {
    resultsContainer.innerHTML = '';
    items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'movie-card';
        div.innerHTML = `
            <img src="${item.poster_path ? IMG_URL + item.poster_path : 'placeholder.jpg'}">
            <div class="movie-info">
                <h3>${item.title || item.name}</h3>
            </div>
        `;
        resultsContainer.appendChild(div);
    });
}

// ==========================================================================
// 5. BÚSQUEDA Y SUGERENCIAS
// ==========================================================================
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) return searchSuggestions.classList.add('hidden');

    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    
    searchSuggestions.innerHTML = '';
    data.results.slice(0, 5).forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.innerHTML = `
            <img src="${item.poster_path ? IMG_URL + item.poster_path : 'placeholder.jpg'}">
            <div class="suggestion-info">
                <h4>${item.title || item.name}</h4>
            </div>
        `;
        div.addEventListener('click', () => {
            mostrarVistaExplorador("Resultados de búsqueda");
            renderizarResultados([item]);
            searchSuggestions.classList.add('hidden');
        });
        searchSuggestions.appendChild(div);
    });
    searchSuggestions.classList.remove('hidden');
});
