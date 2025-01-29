const startBtn = document.getElementById('start-btn');
const tableButtons = document.querySelectorAll('.table-btn');
const questionContainer = document.getElementById('question-container');
const emojiRows = document.getElementById('emoji-rows');
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
const mistakeTracker = {};

// Table Selection
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

// Start Quiz
startBtn.addEventListener('click', () => {
  if (selectedTables.length === 0) {
    alert('Selecciona al menos una tabla.');
    return;
  }

  questionContainer.classList.remove('hidden');
  generateQuestion();
});

// Question Generator
function generateQuestion() {
  resultEl.classList.add('hidden');
  nextBtn.classList.add('hidden');
  answerEl.value = '';
  answerEl.focus();

  if (confetti) confetti.clear();

  // Get weighted table based on mistakes
  const weightedTables = selectedTables.flatMap(table => 
    Array(10 - (mistakeTracker[table] || 0)).fill(table)
  );
  
  const table = weightedTables[Math.floor(Math.random() * weightedTables.length)];
  const number = Math.floor(Math.random() * 10) + 1;

  currentQuestion = { table, number, answer: table * number };

  // Create emoji visualization
  const emojis = ['🍎', '🐶', '🎈', '🍇', '🐱', '🦄', '🐼', '🚗', '🍉', '🌟', '🐣'];
  const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

  emojiRows.innerHTML = '';
  for (let i = 0; i < table; i++) {
    const row = document.createElement('div');
    row.classList.add('emoji-row');
    row.innerHTML = Array(number).fill(`<span>${randomEmoji}</span>`).join('');
    emojiRows.appendChild(row);
  }

  questionEl.textContent = `${table} × ${number}`;
}

// Answer Handling
submitBtn.addEventListener('click', () => {
  const userAnswer = parseInt(answerEl.value);

  if (isNaN(userAnswer)) {
    alert('Por favor ingresa un número.');
    return;
  }

  resultEl.classList.remove('hidden');
  const isCorrect = userAnswer === currentQuestion.answer;

  if (isCorrect) {
    handleCorrectAnswer();
  } else {
    handleIncorrectAnswer();
  }

  updateStreak(isCorrect);
  nextBtn.classList.remove('hidden');
});

function handleCorrectAnswer() {
  resultEl.textContent = '¡Correcto! 🎉';
  correctSound.play();
  
  // Add celebration effects
  document.querySelectorAll('.emoji-row').forEach(row => {
    row.classList.add('correct-glow');
    setTimeout(() => row.classList.remove('correct-glow'), 1000);
  });

  confetti = new ConfettiGenerator({
    target: 'confetti-canvas',
    max: 150,
    size: 1.2,
    animate: true,
    colors: [[165, 104, 246], [230, 61, 135], [0, 199, 228], [253, 214, 126]],
    clock: 30
  }).render();
}

function handleIncorrectAnswer() {
  resultEl.innerHTML = `Incorrecto. La respuesta era <span class="incorrect-answer">${currentQuestion.answer}</span>.`;
  incorrectSound.play();
  
  // Track mistakes
  mistakeTracker[currentQuestion.table] = (mistakeTracker[currentQuestion.table] || 0) + 1;
  
  // Show visual helper
  showVisualHelper();
}

function showVisualHelper() {
  const helper = document.createElement('div');
  helper.className = 'visual-helper';
  helper.innerHTML = `
    <p style="color: #666; margin-top: 15px;">${currentQuestion.table} grupos de ${currentQuestion.number}:</p>
    <div class="groups">
      ${Array(currentQuestion.number).fill()
       .map(() => `<div class="group">${Array(currentQuestion.table)
         .fill('⭐').join('')}</div>`).join(' + ')}
    </div>
  `;
  questionContainer.appendChild(helper);
}

// Streak System
function updateStreak(isCorrect) {
  streak = isCorrect ? streak + 1 : 0;
  streakCount.textContent = streak;

  if (isCorrect && streak % 5 === 0 && streak !== 0) {
    showMotivationalMessage();
  }
}

function showMotivationalMessage() {
  const messages = [
    "¡Racha de 5! 🔥",
    "¡Increíble! 🚀",
    "¡Sigue así! 💪",
    "¡Eres un genio! 🧠"
  ];
  const message = messages[Math.floor(Math.random() * messages.length)];
  
  const messageEl = document.createElement('div');
  messageEl.className = 'motivational-message';
  messageEl.textContent = message;
  document.body.appendChild(messageEl);
  
  setTimeout(() => messageEl.remove(), 2000);
}

// Next Question
nextBtn.addEventListener('click', () => {
  document.querySelector('.visual-helper')?.remove();
  generateQuestion();
});
