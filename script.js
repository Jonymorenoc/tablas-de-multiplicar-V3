/*****************************************
 *     TRUCOS (para niños de 6 a 8 años) *
 *****************************************/
const tableTips = {
  1: {
    main: "Cuando multiplicas por 1, el número sigue siendo el mismo.",
    extra: "Por ejemplo, 7 × 1 = 7. ¡Fácil!"
  },
  2: {
    main: "Sumar el número dos veces. 2 × 4 = 4 + 4 = 8.",
    extra: "Piensa en parejas de objetos."
  },
  3: {
    main: "Suma el número tres veces. 3 × 5 = 5 + 5 + 5 = 15.",
    extra: "Dibuja 3 grupos iguales con la misma cantidad."
  },
  4: {
    main: "Es como hacer 2 × 2 veces. 4 × 3 = (2×3)+(2×3).",
    extra: "4 grupos son el doble de 2 grupos."
  },
  5: {
    main: "Los resultados terminan en 0 o 5. 5 × 4 = 20.",
    extra: "Cuenta de 5 en 5: 5, 10, 15, 20..."
  },
  6: {
    main: "Es como 3 × 2 veces. 6 × 4 = (3×4)+(3×4).",
    extra: "Los números son siempre pares."
  },
  7: {
    main: "7 puede ser difícil. Practica: 7, 14, 21, 28...",
    extra: "Memoriza de 7 en 7 y será más fácil."
  },
  8: {
    main: "El doble de 4. 8 × 3 = (4×3)+(4×3).",
    extra: "Piensa en 8 como 2 grupos de 4."
  },
  9: {
    main: "Truco de dedos: baja el dedo n°(multiplicación) y cuenta lados.",
    extra: "O cuenta de 9 en 9: 9, 18, 27..."
  },
  10: {
    main: "Agrega un 0 al final. 10 × 4 = 40.",
    extra: "¡La tabla más fácil de todas!"
  }
};

/****************************************
 *    EMOJIS PARA LA AYUDA VISUAL       *
 ****************************************/
const tableEmojis = {
  1: "🍎",  // Manzana
  2: "🍌",  // Plátano
  3: "🍇",  // Uvas
  4: "🍉",  // Sandía
  5: "🍓",  // Fresas
  6: "🍊",  // Naranja
  7: "🍍",  // Piña
  8: "🍪",  // Galleta
  9: "🦋",  // Mariposa
  10: "🔟"  // Símbolo 10
};

/****************************************
 *  MENSAJES MOTIVACIONALES (niños)     *
 ****************************************/
const motivationalMessages = [
  "¡Muy bien! Sigue así.",
  "¡Genial! ¡Sigue practicando!",
  "¡Racha de 5! ¡Súper trabajo!",
  "¡Eres increíble!"
];

/****************************************
 *   REFERENCIAS A ELEMENTOS DEL DOM    *
 ****************************************/
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

// Estrellas (5 máximas)
const starsEl = document.querySelectorAll('.stars span');

/****************************************
 *           VARIABLES GLOBALES         *
 ****************************************/
let selectedTables = [];
let currentQuestion = {};
let confetti;
let streak = 0;
let consecutiveFails = 0;
let lastFailedTable = null;

/****************************************
 *         EVENTOS Y FUNCIONES          *
 ****************************************/

// Manejo de selección de tablas
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

// Botón "Comenzar"
startBtn.addEventListener('click', () => {
  if (selectedTables.length === 0) {
    alert('¡Selecciona al menos una tabla!');
    return;
  }
  questionContainer.classList.remove('hidden');
  generateQuestion();
});

/**
 * Genera una pregunta nueva, con "peso" extra para la tabla fallada
 * si hay fallos consecutivos.
 */
function generateQuestion() {
  // Limpia estado anterior
  resultEl.innerHTML = '';
  resultEl.classList.add('hidden');
  answerEl.value = '';
  answerEl.focus();
  confetti?.clear();

  // Lista "ponderada": si falló varias veces seguidas en la misma tabla,
  // esa tabla aparece más seguido para reforzar.
  const weightedTables = selectedTables.flatMap(table => 
    Array(10 - (consecutiveFails > 1 && table === lastFailedTable ? 5 : 0)).fill(table)
  );
  
  // Elige una tabla aleatoria de la lista
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

// Botón "Responder"
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

/**
 * Muestra feedback visual y sonoro, además del confeti si es correcto.
 */
function handleAnswerFeedback(isCorrect) {
  resultEl.classList.remove('hidden');
  resultEl.className = isCorrect ? 'correct-message' : 'incorrect-message';
  resultEl.innerHTML = isCorrect
    ? '¡Correcto! ¡Felicidades!'
    : `Incorrecto. La respuesta es: ${currentQuestion.answer}`;
  
  // Reproduce el sonido correspondiente
  (isCorrect ? correctSound : incorrectSound).play();
  
  // Confeti si acierta
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
 * Muestra los tips específicos de la tabla y un refuerzo si acierta.
 */
function showTips(isCorrect) {
  const tipData = tableTips[currentQuestion.table];
  if (!tipData) return;
  
  const tipBox = document.createElement('div');
  tipBox.className = 'tip-box';
  
  const mainTip = `<div class="help-text">${tipData.main}</div>`;
  const extraTip = tipData.extra 
    ? `<div class="help-text">${tipData.extra}</div>`
    : '';
  
  if (isCorrect) {
    // Mensaje especial cuando acierta
    tipBox.innerHTML = `
      <div class="help-text">¡Bien hecho! Recuerda este truco:</div>
      ${mainTip}
      ${extraTip}
    `;
  } else {
    // Si falla, se muestra la respuesta y el truco
    tipBox.innerHTML = `
      ${mainTip}
      <div class="help-text">Ejemplo: ${currentQuestion.table} × ${currentQuestion.number} = ${currentQuestion.answer}</div>
      ${extraTip}
    `;
  }
  
  resultEl.appendChild(tipBox);
}

/**
 * Muestra ayuda visual con emojis tras fallar 2 veces seguidas.
 * Cada fila representa un "grupo" de la multiplicación.
 */
function showVisualHelp() {
  const visualHelp = document.createElement('div');
  visualHelp.className = 'visual-help';
  
  // Usamos un emoji distinto según la tabla
  const emoji = tableEmojis[currentQuestion.table] || "🔵";

  // Construimos la vista en filas: para "table" grupos,
  // cada fila tiene "number" emojis.
  let rowsHTML = '';
  for (let i = 0; i < currentQuestion.table; i++) {
    rowsHTML += `
      <div class="emoji-row">${emoji.repeat(currentQuestion.number)}</div>
    `;
  }

  // También mostramos la suma numérica
  const numericGroups = Array.from({ length: currentQuestion.table }, () => currentQuestion.number).join(' + ');

  visualHelp.innerHTML = `
    <div class="help-text">Esta multiplicación es: ${currentQuestion.table} grupos de ${currentQuestion.number}.</div>
    ${rowsHTML}
    <div class="help-text">En números: ${numericGroups} = ${currentQuestion.answer}</div>
  `;
  
  resultEl.appendChild(visualHelp);
}

/**
 * Actualiza la racha de aciertos y las estrellas (hasta 5).
 */
function updateStreak(isCorrect) {
  streak = isCorrect ? (streak + 1) : 0;
  streakCount.textContent = streak;
  updateStarsUI();
  
  // Si se desea, se puede mostrar un mensaje motivacional cada 5 aciertos.
  if (isCorrect && streak > 0 && streak % 5 === 0) {
    showMotivationalMessage();
  }
}

/**
 * Enciende/apaga las 5 estrellas según la racha.
 * Al superar 5, quedan las 5 iluminadas (indicando “tope”).
 */
function updateStarsUI() {
  // Racha mínima: 0, máxima representada: 5
  const starsToLight = streak > 5 ? 5 : streak;
  for (let i = 0; i < starsEl.length; i++) {
    starsEl[i].style.color = (i < starsToLight) ? '#FFD700' : '#ccc';
  }
}

/**
 * Muestra un mensaje motivacional cada vez que la racha sea múltiplo de 5.
 */
function showMotivationalMessage() {
  const randomIndex = Math.floor(Math.random() * motivationalMessages.length);
  const message = motivationalMessages[randomIndex];
  
  const msgBox = document.createElement('div');
  msgBox.className = 'tip-box';
  msgBox.innerHTML = `<div class="help-text">${message}</div>`;
  
  resultEl.appendChild(msgBox);
}

// Botón "Siguiente"
nextBtn.addEventListener('click', () => {
  confetti?.clear();
  resultEl.innerHTML = '';
  resultEl.classList.add('hidden');
  nextBtn.classList.add('hidden');
  
  generateQuestion();
});
