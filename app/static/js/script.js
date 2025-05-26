// HTML'deki elemanları seçiyoruz
const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const responseArea = document.getElementById("response-area");
const chatHistory = document.getElementById("chat-history");
const newChatBtn = document.getElementById("new-chat-btn");
const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");
const authButtons = document.getElementById("auth-buttons");
const userProfile = document.getElementById("user-profile");
const usernameDisplay = document.getElementById("username-display");
const aktiftechLogoUrl = document.getElementById("config").dataset.logoUrl;

// Giriş durumu ve kullanıcı bilgisi
let isLoggedIn = false;
let currentUser = null;
let userChats = {};
let activeChatId = null;

// === LocalStorage Fonksiyonları ===
function saveToStorage() {
  if (currentUser) {
    localStorage.setItem("currentUser", currentUser);
    localStorage.setItem("userChats", JSON.stringify(userChats));
  }
}

function loadFromStorage() {
  const storedUser = localStorage.getItem("currentUser");
  const storedChats = localStorage.getItem("userChats");
  if (storedUser && storedChats) {
    currentUser = storedUser;
    isLoggedIn = true;
    userChats = JSON.parse(storedChats);
    updateAuthUI();
    renderChatHistory();
    showPlaceholder();
  }
}

// === UI Güncellemeleri ===
function updateAuthUI() {
  if (isLoggedIn) {
    authButtons.style.display = "none";
    userProfile.style.display = "flex";
    usernameDisplay.textContent = currentUser;
  } else {
    authButtons.style.display = "flex";
    userProfile.style.display = "none";
  }
}

// === Placeholder ===
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

// === Giriş / Kayıt / Çıkış ===
loginBtn.addEventListener("click", () => {
  // Kullanıcıyı login.html sayfasına yönlendir
  window.location.href = "/login";
});

registerBtn.addEventListener("click", () => {
  window.location.href = "/register";
});

logoutBtn.addEventListener("click", () => {
  isLoggedIn = false;
  localStorage.clear();
  currentUser = null;
  activeChatId = null;
  updateAuthUI();
  responseArea.innerHTML = "";
  chatHistory.innerHTML = "";
  showPlaceholder();
});

// === Yeni Sohbet ===
function addNewChat() {
  if (!isLoggedIn) return alert("Lütfen giriş yapın.");
  const chats = userChats[currentUser];
  const newId = chats.length ? Math.max(...chats.map(c => c.id)) + 1 : 1;
  const newChat = { id: newId, title: "New Chat", messages: [], titleSet: false };
  chats.unshift(newChat);
  saveToStorage();
  renderChatHistory();
  setActiveChat(newId);
  input.value = "";
  input.focus();
}

// === Aktif Sohbet Ayarla ===
function setActiveChat(id) {
  activeChatId = id;
  renderChatHistory();
  const chat = userChats[currentUser].find(c => c.id === id);
  chat?.messages.length ? renderMessages() : showPlaceholder();
  responseArea.scrollTop = 0;
  input.value = "";
  input.placeholder = "Sorunuzu yazın...";
}

// === Sohbet Geçmişini Göster ===
function renderChatHistory() {
  if (!isLoggedIn) return;
  const chats = userChats[currentUser];
  chatHistory.innerHTML = "";

  chats.forEach(chat => {
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
        saveToStorage();
        renderChatHistory();
      }
    });

    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (confirm("Bu sohbeti silmek istediğinizden emin misiniz?")) {
        const updatedChats = chats.filter(c => c.id !== chat.id);
        userChats[currentUser] = updatedChats;
        if (activeChatId === chat.id) {
          activeChatId = updatedChats.length ? updatedChats[0].id : null;
          setActiveChat(activeChatId);
        }
        saveToStorage();
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

// === Mesajları Göster ===
function renderMessages() {
  const chat = userChats[currentUser].find(c => c.id === activeChatId);
  if (!chat) {
    showPlaceholder();
    return;
  }
  responseArea.innerHTML = "";
  chat.messages.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message", msg.sender === "user" ? "user-message" : "bot-message");
    div.textContent = msg.text;
    responseArea.appendChild(div);
  });
  responseArea.scrollTop = responseArea.scrollHeight;
}

// === Yeni Sohbet Butonu ===
newChatBtn.addEventListener("click", addNewChat);

// === Mesaj Gönderme ===
form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!isLoggedIn) return alert("Lütfen giriş yapın.");
  const text = input.value.trim();
  if (!text) return;

  if (activeChatId === null) {
    addNewChat();
  }

  const chat = userChats[currentUser].find(c => c.id === activeChatId);
  if (!chat) return;

  chat.messages.push({ sender: "user", text });

  if (!chat.titleSet && chat.title === "New Chat") {
    chat.title = text.length > 30 ? text.slice(0, 30) + "..." : text;
    chat.titleSet = true;
    renderChatHistory();
  }

  renderMessages();
  input.value = "";
  input.focus();

  // Bot cevabı simülasyonu
  setTimeout(() => {
    const botResponse = "Bu, botun cevap simülasyonudur.";
    chat.messages.push({ sender: "bot", text: botResponse });
    saveToStorage();
    renderMessages();
  }, 700);
});

// === Sayfa Yüklendiğinde ===
window.addEventListener("DOMContentLoaded", () => {
  loadFromStorage();
  updateAuthUI();
  if (!isLoggedIn) showPlaceholder();
});
