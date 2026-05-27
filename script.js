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
// 4. BÚSQUEDA Y SUGERENCIAS (Películas y Series)
// ==========================================================================
const searchInput = document.getElementById('search-input');
const searchSuggestions = document.getElementById('search-suggestions');
let timeoutSugerencias;

searchInput.addEventListener('input', (e) => {
    clearTimeout(timeoutSugerencias);
    const query = e.target.value.trim();
    
    if (query.length < 3) {
        searchSuggestions.classList.add('hidden');
        return;
    }

    // Usamos el endpoint 'multi' de la API para buscar pelis y series a la vez
    timeoutSugerencias = setTimeout(async () => {
        try {
            const res = await fetch(`${BASE_URL}/search/multi?api_key=${API_KEY}&language=es-ES&query=${encodeURIComponent(query)}`);
            const data = await res.json();
            mostrarSugerencias(data.results.slice(0, 5)); // Mostramos solo los 5 mejores resultados
        } catch (error) {
            console.error("Error al buscar:", error);
        }
    }, 300);
});

function mostrarSugerencias(items) {
    searchSuggestions.innerHTML = '';
    
    if (items.length === 0) {
        searchSuggestions.innerHTML = '<div class="suggestion-item">No se encontraron resultados</div>';
    } else {
        items.forEach(item => {
            // Solo nos interesan películas o series
            if (item.media_type === 'movie' || item.media_type === 'tv') {
                const title = item.title || item.name;
                const poster = item.poster_path ? `${IMG_URL}${item.poster_path}` : 'placeholder.jpg';
                const type = item.media_type === 'movie' ? 'Película' : 'Serie';
                
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `
                    <img src="${poster}" alt="${title}">
                    <div class="suggestion-info">
                        <h4>${title}</h4>
                        <span>${type}</span>
                    </div>
                `;
                // Aquí podrías añadir un evento click para navegar al detalle
                searchSuggestions.appendChild(div);
            }
        });
    }
    searchSuggestions.classList.remove('hidden');
}

// Cerrar sugerencias al hacer clic fuera
document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target)) {
        searchSuggestions.classList.add('hidden');
    }
});
