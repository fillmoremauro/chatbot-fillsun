
document.addEventListener("DOMContentLoaded", () => {
  const input = document.createElement("input");
  const button = document.createElement("button");
  const output = document.createElement("div");

  input.placeholder = "Escribí tu consulta...";
  button.innerText = "Enviar";
  output.style.marginTop = "1rem";

  document.body.appendChild(input);
  document.body.appendChild(button);
  document.body.appendChild(output);

  button.onclick = async () => {
    const userMessage = input.value;
    if (!userMessage) return;

    const userDiv = document.createElement("div");
    userDiv.innerHTML = "<strong>Vos:</strong> " + userMessage;
    output.appendChild(userDiv);

    const botDiv = document.createElement("div");
    botDiv.innerHTML = "<strong>Luz:</strong> escribiendo...";
    output.appendChild(botDiv);

    const response = await fetch("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage })
    });

    const data = await response.json();
    botDiv.innerHTML = "<strong>Luz:</strong> " + (data.reply || "Error al responder");
    input.value = "";
  };
});
