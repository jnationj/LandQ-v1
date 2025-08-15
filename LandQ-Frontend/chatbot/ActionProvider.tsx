// chatbot/ActionProvider.tsx

interface Props {
  createChatBotMessage: any;
  setState: any;
}

export default function ActionProvider({ createChatBotMessage, setState }: Props) {
  const handleHello = () => {
    const message = createChatBotMessage("Hello there! 👋");

    setState((prev: any) => ({
      ...prev,
      messages: [...prev.messages, message],
    }));
  };

  // Must return a React component
  return <></>;
}
