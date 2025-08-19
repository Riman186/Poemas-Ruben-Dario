let mediaRecorder;
let audioChunks = [];
const recordingsList = document.getElementById("recordings");
const recordBtn = document.getElementById("record-button");

recordBtn.addEventListener("click", async () => {
  if (!mediaRecorder || mediaRecorder.state === "inactive") {
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
    recordBtn.textContent = "⏹️ Detener";

    startKaraoke();

  } else {
    mediaRecorder.stop();
    recordBtn.textContent = "🎤 Grabar";
    if (recognition) recognition.stop();
  }
});

function addRecording(url, blob) {
  const li = document.createElement("li");
  li.textContent = "Grabación " + new Date().toLocaleTimeString();

  const playBtn = document.createElement("button");
  playBtn.textContent = "▶️";
  playBtn.onclick = () => {
    const audio = new Audio(url);
    audio.play();
  };

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


let recognition; 
let currentLine = 0;
let poemLines = [];

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

  // Dividir texto en versos
  poemLines = poem.text.split("\n");
  const container = document.getElementById("poem-text");
  container.innerHTML = "";

  poemLines.forEach((line, i) => {
    let span = document.createElement("span");
    span.textContent = line;
    span.id = "line-" + i;
    span.classList.add("karaoke-line");
    container.appendChild(span);
    container.appendChild(document.createElement("br"));
  });

  currentLine = 0;
}

function highlightLine(index) {
  document.querySelectorAll(".karaoke-line").forEach(el => el.classList.remove("active"));
  const el = document.getElementById("line-" + index);
  if (el) {
    el.classList.add("active");
    el.scrollIntoView({ behavior: "smooth", block: "center" }); 
  }
}

function startKaraoke() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    alert("Tu navegador no soporta reconocimiento de voz.");
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("Detectado:", transcript);

    const expected = poemLines[currentLine]?.toLowerCase();
    if (!expected) return;
    
    // Limpiar la línea esperada de puntuación para una mejor comparación
    const cleanedExpected = expected.replace(/[¿?¡!,.]/g, '');

    // Compara si la transcripción incluye las primeras 10 letras del verso, para que sea más precisa
    if (transcript.includes(cleanedExpected.slice(0, 10))) {
      highlightLine(currentLine);
      currentLine++;
    }
  };

  recognition.start();
}

  recognition = new SpeechRecognition();
  recognition.lang = "es-ES";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("Detectado:", transcript);

    const expected = poemLines[currentLine]?.toLowerCase();
    if (!expected) return;

    if (transcript.includes(expected.slice(0, 5))) {
      highlightLine(currentLine);
      currentLine++;
    }
  };

  recognition.start();


loadPoem();
