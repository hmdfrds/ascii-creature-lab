const creatureParams = {
  bodyWidth: 15,
  bodyHeight: 10,
  numberOfLimbs: 4,
  limbComplexity: 2,
  headSize: 2,
  numberOfEyes: 2,
  textureDensity: 0.3,
  symmetryFactor: 0.8,
};

function initializeControls() {
  for (const param in creatureParams) {
    const slider = document.getElementById(param);
    const display = document.getElementById(`${param}Val`);
    slider.value = creatureParams[param];
    display.textContent = creatureParams[param];

    slider.addEventListener("input", (event) => {
      const newValue = parseFloat(event.target.value);
      creatureParams[param] = newValue;
      display.textContent = newValue;
    });
  }
}

document.getElementById("generateBtn").addEventListener("click", () => {
  const creatureArt = generateCreature(creatureParams);
  document.getElementById("creatureDisplay").textContent = creatureArt;
});

function randomizeParameters() {
  const ranges = {
    bodyWidth: [5, 30],
    bodyHeight: [3, 20],
    numberOfLimbs: [0, 8],
    limbComplexity: [1, 5],
    headSize: [1, 3],
    numberOfEyes: [1, 5],
    textureDensity: [0, 1],
    symmetryFactor: [0, 1],
  };

  for (const param in ranges) {
    const [min, max] = ranges[param];
    const randomValue = Math.random() * (max - min) + min;
    creatureParams[param] =
      param.includes("Density") || param.includes("Factor")
        ? parseFloat(randomValue.toFixed(1))
        : Math.round(randomValue);
    document.getElementById(param).value = creatureParams[param];
    console.log(param);
    document.getElementById(`${param}Val`).textContent = creatureParams[param];
  }

  const creatureArt = generateCreature(creatureParams);
  document.getElementById("creatureDisplay").textContent = creatureArt;
}
function generateCreature(params) {
  // --- Helper Functions ---

  // Creates a 2D grid (array of arrays) with given width and height, filled with spaces.
  function createGrid(width, height) {
    return Array.from({ length: height }, () => Array(width).fill(" "));
  }

  // Draws a simple box with a stylized border (for head and body)
  function drawBox(grid, x, y, w, h, borderChars) {
    const { topLeft, topRight, bottomLeft, bottomRight, horizontal, vertical } =
      borderChars;
    grid[y][x] = topLeft;
    grid[y][x + w - 1] = topRight;
    grid[y + h - 1][x] = bottomLeft;
    grid[y + h - 1][x + w - 1] = bottomRight;
    for (let i = x + 1; i < x + w - 1; i++) {
      grid[y][i] = horizontal;
      grid[y + h - 1][i] = horizontal;
    }
    for (let j = y + 1; j < y + h - 1; j++) {
      grid[j][x] = vertical;
      grid[j][x + w - 1] = vertical;
    }
  }

  // Draw the head with eyes and a mouth
  function drawHead(grid, x, y, w, h, params) {
    // Use a stylish border for the head.
    const border = {
      topLeft: "/",
      topRight: "\\",
      bottomLeft: "\\",
      bottomRight: "/",
      horizontal: "-",
      vertical: "|",
    };
    drawBox(grid, x, y, w, h, border);

    // Place eyes on the central row.
    const eyeChar = "o";
    const eyeRow = y + Math.floor(h / 2);
    const availableSpace = w - 2;
    const gap = availableSpace / (params.numberOfEyes + 1);
    for (let i = 1; i <= params.numberOfEyes; i++) {
      let eyeCol = x + Math.floor(i * gap);
      // Apply a bit of randomness when symmetry is relaxed.
      if (params.symmetryFactor < 1) {
        eyeCol += Math.floor(
          (Math.random() - 0.5) * (1 - params.symmetryFactor) * 2
        );
      }
      eyeCol = Math.max(x + 1, Math.min(x + w - 2, eyeCol));
      grid[eyeRow][eyeCol] = eyeChar;
    }

    // Add a mouth if there's enough vertical space.
    if (h >= 4) {
      const mouthRow = y + Math.floor(h * 0.75);
      for (let i = x + Math.floor(w / 4); i < x + w - Math.floor(w / 4); i++) {
        grid[mouthRow][i] = "_";
      }
    }
  }

  // Draw the body as a box filled with a texture.
  function drawBody(grid, x, y, w, h, params) {
    // Use a classic box border.
    const border = {
      topLeft: "+",
      topRight: "+",
      bottomLeft: "+",
      bottomRight: "+",
      horizontal: "-",
      vertical: "|",
    };
    drawBox(grid, x, y, w, h, border);

    // Fill the inside with a random texture based on textureDensity.
    const textures = [".", ",", ";", "#", "*"];
    for (let j = y + 1; j < y + h - 1; j++) {
      for (let i = x + 1; i < x + w - 1; i++) {
        if (Math.random() < params.textureDensity) {
          grid[j][i] = textures[Math.floor(Math.random() * textures.length)];
        }
      }
    }
  }

  // Draw limbs attached to the sides of the body.
  function drawLimbs(
    grid,
    bodyX,
    bodyY,
    bodyW,
    limbStartY,
    limbLength,
    params
  ) {
    // We'll attach limbs on both left and right sides.
    // For a creative touch, limbs will attach at random vertical positions along the body.
    const totalLimbs = params.numberOfLimbs;
    const leftLimbs = Math.ceil(totalLimbs / 2);
    const rightLimbs = Math.floor(totalLimbs / 2);

    // Left side limbs (drawn with '/')
    for (let i = 0; i < leftLimbs; i++) {
      const attachRow =
        bodyY + 1 + Math.floor(Math.random() * (limbStartY - bodyY - 1));
      const attachCol = bodyX; // left border of the body
      for (let l = 0; l < limbLength; l++) {
        const row = attachRow + l;
        const col = attachCol - l - 1; // extending diagonally left
        if (row < grid.length && col >= 0) {
          grid[row][col] = "/";
        }
      }
    }

    // Right side limbs (drawn with '\')
    for (let i = 0; i < rightLimbs; i++) {
      const attachRow =
        bodyY + 1 + Math.floor(Math.random() * (limbStartY - bodyY - 1));
      const attachCol = bodyX + bodyW - 1; // right border of the body
      for (let l = 0; l < limbLength; l++) {
        const row = attachRow + l;
        const col = attachCol + l + 1; // extending diagonally right
        if (row < grid.length && col < grid[0].length) {
          grid[row][col] = "\\";
        }
      }
    }
  }

  // --- Compute Dimensions Based on Parameters ---
  // Scale head size and body dimensions creatively.
  const headWidth = params.headSize * 4; // head scales with headSize
  const headHeight = params.headSize * 2 + 1;
  const bodyWidth = params.bodyWidth;
  const bodyHeight = params.bodyHeight;
  const limbLength = params.limbComplexity + 2;

  // Determine canvas size with extra margins for limbs and overall balance.
  const canvasWidth = Math.max(headWidth, bodyWidth) + 12;
  const canvasHeight = headHeight + bodyHeight + limbLength + 4;

  // --- Create Canvas Grid ---
  const grid = createGrid(canvasWidth, canvasHeight);

  // --- Draw the Creature ---
  // Center the head at the top.
  const headX = Math.floor((canvasWidth - headWidth) / 2);
  const headY = 1;
  drawHead(grid, headX, headY, headWidth, headHeight, params);

  // Place the body just below the head.
  const bodyX = Math.floor((canvasWidth - bodyWidth) / 2);
  const bodyY = headY + headHeight;
  drawBody(grid, bodyX, bodyY, bodyWidth, bodyHeight, params);

  // Attach limbs to the sides of the body.
  const limbStartY = bodyY + bodyHeight;
  drawLimbs(grid, bodyX, bodyY, bodyWidth, limbStartY, limbLength, params);

  // --- Convert Grid to a Multi-line String ---
  let creatureStr = grid.map((row) => row.join("")).join("\n");
  creatureStr = creatureStr
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n");
  return creatureStr;
}

document
  .getElementById("randomizeBtn")
  .addEventListener("click", randomizeParameters);

document.getElementById("saveBtn").addEventListener("click", () => {
  const creatureArt = document.getElementById("creatureDisplay").textContent;
  const creatureName =
    document.getElementById("creatureNameInput").value.trim() ||
    `creature_${Date.now()}`;
  const blob = new Blob([creatureArt], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${creatureName}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

document.addEventListener("DOMContentLoaded", initializeControls);
