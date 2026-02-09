const phone = document.querySelector(".phone") || document.body;
const stickersContainer = document.getElementById("stickers-container");

/* ---------- STICKERS SETUP ---------- */
const stickerLists = {
  background: [
    "capy_ljuub.png","capy_maaz.gif","dii.png","gric.gif","guz_2.gif",
    "guz_poziv.gif","kokos.png","miao.gif","pingvin.gif","znaas.png"
  ]
};

let happyIndex = 0;
let occupiedPositions = [];

/* ---------- SAFE ZONE (centered content) ---------- */
function getSafeZone() {
  const phoneRect = phone.getBoundingClientRect();
  const rect = document.querySelector(".centered")?.getBoundingClientRect() || { left: 0, top: 0, right: 0, bottom: 0 };
  return {
    left: rect.left - phoneRect.left,
    top: rect.top - phoneRect.top,
    right: rect.right - phoneRect.left,
    bottom: rect.bottom - phoneRect.top
  };
}

function isOverlapping(x, y, w, h, list) {
  return list.some(p =>
    x < p.x + p.width &&
    x + w > p.x &&
    y < p.y + p.height &&
    y + h > p.y
  );
}

/* ---------- RANDOM POSITION (PHONE-BOUND) ---------- */
function getRandomNonOverlappingPosition(w, h) {
  const phoneRect = phone.getBoundingClientRect();
  const safe = getSafeZone();
  const margin = 10;

  let x, y, tries = 0;
  do {
    x = margin + Math.random() * (phoneRect.width - w - 2 * margin);
    y = margin + Math.random() * (phoneRect.height - h - 2 * margin);
    tries++;
    if (tries > 200) break;
  } while (
    (x + w > safe.left && x < safe.right && y + h > safe.top && y < safe.bottom) ||
    isOverlapping(x, y, w, h, occupiedPositions)
  );

  x = Math.max(margin, Math.min(x, phoneRect.width - w - margin));
  y = Math.max(margin, Math.min(y, phoneRect.height - h - margin));

  return { x, y };
}

/* ---------- CREATE STICKER ---------- */
function createSticker(name, folder="background", x=null, y=null, maxSizePct=25, duration=10000) {
  const img = document.createElement("img");
  img.src = `assets/stickers/${folder}/${name}`;
  img.classList.add("sticker");

  const phoneRect = phone.getBoundingClientRect();
  const sizePct = 10 + Math.random() * maxSizePct;
  const sizePx = phoneRect.width * (sizePct / 100);

  img.style.width = sizePx + "px";
  img.style.height = sizePx + "px";

  const pos = (x !== null && y !== null)
    ? {
        x: Math.max(0, Math.min(x, phoneRect.width - sizePx)),
        y: Math.max(0, Math.min(y, phoneRect.height - sizePx))
      }
    : getRandomNonOverlappingPosition(sizePx, sizePx);

  img.style.left = pos.x + "px";
  img.style.top = pos.y + "px";

  stickersContainer.appendChild(img);

  requestAnimationFrame(() => {
    occupiedPositions.push({
      x: pos.x,
      y: pos.y,
      width: img.offsetWidth,
      height: img.offsetHeight
    });
  });

  setTimeout(() => {
    img.remove();
    occupiedPositions = occupiedPositions.filter(p => p.x !== pos.x || p.y !== pos.y);
  }, duration);
}

/* ---------- BACKGROUND STICKERS ---------- */
setInterval(() => {
  const bg = stickerLists.background;
  if (!bg.length) return;
  createSticker(bg[happyIndex], "background");
  happyIndex = (happyIndex + 1) % bg.length;
}, 1000);

/* ---------- RESIZE SAFETY ---------- */
window.addEventListener("resize", () => {
  occupiedPositions = [];
  const allStickers = stickersContainer.querySelectorAll(".sticker");
  allStickers.forEach(sticker => sticker.remove());
});
