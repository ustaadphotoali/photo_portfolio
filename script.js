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
  line.setAttribute("stroke", "#47d7ff");
  line.setAttribute("stroke-width", "2");
  line.style.filter = "drop-shadow(0 0 8px rgba(71, 215, 255, 0.9))";

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

  backgroundMap.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.52), rgba(0, 0, 0, 0.86)), url("${url}")`;
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

function createSidebarButton(category) {
  const button = document.createElement("button");
  button.className = "category-link";
  button.type = "button";
  button.textContent = prettifyCategory(category.name);

  if (category.name === currentCategory) {
    button.classList.add("active");
  }

  button.addEventListener("click", () => {
    currentCategory = category.name;
    renderLayout();
  });

  return button;
}

function renderLayout() {
  gallery.className = "gallery shell-layout";
  gallery.innerHTML = "";

  const shell = document.createElement("div");
  shell.className = "content-shell";

  const sidebar = document.createElement("aside");
  sidebar.className = "category-sidebar";

  const sidebarTitle = document.createElement("h2");
  sidebarTitle.className = "sidebar-title";
  sidebarTitle.textContent = "Categories";

  const sidebarList = document.createElement("div");
  sidebarList.className = "category-list";

  categories.forEach((category) => {
    sidebarList.appendChild(createSidebarButton(category));
  });

  sidebar.appendChild(sidebarTitle);
  sidebar.appendChild(sidebarList);

  const content = document.createElement("section");
  content.className = "gallery-panel";

  const activeCategory = categories.find((category) => category.name === currentCategory) || categories[0];
  const images = allImages.filter((image) => image.category === activeCategory.name);
  const heroImage = images[0];

  const panelHeader = document.createElement("div");
  panelHeader.className = "panel-header";

  const panelTitle = document.createElement("h2");
  panelTitle.className = "panel-title";
  panelTitle.textContent = prettifyCategory(activeCategory.name);

  const panelMeta = document.createElement("p");
  panelMeta.className = "panel-meta";
  panelMeta.textContent = `${images.length} image${images.length === 1 ? "" : "s"} - ${activeCategory.folder || activeCategory.name}`;

  panelHeader.appendChild(panelTitle);
  panelHeader.appendChild(panelMeta);

  content.appendChild(panelHeader);

  if (heroImage) {
    const heroContainer = document.createElement("div");
    heroContainer.className = "hero-container";

    const img = document.createElement("img");
    img.src = heroImage.secure_url;
    img.alt = "featured";
    img.loading = "lazy";

    img.addEventListener("click", () => {
      openLightbox(heroImage, img);
    });

    heroContainer.appendChild(img);
    content.appendChild(heroContainer);
  }

  shell.appendChild(sidebar);
  shell.appendChild(content);
  gallery.appendChild(shell);

  pageTitle.textContent = "V's Perspective";
  pageSubtitle.textContent = "Select a category to explore the collection";
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

    if (categories.length > 0) {
      currentCategory = categories[0].name;
      renderLayout();
    } else {
      pageTitle.textContent = "V's Perspective";
      pageSubtitle.textContent = "No categories found";
      gallery.innerHTML = "<p style='padding:20px;'>No categories found.</p>";
    }
  })
  .catch((err) => {
    console.error("Error loading images:", err);
    pageTitle.textContent = "V's Perspective";
    pageSubtitle.textContent = "Unable to load the collection";
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
