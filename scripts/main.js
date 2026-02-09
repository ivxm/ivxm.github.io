const phone = document.querySelector(".phone") || document.body;

const yesBtn = document.getElementById("yes");
const noBtn = document.getElementById("no");
const stickersContainer = document.getElementById("stickers-container");

/* ---------- INITIAL BUTTON PLACEMENT ---------- */
function placeButtonsInitially() {
  const centeredRect = document.querySelector(".centered").getBoundingClientRect();
  const parentRect = yesBtn.offsetParent.getBoundingClientRect();

  // Yes button on left
  yesBtn.style.position = "absolute";
  yesBtn.style.left = (centeredRect.left - parentRect.left + 10) + "px";
  yesBtn.style.top = (centeredRect.bottom - parentRect.top + 10) + "px";

  // No button on right
  noBtn.style.position = "absolute";
  noBtn.style.left = (centeredRect.right - parentRect.left - noBtn.offsetWidth - 10) + "px";
  noBtn.style.top = (centeredRect.bottom - parentRect.top + 10) + "px";
}

placeButtonsInitially();



/* ---------- STICKERS SETUP ---------- */
const stickerLists = {
  background: [
    "capy_ljuub.png","capy_maaz.gif","dii.png","gric.gif","guz_2.gif",
    "guz_poziv.gif","kokos.png","miao.gif","pingvin.gif","znaas.png"
  ],
  angry: ["kicanje.png"]
};

let happyIndex = 0;
let occupiedPositions = [];

/* ---------- SAFE ZONE ---------- */
function getSafeZone() {
  const phoneRect = phone.getBoundingClientRect();
  const rect = document.querySelector(".centered").getBoundingClientRect();
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
  const margin = 10; // spacing from edges

  let x, y, tries = 0;

  do {
    x = margin + Math.random() * (phoneRect.width - w - 2 * margin);
    y = margin + Math.random() * (phoneRect.height - h - 2 * margin);
    tries++;
    if (tries > 200) break;
  } while (
    (x + w > safe.left && x < safe.right && y + h > safe.top && y < safe.bottom) || // avoid center
    isOverlapping(x, y, w, h, occupiedPositions)
  );

  // clamp to phone container
  x = Math.max(margin, Math.min(x, phoneRect.width - w - margin));
  y = Math.max(margin, Math.min(y, phoneRect.height - h - margin));

  return { x, y };
}

/* ---------- CREATE STICKER ---------- */
function createSticker(name, folder="background", x=null, y=null, maxSizePct=25, duration=5000) {
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

/* ---------- SAFE ZONES FOR NO BUTTON ---------- */
function getPhoneRelativeRect(el) {
  const phoneRect = phone.getBoundingClientRect();
  const rect = el.getBoundingClientRect();
  return {
    left: rect.left - phoneRect.left,
    top: rect.top - phoneRect.top,
    right: rect.right - phoneRect.left,
    bottom: rect.bottom - phoneRect.top,
    width: rect.width,
    height: rect.height
  };
}

function getSafeZones() {
  const margin = 10; // extra padding around safe zones
  const hRect = getPhoneRelativeRect(document.querySelector("h1"));
  const yRect = getPhoneRelativeRect(yesBtn);

  return [
    {
      left: hRect.left - margin,
      top: hRect.top - margin,
      right: hRect.right + margin,
      bottom: hRect.bottom + margin
    },
    {
      left: yRect.left - margin,
      top: yRect.top - margin,
      right: yRect.right + margin,
      bottom: yRect.bottom + margin
    }
  ];
}

function overlapsSafeZone(x, y, w, h, zones) {
  return zones.some(z =>
    x < z.right && x + w > z.left &&
    y < z.bottom && y + h > z.top
  );
}

noBtn.addEventListener("click", () => {
  const phoneRect = phone.getBoundingClientRect();
  const btnRect = getPhoneRelativeRect(noBtn);
  const btnW = btnRect.width;
  const btnH = btnRect.height;

  // Angry sticker at current position
  createSticker(
    "kicanje.png",
    "angry",
    btnRect.left,
    btnRect.top,
    15,
    2000
  );

  const zones = getSafeZones();
  const margin = 10;

  let x, y;
  let tries = 0;

  do {
    x = margin + Math.random() * (phoneRect.width - btnW - 2 * margin);
    y = margin + Math.random() * (phoneRect.height - btnH - 2 * margin);
    tries++;
    if (tries > 100) break;
  } while (overlapsSafeZone(x, y, btnW, btnH, zones));

  // FINAL: adjust for offsetParent so it stays inside phone container
  const parentRect = noBtn.offsetParent.getBoundingClientRect();
  const left = x + phoneRect.left - parentRect.left;
  const top = y + phoneRect.top - parentRect.top;

  noBtn.style.left = left + "px";
  noBtn.style.top = top + "px";
});


/* ---------- YES BUTTON ---------- */
yesBtn.addEventListener("click", () => {
  window.location.href = "yes.html";
});

/* ---------- RESIZE SAFETY ---------- */
window.addEventListener("resize", () => {
  occupiedPositions = [];
  placeButtonsInitially();

  // remove all current stickers to prevent overflow
  const allStickers = stickersContainer.querySelectorAll(".sticker");
  allStickers.forEach(sticker => sticker.remove());
});
