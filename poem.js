let mediaRecorder;
let audioChunks = [];
const recordingsList = document.getElementById("recordings");

document.getElementById("record-button").addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    // Iniciar grabación
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = e => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/mp3" });
      const url = URL.createObjectURL(blob);
      audioChunks = [];

      addRecording(url, blob);
    };

    mediaRecorder.start();
    document.getElementById("record-button").textContent = "⏹️ Detener";

  } else {
    // Detener grabación
    mediaRecorder.stop();
    document.getElementById("record-button").textContent = "🎤 Grabar";
  }
});

function addRecording(url, blob) {
  const li = document.createElement("li");
  li.textContent = "Grabación " + new Date().toLocaleTimeString();

  // ▶️ Reproducir
  const playBtn = document.createElement("button");
  playBtn.textContent = "▶️";
  playBtn.onclick = () => {
    const audio = new Audio(url);
    audio.play();
  };

  // 💾 Descargar
  const downloadBtn = document.createElement("button");
  downloadBtn.textContent = "💾";
  downloadBtn.onclick = () => {
    const a = document.createElement("a");
    a.href = url;
    a.download = "grabacion-" + Date.now() + ".mp3";
    a.click();
  };

  // 🗑️ Eliminar
  const deleteBtn = document.createElement("button");
  deleteBtn.textContent = "🗑️";
  deleteBtn.onclick = () => {
    recordingsList.removeChild(li);
  };

  li.appendChild(document.createTextNode(" "));
  li.appendChild(playBtn);
  li.appendChild(downloadBtn);
  li.appendChild(deleteBtn);

  recordingsList.appendChild(li);
}
