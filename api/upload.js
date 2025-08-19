async function shareRecording() {
  if (!currentAudioUrl) return;

  try {
    const blob = await fetch(currentAudioUrl).then(r => r.blob());

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mi-grabacion.mp3"; 
    document.body.appendChild(a);
    a.click();
    a.remove();

    alert("🎶 Grabación descargada. Ahora podés enviarla por WhatsApp manualmente.");

  } catch (error) {
    console.error("Error al descargar:", error);
    alert(`Error al descargar: ${error.message}`);
  }
}
