// app.js
document.addEventListener('DOMContentLoaded', async () => {
    const poemsList = document.getElementById('poems');
    const searchBar = document.getElementById('search-bar');
    const searchButton = document.getElementById('search-button');

    // Almacenar todos los poemas en una variable global para poder filtrarlos
    let allPoems = [];

    // Función para renderizar los poemas en la lista
    function renderPoems(poemsToRender) {
        poemsList.innerHTML = ''; // Limpiar la lista actual
        if (poemsToRender.length === 0) {
            poemsList.innerHTML = '<p>No se encontraron poemas.</p>';
        }

        poemsToRender.forEach(poem => {
            const li = document.createElement('li');
            li.innerHTML = `
                <h3>${poem.title}</h3>
                <p><strong>Autor:</strong> ${poem.author}</p>
                <p><strong>Tema:</strong> ${poem.theme}</p>
            `;
            li.addEventListener('click', () => {
                window.location.href = `poem.html?id=${poem.id}`;
            });
            poemsList.appendChild(li);
        });
    }

    // Cargar los poemas al inicio
    try {
        const response = await fetch('poems.json');
        allPoems = await response.json();
        renderPoems(allPoems);
    } catch (error) {
        console.error("Error al cargar los poemas:", error);
        poemsList.innerHTML = '<p>Error al cargar los poemas. Intenta de nuevo más tarde.</p>';
    }

    // Agregar evento al botón de búsqueda
    searchButton.addEventListener('click', () => {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredPoems = allPoems.filter(poem => {
            return poem.title.toLowerCase().includes(searchTerm) ||
                   poem.theme.toLowerCase().includes(searchTerm);
        });
        renderPoems(filteredPoems);
    });

    // Opcional: Agregar evento a la barra de búsqueda para que se filtre al presionar "Enter"
    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
});