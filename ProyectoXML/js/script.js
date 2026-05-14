let questions = [];
let currentQuestion = 0;
let score = 0;
let timer = 0;
let timerInterval;
let quizStarted = false;

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('lang').addEventListener('change', loadQuiz);
  document.getElementById('next-btn').addEventListener('click', handleMainButton);
  loadQuiz();
});

function loadQuiz() {
  const lang = document.getElementById('lang').value;
  const xhr = new XMLHttpRequest();
  xhr.open('GET', `xml/preguntas_${lang}.xml`, true);
  xhr.onload = function() {
    if (this.status === 200) {
      const xml = this.responseXML;
      const nodes = Array.from(xml.getElementsByTagName('question'));
      questions = nodes.map(q => ({
        wording: q.getElementsByTagName('wording')[0].textContent,
        choices: shuffleArray(Array.from(q.getElementsByTagName('choice')).map(c => ({
          text: c.textContent,
          correct: c.getAttribute('correct') === 'yes'
        })))
      }));
      shuffleArray(questions);
      resetQuizData();
    }
  };
  xhr.send();
}

function resetQuizData() {
  quizStarted = false;
  currentQuestion = 0;
  score = 0;
  clearInterval(timerInterval);
  document.getElementById('question').textContent = "¡Listo para el desafío!";
  document.getElementById('choices').innerHTML = "";
  document.getElementById('next-btn').textContent = "Comenzar Quiz";
  document.getElementById('next-btn').disabled = false;
}

function handleMainButton() {
  if (!quizStarted) startQuiz();
  else nextQuestion();
}

function startQuiz() {
  quizStarted = true;
  timer = 0;
  timerInterval = setInterval(() => {
    timer++;
    const min = String(Math.floor(timer / 60)).padStart(2, '0');
    const sec = String(timer % 60).padStart(2, '0');
    document.getElementById('timer').textContent = `⏱ ${min}:${sec}`;
  }, 1000);
  showQuestion();
}

function showQuestion() {
  const q = questions[currentQuestion];
  document.getElementById('question').textContent = q.wording;
  document.getElementById('progress').style.width = `${(currentQuestion / questions.length) * 100}%`;
  
  const container = document.getElementById('choices');
  container.innerHTML = "";
  q.choices.forEach(c => {
    const div = document.createElement('div');
    div.className = 'choice';
    div.textContent = c.text;
    div.onclick = function() {
      if (document.querySelector('.choice.selected')) return;
      this.classList.add('selected');
      document.getElementById('next-btn').disabled = false;
      this.dataset.correct = c.correct;
    };
    container.appendChild(div);
  });
  document.getElementById('next-btn').disabled = true;
  document.getElementById('next-btn').textContent = currentQuestion === questions.length - 1 ? "Finalizar" : "Siguiente";
}

function nextQuestion() {
  const selected = document.querySelector('.choice.selected');
  if (selected.dataset.correct === 'true') score++;
  
  // Feedback visual
  document.querySelectorAll('.choice').forEach(c => {
    if (c.dataset.correct === 'true') c.classList.add('correct');
    else if (c === selected) c.classList.add('incorrect');
    c.style.pointerEvents = 'none';
  });

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < questions.length) showQuestion();
    else finishQuiz();
  }, 1200);
}

function finishQuiz() {
  clearInterval(timerInterval);
  document.getElementById('quiz-box').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('final-score').textContent = `Puntuación: ${score} / ${questions.length}`;
  document.getElementById('result-message').textContent = score > 10 ? "¡Eres un experto!" : "¡Sigue entrenando!";
}

function resetQuiz() {
  location.reload();
}