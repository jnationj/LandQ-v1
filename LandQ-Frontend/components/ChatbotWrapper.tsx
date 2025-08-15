"use client";

import React, { useState } from "react";
import Chatbot from "react-chatbot-kit";
import "react-chatbot-kit/build/main.css";

import config from "@/chatbot/Config";
import MessageParser from "@/chatbot/MessageParser";
import ActionProvider from "@/chatbot/ActionProvider";

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      {/* Floating Chat Icon */}
      <button
        className="fixed bottom-6 right-6 bg-green-600 rounded-full p-4 shadow-lg hover:bg-green-700 transition"
        onClick={() => setOpen(!open)}
      >
        🤖
      </button>

      {/* Chatbot Window */}
      {open && (
        <div className="fixed bottom-20 right-6 w-[350px] z-50">
          <Chatbot
            config={config}
            messageParser={MessageParser}
            actionProvider={ActionProvider}
          />
        </div>
      )}
    </div>
  );
}