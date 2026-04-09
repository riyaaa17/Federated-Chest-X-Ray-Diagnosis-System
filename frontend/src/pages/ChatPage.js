// pages/ChatPage.js
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

export default function ChatPage() {
  const { token, API } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Hello! I'm your medical AI assistant powered by RAG. Ask me anything about chest conditions, symptoms, or radiology findings.",
    },
  ]);
  const [input,   setInput]   = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;

    setMessages(prev => [...prev, { role: "user", text: q }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ question: q }),
      });
      if (!res.ok) throw new Error("Chat request failed");
      const data = await res.json();
      setMessages(prev => [...prev, { role: "bot", text: data.answer }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: "bot", text: "Sorry, I encountered an error. Please try again.", isError: true,
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div style={s.page} className="fade-up">
      {/* Header */}
      <div style={s.header}>
        <h1 style={s.title}>Medical AI Chatbot</h1>
        <p style={s.subtitle}>Powered by RAG — Ask about chest conditions, diagnoses, and radiology</p>
      </div>

      {/* Chat window */}
      <div style={s.chatWindow}>
        <div style={s.messages}>
          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                ...s.msgRow,
                justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
              }}
            >
              {msg.role === "bot" && (
                <div style={s.botAvatar}>🧠</div>
              )}
              <div style={{
                ...s.bubble,
                ...(msg.role === "user" ? s.userBubble : s.botBubble),
                ...(msg.isError ? s.errorBubble : {}),
              }}>
                {msg.text}
              </div>
              {msg.role === "user" && (
                <div style={s.userAvatar}>You</div>
              )}
            </div>
          ))}

          {loading && (
            <div style={{ ...s.msgRow, justifyContent: "flex-start" }}>
              <div style={s.botAvatar}>🧠</div>
              <div style={{ ...s.bubble, ...s.botBubble }}>
                <span style={s.typingDot} />
                <span style={{ ...s.typingDot, animationDelay: "0.2s" }} />
                <span style={{ ...s.typingDot, animationDelay: "0.4s" }} />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input area */}
        <div style={s.inputArea}>
          <textarea
            style={s.textarea}
            placeholder="Ask a medical question... (Enter to send)"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={2}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              ...s.sendBtn,
              opacity: loading || !input.trim() ? 0.5 : 1,
              cursor: loading || !input.trim() ? "not-allowed" : "pointer",
            }}
          >
            {loading ? <span style={s.spinner} /> : "➤"}
          </button>
        </div>
      </div>

      <p style={s.hint}>Press Enter to send · Shift+Enter for new line</p>
    </div>
  );
}

const s = {
  page:     { display: "flex", flexDirection: "column", height: "calc(100vh - 64px)" },
  header:   { marginBottom: 20, flexShrink: 0 },
  title:    { fontFamily: "var(--font-head)", fontSize: 26, fontWeight: 800, marginBottom: 4 },
  subtitle: { color: "var(--text2)", fontSize: 14 },
  chatWindow: {
    flex: 1, display: "flex", flexDirection: "column",
    background: "var(--card)", border: "1px solid var(--border)",
    borderRadius: "var(--radius2)", overflow: "hidden",
    minHeight: 0,
  },
  messages: {
    flex: 1, overflow: "auto",
    padding: "20px 24px", display: "flex",
    flexDirection: "column", gap: 16,
  },
  msgRow: {
    display: "flex", alignItems: "flex-end", gap: 10,
  },
  botAvatar: {
    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
    background: "rgba(0,212,255,0.1)", border: "1px solid rgba(0,212,255,0.2)",
    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14,
  },
  userAvatar: {
    width: 32, height: 32, borderRadius: 10, flexShrink: 0,
    background: "linear-gradient(135deg, var(--accent2), var(--accent))",
    display: "flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, fontWeight: 700, color: "var(--bg)",
    fontFamily: "var(--font-head)",
  },
  bubble: {
    maxWidth: "70%", padding: "12px 16px", borderRadius: 12,
    fontSize: 14, lineHeight: 1.6, fontFamily: "var(--font-body)",
  },
  botBubble: {
    background: "var(--bg3)", border: "1px solid var(--border)",
    color: "var(--text)", borderBottomLeftRadius: 4,
    display: "flex", gap: 4, alignItems: "center",
  },
  userBubble: {
    background: "var(--accent)", color: "var(--bg)",
    fontWeight: 500, borderBottomRightRadius: 4,
  },
  errorBubble: {
    background: "rgba(255,77,106,0.1)", border: "1px solid rgba(255,77,106,0.3)",
    color: "var(--red)",
  },
  typingDot: {
    display: "inline-block", width: 6, height: 6, borderRadius: "50%",
    background: "var(--text3)", animation: "pulse 1s ease-in-out infinite",
  },
  inputArea: {
    padding: "16px 20px", borderTop: "1px solid var(--border)",
    display: "flex", gap: 12, alignItems: "flex-end",
    background: "var(--bg2)",
  },
  textarea: {
    flex: 1, resize: "none",
    padding: "10px 14px",
    background: "var(--bg3)", border: "1px solid var(--border)",
    borderRadius: 10, color: "var(--text)", fontSize: 14,
    fontFamily: "var(--font-body)", outline: "none",
    lineHeight: 1.5,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 10, flexShrink: 0,
    background: "var(--accent)", border: "none",
    color: "var(--bg)", fontSize: 18,
    display: "flex", alignItems: "center", justifyContent: "center",
  },
  spinner: {
    width: 16, height: 16, borderRadius: "50%",
    border: "2px solid rgba(0,0,0,0.2)", borderTopColor: "var(--bg)",
    animation: "spin 0.7s linear infinite", display: "inline-block",
  },
  hint: { marginTop: 8, fontSize: 11, color: "var(--text3)", textAlign: "center", flexShrink: 0 },
};