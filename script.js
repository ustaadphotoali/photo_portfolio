const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.getElementById("close");
const titleEl = document.getElementById("img-title");
const locationEl = document.getElementById("img-location");
const detailsEl = document.getElementById("img-details");
const overlay = document.getElementById("map-overlay");
const backgroundMap = document.querySelector(".background-map");
const pageTitle = document.querySelector("header h1");
const pageSubtitle = document.querySelector("header p");

let currentImageRect = null;
let allImages = [];
let categories = [];
let currentCategory = null;

function latLngToXY(lat, lng) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const x = (lng + 180) * (width / 360);
  const y = (90 - lat) * (height / 180);

  return { x, y };
}

function drawLine(imgRect, lat, lng) {
  overlay.innerHTML = "";

  const { x, y } = latLngToXY(lat, lng);
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");

  const startX = imgRect.left + imgRect.width / 2;
  const startY = imgRect.top + imgRect.height / 2;

  line.setAttribute("x1", startX);
  line.setAttribute("y1", startY);
  line.setAttribute("x2", x);
  line.setAttribute("y2", y);
  line.setAttribute("stroke", "#f8dfb0");
  line.setAttribute("stroke-width", "2");
  line.style.filter = "drop-shadow(0 0 6px rgba(248, 223, 176, 0.8))";

  overlay.appendChild(line);
}

function clearLine() {
  overlay.innerHTML = "";
}

function prettifyCategory(name) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function setBackgroundImage(url) {
  if (!url) {
    return;
  }

  backgroundMap.style.backgroundImage = `linear-gradient(rgba(10, 6, 2, 0.5), rgba(10, 6, 2, 0.78)), url("${url}")`;
}

function openLightbox(imgData, imgElement) {
  lightbox.style.display = "flex";
  lightboxImg.src = imgData.secure_url;
  document.body.style.overflow = "hidden";
  currentImageRect = imgElement.getBoundingClientRect();

  titleEl.textContent = imgData.display_name || "Untitled";
  locationEl.textContent = imgData.location
    ? `Location: ${imgData.location}`
    : "Location: Unknown";

  const sizeMB = imgData.bytes
    ? (imgData.bytes / (1024 * 1024)).toFixed(2)
    : "Unknown";

  detailsEl.innerHTML = `
    ${imgData.width || "?"} x ${imgData.height || "?"}<br>
    ${sizeMB} MB<br>
    ${imgData.format ? imgData.format.toUpperCase() : "Unknown format"}<br>
    ${prettifyCategory(imgData.category || "Uncategorized")}
  `;

  if (imgData.lat && imgData.lng) {
    drawLine(currentImageRect, imgData.lat, imgData.lng);
  } else {
    clearLine();
  }
}

function createImageCard(imgData) {
  const wrapper = document.createElement("div");
  wrapper.className = "gallery-item";

  const img = document.createElement("img");
  img.src = imgData.secure_url;
  img.alt = imgData.display_name || "Portfolio image";
  img.loading = "lazy";

  img.addEventListener("click", () => {
    openLightbox(imgData, img);
  });

  wrapper.appendChild(img);
  return wrapper;
}

function renderCategoryGallery(categoryName) {
  currentCategory = categoryName;
  gallery.className = "gallery image-gallery";
  gallery.innerHTML = "";

  const toolbar = document.createElement("div");
  toolbar.className = "gallery-toolbar";

  const backButton = document.createElement("button");
  backButton.className = "back-button";
  backButton.type = "button";
  backButton.textContent = "Back to categories";
  backButton.addEventListener("click", renderCategories);

  toolbar.appendChild(backButton);
  gallery.appendChild(toolbar);

  const images = allImages.filter((image) => image.category === categoryName);
  const imagesGrid = document.createElement("div");
  imagesGrid.className = "images-grid";

  images.forEach((imgData) => {
    imagesGrid.appendChild(createImageCard(imgData));
  });

  gallery.appendChild(imagesGrid);

  pageTitle.textContent = prettifyCategory(categoryName);
  pageSubtitle.textContent = `${images.length} image${images.length === 1 ? "" : "s"} in this collection`;
}

function createCategoryCard(category) {
  const card = document.createElement("button");
  card.className = "category-card";
  card.type = "button";
  card.style.backgroundImage = `linear-gradient(rgba(10, 6, 2, 0.2), rgba(10, 6, 2, 0.7)), url("${category.coverImage}")`;

  const title = document.createElement("span");
  title.className = "category-name";
  title.textContent = prettifyCategory(category.name);

  const meta = document.createElement("span");
  meta.className = "category-count";
  meta.textContent = `${category.count} image${category.count === 1 ? "" : "s"}`;

  const folder = document.createElement("span");
  folder.className = "category-folder";
  folder.textContent = category.folder || category.name;

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(folder);
  card.addEventListener("click", () => renderCategoryGallery(category.name));

  return card;
}

function renderCategories() {
  currentCategory = null;
  gallery.className = "gallery category-gallery";
  gallery.innerHTML = "";

  categories.forEach((category) => {
    gallery.appendChild(createCategoryCard(category));
  });

  pageTitle.textContent = "My Photography";
  pageSubtitle.textContent = "Browse by category";
}

fetch("/images")
  .then((res) => res.json())
  .then((payload) => {
    allImages = payload.images || [];
    categories = payload.categories || [];

    const heroImage =
      allImages.find((image) => image.isHeroBackground) ||
      allImages[0] ||
      null;

    if (heroImage) {
      setBackgroundImage(heroImage.secure_url);
    }

    renderCategories();
  })
  .catch((err) => {
    console.error("Error loading images:", err);
    gallery.innerHTML = "<p style='padding:20px;'>Could not load images.</p>";
  });

function closeLightbox() {
  lightbox.style.display = "none";
  lightboxImg.src = "";
  document.body.style.overflow = "auto";
  clearLine();
}

closeBtn.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && lightbox.style.display === "flex") {
    closeLightbox();
  }
});
