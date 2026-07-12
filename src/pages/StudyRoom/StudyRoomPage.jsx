import { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useStudyData } from '../../context/StudyDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  Send,
  Bot,
  User,
  Sparkles,
  Upload,
  FileText,
  Download,
  Brain,
  BookOpen,
  ListChecks,
  Loader2,
  MessageSquare,
} from 'lucide-react';

const DEMO_RESPONSES = [
  {
    keyword: 'sorting',
    response:
      'Sorting algorithms arrange data in a specific order. Common algorithms include:\n\n- **Bubble Sort** - O(n^2) - Simple but inefficient\n- **Quick Sort** - O(n log n) - Divide and conquer\n- **Merge Sort** - O(n log n) - Stable sorting\n- **Insertion Sort** - O(n^2) - Good for small datasets\n\nWould you like me to explain any of these in detail?',
  },
  {
    keyword: 'linked list',
    response:
      'A **linked list** is a linear data structure where elements are stored in nodes, each pointing to the next node.\n\n**Types:**\n- Singly Linked List - One direction\n- Doubly Linked List - Both directions\n- Circular Linked List - Last node points to first\n\n**Key Operations:** Insertion O(1) at head, Deletion O(1) at head, Search O(n)',
  },
  {
    keyword: 'os',
    response:
      '**Operating System (OS)** manages computer hardware and software resources.\n\n**Key Functions:**\n- Process Management - Scheduling, synchronization\n- Memory Management - Allocation, paging, segmentation\n- File System - Storage organization\n- Device Management - I/O operations\n\n**Popular OS Concepts:** Deadlock, Virtual Memory, File Systems, Process Scheduling',
  },
  {
    keyword: 'network',
    response:
      '**Computer Networking** connects devices for data exchange.\n\n**OSI Model (7 Layers):**\n1. Physical - Cables, signals\n2. Data Link - MAC addresses, frames\n3. Network - IP addressing, routing\n4. Transport - TCP/UDP segments\n5. Session - Connection management\n6. Presentation - Data encryption\n7. Application - HTTP, FTP, SMTP\n\n**Key Protocols:** TCP, IP, HTTP, DNS, DHCP',
  },
  {
    keyword: 'database',
    response:
      '**Database Management Systems (DBMS)** store and manage structured data.\n\n**Key Concepts:**\n- **Normalization** - Eliminating redundancy\n- **ACID Properties** - Atomicity, Consistency, Isolation, Durability\n- **SQL** - Structured Query Language\n- **ER Diagrams** - Entity-Relationship modeling\n\n**Types:** Relational (MySQL), NoSQL (MongoDB), Graph (Neo4j)',
  },
];

const AI_FEATURES = [
  { icon: Brain, title: 'Explain Concept', description: 'Get detailed explanations of any technical concept', color: 'from-blue-500 to-blue-600' },
  { icon: Sparkles, title: 'Generate Quiz', description: 'Create practice quizzes for any subject', color: 'from-purple-500 to-purple-600' },
  { icon: FileText, title: 'Summarize Notes', description: 'Generate concise summaries from your notes', color: 'from-green-500 to-green-600' },
  { icon: ListChecks, title: 'Make Study Plan', description: 'Create personalized study schedules', color: 'from-orange-500 to-orange-600' },
];

const INITIAL_MESSAGE = {
  id: '0',
  role: 'assistant',
  content: "Hi! I'm StudyCat AI, your academic assistant. I can help you with:\n\n- Explaining engineering concepts\n- Generating practice quizzes\n- Summarizing your notes\n- Creating study plans\n\nWhat would you like to learn about today?",
  timestamp: new Date().toISOString(),
};

const readTextFile = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(String(reader.result || ''));
  reader.onerror = () => reject(reader.error);
  reader.readAsText(file);
});

const requestStudyAi = async (messages, mode = 'chat') => {
  const response = await fetch('/api/study-chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, mode }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Study AI request failed.');
  }

  return data.message;
};

export function StudyRoomPage() {
  const { subjects } = useStudyData();
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState('');
  const [summary, setSummary] = useState('');
  const [showSummaryUpload, setShowSummaryUpload] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getDemoResponse = (userMessage) => {
    const lower = userMessage.toLowerCase();
    const matchedResponse = DEMO_RESPONSES.find((item) => lower.includes(item.keyword));

    return matchedResponse?.response ||
      "I could not reach the Study Room AI service. Start the backend with `npm run server`, then ask again. For now, try asking about sorting, linked lists, OS concepts, networking, or databases.";
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    const nextMessages = [...messages, userMessage];

    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const aiReply = await requestStudyAi(
        nextMessages.map(({ role, content }) => ({ role, content })),
      );

      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiReply,
          timestamp: new Date().toISOString(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: getDemoResponse(userMessage.content),
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedFileName(file.name);
    setShowSummaryUpload(true);
    setSummary('');

    try {
      const canReadAsText = file.type.startsWith('text/') || /\.(txt|md|csv)$/i.test(file.name);
      const fileText = canReadAsText ? await readTextFile(file) : '';
      const prompt = fileText
        ? `Summarize these study notes from "${file.name}" for exam revision:\n\n${fileText.slice(0, 12000)}`
        : `The student uploaded a file named "${file.name}". Create a study-summary template and revision checklist they can use after extracting the text.`;

      const aiSummary = await requestStudyAi([{ role: 'user', content: prompt }], 'summary');
      setSummary(aiSummary);
    } catch {
      setSummary(
        `**Summary for "${file.name}"**\n\nThe Study Room AI service could not be reached. Start the backend with \`npm run server\`, then upload the file again.\n\nFocus your revision on definitions, key formulas, solved examples, and likely exam questions.`
      );
    }
  };

  const handleFeatureClick = (feature) => {
    const prompts = {
      'Explain Concept': 'I need help understanding a concept. Can you explain it in simple terms?',
      'Generate Quiz': 'Please generate a practice quiz for my current subjects.',
      'Summarize Notes': "I'd like to summarize my uploaded notes.",
      'Make Study Plan': 'Help me create a study plan for this week.',
    };
    setInput(prompts[feature] || '');
  };

  const handleDownloadPDF = () => {
    if (!summary) return;
    
    const doc = new jsPDF();
    const margin = 15;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - margin * 2;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(`Study Notes Summary: ${uploadedFileName || 'Document'}`, margin, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    
    const splitText = doc.splitTextToSize(summary, maxLineWidth);
    
    let y = 35;
    const pageHeight = doc.internal.pageSize.getHeight();
    
    for (let i = 0; i < splitText.length; i++) {
      if (y > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      doc.text(splitText[i], margin, y);
      y += 6; 
    }
    
    doc.save(`Summary_${uploadedFileName || 'Notes'}.pdf`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Bot className="w-6 h-6 text-primary-500" />
            AI Study Room
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Your intelligent study assistant
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {AI_FEATURES.map((feature) => (
          <button
            key={feature.title}
            onClick={() => handleFeatureClick(feature.title)}
            className="group text-left"
          >
            <Card variant="glass" className="p-4 hover:scale-[1.02] transition-all duration-300 cursor-pointer h-full">
              <div className={`inline-flex p-2.5 rounded-xl bg-gradient-to-br ${feature.color} text-white mb-3`}>
                <feature.icon className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{feature.description}</p>
            </Card>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-primary-500" />
                AI Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              <div className="flex-1 overflow-y-auto min-h-0 px-6 py-4 space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-xl flex-shrink-0 ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-primary-500 to-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}>
                      {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>
                    <div className={`max-w-[80%] ${msg.role === 'user' ? 'text-right' : ''}`}>
                      <div className={`p-3 rounded-xl text-sm leading-relaxed whitespace-pre-line ${
                        msg.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                      }`}>
                        {msg.content}
                      </div>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800">
                      <Bot className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                    </div>
                    <div className="p-3 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask a doubt about your studies..."
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                    disabled={isLoading}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim() || isLoading}
                    className="p-3 rounded-xl bg-gradient-to-r from-primary-600 to-purple-600 text-white hover:from-primary-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Upload className="w-4 h-4 text-primary-500" />
                Upload Notes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer hover:border-primary-500 dark:hover:border-primary-400 transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.csv,.pdf,.doc,.docx,.png,.jpg"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {uploadedFileName || 'Upload your notes or PDF'}
                </p>
                <p className="text-xs text-gray-400 mt-1">Text files are summarized directly</p>
              </div>
              {uploadedFileName && (
                <div className="mt-3 flex items-center gap-2 p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                  <FileText className="w-4 h-4 text-primary-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{uploadedFileName}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {(showSummaryUpload || summary) && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary-500" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary ? (
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                      {summary}
                    </div>
                    <Button variant="primary" size="sm" className="w-full" onClick={handleDownloadPDF}>
                      <Download className="w-4 h-4" />
                      Download Summary as PDF
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Generating summary...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary-500" />
                Quick Subjects
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {subjects.slice(0, 4).map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => setInput(`Help me with ${subject.name}`)}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: subject.color }} />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{subject.name}</span>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
