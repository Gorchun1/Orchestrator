import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_PROMPT_V4_1 } from '../constants';

class GeminiService {
  private client: GoogleGenAI | null = null;
  private chatSession: Chat | null = null;
  private apiKey: string | undefined = undefined;

  constructor() {
    // Priority: Process Env
    if (process.env.API_KEY) {
        this.apiKey = process.env.API_KEY;
        this.client = new GoogleGenAI({ apiKey: this.apiKey });
    } else {
        console.warn("API Key not found in env. Service operates in mock/limited mode.");
    }
  }

  public isConfigured(): boolean {
    return !!this.client;
  }

  public async getChatSession(history: {role: 'user' | 'model', parts: [{ text: string }]}[] = []): Promise<Chat | null> {
    if (!this.client) return null;

    // If session doesn't exist, create it.
    // Note: In a real app, we might want to preserve history across reloads better,
    // but for now we lazily init.
    if (!this.chatSession) {
        this.chatSession = this.client.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: SYSTEM_PROMPT_V4_1,
                temperature: 0.2, // Low temp for architectural consistency
                maxOutputTokens: 2000, 
            },
            history: history
        });
    }
    return this.chatSession;
  }

  public async sendMessage(message: string): Promise<string> {
    const session = await this.getChatSession();

    if (!session) {
        // Mock Fallback for Demo (Strictly formatted for the new Parser)
        return `Задача понятна: Демонстрация работы без ключа.
        
Я работаю в демонстрационном режиме.

[BACKSTAGE]
Role: MockSystem
Status: waiting_approval
OPCODE: JSON_CMD
PAYLOAD: {"type": "create_task", "title": "Подключить API Key", "description": "Необходимо добавить process.env.API_KEY для работы нейросети.", "assigneeRole": "Руководитель проекта"}
[/BACKSTAGE]`;
    }

    try {
      const response: GenerateContentResponse = await session.sendMessage({
        message: message
      });
      return response.text || "Нет ответа от модели.";
    } catch (error) {
      console.error("Gemini API Error:", error);
      return "Ошибка: Не удалось обработать запрос через Gemini API. Возможно, истек лимит токенов или ключ невалиден.";
    }
  }

  // Helper to structure context for the AI
  public buildContextContext(kpis: string[], currentTeam: any[], openTasks: any[]): string {
    return `
      [СИСТЕМНОЕ СОСТОЯНИЕ]
      KPI: ${kpis.length > 0 ? kpis.join(', ') : 'Не определены'}
      КОМАНДА: ${currentTeam.length > 0 ? currentTeam.map((t: any) => `${t.role} (${t.workload}%)`).join(', ') : 'Пусто'}
      ЗАДАЧИ: ${openTasks.map((t: any) => `${t.id}: ${t.title} [${t.status}]`).join('; ')}
      
      [ИНСТРУКЦИЯ]
      Анализируй это состояние. Если видишь расхождения или необходимость действий, генерируй команды JSON в блоке BACKSTAGE.
    `;
  }
}

export const geminiService = new GeminiService();