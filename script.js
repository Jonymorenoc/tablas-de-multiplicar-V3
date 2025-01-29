const tableTips = {
  1: "Recuerda: cualquier número multiplicado por 1 es igual a sí mismo.",
  2: "Truco: suma el número dos veces. Ejemplo: 2×4 = 4 + 4",
  3: "Suma el número tres veces. 3×5 = 5 + 5 + 5",
  4: "Dobla el resultado de la tabla del 2. 4×3 = 2×3 + 2×3",
  5: "Los resultados siempre terminan en 0 o 5.",
  6: "Dobla la tabla del 3. 6×4 = 3×4 + 3×4",
  7: "Secuencia: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70",
  8: "Dobla la tabla del 4. 8×3 = 4×3 + 4×3",
  9: "Truco de los dedos: baja un dedo para cada multiplicación.",
  10: "Agrega un 0 al número. 10×4 = 40"
};

const startBtn = document.getElementById('start-btn');
const tableButtons = document.querySelectorAll('.table-btn');
const questionContainer = document.getElementById('question-container');
const questionEl = document.getElementById('question');
const answerEl = document.getElementById('answer');
const resultEl = document.getElementById('result');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const streakCount = document.getElementById('streak-count');
const correctSound = document.getElementById('correct-sound');
const incorrectSound = document.getElementById('incorrect-sound');

let selectedTables = [];
let currentQuestion = {};
let confetti;
let streak = 0;
let consecutiveFails = 0;
let lastFailedTable = null;

// Selección de tablas
tableButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('selected');
    const table = parseInt(button.dataset.table);
    
    if(selectedTables.includes(table)) {
      selectedTables = selectedTables.filter(t => t !== table);
    } else {
      selectedTables.push(table);
    }
  });
});

// Iniciar juego
startBtn.addEventListener('click', () => {
  if (selectedTables.length === 0) {
    alert('¡Selecciona al menos una tabla!');
    return;
  }
  questionContainer.classList.remove('hidden');
  generateQuestion();
});

// Generar pregunta
function generateQuestion() {
  resultEl.innerHTML = '';
  answerEl.value = '';
  answerEl.focus();
  
  const weightedTables = selectedTables.flatMap(table => 
    Array(10 - (consecutiveFails > 1 && table === lastFailedTable ? 5 : 0)).fill(table)
  );
  
  const table = weightedTables[Math.floor(Math.random() * weightedTables.length)];
  const number = Math.floor(Math.random() * 10) + 1;
  
  currentQuestion = {
    table,
    number,
    answer: table * number
  };
  
  questionEl.textContent = `${table} × ${number}`;
}

// Manejar respuesta
submitBtn.addEventListener('click', () => {
  const userAnswer = parseInt(answerEl.value);
  
  if (isNaN(userAnswer)) {
    alert('Escribe un número para responder');
    return;
  }

  const isCorrect = userAnswer === currentQuestion.answer;
  handleAnswerFeedback(isCorrect);
  updateStreak(isCorrect);
  showTips(isCorrect);
  
  if (!isCorrect) {
    consecutiveFails++;
    lastFailedTable = currentQuestion.table;
    if (consecutiveFails >= 2) {
      showVisualHelp();
    }
  } else {
    consecutiveFails = 0;
  }
  
  nextBtn.classList.remove('hidden');
});

function handleAnswerFeedback(isCorrect) {
  resultEl.classList.remove('hidden');
  resultEl.className = isCorrect ? 'correct-message' : 'incorrect-message';
  resultEl.innerHTML = isCorrect ? 
    '¡Correcto! 🎉' : 
    `Incorrecto ❌<br>Respuesta correcta: ${currentQuestion.answer}`;

  (isCorrect ? correctSound : incorrectSound).play();
  
  if (isCorrect) {
    confetti = new ConfettiGenerator({
      target: 'confetti-canvas',
      max: 80,
      size: 1,
      animate: true,
      colors: [[74, 144, 226], [245, 166, 35], [46, 204, 113]],
      clock: 25
    }).render();
  }
}

function showTips(isCorrect) {
  const tipBox = document.createElement('div');
  tipBox.className = 'tip-box';
  tipBox.innerHTML = `
    <div class="help-text">${tableTips[currentQuestion.table]}</div>
    ${!isCorrect ? `<div class="help-text">Ejemplo: ${currentQuestion.table}×${currentQuestion.number} = ${currentQuestion.answer}</div>` : ''}
  `;
  resultEl.appendChild(tipBox);
}

function showVisualHelp() {
  const visualHelp = document.createElement('div');
  visualHelp.className = 'visual-help';
  visualHelp.innerHTML = `
    <div class="help-text">${currentQuestion.table} grupos de ${currentQuestion.number}:</div>
    <div class="help-text">${Array(currentQuestion.number).fill(currentQuestion.table).join(' + ')} = ${currentQuestion.answer}</div>
  `;
  resultEl.appendChild(visualHelp);
}

function updateStreak(isCorrect) {
  streak = isCorrect ? streak + 1 : 0;
  streakCount.textContent = streak;
  
  if (isCorrect && streak % 5 === 0 && streak > 0) {
    showMotivationalMessage();
  }
}

function showMotivationalMessage() {
  const messages = [
    "¡Sigue así! 💪",
    "¡Estás mejorando! 🚀",
    "¡Racha de 5! 🔥",
    "¡Eres un crack! 🏆"
  ];
  const message = document.createElement('div');
  message.className = 'tip-box';
  message.textContent = messages[Math.floor(Math.random() * messages.length)];
  resultEl.appendChild(message);
}

// Siguiente pregunta
nextBtn.addEventListener('click', () => {
  confetti?.clear();
  generateQuestion();
  nextBtn.classList.add('hidden');
});
