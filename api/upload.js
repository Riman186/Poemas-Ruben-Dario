async function shareRecording() {
    if (!currentAudioUrl) return;
    
    try {
        // 1. Convertir Blob a Base64
        const blob = await fetch(currentAudioUrl).then(r => r.blob());
        const base64Audio = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onerror = reject;
            reader.onloadend = () => {
                if (reader.result) {
                    resolve(reader.result.split(',')[1]);
                } else {
                    reject(new Error('Conversión fallida'));
                }
            };
            reader.readAsDataURL(blob);
        });

        // 2. Subir a Vercel Blob
        const response = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ audio: base64Audio })
        });

        // 3. Verificar la respuesta
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Error ${response.status}: ${errorText}`);
        }

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || 'Error desconocido');
        }

        // 4. Compartir en WhatsApp
        const whatsappUrl = `https://wa.me/?text=Escucha mi poema 🎙️: ${result.url}`;
        window.open(whatsappUrl, '_blank');

    } catch (error) {
        console.error('Error al compartir:', error);
        alert(`Error al compartir: ${error.message}`);
    }
}