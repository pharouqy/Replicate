const URL_API = "http://localhost:3000/";
const button = document.querySelector("button");
document
  .querySelector("#promptForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const input = document.querySelector('textarea[name="prompt"]');
    const response = await fetch(URL_API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt: input.value }),
    });

    if (response.ok) {
      const data = await response.json();
      document.querySelector("#result").src = data.imageUrl;
      button.disabled = true;
    } else {
      console.error("Failed to fetch image");
    }
  });
