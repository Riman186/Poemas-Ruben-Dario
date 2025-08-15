// poem.js
document.addEventListener('DOMContentLoaded', async () => {
    const recordButton = document.getElementById('record-button');
    const playButton = document.getElementById('play-button');
    const shareButton = document.getElementById('share-button');
    const poemTitle = document.getElementById('poem-title');
    const poemText = document.getElementById('poem-text');
    let audioBlob;
    let audioUrl;

    // Cargar el poema desde poems.json
    const urlParams = new URLSearchParams(window.location.search);
    const poemId = urlParams.get('id');
    const response = await fetch('poems.json');
    const poems = await response.json();
    const poem = poems.find(p => p.id == poemId);

    poemTitle.textContent = poem.title;
    poemText.textContent = poem.text;

    // Resto del código (grabación, upload a Vercel Blob, etc.)
    // ... (usa el mismo código que te pasé antes para la grabación)
});