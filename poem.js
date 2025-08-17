document.addEventListener('DOMContentLoaded', async () => {
    const recordButton = document.getElementById('record-button');
    const playButton = document.getElementById('play-button');
    const shareButton = document.getElementById('share-button');
    const recordingsList = document.getElementById('recordings');
    
    let mediaRecorder;
    let audioChunks = [];
    let currentAudioUrl = null;
    const poemId = new URLSearchParams(window.location.search).get('id');
    
    const poem = { title: "Poema Ejemplo", text: "Texto del poema..." }; 
    
    let recordings = loadRecordings();
    renderRecordings();

    recordButton.addEventListener('click', toggleRecording);
    playButton.addEventListener('click', () => playRecording(currentAudioUrl));
    shareButton.addEventListener('click', shareRecording);

    async function toggleRecording() {
        if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop();
            recordButton.textContent = '🎤 Grabar';
            recordButton.style.background = '#4CAF50';
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                recordButton.textContent = '⏹️ Detener';
                recordButton.style.background = '#f44336';
                audioChunks = [];

                mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
                
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                    currentAudioUrl = URL.createObjectURL(audioBlob);
                    recordings.push({
                        id: Date.now(),
                        url: currentAudioUrl,
                        date: new Date().toLocaleTimeString()
                    });
                    saveRecordings();
                    renderRecordings();
                    playButton.disabled = false;
                    shareButton.disabled = false;
                };
            } catch (error) {
                alert('¡Permiso del micrófono denegado! 🎤❌');
            }
        }
    }

    function playRecording(url) {
        if (!url) return;
        new Audio(url).play();
    }

    async function shareRecording() {
        if (!currentAudioUrl) return;
        
        try {
           const blob = await fetch(currentAudioUrl).then(r => r.blob());
            const base64Audio = await new Promise(resolve => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(blob);
            });

            // Subir a Vercel Blob
            const response = await fetch('/api/upload', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ audio: base64Audio })
            });
            
            const { url: publicUrl } = await response.json();
navigator.clipboard.writeText(publicUrl);
alert('Enlace copiado: ' + publicUrl);            
        } catch (error) {
            alert('Error al compartir: ' + error.message);
        }
    }

    function deleteRecording(id) {
        recordings = recordings.filter(rec => rec.id !== id);
        saveRecordings();
        renderRecordings();
    }

    function renderRecordings() {
        recordingsList.innerHTML = recordings.map(rec => `
            <li>
                <span>Grabación ${rec.date}</span>
                <div class="recording-actions">
                    <button onclick="playRecording('${rec.url}')">▶️</button>
                    <button onclick="shareSingleRecording('${rec.url}')">📤</button>
                    <button onclick="deleteRecording(${rec.id})">🗑️</button>
                </div>
            </li>
        `).join('');
    }

    function loadRecordings() {
        return JSON.parse(localStorage.getItem(`recordings_${poemId}`)) || [];
    }

    function saveRecordings() {
        localStorage.setItem(`recordings_${poemId}`, JSON.stringify(recordings));
    }

    window.playRecording = playRecording;
    window.deleteRecording = deleteRecording;
    window.shareSingleRecording = async (url) => {
        currentAudioUrl = url;
        await shareRecording();
    };
});