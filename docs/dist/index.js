import {dictionary} from "./utils/dictionary.js";
import {targetWords} from "./utils/targetWords.js";
const WORD_LENGTH = 5;
const FLIP_ANIMATION_DURATION = 500;
const DANCE_ANIMATION_DURATION = 500;
const offsetFromData = new Date(2022, 0, 1);
const msOffset = Date.now() - offsetFromData;
const dayOffset = Math.floor(msOffset / 1e3 / 60 / 60 / 24);
const targetWord = targetWords[dayOffset];
const alertContainer = document.querySelector("[data-alert-container]");
const statisticsIcon = document.querySelector("#stats-icon");
const statisticsContainer = document.querySelector("[data-statistics-container]");
const backgroundFilter = document.querySelector(".background-filter");
const closeBtn = document.querySelector(".close-btn");
const guessGrid = document.querySelector("[data-guess-grid]");
const keyboard = document.querySelector("[data-keyboard]");
console.log("Today's word is '" + targetWord + "'");
gameStateCheck();
startInteraction();
function wordleStateInit() {
  const boardState = ["", "", "", "", "", ""];
  const gameStatus = "IN_PROGRESS";
  const evaluations = [null, null, null, null, null, null];
  const solution = targetWord;
  const wordleState = {
    boardState,
    gameStatus,
    evaluations,
    solution
  };
  localStorage.setItem("wordleState", JSON.stringify(wordleState));
  return;
}
function setGuessedWordToState(guess, tiles) {
  const guessedWordsCount = tiles[0].attributes[0].value;
  const wordleState = JSON.parse(localStorage.getItem("wordleState"));
  wordleState.boardState[guessedWordsCount] = guess;
  wordleState.evaluations[guessedWordsCount] = tiles.map((tile) => tile.dataset.state);
  localStorage.setItem("wordleState", JSON.stringify(wordleState));
}
function validateWordsFromState(key, guess) {
  const activeTiles = [...getActiveTiles()];
  if (activeTiles.length === 5) {
    activeTiles.forEach((...params) => flipTile(...params, guess));
    activeTiles.forEach((tile) => {
      tile.dataset.state = "";
    });
  }
}
function gameStateCheck() {
  if (!localStorage.getItem("wordleState"))
    return wordleStateInit();
  if (localStorage.getItem("wordleState") !== null) {
    const wordleState = JSON.parse(localStorage.getItem("wordleState"));
    if (targetWord !== wordleState.solution) {
      wordleStateInit();
      return;
    }
    wordleState.boardState.forEach((word, index) => {
      if (word.length !== 0) {
        word.split("").forEach((letter) => {
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
    currentStreak
  };
  localStorage.setItem("wordleStatistics", JSON.stringify(wordleStatistics));
  return;
}
function statisticsStateCheck(win) {
  if (!localStorage.getItem("wordleStatistics"))
    wordleStatisticsStateInit();
  const wordleStatistics = JSON.parse(localStorage.getItem("wordleStatistics"));
  const {gameStatus} = JSON.parse(localStorage.getItem("wordleState"));
  if (win && gameStatus !== "FINISHED") {
    wordleStatistics.gamesPlayed++;
    wordleStatistics.currentStreak++;
    wordleStatistics.maxStreak = Math.max(wordleStatistics.maxStreak, wordleStatistics.currentStreak);
    wordleStatistics.gamesWon++;
    wordleStatistics.winPercentage = wordleStatistics.gamesWon / wordleStatistics.gamesPlayed * 100;
    console.log(wordleStatistics);
    localStorage.setItem("wordleStatistics", JSON.stringify(wordleStatistics));
  }
  if (win === false && gameStatus !== "FINISHED") {
    wordleStatistics.gamesPlayed++;
    wordleStatistics.currentStreak = 0;
    wordleStatistics.winPercentage = wordleStatistics.gamesWon / wordleStatistics.gamesPlayed * 100;
    localStorage.setItem("wordleStatistics", JSON.stringify(wordleStatistics));
  }
}
function startInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}
function stopInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}
function handleMouseClick(event) {
  const target = event.target;
  if (target.matches("[data-key]") && target.dataset.key) {
    pressKey(target.dataset.key);
    return;
  }
  if (target.matches("[data-enter]")) {
    submitGuess();
    return;
  }
  if (target.matches("[data-delete]")) {
    deleteKey();
    return;
  }
}
function handleKeyPress(event) {
  if (event.key === "Enter") {
    submitGuess();
    return;
  }
  if (event.key === "Backspace" || event.key === "Delete") {
    deleteKey();
    return;
  }
  if (event.key.match(/^[a-z]$/)) {
    pressKey(event.key);
    return;
  }
}
function pressKey(key) {
  const activeTiles = getActiveTiles();
  if (activeTiles.length >= WORD_LENGTH)
    return;
  const nextTitle = guessGrid.querySelector(":not([data-letter])");
  nextTitle.dataset.letter = key.toLowerCase();
  nextTitle.textContent = key;
  nextTitle.dataset.state = "active";
}
function deleteKey() {
  const activeTiles = getActiveTiles();
  const lastTile = activeTiles[activeTiles.length - 1];
  if (lastTile == null)
    return;
  lastTile.textContent = "";
  delete lastTile.dataset.state;
  delete lastTile.dataset.letter;
}
function submitGuess() {
  const acitveTiles = [...getActiveTiles()];
  if (acitveTiles.length !== WORD_LENGTH) {
    console.log("NOT LONG ENOUGH!");
    showAlert("Not enough letters!");
    shakeTiles(acitveTiles);
    return;
  }
  const guess = acitveTiles.reduce((word, tile) => {
    return word + tile.dataset.letter;
  }, "");
  if (!dictionary.includes(guess)) {
    showAlert("Not in dictionary!");
    shakeTiles(acitveTiles);
    return;
  }
  stopInteraction();
  acitveTiles.forEach((...params) => flipTile(...params, guess));
}
function flipTile(tile, index, array, guess) {
  const letter = tile.dataset.letter;
  const key = keyboard.querySelector(`[data-key="${letter}"i]`);
  setTimeout(() => {
    tile.classList.add("flip");
  }, index * FLIP_ANIMATION_DURATION / 2);
  tile.addEventListener("transitionend", () => {
    tile.classList.remove("flip");
    if (targetWord[index] === letter) {
      tile.dataset.state = "correct";
      key?.classList.add("correct");
    } else if (letter && targetWord.includes(letter)) {
      tile.dataset.state = "wrong-location";
      key?.classList.add("wrong-location");
    } else {
      tile.dataset.state = "wrong";
      key?.classList.add("wrong");
    }
    if (index === array.length - 1) {
      tile.addEventListener("transitionend", () => {
        startInteraction();
        checkWinLose(guess, array);
      }, {once: true});
    }
  }, {once: true});
}
function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]');
}
function showAlert(message, duration = 1e3) {
  const alert = document.createElement("div");
  alert.textContent = message;
  alert.classList.add("alert");
  alertContainer.prepend(alert);
  if (duration == null)
    return;
  setTimeout(() => {
    alert.classList.add("hide");
    alert.addEventListener("transitionend", () => alert.remove());
  }, duration);
}
function shakeTiles(tiles) {
  tiles.forEach((tiles2) => {
    tiles2.classList.add("shake");
    tiles2.addEventListener("animationend", () => {
      tiles2.classList.remove("shake");
    }, {once: true});
  });
}
function checkWinLose(guess, tiles) {
  setGuessedWordToState(guess, tiles);
  const wordleState = JSON.parse(localStorage.getItem("wordleState"));
  const hasCorrectWord = wordleState.boardState.includes(targetWord);
  const isLastGuess = tiles[0].dataset.word === "5" ? true : false;
  if (guess === targetWord) {
    showAlert("You win!", 2e3);
    danceTiles(tiles);
    stopInteraction();
    statisticsStateCheck(true);
    wordleState.gameStatus = "FINISHED";
    localStorage.setItem("wordleState", JSON.stringify(wordleState));
    setTimeout(() => {
      endGameStatistics();
    }, 2e3);
    return;
  }
  const remainingTiles = guessGrid.querySelectorAll(":not([data-letter])");
  if (remainingTiles.length === 0 && !hasCorrectWord && isLastGuess) {
    showAlert(targetWord.toUpperCase(), 2e3);
    stopInteraction();
    statisticsStateCheck(false);
    wordleState.gameStatus = "FINISHED";
    localStorage.setItem("wordleState", JSON.stringify(wordleState));
    setTimeout(() => {
      endGameStatistics();
    }, 2e3);
  }
}
function danceTiles(tiles) {
  tiles.forEach((tiles2, index) => {
    setTimeout(() => {
      tiles2.classList.add("dance");
      tiles2.addEventListener("animationend", () => {
        tiles2.classList.remove("dance");
      }, {once: true});
    }, index * DANCE_ANIMATION_DURATION / 5);
  });
}
function endGameStatistics() {
  statisticsStateCheck(null);
  const wordleState = JSON.parse(localStorage.getItem("wordleState"));
  const gameStatus = wordleState.gameStatus;
  const {gamesPlayed, maxStreak, winPercentage, currentStreak} = JSON.parse(localStorage.getItem("wordleStatistics"));
  const gamesPlayedElement = document.querySelector("[data-stats-played]");
  const winRateElement = document.querySelector("[data-stats-rate]");
  const currentStreakElement = document.querySelector("[data-stats-cstreak]");
  const maxStreakElement = document.querySelector("[data-stats-mstreak]");
  gamesPlayedElement.innerHTML = gamesPlayed;
  winRateElement.innerHTML = winPercentage;
  currentStreakElement.innerHTML = currentStreak;
  maxStreakElement.innerHTML = maxStreak;
  backgroundFilter.style.display = "block";
  statisticsContainer.style.display = "flex";
  if (gameStatus === "IN_PROGRESS") {
    setTimeout(() => {
      statisticsContainer.classList.remove("hide");
      backgroundFilter.classList.remove("hide");
    }, 500);
    closeBtn.addEventListener("click", () => {
      statisticsContainer.classList.add("hide");
      backgroundFilter.classList.add("hide");
      setTimeout(() => {
        statisticsContainer.style.display = "none";
        backgroundFilter.style.display = "none";
      }, 500);
    });
    return;
  }
  const endGameContainer = document.createElement("div");
  endGameContainer.classList.add("end-game-stats-container");
  const nextWordleContainer = document.createElement("div");
  nextWordleContainer.classList.add("next-wordle-container");
  const nextWordleTitle = document.createElement("h1");
  nextWordleTitle.textContent = "NEXT WORDLE";
  nextWordleTitle.classList.add("title");
  nextWordleContainer.append(nextWordleTitle);
  const nextWordleCountdown = document.createElement("div");
  nextWordleCountdown.textContent = countdownTimer();
  nextWordleCountdown.classList.add("countdown");
  nextWordleContainer.append(nextWordleCountdown);
  endGameContainer.append(nextWordleContainer);
  const dividerLine = document.createElement("div");
  dividerLine.classList.add("divider");
  endGameContainer.append(dividerLine);
  const shareBtnContainer = document.createElement("div");
  shareBtnContainer.classList.add("share-btn-container");
  const shareBtn = document.createElement("button");
  shareBtn.textContent = "SHARE";
  shareBtn.classList.add("share-btn");
  shareBtnContainer.append(shareBtn);
  shareBtn.addEventListener("click", shareBtnEvaluation);
  endGameContainer.append(shareBtnContainer);
  statisticsContainer.append(endGameContainer);
  setInterval(() => {
    nextWordleCountdown.textContent = countdownTimer();
  }, 1e3);
  setTimeout(() => {
    statisticsContainer.classList.remove("hide");
    backgroundFilter.classList.remove("hide");
  }, 500);
  closeBtn.addEventListener("click", () => {
    statisticsContainer.classList.add("hide");
    backgroundFilter.classList.add("hide");
    setTimeout(() => {
      endGameContainer.remove();
      statisticsContainer.style.display = "none";
      backgroundFilter.style.display = "none";
    }, 500);
  });
}
function countdownTimer() {
  const now = new Date();
  let midnight = new Date();
  midnight.setHours(24, 0, 0, 0);
  let remainingTimeToMidnight = midnight.getTime() / 1e3 - now.getTime() / 1e3;
  const hours = Math.floor(remainingTimeToMidnight / 3600);
  remainingTimeToMidnight = remainingTimeToMidnight - hours * 3600;
  let minutes = Math.floor(remainingTimeToMidnight / 60);
  remainingTimeToMidnight = remainingTimeToMidnight - minutes * 60;
  let seconds = Math.floor(remainingTimeToMidnight);
  if (minutes < 10)
    minutes = "0" + minutes;
  if (seconds < 10)
    seconds = "0" + seconds;
  return `${hours}:${minutes}:${seconds}`;
}
function shareBtnEvaluation() {
  const {evaluations} = JSON.parse(localStorage.getItem("wordleState"));
  const evaluationsEmojis = evaluations.map((evaluation) => {
    if (evaluation === null)
      return null;
    const evaluationToEmojis = evaluation.map((element) => {
      if (element === "correct")
        return "🟩";
      if (element === "wrong-location")
        return "🟨";
      if (element === "wrong")
        return "⬛️";
    });
    return evaluationToEmojis.join("");
  }).filter((evaluation) => evaluation !== null).join("\n \n");
  const clipboardMessage = "Wordle Clone TS " + dayOffset + "\n \n" + evaluationsEmojis;
  navigator.clipboard.writeText(clipboardMessage);
  showAlert("Copied Results to Clipboard");
}
statisticsIcon.addEventListener("click", () => {
  endGameStatistics();
});
