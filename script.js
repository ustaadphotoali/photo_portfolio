const cloudName = "dqntivbw8";

fetch("images.json")
  .then(res => res.json())
  .then(images => {
    const gallery = document.getElementById("gallery");

    images.forEach(id => {
      const img = document.createElement("img");
      img.src = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${id}`;
      gallery.appendChild(img);
    });
  });
