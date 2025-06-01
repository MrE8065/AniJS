const { app, BrowserWindow, ipcMain } = require('electron/main')
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')

async function scrapeAnime(url) {
    try {
        const response = await axios.get(url)
        const $ = cheerio.load(response.data)
        const animes = []

        $('ul.ListAnimes li article.Anime').each((i, el) => {
            const title = $(el).find('h3.Title').text()
            const image = $(el).find('.Image figure img').attr('src')
            const link = $(el).find('a').attr('href')

            if (title && image) {
                animes.push({
                    title: title.trim(),
                    image: image.startsWith('//') ? `https:${image}` : image,
                    link: `https://www3.animeflv.net${link}`
                })
            }
        })

        return animes.slice(0, 24) // Limit to 24 animes
    } catch (error) {
        console.error('Error scraping anime:', error)
        return []
    }
}

async function scrapeAnimeDetails(url) {
    try {
        const response = await axios.get(url);
        const $ = cheerio.load(response.data);

        const animeData = {
            title: $('h1.Title').text().trim(),
            image: 'https://www3.animeflv.net' + $('.AnimeCover img').attr('src'),
            type: $('.Type').first().text().trim(),
            state: $('.fa-tv').text().trim(),
            score: $('.vtprmd').text().trim(),
            description: $('.Description p').text().trim(),
            episodes: []
        };

        // Buscar el script que contiene "var episodes = [...]"
        const scripts = $('script');
        let episodesRaw = null;

        scripts.each((i, script) => {
            const content = $(script).html();
            const match = content && content.match(/var episodes = (\[\[.*?\]\]);/s);
            if (match && match[1]) {
                episodesRaw = match[1];
                return false; // Salir del bucle
            }
        });

        if (episodesRaw) {
            // Convertimos la cadena en un array real
            const episodesArray = JSON.parse(episodesRaw);

            const animeSlug = url.split('/').pop(); // Ej: 'anime/nombre-del-anime' → 'nombre-del-anime'

            episodesArray.forEach(ep => {
                const episodeNumber = ep[0];
                const episodeUrl = `https://www3.animeflv.net/ver/${animeSlug}-${episodeNumber}`;

                animeData.episodes.push({
                    number: parseInt(episodeNumber, 10),
                    title: `Episodio ${episodeNumber}`,
                    link: episodeUrl
                });
            });

            // Ordenar los episodios de forma ascendente (según el número de episodio)
            animeData.episodes.sort((a, b) => a.number - b.number);
        }

        return animeData;
    } catch (error) {
        console.error('Error scraping anime details:', error);
        throw error;
    }
}


// Helper functions para mantener el código más limpio
const scrapePopularAnime = () => scrapeAnime('https://www3.animeflv.net/browse?order=rating')
const scrapeRecentAnime = () => scrapeAnime('https://www3.animeflv.net/browse?order=updated')

//--------------------------------------------------------------------

const createWindow = () => {
    const win = new BrowserWindow({
        width: 1280,
        height: 880,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile('src/renderer/index.html')

    // Get and send anime data after window is loaded
    win.webContents.on('did-finish-load', async () => {
        const popularAnime = await scrapePopularAnime()
        win.webContents.send('update-popular-anime', popularAnime)
        
        const recentAnime = await scrapeRecentAnime()
        win.webContents.send('update-recent-anime', recentAnime)
    })
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// Añade el manejador para los detalles del anime
ipcMain.handle('get-anime-details', async (event, link) => {
    return await scrapeAnimeDetails(link);
});
