// chatbot/Config.ts
import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  botName: "LandBot",
  initialMessages: [createChatBotMessage(`Hi! I'm here to help you.`, {})],
  customStyles: {
    botMessageBox: {
      backgroundColor: "#2B6CB0",
    },
    chatButton: {
      backgroundColor: "#2B6CB0",
    },
  },
};

export default config;
