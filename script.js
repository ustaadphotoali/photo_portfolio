const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const imageInfo = document.getElementById("image-info");
const closeBtn = document.getElementById("close");

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
        lightboxImg.alt = imgData.display_name || "Expanded portfolio image";
        document.body.style.overflow = "hidden";

        const sizeMB = imgData.bytes
          ? (imgData.bytes / (1024 * 1024)).toFixed(2)
          : "Unknown";

        imageInfo.innerHTML = `
          <div><strong>${imgData.display_name || "Untitled"}</strong></div>
          <div>${imgData.width || "?"} × ${imgData.height || "?"}</div>
          <div>${sizeMB} MB</div>
          <div>${imgData.format ? imgData.format.toUpperCase() : "Unknown format"}</div>
        `;
      });

      wrapper.appendChild(img);
      gallery.appendChild(wrapper);
    });
  })
  .catch((err) => {
    console.error("Error loading images:", err);
    gallery.innerHTML = "<p style='padding:20px;'>Could not load images.</p>";
  });

function closeLightbox() {
  lightbox.style.display = "none";
  lightboxImg.src = "";
  imageInfo.innerHTML = "";
  document.body.style.overflow = "auto";
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
