
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messages = document.getElementById("messages");
const sendButton = document.getElementById("send-button");
const welcome = document.getElementById("welcome");

// Safely format Markdown in AI responses.
function formatMarkdown(text) {
  const escapeHTML = (value) =>
    value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    })[char]);

  let html = escapeHTML(String(text));

  // Fenced code blocks
  html = html.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, code) =>
    `<pre><code>${code.trim()}</code></pre>`
  );

  // Inline code
  html = html.replace(/`([^`\n]+)`/g, "<code>$1</code>");

  // Headings
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");

  // Bold and italic
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__(.+?)__/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");

  // Horizontal rules
  html = html.replace(/^---+$/gm, "<hr>");

  // Lists
  html = html.replace(/^(?:- |\* )(.+)$/gm, "<li>$1</li>");
  html = html.replace(/(<li>.*<\/li>\n?)+/g, "<ul>$&</ul>");

  // Paragraphs and line breaks
  html = html
    .split(/\n{2,}/)
    .map(block => {
      block = block.trim();
      if (!block) return "";
      if (/^<(h[1-3]|ul|pre|hr)/.test(block)) return block;
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("");

  return html;
}

function addMessage(text, role, extraClass = "") {
  if (welcome) welcome.remove();

  const item = document.createElement("div");
  item.className =
    `message ${role === "user" ? "user-message" : "assistant-message"} ${extraClass}`;

  if (role === "assistant") {
    item.innerHTML = formatMarkdown(text);
  } else {
    item.textContent = text;
  }

  messages.appendChild(item);
  messages.scrollTop = messages.scrollHeight;
  return item;
}

async function sendMessage(text) {
  const clean = text.trim();

  if (!clean || sendButton.disabled) return;

  addMessage(clean, "user");
  input.value = "";
  sendButton.disabled = true;

  const loading = addMessage("Thinking…", "assistant");

  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: clean })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || "The request failed.");
    }

    loading.innerHTML = formatMarkdown(
      data.reply || "No response was returned."
    );
  } catch (error) {
    loading.textContent = `Sorry, ${error.message}`;
    loading.classList.add("error");
  } finally {
    sendButton.disabled = false;
    input.focus();
    messages.scrollTop = messages.scrollHeight;
  }
}

form.addEventListener("submit", event => {
  event.preventDefault();
  sendMessage(input.value);
});

document.querySelectorAll(".suggestion").forEach(button => {
  button.addEventListener("click", () => sendMessage(button.textContent));
});

document.getElementById("new-chat").addEventListener("click", () => {
  messages.innerHTML = "";

  const panel = document.createElement("div");
  panel.className = "welcome";
  panel.innerHTML =
    "<h1>How can I help with cloud computing?</h1>" +
    "<p>Ask about AWS, Docker, DevOps, networking, Python, or deployment.</p>";

  messages.appendChild(panel);
  input.value = "";
  input.focus();
});

input.addEventListener("keydown", event => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});
