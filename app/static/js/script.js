const form = document.getElementById("chat-form");
const input = document.getElementById("user-input");
const responseArea = document.getElementById("response-area");
const chatHistory = document.getElementById("chat-history");
const newChatBtn = document.getElementById("new-chat-btn");

// AktifTech logosunun yolu
const aktiftechLogoUrl = document.getElementById("config").dataset.logoUrl;

// Tüm sohbetleri tutan dizi
let chats = [];

// Şu anda aktif olan sohbetin ID'si
let activeChatId = null;

// Placeholder göster
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

// Yeni sohbet oluştur
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

// Aktif sohbeti ayarla
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

// Sohbet geçmişini render et
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
    
    // Sohbet öğesine tıklama
    li.addEventListener("click", (e) => {
      if (!e.target.closest('.chat-history-item-actions')) {
        setActiveChat(chat.id);
      }
    });
    
    // 3 nokta butonuna tıklama
    actionsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll('.chat-history-item-actions-menu').forEach(menu => {
        if (menu !== actionsMenu) menu.classList.remove('show');
      });
      actionsMenu.classList.toggle('show');
    });
    
    // Yeniden adlandır butonu
    renameBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      actionsMenu.classList.remove('show');
      const newTitle = prompt("Sohbeti yeniden adlandır:", chat.title);
      if (newTitle && newTitle !== chat.title) {
        chat.title = newTitle;
        renderChatHistory();
      }
    });
    
    // Sil butonu
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

  // Menü dışına tıklanınca kapat
  document.addEventListener("click", (e) => {
    if (!e.target.closest('.chat-history-item-actions')) {
      document.querySelectorAll('.chat-history-item-actions-menu').forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
}

// Mesajları render et
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

// Yeni sohbet butonu
newChatBtn.addEventListener("click", () => {
  addNewChat();
});

// Mesaj gönderme formu
form.addEventListener("submit", (e) => {
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

  // Bot cevabı simülasyonu
  setTimeout(() => {
    const botResponse = "Bu, botun cevap simülasyonudur.";
    chat.messages.push({ sender: "bot", text: botResponse });
    renderMessages();
  }, 700);
});

// Sayfa yüklendiğinde placeholder göster
window.addEventListener("DOMContentLoaded", () => {
  showPlaceholder();
});

// Oturum aç butonu yönlendirme (login.html için)
// Düzeltilmiş yönlendirmeler
document.getElementById('login-btn')?.addEventListener('click', () => {
  window.location.href = '/login';  // Flask route'una yönlendirme
});

document.getElementById('register-btn')?.addEventListener('click', () => {
  window.location.href = '/register';  // Flask route'una yönlendirme
});