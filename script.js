const gallery = document.getElementById("gallery");

fetch("/images")
  .then(res => res.json())
  .then(images => {
    gallery.innerHTML = ""; // clear anything old

    images.forEach(imgData => {
      const img = document.createElement("img");
      img.src = imgData.secure_url;
      img.loading = "lazy"; // improves performance

      gallery.appendChild(img);
    });
  })
  .catch(err => {
    console.error("Error loading images:", err);
  });
