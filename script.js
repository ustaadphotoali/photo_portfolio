const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const closeBtn = document.getElementById("close");

// NEW elements
const titleEl = document.getElementById("img-title");
const locationEl = document.getElementById("img-location");
const detailsEl = document.getElementById("img-details");
const overlay = document.getElementById("map-overlay");

// Store current image position
let currentImageRect = null;

// Convert lat/lng → screen position
function latLngToXY(lat, lng) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const x = (lng + 180) * (width / 360);
  const y = (90 - lat) * (height / 180);

  return { x, y };
}

// Draw line
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
  line.setAttribute("stroke", "#00eaff");
  line.setAttribute("stroke-width", "2");

  // Glow effect
  line.style.filter = "drop-shadow(0 0 6px #00eaff)";

  overlay.appendChild(line);
}

// Clear line
function clearLine() {
  overlay.innerHTML = "";
}

// Fetch images
fetch("/images")
  .then((res) => res.json())
  .then((images) => {
    gallery.innerHTML = "";

    images.forEach((imgData) => {
      const wrapper = document.createElement("div");
      wrapper.className = "gallery-item";

      const img = document.createElement("img");
      img.src = imgData.secure_url;
      img.alt = imgData.display_name || "Portfolio image";
      img.loading = "lazy";

      img.addEventListener("click", () => {
        lightbox.style.display = "flex";
        lightboxImg.src = imgData.secure_url;
        document.body.style.overflow = "hidden";

        // Save position for line
        currentImageRect = img.getBoundingClientRect();

        // Populate side panel
        titleEl.textContent = imgData.display_name || "Untitled";

        locationEl.textContent = imgData.location
          ? `Location: ${imgData.location}`
          : "Location: Unknown";

        const sizeMB = imgData.bytes
          ? (imgData.bytes / (1024 * 1024)).toFixed(2)
          : "Unknown";

        detailsEl.innerHTML = `
          ${imgData.width || "?"} × ${imgData.height || "?"}<br>
          ${sizeMB} MB<br>
          ${imgData.format ? imgData.format.toUpperCase() : "Unknown format"}
        `;

        // Draw line ONLY if lat/lng exists
        if (imgData.lat && imgData.lng) {
          drawLine(currentImageRect, imgData.lat, imgData.lng);
        } else {
          clearLine();
        }
      });

      wrapper.appendChild(img);
      gallery.appendChild(wrapper);
    });
  })
  .catch((err) => {
    console.error("Error loading images:", err);
    gallery.innerHTML = "<p style='padding:20px;'>Could not load images.</p>";
  });

// Close logic
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
