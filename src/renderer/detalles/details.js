// Función para cargar los datos al entrar en la página
document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const animeLink = params.get('link');
    
    try {
        const animeData = await window.electronAPI.getAnimeDetails(animeLink);
        
        // Actualizamos la UI con los datos
        document.querySelector('.anime-detail img').src = animeData.image;
        document.querySelector('.title').textContent = animeData.title;
        document.querySelector('.type').textContent = animeData.type;
        document.querySelector('.state').textContent = animeData.state;
        document.querySelector('.score').textContent = animeData.score;
        document.querySelector('.description').textContent = animeData.description;
        
        // Actualizamos la lista de episodios
        const episodeList = document.querySelector('.episode-list');
        if (animeData.episodes && animeData.episodes.length > 0) {
            episodeList.innerHTML = animeData.episodes.map(episode => `
                <li>
                    <a href="${episode.link}" target="_blank">${episode.title}</a>
                </li>
            `).join('');
        } else {
            episodeList.innerHTML = '<li>No se encontraron episodios</li>';
        }
    } catch (error) {
        console.error('Error al cargar los detalles:', error);
        document.querySelector('.episode-list').innerHTML = 
            '<li>Error al cargar los episodios</li>';
    }
});