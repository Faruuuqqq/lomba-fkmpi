'use client';

import { Modal } from './Modal';
import { Keyboard, Command, ArrowLeft, ArrowRight, ArrowDown, ArrowUp, Save, Copy, Search, MessageSquare } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts = [
    {
      category: 'Editor Actions',
      items: [
        { key: 'Ctrl + S', description: 'Save document' },
        { key: 'Ctrl + Z', description: 'Undo' },
        { key: 'Ctrl + Shift + Z', description: 'Redo' },
        { key: 'Ctrl + B', description: 'Bold text' },
        { key: 'Ctrl + I', description: 'Italic text' },
        { key: 'Ctrl + U', description: 'Underline text' },
      ],
    },
    {
      category: 'Navigation',
      items: [
        { key: 'Alt + Left', description: 'Go back' },
        { key: 'Alt + Right', description: 'Go forward' },
        { key: 'Ctrl + /', description: 'Open keyboard shortcuts' },
      ],
    },
    {
      category: 'AI Assistant',
      items: [
        { key: 'Ctrl + Enter', description: 'Send message to AI' },
        { key: 'Ctrl + Shift + C', description: 'Open AI Chat' },
        { key: 'Ctrl + Shift + P', description: 'Open projects list' },
        { key: 'Ctrl + Shift + G', description: 'Run Grammar Check' },
      ],
    },
    {
      category: 'Search & Actions',
      items: [
        { key: 'Ctrl + K', description: 'Quick search' },
        { key: 'Ctrl + Shift + L', description: 'Open Library' },
        { key: 'Ctrl + Shift + T', description: 'Open Progress Tracker' },
      ],
    },
  ];

  const renderKey = (key: string) => {
    const parts = key.split(' + ');
    return (
      <div className="flex items-center gap-1">
        {parts.map((part, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && <span className="text-zinc-400">+</span>}
            <kbd className="px-2 py-1 bg-zinc-100 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded text-xs font-mono text-zinc-700 dark:text-zinc-300">
              {part}
            </kbd>
          </React.Fragment>
        ))}
      </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Keyboard Shortcuts">
      <div className="space-y-6 max-h-[70vh] overflow-y-auto">
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          Use these keyboard shortcuts to work faster and more efficiently.
        </p>

        {shortcuts.map((section) => (
          <div key={section.category}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
              {section.category}
            </h3>
            <div className="space-y-2">
              {section.items.map((item) => (
                <div key={item.key} className="flex items-center justify-between py-2 px-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <span className="text-sm text-zinc-700 dark:text-zinc-300">{item.description}</span>
                  {renderKey(item.key)}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-lg">
          <div className="flex items-start gap-2">
            <Keyboard className="w-5 h-5 text-indigo-600 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                Pro Tip
              </p>
              <p className="text-xs text-indigo-700 dark:text-indigo-300">
                Press <kbd className="px-1 py-0.5 bg-indigo-100 dark:bg-indigo-800 rounded text-xs font-mono">Ctrl + /</kbd> anytime to quickly access this shortcuts menu.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}
