import ChatBot from "react-chatbotify";
import chatBotIcon from "../assets/chatbot-icon.png";

const MyChatBot = () => {
    localStorage.removeItem("playground");
  
    const options = {
      theme: { embedded: false, showFooter: false },
      chatHistory: { storageKey: "playground", viewChatHistoryButtonText: false },
      botBubble: { simStream: true, animate: false },
      header: { title: "Talk With Data", avatar: chatBotIcon },
      fileAttachment: { disabled: true },
      chatButton: { icon: chatBotIcon, title: "Chat with AI Bot" },
      notification: { disabled: true },
    };
    const flow = {
      start: {
        message: "Welcome, How can I help you?",
        path: "end_loop",
      },
      end_loop: {
        message: async (params) => {
          const history = localStorage.getItem("playground");
          const sortHitsory = (JSON.parse(history).slice(-5, -1));
          const response = await fetch("https://backend.assignment.devsdemo.co/ai", {
            method: "POST",
            body: JSON.stringify({
              message: params.userInput,
              history: {sortHitsory},
            }),
            headers: { "Content-Type": "application/json" },
          });
          const data = await response.json();
          return `${data}`;
        },
        path: "end_loop",
      },
    };
  
    return <ChatBot options={options} flow={flow} />;
  };


  export default MyChatBot;