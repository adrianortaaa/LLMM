const quotes = [
  { text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", author: "Cicero" },
  { text: "The only true wisdom is in knowing you know nothing.", author: "Socrates" },
  { text: "Life is either a daring adventure or nothing at all.", author: "Helen Keller" },
  { text: "Not all those who wander are lost.", author: "J.R.R. Tolkien" }
];

document.getElementById("btn").addEventListener("click", () => {
  const i = Math.floor(Math.random() * quotes.length);
  document.getElementById("quote").innerText = quotes[i].text;
  document.getElementById("author").innerText = "- " + quotes[i].author;
});