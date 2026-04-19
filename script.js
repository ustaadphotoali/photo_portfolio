const gallery = document.getElementById("gallery");

fetch("/images")
  .then(res => res.json())
  .then(images => {
    images.forEach(imgData => {
      const img = document.createElement("img");
      img.src = imgData.secure_url;
      gallery.appendChild(img);
    });
  });
