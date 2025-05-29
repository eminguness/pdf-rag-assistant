const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const responseArea = document.getElementById("response-area");
const chatHistory = document.getElementById("chat-history");
const newChatBtn = document.getElementById("new-chat-btn");
const profileCircle = document.getElementById("profile-circle");
const logoutBtn = document.getElementById("logout-btn");
const authButtons = document.getElementById("auth-buttons");

const aktiftechLogoUrl = document.getElementById("config").dataset.logoUrl;

let chats = [];
let activeChatId = null;

function checkUserSession() {
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));
  
  if (loggedInUser) {
    authButtons.style.display = 'none';
    profileCircle.textContent = loggedInUser.initials;
    profileCircle.style.display = 'flex';
    logoutBtn.style.display = 'block';
  } else {
    authButtons.style.display = 'flex';
    profileCircle.style.display = 'none';
    logoutBtn.style.display = 'none';
  }
}

function logout() {
  localStorage.removeItem('loggedInUser');
  window.location.href = '/';
}

function showPlaceholder() {
  responseArea.innerHTML = `
    <div class="placeholder-container">
      <img src="${aktiftechLogoUrl}" alt="AktifTech Logo" class="header-icon-inline-large" />
      <p class="placeholder-text">
        Merhaba, ben ChatBot.<br />
        Bugün size nasıl yardımcı olabilirim?
      </p>
    </div>
  `;
}

function addNewChat() {
  const newId = chats.length ? Math.max(...chats.map(c => c.id)) + 1 : 1;

  const newChat = {
    id: newId,
    title: "New Chat",
    messages: [],
    titleSet: false,
  };

  chats.unshift(newChat);
  renderChatHistory();
  setActiveChat(newId);
  input.value = "";
  input.focus();
}

function setActiveChat(id) {
  activeChatId = id;
  renderChatHistory();

  const chat = chats.find(c => c.id === activeChatId);
  if (!chat || chat.messages.length === 0) {
    showPlaceholder();
  } else {
    renderMessages();
  }

  responseArea.scrollTop = 0;
  input.value = "";
  input.placeholder = "Sorunuzu yazın...";
}

function renderChatHistory() {
  chatHistory.innerHTML = "";

  chats.forEach((chat) => {
    const li = document.createElement("li");
    li.className = (chat.id === activeChatId) ? "active" : "";
    
    const titleSpan = document.createElement("span");
    titleSpan.textContent = chat.title;
    
    const actionsDiv = document.createElement("div");
    actionsDiv.className = "chat-history-item-actions";
    
    const actionsBtn = document.createElement("button");
    actionsBtn.className = "chat-history-item-actions-btn";
    actionsBtn.innerHTML = '<i class="fas fa-ellipsis-v"></i>';
    
    const actionsMenu = document.createElement("div");
    actionsMenu.className = "chat-history-item-actions-menu";
    
    const renameBtn = document.createElement("button");
    renameBtn.className = "rename-btn";
    renameBtn.innerHTML = '<i class="fas fa-pen"></i> Yeniden Adlandır';
    
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn";
    deleteBtn.innerHTML = '<i class="fas fa-trash"></i> <span>Sil</span>';
    
    actionsMenu.appendChild(renameBtn);
    actionsMenu.appendChild(deleteBtn);
    actionsDiv.appendChild(actionsBtn);
    actionsDiv.appendChild(actionsMenu);
    
    li.appendChild(titleSpan);
    li.appendChild(actionsDiv);
    
    li.addEventListener("click", (e) => {
      if (!e.target.closest('.chat-history-item-actions')) {
        setActiveChat(chat.id);
      }
    });
    
    actionsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll('.chat-history-item-actions-menu').forEach(menu => {
        if (menu !== actionsMenu) menu.classList.remove('show');
      });
      actionsMenu.classList.toggle('show');
    });
    
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      actionsMenu.classList.remove('show');
      const newTitle = prompt("Sohbeti yeniden adlandır:", chat.title);
      if (newTitle && newTitle !== chat.title) {
        chat.title = newTitle;
        renderChatHistory();
      }
    });
    
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Bu sohbeti silmek istediğinizden emin misiniz?")) {
        chats = chats.filter(c => c.id !== chat.id);
        if (activeChatId === chat.id) {
          activeChatId = chats.length ? chats[0].id : null;
          setActiveChat(activeChatId);
        }
        renderChatHistory();
      }
    });
    
    chatHistory.appendChild(li);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest('.chat-history-item-actions')) {
      document.querySelectorAll('.chat-history-item-actions-menu').forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
}

function renderMessages() {
  const chat = chats.find(c => c.id === activeChatId);
  if (!chat) {
    showPlaceholder();
    return;
  }

  responseArea.innerHTML = "";
  chat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message");
    div.classList.add(msg.sender === "user" ? "user-message" : "bot-message");
    div.textContent = msg.text;
    responseArea.appendChild(div);
  });

  responseArea.scrollTop = responseArea.scrollHeight;
}

newChatBtn.addEventListener("click", () => {
  addNewChat();
});

// GÜNCELLENDİ: Kullanıcının mesajını Flask API'ye gönderip cevabı al
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const text = input.value.trim();
  if (!text) return;

  if (activeChatId === null) {
    addNewChat();
  }

  const chat = chats.find(c => c.id === activeChatId);
  if (!chat) return;

  chat.messages.push({ sender: "user", text });

  if (!chat.titleSet && chat.title === "New Chat") {
    chat.title = text.length > 30 ? text.substring(0, 30) + "..." : text;
    chat.titleSet = true;
    renderChatHistory();
  }

  renderMessages();
  input.value = "";
  input.focus();

  const loadingMessage = { sender: "bot", text: "Yanıt yazılıyor..." };
  chat.messages.push(loadingMessage);
  renderMessages();

  try {
    const response = await fetch("/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: text })
    });

    const data = await response.json();
    const botAnswer = data.answer || "Cevap alınamadı.";

    chat.messages.pop(); // kaldır "Yanıt yazılıyor..."
    chat.messages.push({ sender: "bot", text: botAnswer });
    renderMessages();
  } catch (error) {
    chat.messages.pop();
    chat.messages.push({ sender: "bot", text: "Bir hata oluştu. Lütfen tekrar deneyin." });
    renderMessages();
    console.error("LLM cevabı alınamadı:", error);
  }
});

// Oturum yönlendirme
document.getElementById('login-btn')?.addEventListener('click', () => {
  window.location.href = '/login';
});

document.getElementById('register-btn')?.addEventListener('click', () => {
  window.location.href = '/register';
});

logoutBtn?.addEventListener('click', logout);

window.addEventListener("DOMContentLoaded", () => {
  checkUserSession();
  showPlaceholder();
});
