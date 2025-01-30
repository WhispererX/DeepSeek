// Configuration
const ip = "127.0.0.1";
const port = 11434;
const api = "generate";

const messages = [];

// API Request Handler
const makeApiRequest = (ip, port, api, model, prompt) => {
  const data = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: model,
      prompt: prompt,
      stream: false,
    }),
  };

  return fetch(`http://${ip}:${port}/api/${api}`, data).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return response.json();
  });
};

// Message Handler
const sendMessage = async (prompt, model = "deepseek-coder-v2:16b") => {
  messages.push({ role: "user", content: prompt });
  const response = await makeApiRequest(
    ip,
    port,
    api,
    model,
    `${messages
      .map((message) => `${message.role}: ${message.content}`)
      .join("\n")}`
  );
  messages.push({ role: "assistant", content: response.response });
  return response.response;
};

// Wait for DOM to be fully loaded
document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("DOM is ready!");

    // Get input element
    const input = document.getElementById("input");

    const loading = document.getElementById("notification");

    // Add event listener for Enter key
    input.addEventListener("keydown", async (event) => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        const prompt = input.value;
        if (prompt.trim() === "") return;
        loading.style.display = "inline-block";
        createMessage(prompt, true);
        createMessage("DeepSeek is typing...", false);
        input.value = "";
        input.readOnly = true;
        const response = await sendMessage(prompt);
        loading.style.display = "none";
        input.readOnly = false;
        if (response) {
          //createMessage(response);
          editMessage(response);
          scrollToBottom();
        } else {
          editMessage("Sorry, I couldn't generate a response.");
        }
      }
    });
  },
  // Auto-resize as user types
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  })
);

// Message Creation
const createMessage = (messageContent, isUser = false) => {
  const messageContainer =
    document.getElementsByClassName("message-container")[0];
  const message = document.createElement("div");
  message.classList.add("message");
  if (isUser) message.classList.add("you");

  const contentDiv = document.createElement("div");
  contentDiv.classList.add("content");

  const md = document.createElement("md");
  md.innerHTML = messageContent;
  md.textContent = messageContent;
  contentDiv.appendChild(md);

  const profile = document.createElement("img");
  profile.classList.add("profile");
  profile.src = "./Assets/Images/deepseek.png";

  const copyIcon = document.createElement("i");
  copyIcon.classList.add("copy", "bi", "bi-clipboard2");
  copyIcon.addEventListener("click", () => {
    const text = md.textContent;
    navigator.clipboard.writeText(text);
    copyIcon.classList.add("copied");
    setTimeout(() => {
      copyIcon.classList.remove("copied");
    }, 2000);
  });

  message.appendChild(profile);
  message.appendChild(contentDiv);
  message.appendChild(copyIcon);
  messageContainer.appendChild(message);
  renderMarkdown();
  scrollToBottom();
};

const editMessage = (messageContent) => {
  const messages = document.getElementsByClassName("message");
  const lastMessage = messages[messages.length - 1];
  const contentDiv = lastMessage.querySelector(".content");
  const md = contentDiv.querySelector("md");
  md.textContent = messageContent;
  md.innerHTML = messageContent;
  renderMarkdown();
};

const scrollToBottom = () => {
  window.scrollTo({
    top: document.documentElement.scrollHeight,
    behavior: "smooth",
  });
};

formatRules = () => {
 createMessage(`![Markdown](./Assets/Images/markdown.png)`);
}

