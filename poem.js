// poem.js (tu archivo actual)
async function uploadRecording(audioBlob) {
  // Convierte el Blob a Base64
  const reader = new FileReader();
  reader.readAsDataURL(audioBlob);
  
  reader.onloadend = async () => {
    const base64Audio = reader.result.split(',')[1]; // Quita el prefijo "data:audio/mp3;base64,"

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio: base64Audio }),
    });

    const data = await response.json();
    console.log('Audio subido:', data.url); // URL pública del audio
    // Aquí puedes guardar "data.url" en tu base de datos (ej: Supabase o Firestore para los poemas)
  };
}

// Ejemplo de uso al grabar:
const audioBlob = new Blob([audioChunks], { type: 'audio/mp3' });
uploadRecording(audioBlob);