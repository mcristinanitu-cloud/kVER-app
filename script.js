const API_KEY = 'fa3ef31ea0b78236a43a91a3b9af300c';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_URL = 'https://image.tmdb.org/t/p/w500';

const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');

// Búsqueda en vivo (Sugerencias)
searchInput.addEventListener('input', async (e) => {
    const query = e.target.value.trim();
    if (query.length < 3) { searchSuggestions.classList.add('hidden'); return; }
    
    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    const resultados = data.results.filter(i => i.media_type === 'movie' || i.media_type === 'tv').slice(0, 5);
    
    searchSuggestions.innerHTML = resultados.map(item => `
        <div class="suggestion-item" onclick="ejecutarBusquedaReal('${item.title || item.name}')">
            <img src="${item.poster_path ? IMG_URL + item.poster_path : ''}">
            <div><h4>${item.title || item.name}</h4><span>${item.media_type === 'tv' ? 'Serie' : 'Película'}</span></div>
        </div>`).join('');
    searchSuggestions.classList.remove('hidden');
});

// Función de búsqueda real (la que clicas)
async function ejecutarBusquedaReal(query) {
    document.getElementById('explore-section').classList.remove('hidden');
    document.getElementById('hero-section').classList.add('hidden');
    document.getElementById('random-section').classList.add('hidden');
    searchSuggestions.classList.add('hidden');
    searchInput.value = '';

    const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    pintarPeliculas(data.results.filter(i => i.media_type === 'movie' || i.media_type === 'tv'));
}

// Ocultar sugerencias al hacer clic fuera
document.addEventListener('click', (e) => { if (!e.target.closest('.search-container')) searchSuggestions.classList.add('hidden'); });

// ... (Aquí mantén el resto de tus funciones: cargarHero, cargarRandom, pintarPeliculas, etc)
