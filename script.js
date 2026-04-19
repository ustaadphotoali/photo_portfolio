const cloudName = "YOUR_CLOUD_NAME";

const images = [
  "portfolio/photo1",
  "portfolio/photo2"
];

const gallery = document.getElementById("gallery");

images.forEach((id) => {
  const img = document.createElement("img");
  img.src = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${id}.jpg`;
  gallery.appendChild(img);
});
