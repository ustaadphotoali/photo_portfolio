const cloudName = "dqntivbw8";

const images = [
  "test/photo1",
  "test/photo2"
];

const gallery = document.getElementById("gallery");

images.forEach((id) => {
  const img = document.createElement("img");
  img.src = `https://res.cloudinary.com/${cloudName}/image/upload/f_auto,q_auto/${id}.jpg`;
  gallery.appendChild(img);
});
