import { dictionary } from './utils/dictionary';
import { targetWords } from './utils/targetWords';

const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;

const offsetFromData: any = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromData;
const dayOffset = Math.floor(msOffset / 1000 / 60 / 60 / 24);
const targetWord = targetWords[dayOffset];
// const targetWord = 'house';

const alertContainer = document.querySelector(
  '[data-alert-container]',
) as HTMLElement;

const statisticsIcon = document.querySelector('#stats-icon') as HTMLElement;
const statisticsContainer = document.querySelector(
  '[data-statistics-container]',
) as HTMLElement;
const backgroundFilter = document.querySelector(
  '.background-filter',
) as HTMLElement;
const closeBtn = document.querySelector('.close-btn') as HTMLElement;

const guessGrid = document.querySelector('[data-guess-grid]') as HTMLElement;
const keyboard = document.querySelector('[data-keyboard]') as HTMLElement;

console.log("Today's word is " + "'" + targetWord + "'");

gameStateCheck();
startInteraction();

function wordleStateInit() {
  const boardState = ['', '', '', '', '', ''];
  const gameStatus = 'IN_PROGRESS';
  const evaluations = [null, null, null, null, null, null];
  const solution = targetWord;

  const wordleState = {
    boardState,
    gameStatus,
    evaluations,
    solution,
  };

  localStorage.setItem('wordleState', JSON.stringify(wordleState));
  return;
}

function setGuessedWordToState(guess: string, tiles: HTMLElement[]) {
  const guessedWordsCount = tiles[0].attributes[0].value;

  const wordleState = JSON.parse(localStorage.getItem('wordleState') as string);

  wordleState.boardState[guessedWordsCount] = guess;

  wordleState.evaluations[guessedWordsCount] = tiles.map(
    (tile) => tile.dataset.state,
  );

  localStorage.setItem('wordleState', JSON.stringify(wordleState));
}

function validateWordsFromState(key: string, guess: string) {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length === 5) {
    activeTiles.forEach((...params) => flipTile(...params, guess));
    activeTiles.forEach((tile) => {
      tile.dataset.state = '';
    });
  }
}

function gameStateCheck() {
  if (!localStorage.getItem('wordleState')) return wordleStateInit();

  if (localStorage.getItem('wordleState') !== null) {
    const wordleState = JSON.parse(
      localStorage.getItem('wordleState') as string,
    );

    if (targetWord !== wordleState.solution) {
      wordleStateInit();
      return;
    }

    wordleState.boardState.forEach((word: string, index: number) => {
      if (word.length !== 0) {
        word.split('').forEach((letter) => {
          pressKey(letter);
          validateWordsFromState(letter, word);
        });
      }
    });
  }
}

function wordleStatisticsStateInit() {
  const gamesPlayed = 0;
  const gamesWon = 0;
  const maxStreak = 0;
  const winPercentage = 0;
  const currentStreak = 0;

  const wordleStatistics = {
    gamesPlayed,
    gamesWon,
    maxStreak,
    winPercentage,
    currentStreak,
  };

  localStorage.setItem('wordleStatistics', JSON.stringify(wordleStatistics));
  return;
}

function statisticsStateCheck(win: boolean | null) {
  if (!localStorage.getItem('wordleStatistics')) wordleStatisticsStateInit();

  const wordleStatistics = JSON.parse(
    localStorage.getItem('wordleStatistics') as string,
  );

  const { gameStatus } = JSON.parse(
    localStorage.getItem('wordleState') as string,
  );

  console.log(gameStatus);
  console.log(wordleStatistics);

  if (win && gameStatus !== 'FINISHED') {
    wordleStatistics.gamesPlayed++;
    wordleStatistics.currentStreak++;
    wordleStatistics.maxStreak = Math.max(
      wordleStatistics.maxStreak,
      wordleStatistics.currentStreak,
    );
    wordleStatistics.gamesWon++;
    wordleStatistics.winPercentage =
      (wordleStatistics.gamesWon / wordleStatistics.gamesPlayed) * 100;
    console.log(wordleStatistics);

    localStorage.setItem('wordleStatistics', JSON.stringify(wordleStatistics));
  }

  if (win === false && gameStatus !== 'FINISHED') {
    wordleStatistics.gamesPlayed++;
    wordleStatistics.currentStreak = 0;
    wordleStatistics.winPercentage =
      (wordleStatistics.gamesWon / wordleStatistics.gamesPlayed) * 100;
    localStorage.setItem('wordleStatistics', JSON.stringify(wordleStatistics));
  }
}

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
  array: HTMLElement[],
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

function showAlert(message: string, duration: number | null = 1000) {
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

function checkWinLose(guess: string, tiles: HTMLElement[]) {
  setGuessedWordToState(guess, tiles);

  const wordleState = JSON.parse(localStorage.getItem('wordleState') as string);
  const hasCorrectWord = wordleState.boardState.includes(targetWord);
  const isLastGuess = tiles[0].dataset.word === '5' ? true : false;

  if (guess === targetWord) {
    showAlert('You win!', 2000);
    danceTiles(tiles);
    stopInteraction();
    statisticsStateCheck(true);
    wordleState.gameStatus = 'FINISHED';
    localStorage.setItem('wordleState', JSON.stringify(wordleState));
    setTimeout(() => {
      endGameStatistics();
    }, 2000);
    return;
  }

  const remainingTiles = guessGrid.querySelectorAll(':not([data-letter])');

  if (remainingTiles.length === 0 && !hasCorrectWord && isLastGuess) {
    showAlert(targetWord.toUpperCase(), 2000);
    stopInteraction();
    statisticsStateCheck(false);
    wordleState.gameStatus = 'FINISHED';
    localStorage.setItem('wordleState', JSON.stringify(wordleState));
    setTimeout(() => {
      endGameStatistics();
    }, 2000);
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

function endGameStatistics() {
  statisticsStateCheck(null);

  const wordleState = JSON.parse(localStorage.getItem('wordleState') as string);
  const gameStatus = wordleState.gameStatus;

  const { gamesPlayed, maxStreak, winPercentage, currentStreak } = JSON.parse(
    localStorage.getItem('wordleStatistics') as string,
  );

  const gamesPlayedElement = document.querySelector(
    '[data-stats-played]',
  ) as HTMLElement;
  const winRateElement = document.querySelector(
    '[data-stats-rate]',
  ) as HTMLElement;
  const currentStreakElement = document.querySelector(
    '[data-stats-cstreak]',
  ) as HTMLElement;
  const maxStreakElement = document.querySelector(
    '[data-stats-mstreak]',
  ) as HTMLElement;

  gamesPlayedElement.innerHTML = gamesPlayed;
  winRateElement.innerHTML = winPercentage;
  currentStreakElement.innerHTML = currentStreak;
  maxStreakElement.innerHTML = maxStreak;

  backgroundFilter.style.display = 'block';
  statisticsContainer.style.display = 'flex';

  if (gameStatus === 'IN_PROGRESS') {
    setTimeout(() => {
      statisticsContainer.classList.remove('hide');
      backgroundFilter.classList.remove('hide');
    }, 500);

    closeBtn.addEventListener('click', () => {
      statisticsContainer.classList.add('hide');
      backgroundFilter.classList.add('hide');
      setTimeout(() => {
        statisticsContainer.style.display = 'none';
        backgroundFilter.style.display = 'none';
      }, 500);
    });
    return;
  }

  const endGameContainer = document.createElement('div');
  endGameContainer.classList.add('end-game-stats-container');

  const nextWordleContainer = document.createElement('div');
  nextWordleContainer.classList.add('next-wordle-container');

  const nextWordleTitle = document.createElement('h1');
  nextWordleTitle.textContent = 'NEXT WORDLE';
  nextWordleTitle.classList.add('title');
  nextWordleContainer.append(nextWordleTitle);

  const nextWordleCountdown = document.createElement('div');
  nextWordleCountdown.textContent = countdownTimer();
  nextWordleCountdown.classList.add('countdown');
  nextWordleContainer.append(nextWordleCountdown);

  endGameContainer.append(nextWordleContainer);

  const dividerLine = document.createElement('div');
  dividerLine.classList.add('divider');

  endGameContainer.append(dividerLine);

  const shareBtnContainer = document.createElement('div');
  shareBtnContainer.classList.add('share-btn-container');

  const shareBtn = document.createElement('button');
  shareBtn.textContent = 'SHARE';
  shareBtn.classList.add('share-btn');
  shareBtnContainer.append(shareBtn);

  endGameContainer.append(shareBtnContainer);

  statisticsContainer.append(endGameContainer);

  setInterval(() => {
    nextWordleCountdown.textContent = countdownTimer();
  }, 1000);

  setTimeout(() => {
    statisticsContainer.classList.remove('hide');
    backgroundFilter.classList.remove('hide');
  }, 500);

  closeBtn.addEventListener('click', () => {
    statisticsContainer.classList.add('hide');
    backgroundFilter.classList.add('hide');
    setTimeout(() => {
      endGameContainer.remove();
      statisticsContainer.style.display = 'none';
      backgroundFilter.style.display = 'none';
    }, 500);
  });
}

function countdownTimer() {
  const now = new Date();
  let midnight = new Date();
  midnight.setHours(24, 0, 0, 0);

  let remainingTimeToMidnight =
    midnight.getTime() / 1000 - now.getTime() / 1000;

  const hours = Math.floor(remainingTimeToMidnight / 3600);
  remainingTimeToMidnight = remainingTimeToMidnight - hours * 3600;
  let minutes: number | string = Math.floor(remainingTimeToMidnight / 60);
  remainingTimeToMidnight = remainingTimeToMidnight - minutes * 60;
  let seconds: number | string = Math.floor(remainingTimeToMidnight);

  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;

  return `${hours}:${minutes}:${seconds}`;
}

statisticsIcon.addEventListener('click', () => {
  endGameStatistics();
});
