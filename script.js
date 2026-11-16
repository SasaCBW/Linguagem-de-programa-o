
const canvas = document.getElementById("artCanvas");
const ctx = canvas.getContext("2d");

const brushSize = document.getElementById("brushSize");
const sizeValue = document.getElementById("sizeValue");
const colorPicker = document.getElementById("colorPicker");
const backgroundColor = document.getElementById("backgroundColor");
const symmetry = document.getElementById("symmetry");
const canvasHint = document.getElementById("canvasHint");
const canvasStatus = document.getElementById("canvasStatus");

const clearBtn = document.getElementById("clearBtn");
const randomBtn = document.getElementById("randomBtn");
const saveBtn = document.getElementById("saveBtn");

let currentColor = "#ff5470";
let currentTool = "brush";
let currentSize = 8;
let currentBackground = "#101426";
let drawing = false;
let lastPoint = null;

const colors = [
  "#ff5470",
  "#ffb347",
  "#ffe66d",
  "#5ee6a8",
  "#55c8ff",
  "#a98bff",
  "#ffffff"
];

let canvasWidth = 0;
let canvasHeight = 0;

// Configuração da tela
function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();

  if (!rect.width || !rect.height) return;

  let previousCanvas = null;

  if (canvas.width && canvas.height) {
    previousCanvas = document.createElement("canvas");
    previousCanvas.width = canvas.width;
    previousCanvas.height = canvas.height;

    previousCanvas
      .getContext("2d")
      .drawImage(canvas, 0, 0);
  }

  const oldWidth = canvasWidth;
  const oldHeight = canvasHeight;

  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);

  canvasWidth = rect.width;
  canvasHeight = rect.height;

  canvas.width = Math.round(canvasWidth * pixelRatio);
  canvas.height = Math.round(canvasHeight * pixelRatio);

  ctx = canvas.getContext("2d");
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  ctx.fillStyle = currentBackground;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  if (previousCanvas && oldWidth && oldHeight) {
    ctx.drawImage(
      previousCanvas,
      0,
      0,
      previousCanvas.width,
      previousCanvas.height,
      0,
      0,
      canvasWidth,
      canvasHeight
    );
  }
}

// Limpar a tela
function clearCanvas() {
  ctx.save();
  ctx.globalAlpha = 1;
  ctx.shadowBlur = 0;
  ctx.fillStyle = currentBackground;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);
  ctx.restore();

  canvasHint.classList.remove("hidden");
  canvasStatus.textContent = "Tela limpa. Uma nova criação espera por você!";
}

// Atualizar status
function updateStatus(message) {
  canvasStatus.textContent = message;
}

// Coordenadas do mouse ou toque
function getPointerPosition(event) {
  const rect = canvas.getBoundingClientRect();

  return {
    x: event.clientX - rect.left,
    y: event.clientY - rect.top
  };
}

// Desenhar um traço
function drawLine(x1, y1, x2, y2, color, size, neon = false) {
  ctx.save();

  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);

  ctx.strokeStyle = color;
  ctx.lineWidth = size;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (neon) {
    ctx.shadowColor = color;
    ctx.shadowBlur = size * 3;
  }

  ctx.stroke();
  ctx.restore();
}

// Desenhar um círculo
function drawCircle(x, y, radius, color, filled = false) {
  ctx.save();

  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);

  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(1.5, currentSize / 3);

  if (filled) {
    ctx.fill();
  } else {
    ctx.stroke();
  }

  ctx.restore();
}

// Desenhar confetes
function drawConfetti(x, y, color) {
  for (let i = 0; i < 5; i++) {
    const offsetX = (Math.random() - 0.5) * currentSize * 5;
    const offsetY = (Math.random() - 0.5) * currentSize * 5;
    const size = Math.random() * currentSize + 2;

    ctx.save();
    ctx.translate(x + offsetX, y + offsetY);
    ctx.rotate(Math.random() * Math.PI);

    ctx.fillStyle = i % 2 === 0 ? color : randomColor();
    ctx.fillRect(-size / 2, -size / 2, size, size * 1.5);

    ctx.restore();
  }
}

// Escolher uma cor aleatória
function randomColor() {
  return colors[Math.floor(Math.random() * colors.length)];
}

// Desenhar de acordo com a ferramenta selecionada
function drawAt(x, y, previousX, previousY) {
  const points = [{ x, y }];

  if (symmetry.checked) {
    const mirroredX = canvasWidth - x;

    if (Math.abs(mirroredX - x) > 1) {
      points.push({ x: mirroredX, y });
    }
  }

  points.forEach((point) => {
    const px = point.x;
    const py = point.y;

    if (currentTool === "brush") {
      if (previousX === null) {
        drawCircle(px, py, currentSize / 2, currentColor, true);
      } else {
        const previousMirroredX = symmetry.checked
          ? canvasWidth - previousX
          : previousX;

        const isMirroredPoint = px !== x;

        drawLine(
          isMirroredPoint ? previousMirroredX : previousX,
          previousY,
          px,
          py,
          currentColor,
          currentSize
        );
      }
    }

    if (currentTool === "neon") {
      if (previousX === null) {
        drawCircle(px, py, currentSize, currentColor, false);
      } else {
        const previousMirroredX = symmetry.checked
          ? canvasWidth - previousX
          : previousX;

        const isMirroredPoint = px !== x;

        drawLine(
          isMirroredPoint ? previousMirroredX : previousX,
          previousY,
          px,
          py,
          currentColor,
          currentSize,
          true
        );
      }
    }

    if (currentTool === "bubbles") {
      const radius = Math.random() * currentSize * 1.8 + 3;

      ctx.save();
      ctx.globalAlpha = 0.45 + Math.random() * 0.35;
      drawCircle(px, py, radius, currentColor, false);
      ctx.restore();
    }

    if (currentTool === "geometric") {
      const radius = currentSize * (1 + Math.random() * 2);

      ctx.save();
      ctx.globalAlpha = 0.85;
      drawCircle(px, py, radius, currentColor, false);

      if (previousX !== null) {
        const previousMirroredX = symmetry.checked
          ? canvasWidth - previousX
          : previousX;

        const isMirroredPoint = px !== x;

        drawLine(
          isMirroredPoint ? previousMirroredX : previousX,
          previousY,
          px,
          py,
          currentColor,
          Math.max(1, currentSize / 3)
        );
      }

      ctx.restore();
    }

    if (currentTool === "confetti") {
      drawConfetti(px, py, currentColor);
    }
  });
}

// Início do desenho
canvas.addEventListener("pointerdown", (event) => {
  event.preventDefault();

  drawing = true;
  canvas.setPointerCapture(event.pointerId);

  const point = getPointerPosition(event);

  lastPoint = point;

  canvasHint.classList.add("hidden");

  drawAt(point.x, point.y, null, null);

  updateStatus("Criando sua arte...");
});

// Movimento do desenho
canvas.addEventListener("pointermove", (event) => {
  if (!drawing) return;

  event.preventDefault();

  const point = getPointerPosition(event);

  drawAt(
    point.x,
    point.y,
    lastPoint.x,
    lastPoint.y
  );

  lastPoint = point;
});

// Finalizar desenho
function stopDrawing() {
  if (!drawing) return;

  drawing = false;
  lastPoint = null;

  updateStatus("Sua criação está tomando forma!");
}

canvas.addEventListener("pointerup", stopDrawing);
canvas.addEventListener("pointercancel", stopDrawing);
canvas.addEventListener("lostpointercapture", stopDrawing);

// Selecionar ferramenta
document.querySelectorAll(".tool-btn").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tool-btn").forEach((item) => {
      item.classList.remove("active");
    });

    button.classList.add("active");

    currentTool = button.dataset.tool;

    const toolNames = {
      brush: "Pincel livre",
      neon: "Neon",
      bubbles: "Bolhas",
      geometric: "Geométrico",
      confetti: "Confetes"
    };

    updateStatus("Ferramenta selecionada: " + toolNames[currentTool]);
  });
});

// Selecionar cor da paleta
document.querySelectorAll(".color-swatch").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".color-swatch").forEach((item) => {
      item.classList.remove("selected");
    });

    button.classList.add("selected");

    currentColor = button.dataset.color;
    colorPicker.value = currentColor;

    updateStatus("Nova cor selecionada!");
  });
});

// Escolher cor personalizada
colorPicker.addEventListener("input", (event) => {
  currentColor = event.target.value;

  document.querySelectorAll(".color-swatch").forEach((item) => {
    item.classList.remove("selected");
  });

  updateStatus("Cor personalizada selecionada!");
});

// Alterar tamanho do pincel
brushSize.addEventListener("input", (event) => {
  currentSize = Number(event.target.value);
  sizeValue.textContent = currentSize + " px";
});

// Alterar cor do fundo
backgroundColor.addEventListener("input", (event) => {
  currentBackground = event.target.value;

  clearCanvas();

  updateStatus("Fundo alterado. A tela foi limpa para uma nova criação.");
});

// Limpar botão
clearBtn.addEventListener("click", () => {
  clearCanvas();
});

// Criar arte automática
function createRandomArt() {
  clearCanvas();

  canvasHint.classList.add("hidden");

  const totalShapes = 110;

  for (let i = 0; i < totalShapes; i++) {
    const x = Math.random() * canvasWidth;
    const y = Math.random() * canvasHeight;
    const color = randomColor();
    const size = Math.random() * 35 + 5;
    const type = Math.floor(Math.random() * 4);

    ctx.save();

    ctx.globalAlpha = Math.random() * 0.65 + 0.25;

    if (type === 0) {
      drawCircle(x, y, size, color, Math.random() > 0.5);
    }

    if (type === 1) {
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);

      ctx.fillStyle = color;
      ctx.fillRect(-size / 2, -size / 2, size, size);
    }

    if (type === 2) {
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(
        x + (Math.random() - 0.5) * 120,
        y + (Math.random() - 0.5) * 120
      );

      ctx.strokeStyle = color;
      ctx.lineWidth = Math.random() * 5 + 1;
      ctx.stroke();
    }

    if (type === 3) {
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);

      ctx.fillStyle = color;
      ctx.fill();
    }

    ctx.restore();
  }

  updateStatus("Uma nova composição artística foi criada!");
}

// Botão de arte aleatória
randomBtn.addEventListener("click", createRandomArt);

// Salvar desenho como imagem PNG
function saveArtwork() {
  const exportCanvas = document.createElement("canvas");
  const exportContext = exportCanvas.getContext("2d");

  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;

  exportContext.fillStyle = currentBackground;
  exportContext.fillRect(
    0,
    0,
    exportCanvas.width,
    exportCanvas.height
  );

  exportContext.drawImage(canvas, 0, 0);

  const link = document.createElement("a");

  link.download = "minha-arte-digital.png";
  link.href = exportCanvas.toDataURL("image/png");

  link.click();

  updateStatus("Sua arte foi preparada para salvar!");
}

// Botão salvar
saveBtn.addEventListener("click", saveArtwork);

// Ajustar tela quando a janela mudar de tamanho
let resizeTimeout;

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);

  resizeTimeout = setTimeout(() => {
    resizeCanvas();
  }, 150);
});

// Inicializar o projeto
resizeCanvas();
clearCanvas();

updateStatus("Tudo pronto. Escolha uma ferramenta e comece!");
