document.addEventListener('DOMContentLoaded', async () => {
    // Elementos del DOM
    const recordButton = document.getElementById('record-button');
    const playButton = document.getElementById('play-button');
    const shareButton = document.getElementById('share-button');
    const recordingsList = document.getElementById('recordings');
    let mediaRecorder;
    let audioChunks = [];

    // Cargar el poema
    const poemId = new URLSearchParams(window.location.search).get('id');
    const poems = await (await fetch('poems.json')).json();
    const poem = poems.find(p => p.id == poemId);
    document.getElementById('poem-title').textContent = poem.title;
    document.getElementById('poem-text').textContent = poem.text;

    // Cargar grabaciones existentes (simulado)
    let recordings = JSON.parse(localStorage.getItem(`recordings_${poemId}`)) || [];
    renderRecordings();

    // Grabación de voz
    recordButton.addEventListener('click', toggleRecording);
    playButton.addEventListener('click', playLastRecording);
    shareButton.addEventListener('click', shareLastRecording);

    // Funciones
    async function toggleRecording() {
        if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop();
            recordButton.textContent = 'Grabar';
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            recordButton.textContent = 'Detener';
            audioChunks = [];

            mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const recording = {
                    id: Date.now(),
                    url: audioUrl,
                    blob: await blobToBase64(audioBlob),
                    date: new Date().toLocaleString()
                };
                
                recordings.push(recording);
                localStorage.setItem(`recordings_${poemId}`, JSON.stringify(recordings));
                renderRecordings();
            };
        }
    }

    function renderRecordings() {
        recordingsList.innerHTML = recordings.map(rec => `
            <li>
                <span>Grabación ${new Date(rec.id).toLocaleTimeString()}</span>
                <div class="recording-actions">
                    <button onclick="playRecording('${rec.url}')">▶️</button>
                    <button onclick="shareRecording('${rec.url}')">📤</button>
                    <button onclick="deleteRecording(${rec.id})">🗑️</button>
                </div>
            </li>
        `).join('');
    }

    window.playRecording = (url) => new Audio(url).play();
    
    window.shareRecording = async (url) => {
        // Subir a Vercel Blob para obtener enlace público
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: url.split(',')[1] })
        });
        const { url: publicUrl } = await response.json();
        
        // Compartir vía WhatsApp
        window.open(`https://wa.me/?text=Escucha mi grabación: ${publicUrl}`);
    };

    window.deleteRecording = (id) => {
        recordings = recordings.filter(rec => rec.id !== id);
        localStorage.setItem(`recordings_${poemId}`, JSON.stringify(recordings));
        renderRecordings();
    };

    async function blobToBase64(blob) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(blob);
        });
    }
});