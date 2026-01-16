const images = [
  "https://picsum.photos/id/100/800/500",
  "https://picsum.photos/id/200/800/500",
  "https://picsum.photos/id/300/800/500",
  "https://picsum.photos/id/400/800/500"
];

let index = 0;
const imgElement = document.getElementById("slider-img");

document.getElementById("next").addEventListener("click", () => {
  index = (index + 1) % images.length;
  imgElement.src = images[index];
});

document.getElementById("prev").addEventListener("click", () => {
  index = (index - 1 + images.length) % images.length;
  imgElement.src = images[index];
});