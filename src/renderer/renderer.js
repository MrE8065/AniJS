// Función genérica para actualizar un contenedor de animes
function updateAnimeContainer(containerSelector, animes) {
    const container = document.querySelector(containerSelector);
    container.innerHTML = '';
    
    animes.forEach(anime => {
        const card = document.createElement('div');
        card.className = 'card';
        
        const params = new URLSearchParams({
            link: anime.link
        });

        card.innerHTML = `
            <a href="detalles/index.html?${params.toString()}">
                <img class="card-img" src="${anime.image}" alt="Carátula de ${anime.title}">
                <span class="card-title">${anime.title}</span>
            </a>
        `;
        
        container.appendChild(card);
    });
}

// Funciones para manejar los eventos de actualización de listas de animes
window.electronAPI.onUpdatePopularAnime((event, animes) => {
    updateAnimeContainer('.card-container.popular', animes);
});

window.electronAPI.onUpdateRecentAnime((event, animes) => {
    updateAnimeContainer('.card-container.recientes', animes);
});