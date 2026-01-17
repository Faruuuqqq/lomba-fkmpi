'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import { useEffect } from 'react';
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, List, ListOrdered, Undo, Redo, Heading1, Heading2, Type } from 'lucide-react';
import toast from 'react-hot-toast';

interface EditorProps {
  content: string;
  onUpdate: (content: string) => void;
  isLocked: boolean;
}

export function Editor({ content, onUpdate, isLocked }: EditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
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
          toast('⚠️ Please type your own ideas instead of pasting large blocks of text (>20 words).', {
            icon: '✍️',
            duration: 5000,
          });
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

        {/* Bauhaus Toolbar */}
        <div className="mb-8 pb-4 border-b-4 border-bauhaus">
          <div className="flex flex-wrap gap-2">
            {/* Text Formatting */}
            <div className="flex gap-1">
              <button
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={isLocked}
                className={`w-10 h-10 border-2 border-bauhaus rounded-none flex items-center justify-center transition-all ${editor.isActive('bold')
                  ? 'bg-bauhaus-yellow shadow-bauhaus-sm'
                  : 'bg-white hover:bg-bauhaus-yellow'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'btn-press'}`}
                title="Bold (Ctrl+B)"
              >
                <BoldIcon className="w-5 h-5" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={isLocked}
                className={`w-10 h-10 border-2 border-bauhaus rounded-none flex items-center justify-center transition-all ${editor.isActive('italic')
                  ? 'bg-bauhaus-yellow shadow-bauhaus-sm'
                  : 'bg-white hover:bg-bauhaus-yellow'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'btn-press'}`}
                title="Italic (Ctrl+I)"
              >
                <ItalicIcon className="w-5 h-5" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                disabled={isLocked}
                className={`w-10 h-10 border-2 border-bauhaus rounded-none flex items-center justify-center transition-all ${editor.isActive('underline')
                  ? 'bg-bauhaus-yellow shadow-bauhaus-sm'
                  : 'bg-white hover:bg-bauhaus-yellow'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'btn-press'}`}
                title="Underline (Ctrl+U)"
              >
                <UnderlineIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-1 h-10 bg-bauhaus"></div>

            {/* Headings */}
            <div className="flex gap-1">
              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                disabled={isLocked}
                className={`w-10 h-10 border-2 border-bauhaus rounded-none flex items-center justify-center transition-all ${editor.isActive('heading', { level: 1 })
                  ? 'bg-bauhaus-blue text-white shadow-bauhaus-sm'
                  : 'bg-white hover:bg-bauhaus-blue hover:text-white'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'btn-press'}`}
                title="Heading 1"
              >
                <Heading1 className="w-5 h-5" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                disabled={isLocked}
                className={`w-10 h-10 border-2 border-bauhaus rounded-none flex items-center justify-center transition-all ${editor.isActive('heading', { level: 2 })
                  ? 'bg-bauhaus-blue text-white shadow-bauhaus-sm'
                  : 'bg-white hover:bg-bauhaus-blue hover:text-white'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'btn-press'}`}
                title="Heading 2"
              >
                <Heading2 className="w-5 h-5" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-1 h-10 bg-bauhaus"></div>

            {/* Lists */}
            <div className="flex gap-1">
              <button
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                disabled={isLocked}
                className={`w-10 h-10 border-2 border-bauhaus rounded-none flex items-center justify-center transition-all ${editor.isActive('bulletList')
                  ? 'bg-bauhaus-red text-white shadow-bauhaus-sm'
                  : 'bg-white hover:bg-bauhaus-red hover:text-white'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'btn-press'}`}
                title="Bullet List"
              >
                <List className="w-5 h-5" />
              </button>

              <button
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                disabled={isLocked}
                className={`w-10 h-10 border-2 border-bauhaus rounded-none flex items-center justify-center transition-all ${editor.isActive('orderedList')
                  ? 'bg-bauhaus-red text-white shadow-bauhaus-sm'
                  : 'bg-white hover:bg-bauhaus-red hover:text-white'
                  } ${isLocked ? 'opacity-40 cursor-not-allowed' : 'btn-press'}`}
                title="Numbered List"
              >
                <ListOrdered className="w-5 h-5" />
              </button>
            </div>

            {/* Divider */}
            <div className="w-1 h-10 bg-bauhaus"></div>

            {/* Undo/Redo */}
            <div className="flex gap-1">
              <button
                onClick={() => editor.chain().focus().undo().run()}
                className="w-10 h-10 border-2 border-bauhaus rounded-none bg-white hover:bg-gray-100 flex items-center justify-center transition-all btn-press"
                title="Undo (Ctrl+Z)"
              >
                <Undo className="w-5 h-5" />
              </button>

              <button
                onClick={() => editor.chain().focus().redo().run()}
                className="w-10 h-10 border-2 border-bauhaus rounded-none bg-white hover:bg-gray-100 flex items-center justify-center transition-all btn-press"
                title="Redo (Ctrl+Y)"
              >
                <Redo className="w-5 h-5" />
              </button>
            </div>

            {/* Academic Mode Indicator */}
            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-white border-2 border-bauhaus">
              <Type className="w-4 h-4" />
              <span className="hidden sm:inline font-bold uppercase tracking-wide text-xs">ACADEMIC MODE</span>
            </div>
          </div>
        </div>

        {/* Editor Content with Serif Font */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
