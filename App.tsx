import React, { useState, useEffect, useMemo } from 'react';
import { Project, Task, TaskStatus, ChatMessage, TeamMember, ContextItem, RebalanceProposal } from './types';
import { MOCK_PROJECTS, INITIAL_TASKS, INITIAL_TEAM, INITIAL_CONTEXT } from './constants';
import StatusHub from './components/StatusHub';
import ProjectList from './components/ProjectList';
import ChatInterface from './components/ChatInterface';
import ContextPanel from './components/ContextPanel';
import { geminiService } from './services/geminiService';

const App: React.FC = () => {
  // --- STATE ---
  const [activeProjectId, setActiveProjectId] = useState<string>(MOCK_PROJECTS[0].id);
  const [projects] = useState<Project[]>(MOCK_PROJECTS);
  
  // In a real app, these would be fetched based on projectId
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [team, setTeam] = useState<TeamMember[]>(INITIAL_TEAM);
  const [contextItems] = useState<ContextItem[]>(INITIAL_CONTEXT);
  const [rebalanceProposals, setRebalanceProposals] = useState<RebalanceProposal[]>([]);
  
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 'm1', sender: 'ai', content: 'Оркестратор онлайн. Контекст проекта "Chrome VPN Расширение" загружен.\n\n[BACKSTAGE]\nРоль: Руководитель проекта\nМетрики: KPI загружены, Команда собрана.\nДействие: Ожидаю инструкций пользователя.\n[/BACKSTAGE]', timestamp: Date.now() }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // --- DERIVED STATE ---
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];
  
  const progressPercent = useMemo(() => {
    if (tasks.length === 0) return 0;
    const confirmed = tasks.filter(t => t.status === TaskStatus.CONFIRMED).length;
    return (confirmed / tasks.length) * 100;
  }, [tasks]);

  // --- ACTIONS ---

  // 1. Send Message & Gemini Integration
  const handleSendMessage = async (content: string) => {
    const newUserMsg: ChatMessage = { id: Date.now().toString(), sender: 'user', content, timestamp: Date.now() };
    setChatMessages(prev => [...prev, newUserMsg]);
    setIsThinking(true);

    // Initialize Gemini Chat if not started
    if (!geminiService.isConfigured()) {
        await geminiService.startChat(); 
    }

    // Build History for API (Simplified)
    const history = chatMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.content }]
    })) as any; // Cast to satisfy simple typing for demo

    // Context Injection for logic simulation (Hidden from UI, sent to LLM)
    const contextPrompt = geminiService.buildContextContext(activeProject.kpis, team, tasks);
    const fullPrompt = `${contextPrompt}\nUser says: ${content}`;

    // API Call
    const aiResponseText = await geminiService.sendMessage(fullPrompt);
    
    setIsThinking(false);
    const newAiMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        sender: 'ai', 
        content: aiResponseText, 
        timestamp: Date.now() 
    };
    setChatMessages(prev => [...prev, newAiMsg]);

    // SIMPLE LOGIC SIMULATION: If AI proposes a task in text (mock detection), we add it
    // Check for "create task" in Russian and English just in case
    if (aiResponseText.toLowerCase().includes('создать задачу') || aiResponseText.toLowerCase().includes('create task')) {
        simulateTaskCreation(aiResponseText);
    }
  };

  // 2. Logic Simulation: Extract tasks from AI text (Regex/Heuristic)
  const simulateTaskCreation = (text: string) => {
      // Very basic simulation to show functionality
      const newTask: Task = {
          id: `t${Date.now()}`,
          title: "Новая задача из обсуждения",
          description: "Извлечено из недавнего диалога.",
          status: TaskStatus.WAITING_APPROVAL,
          assigneeRole: "Аналитик", // Default
          source: "AI"
      };
      setTasks(prev => [...prev, newTask]);
  };

  // 3. Confirm Task
  const handleConfirmTask = (taskId: string) => {
    setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status: TaskStatus.CONFIRMED } : t
    ));
    
    // Log in chat
    const task = tasks.find(t => t.id === taskId);
    setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        content: `[BACKSTAGE]\nРоль: Система\nДействие: Пользователь подтвердил задачу "${task?.title}".\nПрогресс обновлен.\n[/BACKSTAGE]`,
        timestamp: Date.now()
    }]);
  };

  // 4. Trigger Auto-Rebalance (Mock)
  // In a real app, this runs periodically on the backend
  useEffect(() => {
    const timer = setTimeout(() => {
        if (rebalanceProposals.length === 0) {
            setRebalanceProposals([{
                id: 'rp1',
                reason: 'Загрузка Аналитика > 85% в течение 3 дней.',
                changes: ['Добавить Мл. Аналитика', 'Перенести отчеты на Стратега'],
                impact: 'Снижение узких мест на 20%',
                status: 'suggested'
            }]);
            // Notify in chat
            setChatMessages(prev => [...prev, {
                id: Date.now().toString(),
                sender: 'ai',
                content: `[BACKSTAGE]\nРоль: Авто-Ребалансировщик\nТревога: Обнаружена аномалия рабочей нагрузки у роли Аналитик.\nДействие: Предложение сформировано в Панели Контекста.\n[/BACKSTAGE]`,
                timestamp: Date.now()
            }]);
        }
    }, 10000); // Trigger after 10s for demo
    return () => clearTimeout(timer);
  }, []);

  const handleAcceptProposal = (propId: string) => {
      setRebalanceProposals([]);
      setTeam(prev => [...prev, {
          id: `tm${Date.now()}`,
          role: 'Мл. Аналитик',
          name: 'Auto_Agent_02',
          effectiveness: 100,
          workload: 0
      }]);
      setChatMessages(prev => [...prev, {
        id: Date.now().toString(),
        sender: 'ai',
        content: `[BACKSTAGE]\nРоль: Система\nДействие: Предложение принято. Состав команды обновлен.\n[/BACKSTAGE]`,
        timestamp: Date.now()
    }]);
  };

  // --- RENDER ---
  return (
    <div className="flex h-screen w-screen bg-white overflow-hidden font-sans">
      {/* COLUMN 1: NAV (20%) */}
      <div className="w-[260px] flex-shrink-0 z-30 shadow-xl">
        <ProjectList 
            projects={projects} 
            activeProjectId={activeProjectId} 
            onSelectProject={setActiveProjectId} 
        />
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP BAR */}
        <StatusHub project={activeProject} progress={progressPercent} />

        <div className="flex-1 flex overflow-hidden">
            {/* COLUMN 2: ACTION/CHAT (55% approx of remaining) */}
            <div className="flex-1 flex flex-col min-w-[500px] border-r border-gray-200">
                <ChatInterface 
                    messages={chatMessages}
                    onSendMessage={handleSendMessage}
                    onConfirmTask={handleConfirmTask}
                    isThinking={isThinking}
                />
            </div>

            {/* COLUMN 3: CONTEXT (25% approx of remaining) */}
            <div className="w-[350px] flex-shrink-0 bg-gray-50">
                <ContextPanel 
                    tasks={tasks}
                    contextItems={contextItems}
                    team={team}
                    proposals={rebalanceProposals}
                    onConfirmTask={handleConfirmTask}
                    onAcceptProposal={handleAcceptProposal}
                />
            </div>
        </div>
      </div>
    </div>
  );
};

export default App;