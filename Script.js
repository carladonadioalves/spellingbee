let words = [];
let currentIndex = 0;
let recognition;
let correctCount = 0;
let timerInterval;
let timeLeft = 30;
let isRunning = false;

const letterMap = {
  "a": "A", "b": "B", "c": "C", "d": "D", "e": "E",
  "f": "F", "g": "G", "h": "H", "i": "I", "j": "J",
  "k": "K", "l": "L", "m": "M", "n": "N", "o": "O",
  "p": "P", "q": "Q", "r": "R", "s": "S", "t": "T",
  "u": "U", "v": "V", "w": "W", "x": "X", "y": "Y", "z": "Z"
};

// 🔹 Carregar lista do arquivo listapalavras.txt
async function loadWords() {
  try {
    const response = await fetch("listapalavras.txt");
    const text = await response.text();
    words = text.split(/\r?\n/).map(w => w.trim()).filter(w => w.length > 0);
    document.getElementById("startBtn").disabled = false;
    console.log("Words loaded:", words);
  } catch (err) {
    alert("Erro ao carregar listapalavras.txt");
    console.error(err);
  }
}

// Falar palavra
function speakWord(word) {
  const utter = new SpeechSynthesisUtterance(word);
  utter.lang = "en-US";
  speechSynthesis.speak(utter);
}

// Iniciar reconhecimento
function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.continuous = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    if (!isRunning) return;
    let userInput = event.results[0][0].transcript.toLowerCase().split(/\s+/);
    let spelled = userInput.map(l => letterMap[l] || "").join("");

    const correctWord = words[currentIndex].toUpperCase();

    if (spelled === correctWord) {
      document.getElementById("feedback").innerText = `✅ Correct! (${spelled})`;
      correctCount++;
      nextWord();
    } else {
      document.getElementById("feedback").innerText = `❌ You said: ${spelled} | Correct: ${correctWord}`;
      // 🔹 perguntar se quer repetir
      setTimeout(() => {
        let retry = confirm(`Você errou a palavra "${correctWord}".\nQuer tentar novamente?`);
        if (retry) {
          // repete a mesma palavra
          speakWord(correctWord);
          startTimer();
          recognition.start();
        } else {
          // segue para a próxima
          nextWord();
        }
      }, 500);
    }
  };

  recognition.onerror = (event) => {
    if (!isRunning) return;
    document.getElementById("feedback").innerText = "Error: " + event.error;
    nextWord();
  };
}

// Rodada
function playRound() {
  if (!isRunning) return;

  if (currentIndex >= words.length) {
    endTraining();
    return;
  }

  const word = words[currentIndex];
  document.getElementById("status").innerText = `Word ${currentIndex + 1} of ${words.length}`;
  document.getElementById("feedback").innerText = "";
  speakWord(word);

  startTimer();
  recognition.start();
}

// Timer
function startTimer() {
  clearInterval(timerInterval);
  timeLeft = 30;
  document.getElementById("timer").innerText = `Time left: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    if (!isRunning) {
      clearInterval(timerInterval);
      return;
    }

    timeLeft--;
    document.getElementById("timer").innerText = `Time left: ${timeLeft}s`;

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("feedback").innerText = "⏰ Time up!";
      recognition.stop();
      nextWord();
    }
  }, 1000);
}

// Próxima palavra
function nextWord() {
  clearInterval(timerInterval);
  recognition.stop();
  currentIndex++;
  setTimeout(playRound, 1500);
}

// Fim normal
function endTraining() {
  isRunning = false;
  clearInterval(timerInterval);
  recognition.stop();
  document.getElementById("status").innerText = "🎉 End of list!";
  showScore();

  // Mostrar GIF
  document.getElementById("celebrateGif").style.display = "block";

  document.getElementById("stopBtn").disabled = true;
  document.getElementById("startBtn").disabled = false;
}

// Mostrar resultado parcial ou final
function showScore() {
  const tried = currentIndex;
  const remaining = words.length - currentIndex;
  const percent = tried > 0 ? ((correctCount / tried) * 100).toFixed(1) : 0;
  document.getElementById("score").innerText =
    `Score: ${correctCount} / ${tried} (${percent}%) | Remaining: ${remaining}`;
}

// Início
function startTraining() {
  currentIndex = 0;
  correctCount = 0;
  isRunning = true;
  document.getElementById("score").innerText = "";
  document.getElementById("stopBtn").disabled = false;
  document.getElementById("startBtn").disabled = true;
  document.getElementById("celebrateGif").style.display = "none"; // esconde gif
  initRecognition();
  playRound();
}

// Interromper (resultado parcial)
function stopTraining() {
  isRunning = false;
  clearInterval(timerInterval);
  recognition.stop();
  document.getElementById("status").innerText = "⏹ Training stopped!";
  showScore();

  // Mostrar GIF
  document.getElementById("celebrateGif").style.display = "block";

  document.getElementById("stopBtn").disabled = true;
  document.getElementById("startBtn").disabled = false;
}

// Mostrar lista com toggle
document.getElementById("showListBtn").addEventListener("click", () => {
  const listDiv = document.getElementById("wordList");
  if (listDiv.style.display === "none") {
    listDiv.innerText = words.join("\n");
    listDiv.style.display = "block";
    document.getElementById("showListBtn").innerText = "Hide Word List";
  } else {
    listDiv.style.display = "none";
    document.getElementById("showListBtn").innerText = "Show Word List";
  }
});

document.getElementById("startBtn").addEventListener("click", startTraining);
document.getElementById("stopBtn").addEventListener("click", stopTraining);

// 🔹 Carregar lista ao abrir a página
loadWords();