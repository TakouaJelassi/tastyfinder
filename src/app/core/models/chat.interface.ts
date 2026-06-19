export interface ChatMessage {
  sender: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

export interface AiResponse {
  text: string;
  error?: string;
}
