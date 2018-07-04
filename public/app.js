fetch("/config")
  .then(res => res.json())
  .then(config => {
    document.getElementById("content").innerHTML = `
<form id="form">
    <label for="text">Text</label>
    <input id="text" type="text" value=${config.defaultText}>
    <button type="button" id="clear">Clear</button>
    <button id="submit">Send</button>
    <p id="result"></p>
    <p id="error"></p>
</form>
`;
    document.getElementById("clear").addEventListener("click", e => {
      document.getElementById("text").value = "";
    });
    document.getElementById("form").addEventListener("submit", e => {
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
        .then(res => {
          if (res.status < 400) {
            return res.json();
          } else {
            return res.json().then(json => Promise.reject(json));
          }
        })
        .then(json => {
          document.getElementById("result").textContent = "Success!";
        })
        .catch(json => {
          document.getElementById("error").textContent = json.message;
        });
    });
  });
