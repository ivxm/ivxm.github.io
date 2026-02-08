const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");

const yesRect = yesBtn.getBoundingClientRect();
const offsetParentRect = yesBtn.offsetParent.getBoundingClientRect();

// start No button right next to Yes
noBtn.style.position = "absolute";
noBtn.style.left = (yesRect.right - offsetParentRect.left + 10) + "px"; // 10px gap
noBtn.style.top = (yesRect.top - offsetParentRect.top) + "px";

const stickersContainer = document.getElementById("stickers-container");

// --- Stickers setup (same as before) ---
const stickerLists = {
  background: ["capy_ljuub.png","capy_maaz.gif","dii.png","gric.gif","guz_2.gif","guz_poziv.gif","kokos.png","miao.gif","pingvin.gif","znaas.png"],
  angry: ["kicanje.png"]
};

let happyIndex = 0;
let occupiedPositions = [];

// --- Safe zone ---
function getSafeZone() {
  return document.querySelector(".centered").getBoundingClientRect();
}

function isOverlapping(x, y, width, height, positions) {
  for (let pos of positions) {
    if (x < pos.x + pos.width && x + width > pos.x && y < pos.y + pos.height && y + height > pos.y) return true;
  }
  return false;
}

function getRandomNonOverlappingPosition(elementWidth, elementHeight) {
  const safe = getSafeZone();
  const margin = 20;
  let x, y, attempts = 0;
  do {
    x = margin + Math.random() * (window.innerWidth - elementWidth - 2 * margin);
    y = margin + Math.random() * (window.innerHeight - elementHeight - 2 * margin);
    attempts++;
    if (attempts > 200) break;
  } while ((x + elementWidth > safe.left - 10 && x < safe.right + 10 && y + elementHeight > safe.top - 10 && y < safe.bottom + 10)
           || isOverlapping(x, y, elementWidth, elementHeight, occupiedPositions));
  return { x, y };
}

function createSticker(name, folder="background", x=null, y=null, maxSizeVW=15, duration=10000) {
  const img = document.createElement("img");
  img.src = `assets/stickers/${folder}/${name}`;
  img.classList.add("sticker");

  const size = 5 + Math.random() * maxSizeVW;
  img.style.width = size + "vw";
  img.style.height = size + "vw";

  const pos = (x!==null && y!==null)
    ? {x, y}
    : getRandomNonOverlappingPosition(window.innerWidth * (size/100), window.innerWidth * (size/100));

  img.style.left = pos.x + "px";
  img.style.top = pos.y + "px";

  stickersContainer.appendChild(img);
  occupiedPositions.push({ x: pos.x, y: pos.y, width: img.offsetWidth, height: img.offsetHeight });

  setTimeout(() => {
    img.remove();
    occupiedPositions = occupiedPositions.filter(p => p !== pos);
  }, duration);

  return img;
}

// --- Round-robin background stickers ---
setInterval(() => {
  const bg = stickerLists.background;
  if (!bg.length) return;
  createSticker(bg[happyIndex], "background");
  happyIndex = (happyIndex + 1) % bg.length;
}, 2500);

// --- No button movement ---
function getSafeZones() {
  const hRect = document.querySelector("h1").getBoundingClientRect();
  const yRect = yesBtn.getBoundingClientRect();
  return [
    { left: hRect.left, top: hRect.top, right: hRect.right, bottom: hRect.bottom },
    { left: yRect.left, top: yRect.top, right: yRect.right, bottom: yRect.bottom }
  ];
}

function isOverlappingSafeZone(x, y, width, height, zones) {
  for (let zone of zones) {
    if (x < zone.right && x + width > zone.left && y < zone.bottom && y + height > zone.top) return true;
  }
  return false;
}

noBtn.addEventListener("click", () => {
  const angryStickers = stickerLists.angry;
  if (!angryStickers.length) return;

  const btnRect = noBtn.getBoundingClientRect();
  const btnWidth = btnRect.width;
  const btnHeight = btnRect.height;

  // place angry sticker
  const containerRect = stickersContainer.getBoundingClientRect();
  createSticker(angryStickers[0], "angry", btnRect.left - containerRect.left, btnRect.top - containerRect.top, 15, 2000);

  const maxDeltaX = window.innerWidth * 0.25;
  const maxDeltaY = window.innerHeight * 0.2;
  const margin = 10;
  const zones = getSafeZones();

  let newX, newY;
  let tries = 0;
  do {
    newX = margin + Math.random() * (window.innerWidth - btnWidth - 2 * margin);
    newY = margin + Math.random() * (window.innerHeight - btnHeight - 2 * margin);
    tries++;
    if (tries > 10) break;
  } while (isOverlappingSafeZone(newX, newY, btnWidth, btnHeight, zones));

  noBtn.style.position = "absolute";
  const offsetParentRect = noBtn.offsetParent.getBoundingClientRect();
  noBtn.style.left = newX - offsetParentRect.left + "px";
  noBtn.style.top = newY - offsetParentRect.top + "px";
});

// --- Yes button click: go to another page ---
yesBtn.addEventListener("click", () => {
  window.location.href = "yes.html"; // or whatever page exists in your repo
});
