// 1. CONFIGURACIÓN INICIAL
const API_KEY = 'fa3ef31ea0b78236a43a91a3b9af300c'; // ¡Pon tu clave real aquí!
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500'; 
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original'; 

// Elementos del DOM (Las 3 Vistas)
const heroSection = document.getElementById('hero-section');
const randomSection = document.getElementById('random-section');
const exploreSection = document.getElementById('explore-section');

const resultsContainer = document.getElementById('results-container');
const randomShowcase = document.getElementById('random-showcase-container');
const viewTitle = document.getElementById('view-title');
let currentHeroMovieId = null; 

// 2. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    cargarHero();
    cargarGeneros();
});

// 3. NAVEGACIÓN SPA (Single Page Application)
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

// 4. PETICIONES A LA API (Fetch)

async function cargarHero() {
    try {
        const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=es-ES`);
        const data = await res.json();
        const topMovie = data.results[0]; 
        currentHeroMovieId = topMovie.id; 
        
        document.getElementById('hero-title').textContent = topMovie.title;
        document.getElementById('hero-overview').textContent = topMovie.overview || "Sin sinopsis.";
        heroSection.style.backgroundImage = `url(${IMG_ORIGINAL}${topMovie.backdrop_path})`;
    } catch (error) {
        console.error("Error cargando el Hero:", error);
    }
}

async function cargarPorPlataforma(providerId) {
    try {
        const res = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&watch_region=ES&with_watch_providers=${providerId}&sort_by=popularity.desc`);
        const data = await res.json();
        
        // CORRECCIÓN: Cambiado de 'pintarPeliculas' a 'pintarResultados'
        pintarResultados(data.results.slice(0, 10), true); 
    } catch (error) {
        mostrarError();
    }
}

async function ejecutarBusqueda() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;

    mostrarVistaExplorador(`Resultados para: "${query}"`);
    document.getElementById('search-input').value = ''; 

    try {
        const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
        const data = await res.json();
        const resultadosFiltrados = data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');
pintarResultados(resultadosFiltrados, false);
    } catch (error) {
        mostrarError();
    }
}

// Eventos Hero (Tráiler)
document.getElementById('btn-trailer').addEventListener('click', async () => {
    if (!currentHeroMovieId) return;
    const res = await fetch(`${BASE_URL}/movie/${currentHeroMovieId}/videos?api_key=${API_KEY}&language=es-ES`);
    const data = await res.json();
    const trailer = data.results.find(v => v.site === 'YouTube' && v.type === 'Trailer');
    if (trailer) window.open(`https://www.youtube.com/watch?v=${trailer.key}`, '_blank');
    else alert('No hay tráiler oficial disponible.');
});
document.getElementById('btn-info').addEventListener('click', () => {
    if (currentHeroMovieId) window.open(`https://www.themoviedb.org/movie/${currentHeroMovieId}`, '_blank');
});

// Eventos Buscador
document.getElementById('search-btn').addEventListener('click', ejecutarBusqueda);
document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') ejecutarBusqueda();
});

// Cargar la película Random (A la vista Dividida)
// Cargar algo aleatorio (Película o Serie)
async function cargarRandom() {
    randomShowcase.innerHTML = '<div class="empty-state"><h3>Buscando algo épico...</h3></div>';
    try {
        // Obtenemos una página aleatoria y un tipo aleatorio (movie o tv)
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const tipoAleatorio = Math.random() > 0.5 ? 'movie' : 'tv';
        
        const res = await fetch(`${BASE_URL}/discover/${tipoAleatorio}?api_key=${API_KEY}&language=es-ES&page=${randomPage}`);
        const data = await res.json();
        
        // Filtramos resultados que tengan un poster (para asegurar calidad visual)
        const itemsValidos = data.results.filter(item => item.poster_path);
        const randomIndex = Math.floor(Math.random() * itemsValidos.length);
        const item = itemsValidos[randomIndex];
        
        const poster = `${IMG_URL}${item.poster_path}`;
        
        // Diferenciamos propiedades entre película y serie
        const titulo = item.title || item.name;
        const urlDetalles = tipoAleatorio === 'movie' 
            ? `https://www.themoviedb.org/movie/${item.id}` 
            : `https://www.themoviedb.org/tv/${item.id}`;
        
        // Pintamos la tarjeta gigante
        randomShowcase.innerHTML = `
            <img src="${poster}" alt="${titulo}" class="showcase-img">
            <div class="showcase-info">
                <h3>${titulo} <small>(${tipoAleatorio === 'movie' ? 'Película' : 'Serie'})</small></h3>
                <p>${item.overview || "Esta obra no tiene descripción, ¡pero seguro que es una joya oculta!"}</p>
                <button class="btn-hero-primary" style="width: fit-content;" onclick="window.open('${urlDetalles}', '_blank')">
                    <i class="fa-solid fa-circle-info"></i> Ver Detalles
                </button>
            </div>
        `;
    } catch (error) {
        randomShowcase.innerHTML = '<div class="empty-state"><h3>Error cargando recomendación. Inténtalo de nuevo.</h3></div>';
    }
}

async function cargarGeneros() {
    try {
        const res = await fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`);
        const data = await res.json();
        const select = document.getElementById('genre-select');
        data.genres.forEach(genero => {
            const option = document.createElement('option');
            option.value = genero.id; option.textContent = genero.name;
            select.appendChild(option);
        });
    } catch (error) {}
}

// Aplicar los filtros del Menú Lateral
async function aplicarFiltros() {
    const genre = document.getElementById('genre-select').value;
    const startYear = document.getElementById('year-start').value;
    const endYear = document.getElementById('year-end').value;
    
    // Cambiamos a la vista de la Cuadrícula
    mostrarVistaExplorador("Resultados Filtrados");

    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&sort_by=popularity.desc`;
    if (genre) url += `&with_genres=${genre}`;
    if (startYear) url += `&primary_release_date.gte=${startYear}-01-01`;
    if (endYear) url += `&primary_release_date.lte=${endYear}-12-31`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        pintarResultados(data.results, false);
    } catch (error) {
        mostrarError();
    }
}

// 5. RENDERIZADO DE LA CUADRÍCULA
function pintarResultados(items, mostrarMedallaTop = false) {
    resultsContainer.innerHTML = ''; 
    if (items.length === 0) {
        resultsContainer.innerHTML = '<div class="empty-state"><h3>No hay resultados</h3><p>Prueba otra búsqueda o cambia los filtros</p></div>';
        return;
    }

    items.forEach((item, index) => {
        const poster = item.poster_path ? `${IMG_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Poster';

        const titulo = item.title || item.name; 
        const tipo = item.media_type === 'tv' ? 'Serie' : 'Película';
        
        const card = document.createElement('div');
        card.classList.add('movie-card');
        
        const rankingHtml = mostrarMedallaTop ? `<div class="rank-badge">${index + 1}</div>` : '';
        
        card.innerHTML = `
            ${rankingHtml}
            <img src="${poster}" alt="${titulo}">
            <div class="movie-info">
                <h3>${titulo} <small style="display:block; font-size: 0.8rem; color: #888;">${tipo}</small></h3>
                <p>${item.overview || "Sin descripción."}</p>
            </div>
        `;
        resultsContainer.appendChild(card);
    });
}

function mostrarError() {
    resultsContainer.innerHTML = '<div class="empty-state"><i class="fa-solid fa-triangle-exclamation"></i><h3>Error de conexión</h3><p>Revisa tu API Key o conexión.</p></div>';
}

// 6. EVENTOS DE LOS BOTONES
const botonesPlataformas = document.querySelectorAll('.btn-platform');
botonesPlataformas.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const nombre = e.target.getAttribute('data-name');
        mostrarVistaExplorador(`Top 10 en ${nombre}`);
        cargarPorPlataforma(id);
    });
});

// Al pulsar Sorpréndeme
document.getElementById('btn-random').addEventListener('click', () => {
    mostrarVistaRandom();
    cargarRandom();
});

// Al pulsar Filtrar en el menú lateral
document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
