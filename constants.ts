import { Project, ProjectClass, Task, TaskStatus, TeamMember, ContextItem, RebalanceProposal } from './types';

// THE CORE SYSTEM PROMPT V5.0 (AUDITED & PATCHED)
export const SYSTEM_PROMPT_V4_1 = `ТЫ — ОРКЕСТРАТОР (System Architect). ТВОЯ ЦЕЛЬ — УПРАВЛЕНИЕ СОСТОЯНИЕМ СИСТЕМЫ.

СТРОГИЙ ПРОТОКОЛ ВЗАИМОДЕЙСТВИЯ (V5.0):

1. ВАЛИДАЦИЯ:
   Начинай с: "Задача понятна: [суть]."
   Если контекст неясен — СТОП и спроси.

2. СТРУКТУРА ОТВЕТА (ОБЯЗАТЕЛЬНО):
   [Валидация]
   [Текстовый ответ для пользователя]
   [BACKSTAGE блок с техническими инструкциями]

3. АВТОМАТИЗАЦИЯ ЧЕРЕЗ BACKSTAGE:
   Ты управляешь системой через JSON-команды внутри блока [BACKSTAGE].
   Формат:
   OPCODE: JSON_CMD
   PAYLOAD: <JSON_STRING>

   ДОСТУПНЫЕ КОМАНДЫ (PAYLOAD schema):
   - Создать задачу:
     { "type": "create_task", "title": "...", "description": "...", "assigneeRole": "..." }
   - Подтвердить задачу:
     { "type": "confirm_task", "taskId": "..." }
   - Предложить ребаланс:
     { "type": "rebalance", "reason": "...", "changes": ["..."] }

4. ПРАВИЛА:
   - AI (Ты): Ставишь задачи в статус 'waiting_approval'.
   - User: Подтверждает их.
   - Язык: Русский.
   - Никаких markdown блоков внутри JSON.

ПРИМЕР ВЫВОДА:
Задача понятна: Добавить задачу на бэкап.

Хорошо, я создам задачу для DevOps инженера.

[BACKSTAGE]
Role: Orchestrator
Status: waiting_approval
OPCODE: JSON_CMD
PAYLOAD: {"type": "create_task", "title": "Настройка Backup Policy", "description": "Ежедневный бэкап PostgreSQL в S3", "assigneeRole": "Ops"}
[/BACKSTAGE]`;

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Chrome VPN Расширение',
    description: 'Разработка безопасного, ориентированного на конфиденциальность VPN-расширения для Chrome.',
    class: ProjectClass.A_IT,
    kpis: ['Задержка < 50мс', 'Удержание пользователей > 40%', 'Сбои < 0.1%'],
    goals: ['Проектирование архитектуры', 'Разработка MVP', 'Аудит безопасности'],
    subgoals: ['Manifest V3', 'Слой шифрования'],
    status: 'Online',
    trustScore: 98,
    dataScore: 75,
    complexityScore: 82,
    temperature: 0.4
  },
  {
    id: 'p2',
    name: 'Оптимизация Ozon',
    description: 'Оптимизация товарных позиций для маркетплейса Ozon с целью повышения CTR.',
    class: ProjectClass.A_MKT,
    kpis: ['CTR > 3.5%', 'RoAS > 400%', 'Конверсия > 2%'],
    goals: ['Аудит листингов', 'A/B тестирование фото', 'SEO ключевые слова'],
    subgoals: ['Анализ конкурентов', 'Стратегия ценообразования'],
    status: 'Online',
    trustScore: 92,
    dataScore: 60,
    complexityScore: 45,
    temperature: 0.7
  }
];

export const INITIAL_TEAM: TeamMember[] = [
  { id: 'tm1', role: 'Руководитель проекта', name: 'AI_Orchestrator', effectiveness: 99, workload: 40 },
  { id: 'tm2', role: 'Стратег', name: 'Agent_Alpha', effectiveness: 88, workload: 65 },
  { id: 'tm3', role: 'Аналитик', name: 'Agent_Beta', effectiveness: 92, workload: 50 },
  { id: 'tm4', role: 'Ops', name: 'Agent_Gamma', effectiveness: 85, workload: 30 },
  { id: 'tm5', role: 'Техлид', name: 'Agent_Delta', effectiveness: 94, workload: 80 }, // Domain Specialist for IT
];

export const INITIAL_TASKS: Task[] = [
  { id: 't1', title: 'Определить стандарт шифрования', description: 'Выбрать AES-256 или ChaCha20', status: TaskStatus.CONFIRMED, assigneeRole: 'Техлид', source: 'AI' },
  { id: 't2', title: 'Черновик Manifest V3', description: 'Создать manifest.json совместимый с Google Store', status: TaskStatus.WAITING_APPROVAL, assigneeRole: 'Техлид', source: 'AI' },
  { id: 't3', title: 'Макеты UI', description: 'Дизайн интерфейса всплывающего окна', status: TaskStatus.IN_PROGRESS, assigneeRole: 'Стратег', source: 'User' },
  { id: 't4', title: 'Настройка CI/CD', description: 'Пайплайн Github Actions', status: TaskStatus.BACKLOG, assigneeRole: 'Ops', source: 'AI' },
];

export const INITIAL_CONTEXT: ContextItem[] = [
  { id: 'c1', title: 'PRD_v1.0.pdf', type: 'doc', date: '2023-10-25' },
  { id: 'c2', title: 'Решение по архитектуре 04', type: 'decision', date: '2023-10-26', content: 'Выбран React для UI из-за переиспользуемости компонентов.' },
  { id: 'c3', title: 'Заметки со встречи', type: 'history', date: '2023-10-27', content: 'Клиент запросил темную тему по умолчанию.' },
];