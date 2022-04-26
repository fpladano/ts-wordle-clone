import { dictionary } from './utils/dictionary';
import { targetWords } from './utils/targetWords';

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

  if (target.matches('[data-key]')) {
    // pressKey(target.dataset.key);
    return;
  }

  if (target.matches('[data-enter]')) {
    // submitGuess();
    return;
  }

  if (target.matches('[data-delete]')) {
    // deleteKey();
    return;
  }
}

function handleKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    // submitGuess();
    return;
  }

  if (event.key === 'Backspace' || event.key === 'Delete') {
    // deleteKey();
    return;
  }

  if (event.key.match(/^[a-z]$/)) {
    // pressKey(event.key);
    return;
  }
}
