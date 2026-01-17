'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEffect, useState, useRef } from 'react';
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, List, ListOrdered, Undo, Redo, Heading1, Heading2, Type, Save, Coins, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useGamification } from '@/contexts/GamificationContext';
import { gamificationAPI } from '@/lib/api';

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  isLocked: boolean;
  isSaving?: boolean;
  lastSaved?: Date;
}

export function Editor({ content, onUpdate, isLocked, isSaving, lastSaved }: EditorProps) {
  const { addTokens, stats } = useGamification();
  const [lastRewardedWordCount, setLastRewardedWordCount] = useState(0);
  const [wordCount, setWordCount] = useState(0);
  const rewardCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
    ],
    content,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      onUpdate(text);

      // Update word count
      const words = text.split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);

      // Write-to-Earn: Check word count for rewards
      if (rewardCheckTimeoutRef.current) {
        clearTimeout(rewardCheckTimeoutRef.current);
      }

      rewardCheckTimeoutRef.current = setTimeout(() => {
        checkWritingReward(editor);
      }, 2000);
    },
    editorProps: {
      handlePaste: (view, event, slice) => {
        const pastedText = slice.content.textBetween(0, slice.content.size);
        const wordCount = pastedText.split(' ').filter(w => w.length > 0).length;

        if (isLocked && wordCount > 20) {
          event.preventDefault();
          toast('⚠️ Please type your own ideas instead of pasting large blocks of text (>20 words).', {
            icon: '✍️',
            duration: 5000,
          });
          return true;
        }
        return false;
      },
      attributes: {
        class: 'prose prose-lg max-w-none focus:outline-none min-h-[600px] font-serif text-zinc-800 dark:text-zinc-200',
      },
    },
  });

  // Write-to-Earn: Check if user earned tokens
  const checkWritingReward = async (editorInstance: any) => {
    if (!editorInstance) return;

    const currentWordCount = editorInstance.getText().split(/\s+/).filter((w: string) => w.length > 0).length;
    const threshold = 50;

    if (currentWordCount - lastRewardedWordCount >= threshold) {
      try {
        const { data } = await gamificationAPI.rewardWriting(currentWordCount);

        if (data.success) {
          const tokensEarned = Math.floor((currentWordCount - lastRewardedWordCount) / threshold);
          setLastRewardedWordCount(currentWordCount);
          addTokens(tokensEarned);

          toast.success(`🪙 +${tokensEarned} Token${tokensEarned > 1 ? 's' : ''}! Keep writing.`, {
            duration: 3000,
            icon: '✍️',
          });
        }
      } catch (error) {
        console.error('Failed to claim writing reward:', error);
      }
    }
  };

  useEffect(() => {
    if (editor && content !== editor.getText()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  useEffect(() => {
    if (editor) {
      const text = editor.getText();
      const words = text.split(/\s+/).filter(w => w.length > 0).length;
      setWordCount(words);
    }
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto bg-zinc-100 dark:bg-zinc-900 p-4 sm:p-8">
      {/* Floating Paper Container */}
      <div className="max-w-[65ch] mx-auto">
        {/* Status Bar */}
        <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-t-lg px-6 py-3 flex items-center justify-between text-xs font-medium text-zinc-600 dark:text-zinc-400">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Type className="w-3.5 h-3.5" />
              <span>{wordCount} words</span>
            </div>
            <div className="flex items-center gap-2">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-amber-600 dark:text-amber-400">{stats.tokens} tokens</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSaving ? (
              <>
                <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              </>
            ) : lastSaved ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
              </>
            ) : null}
          </div>
        </div>

        {/* Paper */}
        <div className="bg-white dark:bg-zinc-800 border-x border-b border-zinc-200 dark:border-zinc-700 rounded-b-lg shadow-sm px-8 sm:px-12 py-12 sm:py-16 min-h-[800px]">
          {/* Minimalist Toolbar */}
          <div className="mb-8 pb-4 border-b border-zinc-200 dark:border-zinc-700">
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={isLocked}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${editor.isActive('bold') ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Bold (Ctrl+B)"
              >
                <BoldIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={isLocked}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${editor.isActive('italic') ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Italic (Ctrl+I)"
              >
                <ItalicIcon className="w-4 h-4" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={isLocked}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${editor.isActive('underline') ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon className="w-4 h-4" />
              </button>

              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                disabled={isLocked}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${editor.isActive('heading', { level: 1 }) ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Heading 1"
              >
                <Heading1 className="w-4 h-4" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                disabled={isLocked}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${editor.isActive('heading', { level: 2 }) ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>

              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={isLocked}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${editor.isActive('bulletList') ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Bullet List"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={isLocked}
                className={`p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors ${editor.isActive('orderedList') ? 'bg-zinc-100 dark:bg-zinc-700' : ''
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : ''}`}
                title="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <div className="w-px h-8 bg-zinc-200 dark:bg-zinc-700 mx-1"></div>

              <button
                onClick={() => editor.chain().focus().undo().run()}
                disabled={isLocked || !editor.can().undo()}
                className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-4 h-4" />
              </button>

              <button
                onClick={() => editor.chain().focus().redo().run()}
                disabled={isLocked || !editor.can().redo()}
                className="p-2 rounded hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Editor Content */}
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  );
}
