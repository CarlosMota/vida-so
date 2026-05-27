type LlmMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export async function invokeLLM(_input: { messages: LlmMessage[]; response_format?: unknown }) {
  return {
    choices: [
      {
        message: {
          content: JSON.stringify({
            items: [
              { name: "Arroz integral", quantity: "1", unit: "kg", category: "Grãos e Cereais", estimatedPrice: 8 },
              { name: "Frango", quantity: "500", unit: "g", category: "Proteínas", estimatedPrice: 18 },
              { name: "Tomate", quantity: "500", unit: "g", category: "Hortifruti", estimatedPrice: 5 },
            ],
          }),
        },
      },
    ],
  };
}
