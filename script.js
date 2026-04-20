const gallery = document.getElementById("gallery");
const lightbox = document.getElementById("lightbox");
const lightboxImg = document.getElementById("lightbox-img");
const imageInfo = document.getElementById("image-info");
const closeBtn = document.getElementById("close");

fetch("/images")
  .then(res => res.json())
  .then(images => {
    gallery.innerHTML = "";

    images.forEach(imgData => {
      const wrapper = document.createElement("div");
      wrapper.className = "gallery-item";

      const img = document.createElement("img");
      img.src = imgData.secure_url;
      img.loading = "lazy";

      // Click → open fullscreen
      img.onclick = () => {
        lightbox.style.display = "flex";
        lightboxImg.src = imgData.secure_url;

        // Metadata (fallback + example fields)
        imageInfo.innerHTML = `
          <div>${imgData.display_name || "Untitled"}</div>
          <div>${imgData.width} x ${imgData.height}</div>
          <div>${(imgData.bytes / 1000000).toFixed(2)} MB</div>
        `;
      };

      wrapper.appendChild(img);
      gallery.appendChild(wrapper);
    });
  });

closeBtn.onclick = () => {
  lightbox.style.display = "none";
};
