async function downloadMedia() {
  const url = document.getElementById("url").value;
  const type = document.getElementById("type").value;

  const status = document.getElementById("status");

  status.innerText = "Downloading...";

  try {
    const response = await fetch("/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url,
        type
      })
    });

    const data = await response.json();

    if (data.download) {
      status.innerHTML = `
        <a href="${data.download}">
          Click here to download
        </a>
      `;
    } else {
      status.innerText = data.error || "Failed";
    }

  } catch (err) {
    status.innerText = "Error downloading media";
  }
}