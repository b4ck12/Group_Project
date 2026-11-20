/* ==========================================================================
   TripMate AI — Group Discussion & Local Insider Concierge (design/fe_demo)
   Bespoke Editorial Travel Journal System (Kinfolk & Airbnb Luxe)
   ========================================================================== */

const ChatModule = (() => {
  let messages = [...INITIAL_CHAT_MESSAGES];
  let isStreaming = false;

  function init() {
    renderMessages();
    setupInputEvents();
  }

  function renderMessages() {
    const container = document.getElementById("chat-messages-container");
    if (!container) return;

    let html = "";
    messages.forEach(msg => {
      if (msg.is_ai) {
        html += `
          <div class="message-bubble message-ai" id="msg-${msg.id}">
            <div class="message-content">
              <div class="ai-header-badge">
                <span class="ai-title">
                  <i data-lucide="compass" style="width:14px;height:14px;color:var(--color-ochre-gold);"></i>
                  TripMate Concierge
                </span>
                <span class="ai-tag">Gợi Ý Bản Địa</span>
              </div>
              <div class="ai-text">${formatMarkdown(msg.text)}</div>
            </div>
            <div class="message-meta">
              <span>${msg.time}</span>
              <span>·</span>
              <span>Cố vấn hành trình</span>
            </div>
          </div>
        `;
      } else {
        const bubbleClass = msg.is_me ? "message-mine" : "message-peer";
        html += `
          <div class="message-bubble ${bubbleClass}">
            <div class="message-meta">
              <span>${msg.sender}</span>
              <span>·</span>
              <span>${msg.time}</span>
            </div>
            <div class="message-content">${escapeHTML(msg.text)}</div>
          </div>
        `;
      }
    });

    container.innerHTML = html;
    container.scrollTop = container.scrollHeight;
    if (window.lucide) window.lucide.createIcons();
  }

  function setupInputEvents() {
    const input = document.getElementById("chat-input-field");
    const sendBtn = document.getElementById("chat-send-btn");

    if (input && sendBtn) {
      sendBtn.addEventListener("click", () => sendMessage());
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      });
    }
  }

  function sendMessage(customText = null) {
    if (isStreaming) return;

    const input = document.getElementById("chat-input-field");
    const text = customText || (input ? input.value.trim() : "");
    if (!text) return;

    if (input) input.value = "";

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    // Append User message
    messages.push({
      id: `m_${Date.now()}`,
      sender: "Nguyễn Minh Đức",
      is_me: true,
      text: text,
      time: timeStr,
      is_ai: false
    });

    renderMessages();

    // Trigger AI response simulation
    simulateAIResponse(text);
  }

  function simulateAIResponse(userPrompt) {
    isStreaming = true;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let fullResponse = "";
    let isRainAdaptation = false;

    const lower = userPrompt.toLowerCase();
    if (lower.includes("mưa") || lower.includes("cafe")) {
      fullResponse = "🌧️ Mình nhận thấy khu phố cổ đang có mưa rào nhẹ! Để cả nhóm có chỗ trú mưa ấm cúng, mình gợi ý chuyển điểm dừng sang **The Hill Station Heritage Cafe** (cách Faifo chỉ 350m). Quán vintage Pháp 2 tầng rất thơm mùi cafe mộc và không gian ấm áp. Mình đã chuẩn bị sẵn nút Swap trên lịch trình rồi nhé!";
      isRainAdaptation = true;
    } else if (lower.includes("hoàng hôn") || lower.includes("ảnh")) {
      fullResponse = "📸 Tầm 16:30 - 17:15 là 'khung giờ vàng' để chụp ảnh tại biển An Bàng hoặc tầng thượng Faifo Coffee. Ánh nắng rọi xiên qua những mái ngói rêu phong hoặc mặt biển êm đềm sẽ cho nhóm những bức ảnh kỷ niệm tuyệt đẹp!";
    } else if (lower.includes("hoa đăng") || lower.includes("vé") || lower.includes("thuyền")) {
      fullResponse = "🏮 Đi thuyền gỗ trên sông Hoài và thả hoa đăng đẹp nhất vào khoảng 18:45 - 19:30 khi các ngôi nhà cổ bắt đầu thắp nến lồng đèn. Giá thuyền khoảng 150.000đ cho cả nhóm 4-5 người chèo thong thả 20 phút nhé!";
    } else {
      fullResponse = `Ý kiến rất hay! Lộ trình hôm nay đã được sắp xếp thong thả với cự ly di chuyển rất gần để cả nhóm vừa chơi vừa tận hưởng không khí phố cổ, không bị mệt hay gấp gáp. Mọi người thả tim hoặc bấm Swap điểm nhé!`;
    }

    const aiMsgId = `m_ai_${Date.now()}`;
    const aiMessage = {
      id: aiMsgId,
      sender: "TripMate Concierge",
      is_me: false,
      text: "",
      time: timeStr,
      is_ai: true
    };

    messages.push(aiMessage);
    renderMessages();

    // Typewriter Streaming
    const words = fullResponse.split(" ");
    let currentWordIndex = 0;

    const streamInterval = setInterval(() => {
      if (currentWordIndex < words.length) {
        aiMessage.text += (currentWordIndex === 0 ? "" : " ") + words[currentWordIndex];
        currentWordIndex++;

        const msgEl = document.querySelector(`#msg-${aiMsgId} .ai-text`);
        if (msgEl) {
          msgEl.innerHTML = formatMarkdown(aiMessage.text) + `<span class="streaming-cursor"></span>`;
        }
        
        const container = document.getElementById("chat-messages-container");
        if (container) container.scrollTop = container.scrollHeight;
      } else {
        clearInterval(streamInterval);
        isStreaming = false;

        const msgEl = document.querySelector(`#msg-${aiMsgId} .ai-text`);
        if (msgEl) msgEl.innerHTML = formatMarkdown(aiMessage.text);

        if (isRainAdaptation && window.TimelineModule) {
          TimelineModule.adaptForRain();
        }
      }
    }, 35);
  }

  function appendAIMessage(text) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messages.push({
      id: `ai_${Date.now()}`,
      sender: "TripMate Concierge",
      is_me: false,
      text: text,
      time: timeStr,
      is_ai: true
    });
    renderMessages();
  }

  function appendSystemMessage(text) {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    messages.push({
      id: `sys_${Date.now()}`,
      sender: "Hệ Thống",
      is_me: false,
      text: text,
      time: timeStr,
      is_ai: false
    });
    renderMessages();
  }

  function useSuggestion(chipText) {
    sendMessage(chipText);
  }

  function formatMarkdown(text) {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>');
  }

  function escapeHTML(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  return {
    init,
    sendMessage,
    appendAIMessage,
    appendSystemMessage,
    useSuggestion
  };
})();
