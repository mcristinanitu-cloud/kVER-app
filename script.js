// 1. CONFIGURACIÓN INICIAL
const API_KEY = 'fa3ef31ea0b78236a43a91a3b9af300c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// Elementos del DOM
const heroSection = document.getElementById('hero-section');
const randomSection = document.getElementById('random-section');
const exploreSection = document.getElementById('explore-section');
const randomShowcase = document.getElementById('random-showcase-container');
const viewTitle = document.getElementById('view-title');

// 2. INICIALIZACIÓN
document.addEventListener('DOMContentLoaded', () => {
    cargarHero();
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
    document.getElementById('results-movie').innerHTML = '<h3>Cargando...</h3>';
    document.getElementById('results-tv').innerHTML = '<h3>Cargando...</h3>';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

document.getElementById('logo').addEventListener('click', mostrarVistaPrincipal);
document.querySelectorAll('.btn-volver').forEach(btn => btn.addEventListener('click', mostrarVistaPrincipal));

// 4. PETICIONES A LA API
async function cargarTopGlobal() {
    mostrarVistaExplorador("Top Global (Tendencias)");
    try {
        const res = await fetch(`${BASE_URL}/trending/all/day?api_key=${API_KEY}&language=es-ES`);
        const data = await res.json();
        const pelis = limpiarResultados(data.results.filter(i => i.media_type === 'movie'));
        const series = limpiarResultados(data.results.filter(i => i.media_type === 'tv'));
        pintarResultados(pelis.slice(0, 10), true, 'movie');
        pintarResultados(series.slice(0, 10), true, 'tv');
    } catch (error) { console.error(error); }
}

async function cargarRandom() {
    randomShowcase.innerHTML = '<h3>Buscando algo épico...</h3>';
    try {
        const randomPage = Math.floor(Math.random() * 50) + 1;
        const tipoAleatorio = Math.random() > 0.5 ? 'movie' : 'tv';
        const res = await fetch(`${BASE_URL}/discover/${tipoAleatorio}?api_key=${API_KEY}&language=es-ES&page=${randomPage}`);
        const data = await res.json();
        const item = data.results[0];
        const poster = item.poster_path ? `${IMG_URL}${item.poster_path}` : 'https://via.placeholder.com/500x750';
        randomShowcase.innerHTML = `<img src="${poster}" class="showcase-img"><div class="showcase-info"><h3>${item.title || item.name}</h3><p>${item.overview || "Sin descripción."}</p></div>`;
    } catch (e) { randomShowcase.innerHTML = '<h3>Error.</h3>'; }
}

async function cargarHero() {
    try {
        const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=es-ES`);
        const data = await res.json();
        const top = data.results[0];
        document.getElementById('hero-title').textContent = top.title;
        document.getElementById('hero-overview').textContent = top.overview;
        heroSection.style.backgroundImage = `url(${IMG_ORIGINAL}${top.backdrop_path})`;
    } catch (e) { console.error(e); }
}

async function cargarPorPlataforma(providerId) {
    try {
        const resM = await fetch(`${BASE_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&watch_region=ES&with_watch_providers=${providerId}`);
        const dataM = await resM.json();
        pintarResultados(limpiarResultados(dataM.results.map(i=>({...i, media_type:'movie'}))), true, 'movie');

        const resT = await fetch(`${BASE_URL}/discover/tv?api_key=${API_KEY}&language=es-ES&watch_region=ES&with_watch_providers=${providerId}`);
        const dataT = await resT.json();
        pintarResultados(limpiarResultados(dataT.results.map(i=>({...i, media_type:'tv'}))), true, 'tv');
    } catch (e) { console.error(e); }
}

async function ejecutarBusqueda() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) return;
    mostrarVistaExplorador(`Resultados: "${query}"`);
    const resM = await fetch(`${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const dataM = await resM.json();
    pintarResultados(limpiarResultados(dataM.results), false, 'movie');
    const resT = await fetch(`${BASE_URL}/search/tv?api_key=${API_KEY}&query=${encodeURIComponent(query)}`);
    const dataT = await resT.json();
    pintarResultados(limpiarResultados(dataT.results), false, 'tv');
}

// 5. RENDERIZADO
function pintarResultados(items, showRank, tipo) {
    const cont = document.getElementById(`results-${tipo}`);
    cont.innerHTML = '';
    items.forEach((item, i) => {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.onclick = () => window.open(`https://www.themoviedb.org/${item.media_type}/${item.id}`, '_blank');
        card.innerHTML = `
            ${showRank ? `<div class="rank-badge">${i + 1}</div>` : ''}
            <img src="${item.poster_path ? IMG_URL+item.poster_path : 'https://via.placeholder.com/500x750'}">
            <div class="movie-info"><h3>${item.title || item.name}</h3></div>
        `;
        cont.appendChild(card);
    });
}

function limpiarResultados(items) { return items ? items.filter(i => i.title || i.name) : []; }

function cambiarPestaña(tipo) {
    document.getElementById('slider-track').style.transform = tipo === 'movie' ? 'translateX(0%)' : 'translateX(-50%)';
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-type') === tipo));
}

document.querySelectorAll('.btn-platform').forEach(b => b.onclick = () => { mostrarVistaExplorador("Explorando..."); cargarPorPlataforma(b.dataset.id); });
document.getElementById('btn-top-global').onclick = cargarTopGlobal;
document.getElementById('btn-random').onclick = () => { mostrarVistaRandom(); cargarRandom(); };
document.getElementById('search-btn').onclick = ejecutarBusqueda;
