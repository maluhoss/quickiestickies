const input = document.querySelector("#note-mods input");
const noteSection = document.querySelector("#notes")
let notes = document.querySelectorAll(".note");
const timeParts = document.querySelectorAll("#time .number");
const timePartInputs = document.querySelectorAll("#time input");
const startButton = document.querySelector("#start-timer");
const stopButton = document.querySelector("#stop-timer");
const resetButton = document.querySelector("#reset-timer")
const hideNotesButton = document.querySelector("#hide-notes");
const showNotesButton = document.querySelector("#show-notes");
const exportButton = document.querySelector("#export-notes");

// create starting points
let initialTimer = 0;
let timer = 0;
let countdownInterval = null;

function calculateTimer() {
  initialTimer = 0;
  timer = 0;
  countdownInterval = null;
  for (let i = 0; i < timeParts.length; i++) {
    const numberOfSeconds = Math.pow(60, timeParts.length - 1 - i) * Number(timeParts[i].innerText);
    timer += numberOfSeconds;
  }
  initialTimer = timer;
}

function displayTime(timer) {
  const mins = Math.floor(timer / Math.pow(60, 1));
  const secs = Math.floor(timer % 60);
  const currentTimeParts = [mins, secs]

  for (let i = 0; i < timeParts.length; i++) {
    const finalOutput = (i === 1 && String(currentTimeParts[i]) < 10)
      ? `0${String(currentTimeParts[i])}`
      : String(currentTimeParts[i]);
    timeParts[i].innerHTML = finalOutput;
  }
}

// calculate timer at the beginning
calculateTimer();

// add event listener to first note
notes.forEach(note => note.addEventListener("input", (event) => {
  if (!event.target.children.length) {
    noteSection.removeChild(event.target)
  }
}))

// add event listener when user changes time input and calculate timer
for (let i = 0; i < timeParts.length; i++) {
  timeParts[i].addEventListener("click", (event) => {
    timeParts[i].nextElementSibling.classList.toggle("hide");
    timeParts[i].nextElementSibling.focus();
    timeParts[i].classList.toggle("hide");
  })

  // if focused and enter is pressed, activate input
  timeParts[i].addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      timeParts[i].nextElementSibling.classList.toggle("hide");
      timeParts[i].nextElementSibling.focus();
      timeParts[i].classList.toggle("hide");
    }
  })

  timePartInputs[i].addEventListener("focusout", (event) => {
      if (event.target.value) {
        timePartInputs[i].previousElementSibling.innerText = event.target.value;
        event.target.value = "";
      }

      // to avoid double toggling when hitting Enter
      if (timePartInputs[i].previousElementSibling.classList.contains("hide")) {
        timePartInputs[i].previousElementSibling.classList.toggle("hide");
        timePartInputs[i].classList.toggle("hide");
        calculateTimer();
      }
  })

  timePartInputs[i].addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      if (event.target.value) {
        timePartInputs[i].previousElementSibling.innerText = event.target.value;
        event.target.value = "";
      }
      timePartInputs[i].previousElementSibling.classList.toggle("hide");
      timePartInputs[i].classList.toggle("hide");
      calculateTimer();
    }
  })
}

startButton.addEventListener("click", () => {
  // show stop button and hide start button
  startButton.classList.toggle("hide");
  stopButton.classList.toggle("hide");

  // start countdown at the beginning
  if (!countdownInterval) {
    displayTime(timer);
    timer--;
  }

  // continue countdown
  countdownInterval = setInterval(() => {
    displayTime(timer);
    if (timer === 0) {
      clearInterval(countdownInterval);
      confetti({
        particleCount: 150,
        spread: 180
      });
      stopButton.classList.toggle("hide");
      startButton.classList.toggle("hide");
    }

    if (timer > 0) {
      timer--;
    }
  }, 1000);
})

stopButton.addEventListener("click", () => {
  // show start button and hide stop button
  startButton.classList.toggle("hide");
  stopButton.classList.toggle("hide");

  // pause countdown
  clearInterval(countdownInterval);
})

resetButton.addEventListener("click", () => {
  clearInterval(countdownInterval)
  displayTime(initialTimer);
  timer = initialTimer;
  countdownInterval = null;

  // show start button and hide stop button when reset pressed while timer is going
  if (startButton.classList.contains("hide")) {
    startButton.classList.toggle("hide");
    stopButton.classList.toggle("hide");
  }
})

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    // create new note
    const submitted = event.target.value;
    const note = document.createElement("article");
    note.classList.add("note", "interactive");
    note.setAttribute("contenteditable", true);
    note.setAttribute("role", "textbox");
    note.addEventListener("input", (event) => {
      if (!event.target.children.length) {
        noteSection.removeChild(event.target)
      }
    })

    // put content into note
    const noteContent = document.createElement("p");
    noteContent.innerHTML = submitted;

    // add note to note section
    note.appendChild(noteContent);
    noteSection.appendChild(note);

    // reset input
    input.value = "";
  }
})

// TO DO: adjust input height if text goes past width e.g. overflow with scrollWidth > offsetWidth

hideNotesButton.addEventListener("click", () => {
  noteSection.classList.toggle("blur");
  showNotesButton.classList.toggle("hide");
  hideNotesButton.classList.toggle("hide");
})

showNotesButton.addEventListener("click", () => {
  noteSection.classList.toggle("blur");
  showNotesButton.classList.toggle("hide");
  hideNotesButton.classList.toggle("hide");
})

exportButton.addEventListener("click", () => {
  // prep text
  let text = "";
  notes = document.querySelectorAll(".note");
  notes.forEach(note => text += `${note.innerText}\n`);

  // create download - ref: https://stackoverflow.com/questions/3665115/how-to-create-a-file-in-memory-for-user-to-download-but-not-through-server
  const link = document.createElement("a")
  link.href = "data:text/plain;charset=UTF-8," + encodeURIComponent(text);
  link.download = "quickiestickies.txt";
  link.style.display = "none";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
})
