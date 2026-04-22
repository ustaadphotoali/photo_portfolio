const masonry = document.getElementById("masonry");
const categoryTitle = document.getElementById("category-title");
const categorySubtitle = document.getElementById("category-subtitle");
const backgroundMap = document.querySelector(".background-map");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.getElementById("close");
const titleEl = document.getElementById("img-title");
const locationEl = document.getElementById("img-location");
const detailsEl = document.getElementById("img-details");

function getCategoryFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("category") || "";
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

  backgroundMap.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.58), rgba(0, 0, 0, 0.86)), url("${url}")`;
  backgroundMap.style.backgroundPosition = "center center";
  backgroundMap.style.backgroundSize = "cover";
  backgroundMap.style.backgroundRepeat = "no-repeat";
}

function openLightbox(imgData) {
  lightbox.style.display = "flex";
  lightboxImg.src = imgData.secure_url;
  document.body.style.overflow = "hidden";

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
    ${imgData.format ? imgData.format.toUpperCase() : "Unknown format"}
  `;
}

function closeLightbox() {
  lightbox.style.display = "none";
  lightboxImg.src = "";
  document.body.style.overflow = "auto";
}

function renderImages(images, selectedCategory) {
  masonry.innerHTML = "";

  if (!images.length) {
    masonry.innerHTML = "<p class='empty-state'>No images found in this category.</p>";
    return;
  }

  setBackgroundImage(images[0].secure_url);

  images.forEach((imgData) => {
    const wrapper = document.createElement("div");
    wrapper.className = "masonry-item";

    const img = document.createElement("img");
    img.src = imgData.secure_url;
    img.alt = imgData.display_name || "";
    img.loading = "lazy";
    img.addEventListener("click", () => openLightbox(imgData));

    wrapper.appendChild(img);
    masonry.appendChild(wrapper);
  });

  categoryTitle.textContent = prettifyCategory(selectedCategory);
  categorySubtitle.textContent = `${images.length} image${images.length === 1 ? "" : "s"} in this collection`;
}

const selectedCategory = getCategoryFromUrl();

fetch("/images")
  .then((res) => res.json())
  .then((payload) => {
    const allImages = payload.images || [];
    const filteredImages = allImages.filter((img) => img.category === selectedCategory);
    renderImages(filteredImages, selectedCategory || "category");
  })
  .catch((error) => {
    console.error("Error loading category images:", error);
    masonry.innerHTML = "<p class='empty-state'>Could not load images.</p>";
  });

closeBtn.addEventListener("click", closeLightbox);

lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) {
    closeLightbox();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox.style.display === "flex") {
    closeLightbox();
  }
});
