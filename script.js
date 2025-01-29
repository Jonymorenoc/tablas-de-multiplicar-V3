/*********************************************
 *   TRUCOS SIMPLES (para niños 6 a 8 años)  *
 *********************************************/
const tableTips = {
  1:  "Multiplicar por 1 no cambia el número.",
  2:  "Haz parejas para contar más fácil.",
  3:  "Suma 3 veces el mismo número.",
  4:  "Piensa en 2 y 2 (doble del doble).",
  5:  "Cuenta de 5 en 5: 5, 10, 15, 20...",
  6:  "Piensa en 3 x 2 (dos veces la tabla del 3).",
  7:  "Cuenta de 7 en 7 (7, 14, 21...).",
  8:  "Es doble de 4. (4 + 4).",
  9:  "Cuenta de 9 en 9 (9, 18, 27...).",
  10: "Agrega un 0 al final."
};

/*****************************************
 * EMOJIS VARIADOS PARA MOSTRAR GRUPOS
 *****************************************/
const kidsEmojis = [
  "🦄","🌟","🐶","🐱","🐹","🐰","🦊","🐸","🐻","🦁","🐵",
  "🦋","🐳","🐬","🐙","🐣","🐼","🐧","🐯","🪄","💫","🍭","🍬","🍩","🎉"
];

/******************************************************
 *   MENSAJES MOTIVACIONALES CADA 5 ACIERTOS (ES)     *
 ******************************************************/
const motivationalMessages = [
  "¡Súper! Sigue así.",
  "¡Racha de 5! ¡Felicidades!",
  "¡Estás aprendiendo muy rápido!"
];

/******************************************************
 *  MENSAJES DE MAMÁ Y PAPÁ EN ACIERTOS Y ERRORES    *
 ******************************************************/
const positiveMomDadCorrect = [
  "Mamá: ¡Bravo! ¡Lo hiciste excelente!",
  "Papá: ¡Estoy muy orgulloso de ti!",
  "Mamá: ¡Fantástico! ¡Sigue así!",
];

const positiveMomDadWrong = [
  "Mamá: ¡No pasa nada, tú puedes!",
  "Papá: ¡Sigue intentando, confío en ti!",
  "Mamá: ¡Un error no te detendrá!",
  "Papá: ¡Ánimo, amor! Vamos con todo."
];

/***********************************************
 *   REFERENCIAS A ELEMENTOS DEL DOCUMENTO     *
 ***********************************************/
const startBtn      = document.getElementById('start-btn');
const tableButtons  = document.querySelectorAll('.table-btn');
const questionContainer = document.getElementById('question-container');
const questionEl    = document.getElementById('question');
const answerEl      = document.getElementById('answer');
const resultEl      = document.getElementById('result');
const submitBtn     = document.getElementById('submit-btn');
const nextBtn       = document.getElementById('next-btn');
const hintBtn       = document.getElementById('hint-btn');
const streakCount   = document.getElementById('streak-count');
const correctSound  = document.getElementById('correct-sound');
const incorrectSound= document.getElementById('incorrect-sound');

// 5 estrellas
const starsEl = document.querySelectorAll('.stars span');

/****************************************************
 *           VARIABLES GLOBALES Y ESTADO            *
 ****************************************************/
let selectedTables      = [];
let currentQuestion     = {};
let confetti;
let streak              = 0;
let attemptsForQuestion = 0;
let isHintShown         = false;

/** Historial para evitar repetir la misma operación durante 5 turnos. */
const lastQuestions     = []; // guardará objetos {table, number}

/****************************************************
 *       CONFIGURACIÓN DE EVENTOS PRINCIPALES       *
 ****************************************************/

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

// Botón "Comenzar"
startBtn.addEventListener('click', () => {
  if (selectedTables.length === 0) {
    alert('¡Selecciona al menos una tabla!');
    return;
  }
  questionContainer.classList.remove('hidden');
  generateQuestion();
});

// Botón "Responder"
submitBtn.addEventListener('click', () => {
  const userAnswer = parseInt(answerEl.value);

  if (isNaN(userAnswer)) {
    alert('Escribe un número para responder');
    return;
  }

  if (userAnswer === currentQuestion.answer) {
    handleCorrectAnswer();
  } else {
    handleWrongAnswer();
  }
});

// Botón "Pista"
hintBtn.addEventListener('click', () => {
  if (!isHintShown) {
    showHint(false);
    isHintShown = true;
  }
});

// Botón "Siguiente"
nextBtn.addEventListener('click', () => {
  confetti?.clear();
  resetUI();
  generateQuestion();
});

/***********************************************
 *           FUNCIONES PRINCIPALES            *
 ***********************************************/

/**
 * Genera una nueva pregunta, evitando repetir la misma operación
 * de las últimas 5 preguntas.
 */
function generateQuestion() {
  // Limpia la UI
  questionEl.textContent = '';
  resultEl.innerHTML = '';
  resultEl.classList.add('hidden');
  answerEl.value = '';
  answerEl.focus();
  nextBtn.classList.add('hidden');
  hintBtn.classList.remove('hidden');
  hintBtn.classList.add('hidden');
  confetti?.clear();

  attemptsForQuestion = 0;
  isHintShown = false;

  hintBtn.classList.remove('hidden');

  // 1. Construimos un arreglo con todas las combinaciones (table, number).
  const allCombos = [];
  selectedTables.forEach(table => {
    for (let num = 1; num <= 10; num++) {
      allCombos.push({ table, number: num, answer: table * num });
    }
  });

  // 2. Intentamos elegir un combo que no esté en "lastQuestions" (últimos 5).
  let newQuestion = null;
  let tries = 0;
  while (tries < 50) {
    const candidate = randomFromArray(allCombos);
    // Verificamos si candidate ya apareció en las últimas 5 preguntas
    const isRepeated = lastQuestions.some(
      q => q.table === candidate.table && q.number === candidate.number
    );

    if (!isRepeated) {
      newQuestion = candidate;
      break;
    }
    tries++;
  }

  // Si no encontramos un combo nuevo (pocas combos o tries agotados),
  // tomamos cualquier combo aleatorio y permitimos la repetición.
  if (!newQuestion) {
    newQuestion = randomFromArray(allCombos);
  }

  currentQuestion = newQuestion;
  questionEl.textContent = `${newQuestion.table} × ${newQuestion.number}`;

  // 3. Actualizamos el historial
  lastQuestions.push({ table: newQuestion.table, number: newQuestion.number });
  if (lastQuestions.length > 5) {
    lastQuestions.shift(); // eliminamos el más antiguo si ya hay 6
  }
}

/** Maneja respuesta correcta */
function handleCorrectAnswer() {
  showResult(true, "¡Bien hecho! Respuesta correcta.");
  
  const cheer = randomFromArray(positiveMomDadCorrect);
  addExtraMessage(cheer);

  streak++;
  streakCount.textContent = streak;
  updateStarsUI();

  correctSound.play();
  launchConfetti();

  if (streak > 0 && streak % 5 === 0) {
    showMotivationalMessage();
  }

  nextBtn.classList.remove('hidden');
  hintBtn.classList.add('hidden');
}

/** Maneja respuesta incorrecta */
function handleWrongAnswer() {
  attemptsForQuestion++;

  const cheer = randomFromArray(positiveMomDadWrong);

  if (attemptsForQuestion === 1) {
    showResult(false, "¡Inténtalo otra vez!");
    addExtraMessage(cheer);
    showHint(false);
  } else if (attemptsForQuestion === 2) {
    showResult(false, `La respuesta es: ${currentQuestion.answer}`);
    addExtraMessage(cheer);

    showHint(true);
    streak = 0;
    streakCount.textContent = streak;
    updateStarsUI();

    nextBtn.classList.remove('hidden');
    hintBtn.classList.add('hidden');
  }

  incorrectSound.play();
}

/** Muestra un mensaje principal (correcto/incorrecto) */
function showResult(isCorrect, text) {
  resultEl.classList.remove('hidden');
  resultEl.className = isCorrect ? 'correct-message' : 'incorrect-message';
  resultEl.innerHTML = text;
}

/** Mensaje extra debajo del principal */
function addExtraMessage(msg) {
  const msgBox = document.createElement('div');
  msgBox.className = 'help-text';
  msgBox.style.marginTop = '10px';
  msgBox.textContent = msg;
  resultEl.appendChild(msgBox);
}

/** Muestra la pista (emojis y truco) */
function showHint(showAnswer) {
  const hintBox = document.createElement('div');
  hintBox.className = 'visual-help';

  const emoji = randomFromArray(kidsEmojis);
  const tip   = tableTips[currentQuestion.table] || "";

  let rowsHTML = '';
  for (let i = 0; i < currentQuestion.table; i++) {
    rowsHTML += `<div class="emoji-row">${emoji.repeat(currentQuestion.number)}</div>`;
  }

  const responseText = showAnswer 
    ? `<div class="help-text">Respuesta: ${currentQuestion.answer}</div>`
    : "";

  const shortTrick = `<div class="help-text">Truco: ${tip}</div>`;

  hintBox.innerHTML = `
    <div class="help-text"><strong>Piensa en grupos:</strong></div>
    ${rowsHTML}
    ${shortTrick}
    ${responseText}
  `;

  resultEl.appendChild(hintBox);
  resultEl.classList.remove('hidden');
}

/** Limpia la UI para la siguiente pregunta */
function resetUI() {
  resultEl.innerHTML = '';
  resultEl.classList.add('hidden');
  hintBtn.classList.add('hidden');
  nextBtn.classList.add('hidden');
}

/** Lanza confeti al acertar */
function launchConfetti() {
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

/** Actualiza las estrellas (hasta 5) */
function updateStarsUI() {
  const starsToLight = (streak > 5) ? 5 : streak;
  for (let i = 0; i < starsEl.length; i++) {
    starsEl[i].style.color = (i < starsToLight) ? '#FFD700' : '#ccc';
  }
}

/** Muestra un mensaje motivacional cada 5 aciertos */
function showMotivationalMessage() {
  const message = randomFromArray(motivationalMessages);
  const msgBox = document.createElement('div');
  msgBox.className = 'tip-box';
  msgBox.innerHTML = `<div class="help-text">${message}</div>`;
  resultEl.appendChild(msgBox);
}

/** Devuelve un elemento aleatorio de un array */
function randomFromArray(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
