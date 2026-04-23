import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

// ─── Initial greeting message ─────────────────────────────────────────────────
const GREETING = {
  id:   "greeting",
  role: "ai",
  text: "I've finished analyzing the bid documents. I found 7 spec sections relevant to your scope, 134 rooms with finish codes, and flagged 4 Division 01 items that require action before bid. What would you like to dig into?",
  time: new Date(),
};

// ─── Quick chip suggestions ───────────────────────────────────────────────────
const QUICK_CHIPS = [
  "What are all the mockup requirements?",
  "Show total SF by finish code",
  "Which rooms need integral cove base?",
  "What submittals are due and when?",
  "Summarize moisture testing requirements",
];

// ─── Format timestamp ─────────────────────────────────────────────────────────
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

// ─── Single message bubble ────────────────────────────────────────────────────
const Message = ({ msg }) => (
  <div className={`chat-msg chat-msg--${msg.role}`}>
    <div className="chat-msg__bubble">{msg.text}</div>
    <div className="chat-msg__time">{formatTime(msg.time)}</div>
  </div>
);

// ─── Typing indicator ─────────────────────────────────────────────────────────
const TypingIndicator = () => (
  <div className="chat-msg chat-msg--ai">
    <div className="chat-msg__bubble" style={{ display: "flex", gap: 5, alignItems: "center", padding: "10px 14px" }}>
      <span style={dotStyle(0)} />
      <span style={dotStyle(1)} />
      <span style={dotStyle(2)} />
    </div>
  </div>
);

function dotStyle(i) {
  return {
    display:         "inline-block",
    width:           6,
    height:          6,
    borderRadius:    "50%",
    background:      "var(--color-text-muted)",
    animation:       "dotBounce 1.2s ease-in-out infinite",
    animationDelay:  `${i * 0.2}s`,
  };
}

// ─── ChatPanel ────────────────────────────────────────────────────────────────
// Props:
//   projectId  — passed from App.js, will be used to scope API calls
//   projectData — full normalized project object (for context-aware responses)
//
// When the backend chat endpoint is ready:
//   1. Remove the placeholder response logic
//   2. Replace the sendToBackend function with your real axios/fetch call
//   3. Pass projectId in the request body so the backend knows which doc to query
const ChatPanel = ({ projectId, projectData }) => {
  const [messages,  setMessages]  = useState([GREETING]);
  const [input,     setInput]     = useState("");
  const [isTyping,  setIsTyping]  = useState(false);
  const [chipsOpen, setChipsOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Auto-scroll to bottom whenever messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || isTyping) return;

    // Hide chips after first message
    setChipsOpen(false);

    // Add user message
    const userMsg = { id: Date.now(), role: "user", text: trimmed, time: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/v1/chat", {
        project_id: projectId,
        message:    trimmed,
      });
      setMessages((prev) => [...prev, {
        id:   Date.now(),
        role: "ai",
        text: res.data.response,
        time: new Date(),
      }]);
    } catch (err) {
      setMessages((prev) => [...prev, {
        id:   Date.now(),
        role: "ai",
        text: "Sorry, I couldn't reach the server. Please try again.",
        time: new Date(),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Dot bounce keyframe — injected once */}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>

      <div className="chat-panel">

        {/* Header */}
        <div className="chat-panel__header">
          <div className="chat-panel__title">Bid assistant</div>
          <div className="chat-panel__sub">Ask anything about this document</div>
        </div>

        {/* Messages */}
        <div className="chat-panel__messages">
          {messages.map((msg) => (
            <Message key={msg.id} msg={msg} />
          ))}
          {isTyping && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="chat-panel__input-area">

          {/* Quick chips — visible until user sends first message */}
          {chipsOpen && (
            <div className="chat-panel__chips">
              {QUICK_CHIPS.map((chip) => (
                <button
                  key={chip}
                  className="chat-panel__chip"
                  onClick={() => sendMessage(chip)}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Text input row */}
          <div className="chat-panel__input-row">
            <input
              ref={inputRef}
              type="text"
              className="chat-panel__input"
              placeholder="Ask about specs, quantities, requirements…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
            />
            <button
              className="chat-panel__send"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
            >
              ↑
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ChatPanel;