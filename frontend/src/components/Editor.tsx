'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { useEffect } from 'react';
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, List, ListOrdered, Undo, Redo, Heading1, Heading2, Type } from 'lucide-react';

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  isLocked: boolean;
}

export function Editor({ content, onUpdate, isLocked }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Bold,
      Italic,
      Underline,
      BulletList,
      OrderedList,
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      onUpdate(text);
    },
    editorProps: {
      handlePaste: (view, event, slice) => {
        const pastedText = slice.content.textBetween(0, slice.content.size);
        const wordCount = pastedText.split(' ').filter(w => w.length > 0).length;

        if (isLocked && wordCount > 20) {
          event.preventDefault();
          alert('Zona Inisiasi: Mohon ketik gagasanmu sendiri, jangan copy-paste blok teks besar (>20 kata).');
          return true;
        }
        return false;
      },
      attributes: {
        class: 'prose prose-lg prose-slate dark:prose-invert max-w-none focus:outline-none min-h-[800px] font-serif-academic leading-relaxed text-slate-800 dark:text-slate-200',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getText()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="flex-1 overflow-y-auto relative flex justify-center p-4 sm:p-8 bg-slate-100 dark:bg-slate-900/50">
      {/* A4 Paper-like Canvas */}
      <div className="w-full max-w-[850px] min-h-[1100px] editor-paper rounded-sm px-8 sm:px-12 py-12 sm:py-16 transition-all duration-300 ease-in-out fade-in">

        {/* Floating Minimalist Toolbar */}
        <div className="toolbar-floating py-3 border-b border-slate-200 dark:border-slate-700 mb-8 flex flex-wrap gap-1">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            disabled={isLocked}
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${editor.isActive('bold') ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
            title="Bold (Ctrl+B)"
          >
            <BoldIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            disabled={isLocked}
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${editor.isActive('italic') ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
            title="Italic (Ctrl+I)"
          >
            <ItalicIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            disabled={isLocked}
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${editor.isActive('underline') ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
            title="Underline (Ctrl+U)"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 self-center" />

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            disabled={isLocked}
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
            title="Heading 1"
          >
            <Heading1 className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            disabled={isLocked}
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
            title="Heading 2"
          >
            <Heading2 className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 self-center" />

          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            disabled={isLocked}
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${editor.isActive('bulletList') ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
            title="Bullet List"
          >
            <List className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            disabled={isLocked}
            className={`p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all ${editor.isActive('orderedList') ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-400'
              } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'hover:scale-110'}`}
            title="Numbered List"
          >
            <ListOrdered className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-slate-300 dark:bg-slate-600 mx-1 self-center" />

          <button
            onClick={() => editor.chain().focus().undo().run()}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:scale-110"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-4 h-4" />
          </button>

          <button
            onClick={() => editor.chain().focus().redo().run()}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-slate-600 dark:text-slate-400 hover:scale-110"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-4 h-4" />
          </button>

          {/* Academic Writing Indicator */}
          <div className="ml-auto flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <Type className="w-3 h-3" />
            <span className="hidden sm:inline">Academic Mode</span>
          </div>
        </div>

        {/* Editor Content with Serif Font */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
