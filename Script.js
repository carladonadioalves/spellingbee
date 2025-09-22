let words = [];
let currentIndex = 0;
let recognition;
let correctCount = 0;
let timerInterval;
let timeLeft = 20;
let isRunning = false;
let retryMode = false; // flag para saber se estamos perguntando Yes/No

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
     words = [
				  "EACH",
				  "CHANGE",
				  "MARKET",
				  "WINGS",
				  "SNACK",
				  "HEALED",
				  "DRIVE",
				  "BACKYARD",
				  "CLASSROOM",
				  "VEGETABLES",
				  "STRONG",
				  "COUNTRYSIDE",
				  "WEATHER",
				  "NEIGHBOR",
				  "NOISY",
				  "BEETLE",
				  "CHOICES",
				  "LOWERED",
				  "SILLY",
				  "BRIGHT",
				  "RAISE",
				  "AMAZING",
				  "BOWL",
				  "DAUGHTER",
				  "DETAIL",
				  "HANDSOME",
				  "SPOON",
				  "CRYING",
				  "WEARING",
				  "SHEEPFOLD",
				  "ONLY",
				  "BUILDING",
				  "SOMETIMES",
				  "DRAGONFLY",
				  "EXCITING",
				  "PANCAKES",
				  "ANSWERED",
				  "ESPECIALLY",
				  "HOLE",
				  "KITCHEN",
				  "WHATEVER",
				  "STALLS",
				  "BETHLEHEM",
				  "HONEY",
				  "USUALLY",
				  "SEEDS",
				  "YOUNGEST",
				  "RADISH",
				  "GRASSHOPPER",
				  "HIGHLIGHTED",
				  "SKUNK",
				  "BEETROOT",
				  "ICELAND",
				  "EYEBROW",
				  "WOOL",
				  "LETTUCE",
				  "BUTTERFLY",
				  "STICKERS",
				  "KITTENS",
				  "HUNGRY",
				  "THURSDAY",
				  "ZACCHAEUS",
				  "OATMEAL",
				  "LEAVES",
				  "BLUEBERRY",
				  "FORGIVENESS",
				  "SEASONED",
				  "COCKROACH",
				  "STRAWBERRY",
				  "GEOGRAPHY",
				  "PRECIOUS",
				  "BREAD",
				  "SPOTTED",
				  "QUICKLY",
				  "CHARACTER",
				  "PURR",
				  "JOYFUL",
				  "DISHONEST",
				  "RELEASING",
				  "AWFUL",
				  "ITCH",
				  "UNHAPPY",
				  "IMMEDIATELY",
				  "WOLF",
				  "POLLINATORS",
				  "WRIST",
				  "SYNONYMS",
				  "TRICK",
				  "BITE",
				  "BATTLE",
				  "EVERYTHING",
				  "BELIEVE",
				  "FIREFLY",
				  "CUCKOO",
				  "PAINTBRUSH",
				  "VILLAGERS",
				  "GLASS",
				  "EARLY",
				  "BRIGHTEST",
				  "TRUTH",
				  "SECRET",
				  "HUSBAND",
				  "HIBERNATE",
				  "REASON",
				  "BIRTHDAY",
				  "HUGE",
				  "NIGHT",
				  "MIDNIGHT",
				  "WEDNESDAY",
				  "FAIR",
				  "LIGHT",
				  "GLOW",
				  "THORAX",
				  "BREAKFAST",
				  "FIRST",
				  "YAWN",
				  "FABLE",
				  "SHINE",
				  "CATERPILLAR",
				  "LAZY",
				  "AWESOME",
				  "FUNNY",
				  "FLEA",
				  "SCARY",
				  "SMILED",
				  "PARALYZED",
				  "SHY",
				  "SHOWER",
				  "RACE",
				  "CREEPY",
				  "CANDY BLOSSOM"
				];
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
  recognition.continuous = true; // ⚡ mantém microfone ligado
  recognition.maxAlternatives = 1;

  recognition.onresult = (event) => {
    if (!isRunning) return;
    let transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();

    if (retryMode) {
      // Estamos esperando Yes/No
      if (transcript.includes("yes")) {
        document.getElementById("feedback").innerText = "🔁 Try again!";
        retryMode = false;
        playRound(); // repete a mesma palavra
      } else if (transcript.includes("no")) {
        retryMode = false;
        nextWord();
      }
      return; // sai sem avaliar como soletração
    }

    // Normal: soletrar letra por letra
    let spelled = transcript.split(/\s+/).map(l => letterMap[l] || "").join("");
    const correctWord = words[currentIndex].toUpperCase();

    if (spelled === correctWord) {
      document.getElementById("feedback").innerText = `✅ Correct! (${spelled})`;
      correctCount++;
      nextWord();
    } else {
      // ❌ Errou → ativar modo retry
      document.getElementById("feedback").innerText =
        `❌ You said: ${spelled}\n👉 Try again? (Say: Yes / No)`;
      retryMode = true; // ativa modo de resposta Yes/No
    }
  };

  recognition.onerror = (event) => {
    if (!isRunning) return;
    document.getElementById("feedback").innerText = "Error: " + event.error;
    nextWord();
  };
}

function safeStopRecognition() {
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      console.warn("Recognition já parado:", e);
    }
  }
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
  timeLeft = 20;
  document.getElementById("timer").innerText = `Time left: ${timeLeft}s`;

  timerInterval = setInterval(() => {
    if (!isRunning) {
      clearInterval(timerInterval);
      return;
    }

    if (--timeLeft <= 0) {
      clearInterval(timerInterval);
      document.getElementById("feedback").innerText = "⏰ Time up!";
      safeStopRecognition();
      nextWord();
    } else {
      document.getElementById("timer").innerText = `Time left: ${timeLeft}s`;
    }
  }, 2000);
}

// Próxima palavra
function nextWord() {
  clearInterval(timerInterval);
  safeStopRecognition();
  currentIndex++;
  setTimeout(playRound, 2000);
}

// Fim normal
function endTraining() {
  isRunning = false;
  clearInterval(timerInterval);
  safeStopRecognition();
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
  safeStopRecognition();
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