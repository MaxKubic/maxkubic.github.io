let highestZIndex = 10;

// Přesune okno do popředí
function bringToFront(win) {
  highestZIndex++;
  win.style.zIndex = highestZIndex;
  updateActiveTaskbarButton(win);
}

// Získá název okna z horní lišty
function getWindowTitle(win) {
  const title = win.querySelector(".title-bar-text");
  return title ? title.textContent.trim() : win.id;
}

// Najde tlačítko daného okna v taskbaru
function getTaskbarButton(win) {
  return document.querySelector(
    `.taskbar-window-button[data-window-id="${win.id}"]`
  );
}

// Vytvoří tlačítko okna v taskbaru
function createTaskbarButton(win) {
  const taskbarWindows = document.getElementById("taskbarWindows");

  if (!taskbarWindows) return null;

  let button = getTaskbarButton(win);

  if (button) return button;

  button = document.createElement("button");
  button.className = "taskbar-window-button";
  button.dataset.windowId = win.id;
  button.textContent = getWindowTitle(win);
  button.title = getWindowTitle(win);

  button.addEventListener("click", () => {
    const isMinimized =
      win.style.display === "none" ||
      win.classList.contains("minimized");

    if (isMinimized) {
      restoreWindow(win);
      return;
    }

    if (button.classList.contains("active")) {
      minimizeWindow(win);
    } else {
      bringToFront(win);
    }
  });

  taskbarWindows.appendChild(button);

  return button;
}

// Označí aktivní okno v taskbaru
function updateActiveTaskbarButton(activeWindow) {
  document.querySelectorAll(".taskbar-window-button").forEach(button => {
    button.classList.remove("active");
  });

  if (!activeWindow) return;

  const button = getTaskbarButton(activeWindow);

  if (button && !activeWindow.classList.contains("minimized")) {
    button.classList.add("active");
    button.classList.remove("minimized");
  }
}

// Otevře okno
function openWindow(id) {
  const win = document.getElementById(id);

  if (!win) return;

  win.style.display = "block";
  win.classList.remove("minimized");

  createTaskbarButton(win);
  bringToFront(win);

  const startMenu = document.getElementById("startMenu");

  if (startMenu) {
    startMenu.style.display = "none";
  }
}

// Zavře okno a odstraní ho z taskbaru
function closeWindow(id) {
  const win = document.getElementById(id);

  if (!win) return;

  win.style.display = "none";
  win.classList.remove("minimized");

  const button = getTaskbarButton(win);

  if (button) {
    button.remove();
  }
}

// Minimalizuje okno
function minimizeWindow(win) {
  if (!win) return;

  createTaskbarButton(win);

  win.classList.add("minimized");
  win.style.display = "none";

  const button = getTaskbarButton(win);

  if (button) {
    button.classList.remove("active");
    button.classList.add("minimized");
  }
}

// Obnoví minimalizované okno
function restoreWindow(win) {
  if (!win) return;

  win.style.display = "block";
  win.classList.remove("minimized");

  bringToFront(win);
}

// Maximalizace nebo návrat do původní velikosti
function toggleMaximizeWindow(win) {
  if (!win) return;

  const isMaximized = win.classList.contains("maximized");

  if (!isMaximized) {
    win.dataset.previousTop = win.style.top;
    win.dataset.previousLeft = win.style.left;
    win.dataset.previousWidth = win.style.width;
    win.dataset.previousHeight = win.style.height;
    win.dataset.previousMaxHeight = win.style.maxHeight;
    win.dataset.previousPosition = win.style.position;

    win.classList.add("maximized");

    win.style.position = "fixed";
    win.style.top = "0";
    win.style.left = "0";
    win.style.width = "100vw";
    win.style.height = "calc(100vh - 30px)";
    win.style.maxHeight = "none";
    win.style.boxSizing = "border-box";

    const body = win.querySelector(".window-body");

    if (body) {
      body.dataset.previousMaxHeight = body.style.maxHeight;
      body.dataset.previousOverflowY = body.style.overflowY;

      body.style.maxHeight = "calc(100vh - 70px)";
      body.style.overflowY = "auto";
    }

    bringToFront(win);
  } else {
    win.classList.remove("maximized");

    win.style.position = win.dataset.previousPosition || "absolute";
    win.style.top = win.dataset.previousTop || "40px";
    win.style.left = win.dataset.previousLeft || "100px";
    win.style.width = win.dataset.previousWidth || "450px";
    win.style.height = win.dataset.previousHeight || "";
    win.style.maxHeight = win.dataset.previousMaxHeight || "";
    win.style.boxSizing = "";

    const body = win.querySelector(".window-body");

    if (body) {
      body.style.maxHeight = body.dataset.previousMaxHeight || "";
      body.style.overflowY = body.dataset.previousOverflowY || "";
    }

    bringToFront(win);
  }
}

// Start menu
function toggleStartMenu() {
  const menu = document.getElementById("startMenu");

  if (!menu) return;

  menu.style.display =
    menu.style.display === "flex" ? "none" : "flex";
}

// Hodiny
function updateClock() {
  const clock = document.getElementById("clock");

  if (!clock) return;

  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");

  clock.textContent = `${hours}:${minutes}`;
}

// Posouvání oken
function makeDraggable(element) {
  let previousMouseX = 0;
  let previousMouseY = 0;

  const header = element.querySelector(".title-bar");

  if (!header) return;

  header.style.cursor = "move";
  header.addEventListener("mousedown", dragMouseDown);

  function dragMouseDown(event) {
  // Na telefonu okna nepřetahujeme
  if (window.innerWidth <= 768) return;

  if (event.target.closest("button")) return;
  if (element.classList.contains("maximized")) return;

  event.preventDefault();

  bringToFront(element);

  previousMouseX = event.clientX;
  previousMouseY = event.clientY;

  document.addEventListener("mousemove", elementDrag);
  document.addEventListener("mouseup", stopDragging);
}

  function elementDrag(event) {
    event.preventDefault();

    const movementX = previousMouseX - event.clientX;
    const movementY = previousMouseY - event.clientY;

    previousMouseX = event.clientX;
    previousMouseY = event.clientY;

    let newTop = element.offsetTop - movementY;
    let newLeft = element.offsetLeft - movementX;

    const titleBarHeight = header.offsetHeight;
    const minimumVisibleWidth = 80;

    const minimumLeft =
      -element.offsetWidth + minimumVisibleWidth;

    const maximumLeft =
      window.innerWidth - minimumVisibleWidth;

    const maximumTop =
      window.innerHeight - titleBarHeight - 30;

    newLeft = Math.max(minimumLeft, Math.min(newLeft, maximumLeft));
    newTop = Math.max(0, Math.min(newTop, maximumTop));

    element.style.top = `${newTop}px`;
    element.style.left = `${newLeft}px`;
  }

  function stopDragging() {
    document.removeEventListener("mousemove", elementDrag);
    document.removeEventListener("mouseup", stopDragging);
  }
}

// Spuštění po načtení stránky
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".window").forEach(win => {
    const controls = win.querySelector(".title-bar-controls");

    if (controls) {
      const minimizeButton = controls.querySelector(
        'button[aria-label="Minimize"]'
      );

      const maximizeButton = controls.querySelector(
        'button[aria-label="Maximize"]'
      );

      const closeButton = controls.querySelector(
        'button[aria-label="Close"]'
      );

      if (minimizeButton) {
        minimizeButton.addEventListener("click", event => {
          event.stopPropagation();
          minimizeWindow(win);
        });
      }

      if (maximizeButton) {
        maximizeButton.addEventListener("click", event => {
          event.stopPropagation();
          toggleMaximizeWindow(win);
        });
      }

      if (closeButton) {
        closeButton.addEventListener("click", event => {
          event.stopPropagation();
          closeWindow(win.id);
        });
      }
    }

    win.addEventListener("mousedown", () => {
      if (win.style.display !== "none") {
        bringToFront(win);
      }
    });

    const titleBar = win.querySelector(".title-bar");

    if (titleBar) {
      titleBar.addEventListener("dblclick", event => {
        if (event.target.closest("button")) return;

        toggleMaximizeWindow(win);
      });
    }

    if (win.classList.contains("draggable")) {
      makeDraggable(win);
    }
  });

  document.addEventListener("mousedown", event => {
    const menu = document.getElementById("startMenu");
    const startButton = document.querySelector(".start-btn");

    if (
      menu &&
      startButton &&
      !menu.contains(event.target) &&
      !startButton.contains(event.target)
    ) {
      menu.style.display = "none";
    }
  });

  updateClock();
  setInterval(updateClock, 1000);
});
