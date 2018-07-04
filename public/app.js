document.getElementById("content").innerHTML = `
<form id="form">
    <label for="text">Text</label>
    <input id="text" type="text">
    <button id="submit">Send</button>
</form>
`;
document.getElementById("content").addEventListener("submit", e => {
  e.preventDefault();
  fetch("/articles", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: document.getElementById("text").value
    })
  })
    .then(res => res.json())
    .then(json => {
      document.getElementById("text").value = "";
    });
});
