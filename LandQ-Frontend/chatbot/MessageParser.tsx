// chatbot/MessageParser.tsx

interface Props {
  message: string;
  actions: {
    handleHello: () => void;
  };
}

export default function MessageParser({ message, actions }: Props) {
  const parse = (text: string) => {
    if (text.toLowerCase().includes("hello")) {
      actions.handleHello();
    }
  };

  parse(message);

  // Must return a React component
  return <></>;
}