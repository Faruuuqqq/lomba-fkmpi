'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Underline from '@tiptap/extension-underline';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { useEffect } from 'react';
import { Bold as BoldIcon, Italic as ItalicIcon, Underline as UnderlineIcon, List, ListOrdered, Undo, Redo, Heading1, Heading2 } from 'lucide-react';

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
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[400px] p-4',
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
    <div className="border rounded-lg overflow-hidden">
      <div className="border-b bg-muted/50 p-2 flex items-center gap-1 flex-wrap">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          disabled={isLocked}
          className={`p-2 rounded hover:bg-background transition-colors ${
            editor.isActive('bold') ? 'bg-background text-primary' : ''
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Bold (Ctrl+B)"
        >
          <BoldIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          disabled={isLocked}
          className={`p-2 rounded hover:bg-background transition-colors ${
            editor.isActive('italic') ? 'bg-background text-primary' : ''
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Italic (Ctrl+I)"
        >
          <ItalicIcon className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          disabled={isLocked}
          className={`p-2 rounded hover:bg-background transition-colors ${
            editor.isActive('underline') ? 'bg-background text-primary' : ''
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Underline (Ctrl+U)"
        >
          <UnderlineIcon className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          disabled={isLocked}
          className={`p-2 rounded hover:bg-background transition-colors ${
            editor.isActive('heading', { level: 1 }) ? 'bg-background text-primary' : ''
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          disabled={isLocked}
          className={`p-2 rounded hover:bg-background transition-colors ${
            editor.isActive('heading', { level: 2 }) ? 'bg-background text-primary' : ''
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          disabled={isLocked}
          className={`p-2 rounded hover:bg-background transition-colors ${
            editor.isActive('bulletList') ? 'bg-background text-primary' : ''
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          disabled={isLocked}
          className={`p-2 rounded hover:bg-background transition-colors ${
            editor.isActive('orderedList') ? 'bg-background text-primary' : ''
          } ${isLocked ? 'opacity-50 cursor-not-allowed' : ''}`}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          onClick={() => editor.chain().focus().undo().run()}
          className="p-2 rounded hover:bg-background transition-colors"
          title="Undo (Ctrl+Z)"
        >
          <Undo className="w-4 h-4" />
        </button>
        <button
          onClick={() => editor.chain().focus().redo().run()}
          className="p-2 rounded hover:bg-background transition-colors"
          title="Redo (Ctrl+Y)"
        >
          <Redo className="w-4 h-4" />
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
