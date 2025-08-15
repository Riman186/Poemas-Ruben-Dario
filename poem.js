// poem.js
document.addEventListener('DOMContentLoaded', async () => {
    const recordButton = document.getElementById('record-button');
    const playButton = document.getElementById('play-button');
    const shareButton = document.getElementById('share-button');
    let mediaRecorder;
    let audioChunks = [];
    let audioBlob;
    let audioUrl;

    // Cargar el poema desde poems.json
    const urlParams = new URLSearchParams(window.location.search);
    const poemId = urlParams.get('id');
    const response = await fetch('poems.json');
    const poems = await response.json();
    const poem = poems.find(p => p.id == poemId);

    document.getElementById('poem-title').textContent = poem.title;
    document.getElementById('poem-text').textContent = poem.text;

    // 1. Lógica de Grabación
    recordButton.addEventListener('click', async () => {
        if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop();
            recordButton.textContent = 'Grabar';
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream);
                mediaRecorder.start();
                recordButton.textContent = 'Detener';
                audioChunks = [];

                mediaRecorder.ondataavailable = (event) => {
                    audioChunks.push(event.data);
                };

                mediaRecorder.onstop = () => {
                    audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                    audioUrl = URL.createObjectURL(audioBlob);
                    playButton.disabled = false;
                    shareButton.disabled = false;
                };
            } catch (error) {
                alert('Error al acceder al micrófono: ' + error.message);
            }
        }
    });

    // 2. Lógica de Reproducción
    playButton.addEventListener('click', () => {
        if (audioUrl) {
            const audio = new Audio(audioUrl);
            audio.play();
        }
    });

    // 3. Lógica de Compartir (Vercel Blob)
    shareButton.addEventListener('click', async () => {
        if (!audioBlob) return;

        try {
            // Subir a Vercel Blob
            const response = await uploadRecording(audioBlob);
            const audioUrl = response.url;

            // Compartir
            if (navigator.share) {
                await navigator.share({
                    title: 'Mi grabación de ' + poem.title,
                    text: 'Escucha mi lectura de Rubén Darío',
                    url: audioUrl,
                });
            } else {
                await navigator.clipboard.writeText(audioUrl);
                alert('¡Enlace copiado! Pégalo en WhatsApp o redes sociales: ' + audioUrl);
            }
        } catch (error) {
            alert('Error al compartir: ' + error.message);
        }
    });

    // Función para subir a Vercel Blob
    async function uploadRecording(blob) {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        
        return new Promise((resolve, reject) => {
            reader.onloadend = async () => {
                const base64Audio = reader.result.split(',')[1];
                try {
                    const response = await fetch('/api/upload', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ audio: base64Audio }),
                    });
                    resolve(await response.json());
                } catch (error) {
                    reject(error);
                }
            };
        });
    }
});