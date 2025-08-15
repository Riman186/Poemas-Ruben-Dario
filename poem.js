document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const poemId = urlParams.get('id');
    const poemTitle = document.getElementById('poem-title');
    const poemText = document.getElementById('poem-text');
    const recordButton = document.getElementById('record-button');
    const playButton = document.getElementById('play-button');
    const shareButton = document.getElementById('share-button');
    
    let mediaRecorder;
    let audioChunks = [];
    let audioBlob;
    
    // Cargar el poema desde Firestore
    db.collection('poems').doc(poemId).get().then((doc) => {
        const poem = doc.data();
        poemTitle.textContent = poem.title;
        poemText.textContent = poem.text;
    });
    
    // Grabación de voz
    recordButton.addEventListener('click', async () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
            recordButton.textContent = 'Grabar';
        } else {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.start();
            recordButton.textContent = 'Detener';
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks.push(event.data);
            };
            
            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/mp3' });
                playButton.disabled = false;
                shareButton.disabled = false;
                audioChunks = [];
            };
        }
    });
    
    // Reproducir grabación
    playButton.addEventListener('click', () => {
        const audioUrl = URL.createObjectURL(audioBlob);
        const audio = new Audio(audioUrl);
        audio.play();
    });
    
    // Compartir grabación
    shareButton.addEventListener('click', () => {
        if (navigator.share) {
            navigator.share({
                title: 'Mi grabación del poema',
                text: 'Escucha mi lectura del poema de Rubén Darío',
                url: audioUrl
            });
        } else {
            // Copiar enlace en PC
            navigator.clipboard.writeText(audioUrl);
            alert('Enlace copiado al portapapeles');
        }
    });
});