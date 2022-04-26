import { dictionary } from './utils/dictionary';
import { targetWords } from './utils/targetWords';

const WORD_LENGTH = 5;

const offsetFromData: any = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromData;
const dayOffset = Math.floor(msOffset / 1000 / 60 / 60 / 24);
const targetWord = targetWords[dayOffset];

const alertContainer = document.querySelector(
  '[data-alert-container]',
) as HTMLElement;

const guessGrid = document.querySelector('[data-guess-grid]') as HTMLElement;

startInteraction();

function startInteraction() {
  document.addEventListener('click', handleMouseClick);
  document.addEventListener('keydown', handleKeyPress);
}

function stopInteraction() {
  document.removeEventListener('click', handleMouseClick);
  document.removeEventListener('keydown', handleKeyPress);
}

function handleMouseClick(event: MouseEvent) {
  const target = event.target as HTMLElement;

  if (target.matches('[data-key]') && target.dataset.key) {
    pressKey(target.dataset.key);
    return;
  }

  if (target.matches('[data-enter]')) {
    submitGuess();
    return;
  }

  if (target.matches('[data-delete]')) {
    deleteKey();
    return;
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    submitGuess();
    return;
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    deleteKey();
    return;
  }

  if (event.key.match(/^[a-z]$/)) {
    pressKey(event.key);
    return;
  }
}

function pressKey(key: string) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH) return;

  const nextTitle = guessGrid.querySelector(
    ':not([data-letter])',
  ) as HTMLElement;

  nextTitle.dataset.letter = key.toLowerCase();
  nextTitle.textContent = key;
  nextTitle.dataset.state = 'active';
}

function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1] as HTMLElement;
  if (lastTile == null) return;
  lastTile.textContent = '';
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}

function submitGuess() {
  const acitveTiles = [...getActiveTiles()];
  if (acitveTiles.length !== WORD_LENGTH) {
    console.log('NOT LONG ENOUGH!');
    showAlert('Not enough letters!');
    // shakeTiles(acitveTiles);
    return;
  }
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}

function showAlert(message: string, duration = 1000) {
  const alert = document.createElement('div');
  alert.textContent = message;
  alert.classList.add('alert');
  alertContainer.prepend(alert);
  if (duration == null) return;

  setTimeout(() => {
    alert.classList.add('hide');
    alert.addEventListener('transitionend', () => alert.remove());
  }, duration);
}
