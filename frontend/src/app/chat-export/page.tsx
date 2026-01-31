'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { MessageCircle, Download, Share, Copy, Trash2 } from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  projectId: string;
}

interface ChatExport {
  id: string;
  projectId: string;
  projectTitle: string;
  messages: ChatMessage[];
  createdAt: Date;
  exportedAt: Date;
  format: 'txt' | 'json' | 'html' | 'markdown';
}

export default function ChatExport() {
  const { user, isAuthenticated } = useAuth();
  const [chatHistory, setChatHistory] = useState<ChatExport[]>([]);
  const [selectedExports, setSelectedExports] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);

  // Mock chat history - in production, this would come from API
  useEffect(() => {
    if (isAuthenticated) {
      loadChatHistory();
    }
  }, [isAuthenticated]);

  const loadChatHistory = async () => {
    setIsLoading(true);
    try {
      // Mock data - in production, fetch from API
      const mockExports: ChatExport[] = [
        {
          id: '1',
          projectId: 'proj-1',
          projectTitle: 'Academic Essay on AI Ethics',
          messages: [
            { id: 'msg-1', role: 'user', content: 'What are the ethical considerations for AI in academic writing?', timestamp: new Date(Date.now() - 3600000), projectId: 'proj-1' },
            { id: 'msg-2', role: 'assistant', content: 'That\'s an excellent question. Let me explore the key ethical considerations:', timestamp: new Date(Date.now() - 3599000), projectId: 'proj-1' },
            { id: 'msg-3', role: 'assistant', content: '1. **Transparency & Disclosure**: Users should know when AI is being used and have access to understand how responses are generated.', timestamp: new Date(Date.now() - 3598000), projectId: 'proj-1' },
            { id: 'msg-4', role: 'user', content: 'This is very helpful. Can you suggest some best practices?', timestamp: new Date(Date.now() - 3597000), projectId: 'proj-1' },
          ],
          createdAt: new Date(Date.now() - 86400000),
          exportedAt: new Date(Date.now() - 3600000),
          format: 'markdown',
        },
        {
          id: '2',
          projectId: 'proj-2',
          projectTitle: 'Research Proposal on Climate Change',
          messages: [
            { id: 'msg-1', role: 'user', content: 'Help me outline a research proposal on climate change adaptation strategies', timestamp: new Date(Date.now() - 7200000), projectId: 'proj-2' },
            { id: 'msg-2', role: 'assistant', content: 'I\'ll help you structure a comprehensive research proposal:', timestamp: new Date(Date.now() - 7199000), projectId: 'proj-2' },
            { id: 'msg-3', role: 'assistant', content: '## Research Question\nHow can urban areas effectively adapt to climate change impacts while promoting social equity?', timestamp: new Date(Date.now() - 7198000), projectId: 'proj-2' },
          ],
          createdAt: new Date(Date.now() - 43200000),
          exportedAt: new Date(Date.now() - 86400000),
          format: 'json',
        },
      ];

      setChatHistory(mockExports);
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async (exportId: string, format: 'txt' | 'json' | 'html' | 'markdown') => {
    const exportItem = chatHistory.find(item => item.id === exportId);
    if (!exportItem) return;

    try {
      let content = '';
      let filename = '';

      switch (format) {
        case 'txt':
          content = exportItem.messages
            .map(msg => `[${msg.timestamp.toISOString()}] [${msg.role.toUpperCase()}] ${msg.content}\\n`)
            .join('\\n\\n');
          filename = `chat-export-${exportItem.projectId}-${format}.txt`;
          break;

        case 'json':
          content = JSON.stringify({
            exportId: exportItem.id,
            projectId: exportItem.projectId,
            projectTitle: exportItem.projectTitle,
            messages: exportItem.messages,
            exportedAt: new Date().toISOString(),
            format: 'json'
          }, null, 2);
          filename = `chat-export-${exportItem.projectId}-${format}.json`;
          break;

        case 'html':
          content = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Chat Export - ${exportItem.projectTitle}</title>
    <style>
      body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background-color: #f8fafc; }
      .message { margin-bottom: 15px; padding: 15px; border-radius: 8px; }
      .user-message { background-color: #e0f2fe; border-left: 4px solid #4f46e5; }
      .assistant-message { background-color: #f1f5f9; border-left: 4px solid #10b981; }
      .message-content { white-space: pre-wrap; word-wrap: break-word; }
      .timestamp { font-size: 0.8em; color: #6b7280; margin-top: 8px; }
      .header { font-weight: bold; margin-bottom: 5px; color: #374151; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Chat Export: ${exportItem.projectTitle}</h1>
        <p>Project ID: ${exportItem.projectId}</p>
        <p>Exported on: ${new Date().toLocaleString()}</p>
    </div>
    ${exportItem.messages.map(msg => `
        <div class="message ${msg.role}-message">
          <div class="timestamp">${new Date(msg.timestamp).toLocaleString()}</div>
          <div class="header">${msg.role === 'user' ? 'You' : 'Assistant'}</div>
          <div class="message-content">${msg.content}</div>
        </div>
    `).join('')}
</body>
</html>
          `;
          filename = `chat-export-${exportItem.projectId}-${format}.html`;
          break;

        case 'markdown':
          content = exportItem.messages
            .map(msg => `# ${new Date(msg.timestamp).toLocaleString()}\\n**${msg.role === 'user' ? 'You' : 'Assistant'}**\\n${msg.content}\\n`)
            .join('\\n---\\n');
          filename = `chat-export-${exportItem.projectId}-${format}.md`;
          break;

        default:
          throw new Error('Unsupported export format');
      }

      // Create download link
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Update export history
      const updatedExport = {
        ...exportItem,
        exportedAt: new Date(),
        format
      };

      // In production, save to database
      console.log(`Export created for ${exportId} in ${format} format`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export chat. Please try again.');
    }
  };

  const handleBatchExport = async () => {
    const formats: ('txt' | 'json' | 'html' | 'markdown')[] = ['txt', 'json'];
    
    setExportProgress(0);
    const totalExports = selectedExports.length;

    for (let i = 0; i < totalExports; i++) {
      const exportId = selectedExports[i];
      const format = formats[i % formats.length];
      
      setExportProgress(Math.round(((i + 1) / totalExports) * 100));
      
      await new Promise(resolve => setTimeout(resolve, 500));
      await handleExport(exportId, format);
    }

    setExportProgress(100);
    alert(`Batch export completed! ${totalExports} exports created.`);
  };

  const toggleExportSelection = (exportId: string) => {
    setSelectedExports(prev => 
      prev.includes(exportId)
        ? prev.filter(id => id !== exportId)
        : [...prev, exportId]
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold text-zinc-800 dark:text-zinc-200">Please log in to export your chat history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-100 dark:bg-zinc-900">
      {/* Header */}
      <div className="bg-white dark:bg-zinc-800 border-b border-zinc-200 dark:border-zinc-700">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">Chat Export</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Export your AI chat history in multiple formats</p>
            </div>
            <button
              onClick={() => window.location.href = '/projects'}
              className="text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Back to Projects
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">Loading chat history...</p>
          </div>
        ) : (
          <>
            {/* Export List */}
            <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Your Chat History</h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Select conversations to export</p>
              
              <div className="space-y-3">
                {chatHistory.map((exportItem) => (
                  <div
                    key={exportItem.id}
                    className={`border rounded-lg p-4 transition-all space-y-3 ${
                      selectedExports.includes(exportItem.id)
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900'
                        : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
                          {exportItem.projectTitle}
                        </h3>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                          Project ID: {exportItem.projectId} • {exportItem.messages.length} messages
                        </p>
                        <p className="text-xs text-zinc-500">
                          Created: {new Date(exportItem.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <input
                        type="checkbox"
                        checked={selectedExports.includes(exportItem.id)}
                        onChange={() => toggleExportSelection(exportItem.id)}
                        className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Format Selection */}
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleExport(exportItem.id, 'txt')}
                          size="sm"
                          disabled={!selectedExports.includes(exportItem.id)}
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          TXT
                        </Button>
                        <Button
                          onClick={() => handleExport(exportItem.id, 'json')}
                          size="sm"
                          disabled={!selectedExports.includes(exportItem.id)}
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          JSON
                        </Button>
                        <Button
                          onClick={() => handleExport(exportItem.id, 'html')}
                          size="sm"
                          disabled={!selectedExports.includes(exportItem.id)}
                          className="text-xs"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          HTML
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {/* Actions */}
                      <Button
                        onClick={() => toggleExportSelection(exportItem.id)}
                        variant={selectedExports.includes(exportItem.id) ? "secondary" : "default"}
                        size="sm"
                      >
                        {selectedExports.includes(exportItem.id) ? "Selected" : "Select"}
                      </Button>
                    </div>
                  </div>
              ))}
            </div>
            </div>

            {/* Batch Actions */}
            {selectedExports.length > 0 && (
              <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-sm p-6">
                <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Batch Export Actions</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-zinc-600">
                      {selectedExports.length} items selected
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleBatchExport()}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export All (TXT)
                      </Button>
                      <Button
                        onClick={() => handleBatchExport()}
                        size="sm"
                        className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Export All (JSON)
                      </Button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {exportProgress > 0 && (
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${exportProgress}%` }}
                      ></div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}