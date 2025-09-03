let mediaRecorder;
let audioChunks = [];
const recordingsList = document.getElementById("recordings");
const recordBtn = document.getElementById("record-button");
const visualizerCanvas = document.getElementById("audio-visualizer");
const canvasCtx = visualizerCanvas.getContext("2d");
let animationFrameId;
let recognition;
let currentLine = 0;
let poemLines = [];

let audioContext;
let analyser;
let source;
let dataArray;
let startTime;
let endTime;

const feedbackModal = document.getElementById("feedbackModal");
const feedbackMessage = document.getElementById("feedbackMessage");
const closeModalBtn = document.querySelector(".close-button");

document.addEventListener('DOMContentLoaded', loadPoem);

recordBtn.addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);

      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioContext.createAnalyser();
      source = audioContext.createMediaStreamSource(stream);

      // 🔊 conectar con ganancia 0 para que SpeechRecognition reciba el audio
      source.connect(analyser);
      const gainNode = audioContext.createGain();
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      analyser.connect(gainNode).connect(audioContext.destination);

      analyser.fftSize = 256;
      dataArray = new Uint8Array(analyser.frequencyBinCount);

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

      mediaRecorder.onstop = () => {
        endTime = new Date();
        const duration = (endTime - startTime) / 1000;
        const blob = new Blob(audioChunks, { type: "audio/mp3" });
        const url = URL.createObjectURL(blob);
        audioChunks = [];
        addRecording(url, blob);

        const volume = getAverageVolume();
        provideFeedback(duration, volume);

        currentLine = 0;
        resetKaraokeHighlight();

        cancelAnimationFrame(animationFrameId);
        visualizerCanvas.style.display = 'none';
      };

      mediaRecorder.start();
      startTime = new Date();
      recordBtn.textContent = "⏹️ Detener";

      visualizerCanvas.style.display = 'block';
      drawVisualizer();
      startKaraoke();

    } catch (error) {
      alert("No se pudo iniciar la grabación. Asegúrate de dar permiso al micrófono.");
      console.error("Error al iniciar la grabación:", error);
      resetUI();
    }
  } else {
    stopRecording();
  }
});

function stopRecording() {
  if (mediaRecorder && mediaRecorder.state === "recording") {
    mediaRecorder.stop();
  }
  recordBtn.textContent = "🎤 Grabar";
  cancelAnimationFrame(animationFrameId);
  visualizerCanvas.style.display = 'none';
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

function resetUI() {
  recordBtn.textContent = "🎤 Grabar";
  visualizerCanvas.style.display = 'none';
  resetKaraokeHighlight();
}

closeModalBtn.addEventListener('click', () => feedbackModal.style.display = "none");

window.addEventListener('click', (event) => {
  if (event.target == feedbackModal) {
    feedbackModal.style.display = "none";
  }
});

function getAverageVolume() {
  analyser.getByteFrequencyData(dataArray);
  let sum = dataArray.reduce((a, b) => a + b, 0);
  return sum / dataArray.length;
}

function provideFeedback(duration, volume) {
  const totalPoemWords = poemLines.join(" ").split(/\s+/).length;
  const wordsPerMinute = duration > 0 ? (totalPoemWords / duration) * 60 : 0;

  let feedback = { rhythm: "", volume: "", overall: "" };

  if (wordsPerMinute < 60) feedback.rhythm = "¡Lee un poquito más rápido! ";
  else if (wordsPerMinute > 150) feedback.rhythm = "¡Intenta leer más despacio! ";
  else feedback.rhythm = "Tu ritmo de lectura es bueno. ";

  if (volume < 30) feedback.volume = "Necesitas hablar un poco más fuerte. ";
  else if (volume > 90) feedback.volume = "Estás hablando muy fuerte, ¡baja un poco la voz! ";
  else feedback.volume = "Tu volumen es adecuado. ";

  const linesRead = currentLine;
  if (feedback.rhythm.includes("bueno") && feedback.volume.includes("adecuado")) {
    feedback.overall = "¡Lo hiciste excelente! 🥳";
  } else if (linesRead < poemLines.length / 2) {
    feedback.overall = "Sigue practicando. ¡Vas mejorando mucho! 💪";
  } else {
    feedback.overall = "¡Buen intento! Sigue practicando 👍";
  }

  showFeedbackModal(`${feedback.overall}<br><br>${feedback.rhythm}${feedback.volume}`);
}

function showFeedbackModal(message) {
  feedbackMessage.innerHTML = message;
  feedbackModal.style.display = "flex";
}

function addRecording(url) {
  const li = document.createElement("li");
  li.innerHTML = `
    <span>Grabación ${new Date().toLocaleTimeString()}</span>
    <div>
      <button onclick="playRecording('${url}')">Reproducir ▶️</button>
      <button onclick="downloadRecording('${url}')">Descargar 💾</button>
      <button onclick="deleteRecording(this)">Eliminar 🗑️</button>
    </div>
  `;
  recordingsList.appendChild(li);
}

function playRecording(url) { new Audio(url).play(); }

function downloadRecording(url) {
  const a = document.createElement("a");
  a.href = url;
  a.download = "grabacion-" + Date.now() + ".mp3";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function deleteRecording(button) { button.closest("li").remove(); }

async function loadPoem() {
  const params = new URLSearchParams(window.location.search);
  const poemId = parseInt(params.get("id"), 10);
  const response = await fetch("poems.json");
  const poems = await response.json();
  const poem = poems.find(p => p.id === poemId);

  if (!poem) {
    document.getElementById("poem-title").textContent = "Poema no encontrado";
    return;
  }

  document.getElementById("poem-title").textContent = poem.title;
  poemLines = poem.text.split("\n").filter(line => line.trim() !== "");
  const container = document.getElementById("poem-text");
  container.innerHTML = "";

  poemLines.forEach((line, index) => {
    const span = document.createElement("span");
    span.textContent = line;
    span.id = `line-${index}`;
    span.classList.add("karaoke-line");
    container.appendChild(span);
    container.appendChild(document.createElement("br"));
  });

  currentLine = 0;
}
// Detectar si es móvil
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// Modo manual para móviles
if (isMobile) {
    let manualLine = 0;
    
    // Agregar botones de navegación
    const navContainer = document.createElement('div');
    navContainer.innerHTML = `
        <div class="mobile-nav" style="margin: 15px 0; text-align: center;">
            <button id="prev-line" style="margin: 0 5px; padding: 10px;">← Anterior</button>
            <button id="next-line" style="margin: 0 5px; padding: 10px;">Siguiente →</button>
        </div>
    `;
    document.getElementById('recording-section').prepend(navContainer);
    
    // Funcionalidad de los botones
    document.getElementById('prev-line').addEventListener('click', () => {
        if (manualLine > 0) {
            manualLine--;
            highlightLine(manualLine);
        }
    });
    
    document.getElementById('next-line').addEventListener('click', () => {
        if (manualLine < poemLines.length - 1) {
            manualLine++;
            highlightLine(manualLine);
        }
    });
    
    // Iniciar con la primera línea resaltada
    highlightLine(0);
}
function cleanWord(word) {
  return word.trim().toLowerCase().replace(/[¿?¡!,.\-—"']/g, '');
}

function highlightLine(index) {
  document.querySelectorAll(".karaoke-line").forEach(el => el.classList.remove("active"));
  const el = document.getElementById(`line-${index}`);
  if (el) {
    el.classList.add("active");
    el.scrollIntoView({ behavior: "smooth", block: "nearest" }); // 👈 más amigable en móvil
  }
}


function resetKaraokeHighlight() {
  document.querySelectorAll(".karaoke-line").forEach(el => el.classList.remove("active"));
}

function startKaraoke() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz. Usa Chrome o Edge.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    const expectedLine = poemLines[currentLine];
    if (!expectedLine) return;

    const expectedWords = cleanWord(expectedLine).split(/\s+/).filter(Boolean);
    const recognizedWords = cleanWord(transcript).split(/\s+/).filter(Boolean);

    let matchCount = 0;
    expectedWords.forEach(word => {
      if (recognizedWords.includes(word)) matchCount++;
    });

    if (matchCount / expectedWords.length > 0.5) {
      highlightLine(currentLine);
      currentLine = Math.min(currentLine + 1, poemLines.length);
    }
  };

  recognition.onerror = (e) => console.error("Error en reconocimiento de voz:", e.error);
  recognition.start();
}

function drawVisualizer() {
  animationFrameId = requestAnimationFrame(drawVisualizer);
  analyser.getByteFrequencyData(dataArray);

  canvasCtx.fillStyle = '#e8e8e8';
  canvasCtx.fillRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);

  const barWidth = (visualizerCanvas.width / analyser.frequencyBinCount) * 2.5;
  let x = 0;

  for (let i = 0; i < analyser.frequencyBinCount; i++) {
    const barHeight = dataArray[i] * 0.4;
    canvasCtx.fillStyle = `rgb(52, 152, 219)`;
    canvasCtx.fillRect(x, visualizerCanvas.height - barHeight, barWidth, barHeight);
    x += barWidth + 1;
  }
}
