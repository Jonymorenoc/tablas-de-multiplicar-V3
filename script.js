/************************************
 *         TRUCOS Y MENSAJES       *
 ************************************/
const tableTips = {
  1: {
    main: "Recuerda: cualquier número multiplicado por 1 es igual a sí mismo.",
    extra: "1 actúa como identidad en la multiplicación."
  },
  2: {
    main: "Truco: sumar el número dos veces. Ejemplo: 2×4 = 4 + 4",
    extra: "Los resultados de la tabla del 2 siempre son números pares."
  },
  3: {
    main: "Piensa en sumar el número tres veces. Ejemplo: 3×5 = 5 + 5 + 5",
    extra: "También puedes usar la tabla del 2 más el número adicional."
  },
  4: {
    main: "Dobla el resultado de la tabla del 2. Ejemplo: 4×3 = (2×3) + (2×3)",
    extra: "Aprender la del 2 primero facilita la del 4."
  },
  5: {
    main: "Los resultados terminan en 0 o 5. Ejemplo: 5×3 = 15",
    extra: "Contar de 5 en 5 es una buena práctica."
  },
  6: {
    main: "Dobla la tabla del 3. 6×4 = (3×4) + (3×4)",
    extra: "Notarás que siempre son pares en múltiplos de 6."
  },
  7: {
    main: "Secuencia: 7, 14, 21, 28, 35, 42, 49, 56, 63, 70",
    extra: "Intenta memorizar los patrones en saltos de 7."
  },
  8: {
    main: "Dobla la tabla del 4. 8×3 = (4×3) + (4×3)",
    extra: "También puedes pensar en 2×4 = 8 y aprovechar ese patrón."
  },
  9: {
    main: "Truco de los dedos: baja un dedo para cada multiplicación.",
    extra: "La suma de los dedos a un lado y al otro da las decenas y unidades."
  },
  10: {
    main: "Agrega un 0 al número. 10×4 = 40",
    extra: "La tabla del 10 es la más sencilla de memorizar."
  }
};

const motivationalMessages = [
  "¡Sigue así! Te estás volviendo un experto.",
  "¡Estás mejorando muy rápido! Sigue practicando.",
  "¡Racha de 5! ¡Imparable!",
  "¡Eres un crack en las multiplicaciones!"
];

/************************************
 *   REFERENCIAS A ELEMENTOS HTML   *
 ************************************/
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

// Para manejar las 3 estrellas
const starsEl = document.querySelectorAll('.stars span');

/************************************
 *           VARIABLES GLOBALES     *
 ************************************/
let selectedTables = [];
let currentQuestion = {};
let confetti;
let streak = 0;
let consecutiveFails = 0;
let lastFailedTable = null;

/************************************
 *        EVENTOS Y FUNCIONES       *
 ************************************/

// Selección de tablas
tableButtons.forEach(button => {
  button.addEventListener('click', () => {
    button.classList.toggle('selected');
    const table = parseInt(button.dataset.table);
    
    if (selectedTables.includes(table)) {
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

/**
 * Genera una nueva pregunta, con "ponderación" si hay fallos consecutivos.
 */
function generateQuestion() {
  // Limpia estados
  resultEl.innerHTML = '';
  resultEl.classList.add('hidden');
  answerEl.value = '';
  answerEl.focus();
  
  // Crear una "lista ponderada" para la tabla fallada consecutivamente
  // (si consecutivamente falló, esa tabla aparece más veces).
  // Ajusta el "5" según la intensidad que quieras darle al refuerzo.
  const weightedTables = selectedTables.flatMap(table => 
    Array(10 - (consecutiveFails > 1 && table === lastFailedTable ? 5 : 0)).fill(table)
  );
  
  // Selecciona una tabla al azar de la lista ponderada
  const table = weightedTables[Math.floor(Math.random() * weightedTables.length)];
  // Número aleatorio del 1 al 10
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
  
  const isCorrect = (userAnswer === currentQuestion.answer);
  
  handleAnswerFeedback(isCorrect);
  updateStreak(isCorrect);
  showTips(isCorrect);
  
  // Manejar fallos consecutivos
  if (!isCorrect) {
    consecutiveFails++;
    lastFailedTable = currentQuestion.table;
    if (consecutiveFails >= 2) {
      showVisualHelp();
    }
  } else {
    consecutiveFails = 0;
  }
  
  // Mostrar botón "Siguiente"
  nextBtn.classList.remove('hidden');
});

/**
 * Muestra la retroalimentación (correcto/incorrecto), reproduce sonido
 * y lanza confeti si es correcto.
 */
function handleAnswerFeedback(isCorrect) {
  resultEl.classList.remove('hidden');
  resultEl.className = isCorrect ? 'correct-message' : 'incorrect-message';
  resultEl.innerHTML = isCorrect 
    ? '¡Correcto! Felicidades.'
    : `Incorrecto. La respuesta correcta es: ${currentQuestion.answer}`;
  
  (isCorrect ? correctSound : incorrectSound).play();
  
  if (isCorrect) {
    confetti = new ConfettiGenerator({
      target: 'confetti-canvas',
      max: 80,
      size: 1,
      animate: true,
      colors: [[74, 144, 226], [245, 166, 35], [46, 204, 113]],
      clock: 25
    });
    confetti.render();
  }
}

/**
 * Muestra tips y refuerzos. Si es correcto, se muestra un texto extra.
 */
function showTips(isCorrect) {
  const tipData = tableTips[currentQuestion.table];
  if (!tipData) return;
  
  // Caja de tips
  const tipBox = document.createElement('div');
  tipBox.className = 'tip-box';

  const mainTip = `<div class="help-text">${tipData.main}</div>`;
  const extraTip = tipData.extra
    ? `<div class="help-text">${tipData.extra}</div>`
    : '';
  
  if (!isCorrect) {
    tipBox.innerHTML = `
      ${mainTip}
      <div class="help-text">Ejemplo: ${currentQuestion.table} × ${currentQuestion.number} = ${currentQuestion.answer}</div>
      ${extraTip}
    `;
  } else {
    // Refuerzo adicional cuando la respuesta es correcta
    tipBox.innerHTML = `
      <div class="help-text">¡Bien hecho! Recuerda este truco:</div>
      ${mainTip}
      ${extraTip}
    `;
  }

  resultEl.appendChild(tipBox);
}

/**
 * Muestra ayuda visual si el usuario falla dos veces seguidas.
 */
function showVisualHelp() {
  const visualHelp = document.createElement('div');
  visualHelp.className = 'visual-help';
  visualHelp.innerHTML = `
    <div class="help-text">Visualiza el problema: ${currentQuestion.table} grupos de ${currentQuestion.number}.</div>
    <div class="help-text">${Array(currentQuestion.number).fill(currentQuestion.table).join(' + ')} = ${currentQuestion.answer}</div>
  `;
  resultEl.appendChild(visualHelp);
}

/**
 * Actualiza la racha de respuestas correctas y el conteo de estrellas.
 */
function updateStreak(isCorrect) {
  streak = isCorrect ? (streak + 1) : 0;
  streakCount.textContent = streak;
  updateStarsUI();
  
  // Cada 5 respuestas correctas, mensaje motivacional
  if (isCorrect && streak > 0 && streak % 5 === 0) {
    showMotivationalMessage();
  }
}

/**
 * Actualiza la representación de las 3 estrellas, dependiendo de la racha.
 */
function updateStarsUI() {
  // Llenar estrellas según racha (máx 3).
  for (let i = 0; i < starsEl.length; i++) {
    starsEl[i].style.color = (i < streak && i < 3) ? '#FFD700' : '#ccc';
  }
}

/**
 * Muestra un mensaje motivacional al alcanzar rachas multiples de 5.
 */
function showMotivationalMessage() {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  const message = motivationalMessages[randomIndex];
  
  const msgBox = document.createElement('div');
  msgBox.className = 'tip-box';
  msgBox.innerHTML = `<div class="help-text">${message}</div>`;
  
  resultEl.appendChild(msgBox);
}

// Botón Siguiente
nextBtn.addEventListener('click', () => {
  // Detener confeti si está activo
  if (confetti) {
    confetti.clear();
  }
  // Ocultar resultado anterior y resetear
  resultEl.innerHTML = '';
  resultEl.classList.add('hidden');
  nextBtn.classList.add('hidden');
  
  // Generar nueva pregunta
  generateQuestion();
});
