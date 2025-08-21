document.addEventListener('DOMContentLoaded', async () => {
    const poemsList = document.getElementById('poems');
    const searchBar = document.getElementById('search-bar');
    const searchButton = document.getElementById('search-button');

    let allPoems = [];

    function renderPoems(poemsToRender) {
        poemsList.innerHTML = ''; 
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

    try {
        const response = await fetch('poems.json');
        allPoems = await response.json();
        renderPoems(allPoems);
    } catch (error) {
        console.error("Error al cargar los poemas:", error);
        poemsList.innerHTML = '<p>Error al cargar los poemas. Intenta de nuevo más tarde.</p>';
    }

    searchButton.addEventListener('click', () => {
        const searchTerm = searchBar.value.toLowerCase();
        const filteredPoems = allPoems.filter(poem => {
            return poem.title.toLowerCase().includes(searchTerm) ||
                   poem.theme.toLowerCase().includes(searchTerm);
        });
        renderPoems(filteredPoems);
    });

    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
});