import { dictionary } from './utils/dictionary';
import { targetWords } from './utils/targetWords';

const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

const offsetFromData: any = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromData;
const dayOffset = Math.floor(msOffset / 1000 / 60 / 60 / 24);
const targetWord = targetWords[dayOffset];

const alertContainer = document.querySelector(
  '[data-alert-container]',
) as HTMLElement;
const guessGrid = document.querySelector('[data-guess-grid]') as HTMLElement;
const keyboard = document.querySelector('[data-keyboard]') as HTMLElement;

console.log("Today's word is " + "'" + targetWord + "'");
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
    shakeTiles(acitveTiles);
    return;
  }

  const guess = acitveTiles.reduce((word: string, tile: any) => {
    return word + tile.dataset.letter;
  }, '');

  if (!dictionary.includes(guess)) {
    showAlert('Not in dictionary!');
    shakeTiles(acitveTiles);
    return;
  }

  stopInteraction();
  acitveTiles.forEach((...params) => flipTile(...params, guess));
}

function flipTile(
  tile: HTMLElement,
  index: number,
  array: Element[],
  guess: string,
) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);

  setTimeout(() => {
    tile.classList.add('flip');
  }, (index * FLIP_ANIMATION_DURATION) / 2);

  tile.addEventListener(
    'transitionend',
    () => {
      tile.classList.remove('flip');
      if (targetWord[index] === letter) {
        tile.dataset.state = 'correct';
        key?.classList.add('correct');
      } else if (letter && targetWord.includes(letter)) {
        tile.dataset.state = 'wrong-location';
        key?.classList.add('wrong-location');
      } else {
        tile.dataset.state = 'wrong';
        key?.classList.add('wrong');
      }

      if (index === array.length - 1) {
        tile.addEventListener(
          'transitionend',
          () => {
            startInteraction();
            checkWinLose(guess, array);
          },
          { once: true },
        );
      }
    },
    { once: true },
  );
}

function getActiveTiles(): NodeListOf<HTMLElement> {
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

function shakeTiles(tiles: Element[]) {
  tiles.forEach((tiles) => {
    tiles.classList.add('shake');
    tiles.addEventListener(
      'animationend',
      () => {
        tiles.classList.remove('shake');
      },
      { once: true },
    );
  });
}

function checkWinLose(guess: string, tiles: Element[]) {
  if (guess === targetWord) {
    showAlert('You win!', 5000);
    danceTiles(tiles);
    stopInteraction();
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(':not([data-letter])');

  if (remainingTiles.length === 0) {
    showAlert(targetWord.toUpperCase(), null);
    stopInteraction();
  }
}

function danceTiles(tiles: Element[]) {
  tiles.forEach((tiles, index) => {
    setTimeout(() => {
      tiles.classList.add('dance');
      tiles.addEventListener(
        'animationend',
        () => {
          tiles.classList.remove('dance');
        },
        { once: true },
      );
    }, (index * DANCE_ANIMATION_DURATION) / 5);
  });
}
