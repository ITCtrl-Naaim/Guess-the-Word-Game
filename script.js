const checkBtn = document.querySelector(".check-btn");
const hintsBtn = document.querySelector(".hints-btn");
const resultMsg = document.querySelector(".result-msg");
const triesContainer = document.querySelector(".tries-container");
const triesCount = 4;
const lettersCount = 6;
let hintsCount = 2;
let currentTry = 1;

// Generate Words
const words = [
  "Banana",
  "Cherry",
  "Orange",
  "Tomato",
  "Papaya",
  "Grapes",
  "Lemons",
];
const wordToGuess =
  words[Math.floor(Math.random() * words.length)].toLowerCase();

// Display Hints On Screen
hintsBtn.textContent = `${hintsCount} ${hintsCount === 1 ? " Hint" : "Hints"}`;

function generateInputs() {
  // Create Inputs
  for (let i = 1; i <= triesCount; i++) {
    const inputsRow = document.createElement("div");
    inputsRow.className = `try-${i}`;
    inputsRow.innerHTML = `<span>Try ${i}<span>`;

    if (i !== 1) inputsRow.classList.add("disabled");

    for (let j = 1; j <= lettersCount; j++) {
      const letterInput = document.createElement("input");
      letterInput.type = "text";
      letterInput.id = `try-${i}-letter-${j}`;
      letterInput.maxLength = 1;
      inputsRow.append(letterInput);
      if (i !== 1) letterInput.disabled = true;
    }
    triesContainer.append(inputsRow);
  }
  triesContainer.children[0].children[1].focus();

  // Manage Movement Over Inputs
  const allInputs = triesContainer.querySelectorAll("div input");
  allInputs.forEach((input) => {
    input.addEventListener("input", (e) => {
      const activeInputs = Array.from(
        triesContainer.querySelectorAll(`.try-${currentTry} input`)
      );
      const enabledInputs = Array.from(
        document.querySelectorAll(`.try-${currentTry} input:not([disabled])`)
      );
      const currentIndex = enabledInputs.indexOf(e.currentTarget);
      const isFilled = activeInputs.every((input) => input.value);
      if (hintsCount > 0) hintsBtn.disabled = isFilled;
      input.value = input.value.toUpperCase();
      const nextInput = enabledInputs[currentIndex + 1];
      if (nextInput) nextInput.focus();
    });
    input.addEventListener("keydown", (e) => {
      const activeInputs = Array.from(
        triesContainer.querySelectorAll(`.try-${currentTry} input`)
      );
      const enabledInputs = Array.from(
        document.querySelectorAll(`.try-${currentTry} input:not([disabled])`)
      );
      const currentIndex = enabledInputs.indexOf(e.currentTarget);
      if (e.key === "Backspace") {
        if (input.value === "" && currentIndex > 0) {
          enabledInputs[currentIndex - 1].focus();
          enabledInputs[currentIndex - 1].value = "";
        } else {
          input.value = "";
        }
        const isFilled = activeInputs.every((input) => input.value);
        if (hintsCount > 0) hintsBtn.disabled = isFilled;
        e.preventDefault();
      } else if (
        e.key === "ArrowRight" &&
        currentIndex < enabledInputs.length - 1
      ) {
        enabledInputs[currentIndex + 1].focus();
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        enabledInputs[currentIndex - 1].focus();
      }
    });
  });
}

function checkInputs() {
  let isSuccessed = true;
  const activeInputs = document.querySelectorAll(`.try-${currentTry} input`);
  activeInputs.forEach((input, index) => {
    const inputValue = input.value.toLowerCase();
    if (inputValue === wordToGuess[index]) {
      input.classList.add("in-place");
    } else if (wordToGuess.includes(inputValue) && inputValue !== "") {
      input.classList.add("not-in-place");
      isSuccessed = false;
    } else {
      input.classList.add("wrong-letter");
      isSuccessed = false;
    }
    input.disabled = true;
  });
  if (isSuccessed) {
    document.getElementById("game-over-success-audio").play();
    checkBtn.disabled = true;
    hintsBtn.disabled = true;
    resultMsg.innerHTML = `
    <p>Excellent! You Won.</p>
    <button class="play-again">Play Again</button>
    `;
    document.querySelector(".play-again").addEventListener("click", () => {
      window.location.reload();
    });
  } else {
    document.querySelector(`.try-${currentTry}`).classList.add("disabled");
    if (currentTry < triesContainer.children.length) {
      document.getElementById("fail-audio").play();
      currentTry++;
      document.querySelector(`.try-${currentTry}`).classList.remove("disabled");
      const currentTryInputs = document.querySelectorAll(
        `.try-${currentTry} input`
      );
      currentTryInputs.forEach((input) => (input.disabled = false));
      currentTryInputs[0].focus();
      if (hintsCount > 0) hintsBtn.disabled = false;
      resultMsg.innerHTML = `<p>Try Again, ${
        triesContainer.children.length - (currentTry - 1)
      } tries left.</p>`;
    } else {
      document.getElementById("game-over-failure-audio").play();
      checkBtn.disabled = true;
      hintsBtn.disabled = true;
      resultMsg.innerHTML = `
      <p>Unfortunately! You Lost. The Word is <span>${wordToGuess.toUpperCase()}</span></p>
      <button class="play-again">Try Again</button>
      `;
      document.querySelector(".play-again").addEventListener("click", () => {
        window.location.reload();
      });
    }
  }
}

function manageHints() {
  if (hintsCount > 0) {
    const activeInputs = Array.from(
      document.querySelectorAll(`.try-${currentTry} input`)
    );
    const emptyInputs = activeInputs.filter((input) => input.value === "");
    if (emptyInputs.length > 0) {
      document.getElementById("hint-audio").play();
      const randomNumber = Math.floor(Math.random() * emptyInputs.length);
      const randomInput = emptyInputs[randomNumber];
      const inputIndex = activeInputs.indexOf(randomInput);
      if (inputIndex !== -1) {
        randomInput.value = wordToGuess[inputIndex].toUpperCase();
        randomInput.disabled = true;
        randomInput.style.pointerEvent = "none";
        randomInput.classList.add("in-place");
      }
      activeInputs.find((input) => input.value === "").focus();
    }
    hintsCount--;
    hintsBtn.textContent = `${hintsCount} ${
      hintsCount === 1 ? " Hint" : "Hints"
    }`;
    if (activeInputs.every((input) => input.value)) {
      hintsBtn.disabled = true;
      return;
    }
  }

  if (hintsCount === 0) {
    hintsBtn.disabled = true;
    return;
  }
}

window.onload = () => generateInputs();
checkBtn.addEventListener("click", checkInputs);
document.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    checkBtn.click();
  }
});

hintsBtn.addEventListener("click", manageHints);
