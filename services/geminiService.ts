import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT_V4_1 } from '../constants';

class GeminiService {
  private client: GoogleGenAI | null = null;
  private chatSession: Chat | null = null;
  private apiKey: string | undefined = undefined;

  constructor() {
    // Ideally initialized with process.env.API_KEY, but we'll handle the case where it's missing for UI demo
    try {
        if (process.env.API_KEY) {
            this.apiKey = process.env.API_KEY;
            this.client = new GoogleGenAI({ apiKey: this.apiKey });
        }
    } catch (e) {
        console.warn("API Key not found in env, service will be limited.");
    }
  }

  public isConfigured(): boolean {
    return !!this.client;
  }

  public async startChat(history: {role: 'user' | 'model', parts: [{ text: string }]}[] = []): Promise<void> {
    if (!this.client) return;

    this.chatSession = this.client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_PROMPT_V4_1,
        temperature: 0.1, // Very low temp for strict logic adherence
        maxOutputTokens: 1000, 
      },
      history: history
    });
  }

  public async sendMessage(message: string): Promise<string> {
    if (!this.client || !this.chatSession) {
        // Mock response for demo purposes if no key
        // Must follow the new strict validation format
        return `Задача понятна: Анализ запроса пользователя (Демо режим).\n\nСистема работает в демонстрационном режиме без API ключа. Пожалуйста, подключите Gemini API для полноценной работы.\n\n[BACKSTAGE]\nРоль: Оркестратор\nДействие: Эмуляция ответа\nСтатус: waiting_approval\n[/BACKSTAGE]`;
    }

    try {
      const response: GenerateContentResponse = await this.chatSession.sendMessage({
        message: message
      });
      return response.text || "Нет ответа от модели.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Ошибка: Не удалось обработать запрос через Gemini API. Проверьте соединение или квоты.";
    }
  }

  // Helper to structure context for the AI
  public buildContextContext(kpis: string[], currentTeam: any[], openTasks: any[]): string {
    // Injecting explicit state to prevent hallucinations
    return `
      [ТЕКУЩИЙ КОНТЕКСТ ПРОЕКТА]
      1. УТВЕРЖДЕННЫЕ KPI: ${kpis.length > 0 ? kpis.join(', ') : 'Не определены (Требуется Этап 4)'}
      2. СОСТАВ КОМАНДЫ: ${currentTeam.length > 0 ? currentTeam.map((t: any) => t.role).join(', ') : 'Не сформирована (Требуется Этап 5)'}
      3. АКТИВНЫЕ ЗАДАЧИ: ${openTasks.length} шт.
      
      [ИНСТРУКЦИЯ]
      Используй эти данные. Если поле "Не определено", не выдумывай его значения, а предложи пользователю выполнить соответствующий этап пайплайна.
    `;
  }
}

export const geminiService = new GeminiService();
