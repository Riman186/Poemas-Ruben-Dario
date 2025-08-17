// app.js
document.addEventListener('DOMContentLoaded', async () => {
    const poemsList = document.getElementById('poems');
    const response = await fetch('poems.json'); 
    const poems = await response.json();

    poems.forEach(poem => {
        const li = document.createElement('li');
        li.textContent = poem.title;
        li.addEventListener('click', () => {
            window.location.href = `poem.html?id=${poem.id}`;
        });
        poemsList.appendChild(li);
li.innerHTML = `
  <h3>${poem.title}</h3>
  <p><strong>Tema:</strong> ${poem.theme}</p>
`;
    });
});