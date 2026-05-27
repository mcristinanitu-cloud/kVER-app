// 1. CONFIGURACIÓN INICIAL
const API_KEY = 'fa3ef31ea0b78236a43a91a3b9af300c';
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

// 3. NAVEGACIÓN SPA
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

document.getElementById('logo').addEventListener('click', mostrarVistaPrincipal);
document.querySelectorAll('.btn-volver').forEach(btn => btn.addEventListener('click', mostrarVistaPrincipal));

// 4. PETICIONES A LA API

async function cargarTopGlobal() {
    mostrarVistaExplorador("Top Global (Tendencias)");
    try {
        // Prueba cambiando 'all' por 'movie' para descartar que sea el endpoint
        const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=es-ES`);
        const data = await res.json();
        
        console.log("Respuesta de API:", data);
        
        const resultadosFiltrados = limpiarResultados(data.results);
        pintarResultados(resultadosFiltrados.slice(0, 10), true); 
    } catch (error) {
        console.error(error);
        mostrarError();
    }
}

async function cargarRandom() {
    randomShowcase.innerHTML = '<div class="empty-state"><h3>Buscando algo épico...</h3></div>';
    try {
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const tipoAleatorio = Math.random() > 0.5 ? 'movie' : 'tv';
        
        const res = await fetch(`${BASE_URL}/discover/${tipoAleatorio}?api_key=${API_KEY}&language=es-ES&page=${randomPage}`);
        const data = await res.json();
        
        const itemsConTipo = data.results.map(item => ({...item, media_type: tipoAleatorio}));
        const itemsValidos = limpiarResultados(itemsConTipo);

        if (itemsValidos.length > 0) {
            const randomIndex = Math.floor(Math.random() * itemsValidos.length);
            const item = itemsValidos[randomIndex];
            const poster = item.poster_path ? `${IMG_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Poster';
            const titulo = item.title || item.name;
            const urlDetalles = tipoAleatorio === 'movie' ? `https://www.themoviedb.org/movie/${item.id}` : `https://www.themoviedb.org/tv/${item.id}`;
            
            randomShowcase.innerHTML = `
                <img src="${poster}" alt="${titulo}" class="showcase-img">
                <div class="showcase-info">
                    <h3>${titulo} <small>(${tipoAleatorio === 'movie' ? 'Película' : 'Serie'})</small></h3>
                    <p>${item.overview || "Esta obra no tiene descripción."}</p>
                    <button class="btn-hero-primary" style="width: fit-content;" onclick="window.open('${urlDetalles}', '_blank')">
                        <i class="fa-solid fa-circle-info"></i> Ver Detalles
                    </button>
                </div>
            `;
        } else {
            randomShowcase.innerHTML = '<div class="empty-state"><h3>No encontramos contenido, intenta de nuevo.</h3></div>';
        }
    } catch (error) {
        randomShowcase.innerHTML = '<div class="empty-state"><h3>Error cargando recomendación.</h3></div>';
    }
}

async function cargarHero() {
    try {
        const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=es-ES`);
        const data = await res.json();
        const topMovie = data.results[0]; 
        currentHeroMovieId = topMovie.id; 
        document.getElementById('hero-title').textContent = topMovie.title;
        document.getElementById('hero-overview').textContent = topMovie.overview || "Sin sinopsis.";
        heroSection.style.backgroundImage = `url(${IMG_ORIGINAL}${topMovie.backdrop_path})`;
    } catch (error) { console.error("Error Hero:", error); }
}

async function cargarPorPlataforma(providerId) {
    // Limpiamos los contenedores antes de cargar
    document.getElementById('results-movie').innerHTML = '<h3>Cargando películas...</h3>';
    document.getElementById('results-tv').innerHTML = '<h3>Cargando series...</h3>';

    try {
        // Llamada para películas
        const resMovie = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&watch_region=ES&with_watch_providers=${providerId}&sort_by=popularity.desc`);
        const dataMovie = await resMovie.json();
        const pelis = limpiarResultados(dataMovie.results.map(i => ({...i, media_type: 'movie'})));
        pintarResultados(pelis.slice(0, 10), true, 'movie');

        // Llamada para series
        const resTv = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&watch_region=ES&with_watch_providers=${providerId}&sort_by=popularity.desc`);
        const dataTv = await resTv.json();
        const series = limpiarResultados(dataTv.results.map(i => ({...i, media_type: 'tv'})));
        pintarResultados(series.slice(0, 10), true, 'tv');

    } catch (error) {
        mostrarError();
    }
}

async function ejecutarBusqueda() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    mostrarVistaExplorador(`Resultados para: "${query}"`);
    
    // Limpiamos contenedores
    document.getElementById('results-movie').innerHTML = '<h3>Cargando...</h3>';
    document.getElementById('results-tv').innerHTML = '<h3>Cargando...</h3>';

    try {
        // Películas
        const resM = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
        const dataM = await resM.json();
        pintarResultados(limpiarResultados(dataM.results), false, 'movie');

        // Series
        const resT = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
        const dataT = await resT.json();
        pintarResultados(limpiarResultados(dataT.results), false, 'tv');
    } catch (error) { mostrarError(); }
}

// 5. RENDERIZADO Y FILTROS
// 5. RENDERIZADO Y FILTROS
// MODIFICACIÓN: Ahora recibe el tipo para saber dónde pintar
function pintarResultados(items, mostrarMedallaTop = false, tipoPintar = 'movie') {
    const contenedor = document.getElementById(`results-${tipoPintar}`);
    contenedor.innerHTML = ''; 
    
    if (items.length === 0) {
        contenedor.innerHTML = '<div class="empty-state"><h3>No hay resultados</h3></div>';
        return;
    }

    items.forEach((item, index) => {
        const poster = item.poster_path ? `${IMG_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750?text=Sin+Poster';
        const titulo = item.title || item.name; 
        const tipo = item.media_type === 'tv' ? 'Serie' : 'Película';
        
        const card = document.createElement('div');
        card.classList.add('movie-card');
        card.style.cursor = 'pointer'; 
        
        card.addEventListener('click', () => {
            window.open(`https://www.themoviedb.org/${item.media_type}/${item.id}`, '_blank');
        });

        card.innerHTML = `
            ${mostrarMedallaTop ? `<div class="rank-badge">${index + 1}</div>` : ''}
            <img src="${poster}" alt="${titulo}">
            <div class="movie-info">
                <h3>${titulo} <small style="display:block; font-size: 0.8rem; color: #888;">${tipo}</small></h3>
                <p>${item.overview ? item.overview.substring(0, 100) + '...' : "Sin descripción."}</p>
            </div>
        `;
        contenedor.appendChild(card);
    }); // <--- ¡ESTA LLAVE CERRABA EL FOREACH!
}

function limpiarResultados(items) {
    return items.filter(item => {
        const tieneTitulo = item.title || item.name;
        if (!item.media_type) {
            item.media_type = item.title ? 'movie' : 'tv';
        }
        const esValido = (item.media_type === 'movie' || item.media_type === 'tv');
        return esValido && tieneTitulo;
    });
}

const botonesPlataformas = document.querySelectorAll('.btn-platform');
botonesPlataformas.forEach(boton => {
    boton.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const nombre = e.target.getAttribute('data-name');
        
        // Ignoramos el botón de Top Global porque ese tiene su propio evento
        if (id) {
            mostrarVistaExplorador(`Top 10 en ${nombre}`);
            cargarPorPlataforma(id);
        }
    });
});

// Ejemplo para una búsqueda que llene ambos lados del slider
async function buscarConDesplazamiento(query) {
    // 1. Buscas pelis
    const resMovie = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${query}`);
    const dataMovie = await resMovie.json();
    pintarResultados(limpiarResultados(dataMovie.results), false, 'movie');

    // 2. Buscas series
    const resTv = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${query}`);
    const dataTv = await res.json();
    pintarResultados(limpiarResultados(dataTv.results), false, 'tv');
}

function cambiarPestaña(tipo) {
    const track = document.getElementById('slider-track');
    const botones = document.querySelectorAll('.tab-btn');
    
    track.style.transform = tipo === 'movie' ? 'translateX(0%)' : 'translateX(-50%)';
    
    botones.forEach(b => {
        // Esto compara el atributo 'data-type' que pusimos en el HTML
        b.classList.toggle('active', b.getAttribute('data-type') === tipo);
    });
}

// Eventos finales
document.getElementById('btn-top-global').addEventListener('click', cargarTopGlobal);
document.getElementById('btn-random').addEventListener('click', () => { mostrarVistaRandom(); cargarRandom(); });
document.getElementById('search-btn').addEventListener('click', ejecutarBusqueda);

