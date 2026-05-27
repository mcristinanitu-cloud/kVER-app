const API_KEY = 'fa3ef31ea0b78236a43a91a3b9af300c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';
const IMG_ORIGINAL = 'https://image.tmdb.org/t/p/original';

// Inicialización
document.addEventListener('DOMContentLoaded', () => { cargarHero(); cargarGeneros(); });

// Navegación
function mostrarVista(vista) {
    document.getElementById('hero-section').classList.toggle('hidden', vista !== 'hero');
    document.getElementById('random-section').classList.toggle('hidden', vista !== 'random');
    document.getElementById('explore-section').classList.toggle('hidden', vista !== 'explore');
}

// Búsqueda y Sugerencias
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');

searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) { searchSuggestions.classList.add('hidden'); return; }
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    mostrarSugerencias(data.results.filter(i => i.media_type === 'movie' || i.media_type === 'tv').slice(0, 5));
});

function mostrarSugerencias(res) {
    searchSuggestions.innerHTML = res.map(item => `
        <div class="suggestion-item" onclick="ejecutarBusqueda('${item.title || item.name}')">
            <img src="${item.poster_path ? IMG_URL + item.poster_path : ''}">
            <div><h4>${item.title || item.name}</h4><span>${item.media_type === 'tv' ? 'Serie' : 'Película'}</span></div>
        </div>`).join('');
    searchSuggestions.classList.remove('hidden');
}

async function ejecutarBusqueda(query) {
    mostrarVista('explore');
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    pintarPeliculas(data.results.filter(i => i.media_type === 'movie' || i.media_type === 'tv'));
}

async function cargarHero() {
    const res = await fetch(`${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=es-ES`);
    const data = await res.json();
    const movie = data.results[0];
    document.getElementById('hero-title').textContent = movie.title;
    document.getElementById('hero-overview').textContent = movie.overview;
    document.getElementById('hero-section').style.backgroundImage = `url(${IMG_ORIGINAL}${movie.backdrop_path})`;
}

function pintarPeliculas(list, top = false) {
    const cont = document.getElementById('results-container');
    cont.innerHTML = list.map((p, i) => `
        <div class="movie-card">
            ${top ? `<div class="rank-badge">${i+1}</div>` : ''}
            <img src="${p.poster_path ? IMG_URL + p.poster_path : ''}">
            <div class="movie-info"><h3>${p.title || p.name}</h3></div>
        </div>`).join('');
}

// Eventos
document.getElementById('logo').onclick = () => mostrarVista('hero');
document.querySelectorAll('.btn-volver').forEach(b => b.onclick = () => mostrarVista('hero'));
document.getElementById('btn-random').onclick = () => { mostrarVista('random'); /* Añadir llamada a cargarRandom */ };
document.getElementById('search-btn').onclick = () => ejecutarBusqueda(searchInput.value);