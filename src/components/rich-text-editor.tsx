"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { useEffect, useCallback, useRef, useState } from 'react'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image as ImageIcon,
  Upload,
  Link2,
  Undo,
  Redo,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  ChevronDown
} from 'lucide-react'

interface RichTextEditorProps {
  content: string
  onChange: (html: string) => void
  placeholder?: string
  onImageUpload?: (file: File) => Promise<string | null>
}

export default function RichTextEditor({ content, onChange, placeholder, onImageUpload }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageMenuOpen, setImageMenuOpen] = useState(false)
  const [uploading, setUploading] = useState(false)
  const imageMenuRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded-lg my-4'
        }
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph']
      }),
      Underline,
      TextStyle,
      Color
    ],
    content: content,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] px-4 py-3'
      },
      handlePaste(view, event) {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of Array.from(items)) {
          if (item.type.startsWith('image/')) {
            event.preventDefault()
            const file = item.getAsFile()
            if (!file) return false
            if (onImageUpload) {
              setUploading(true)
              onImageUpload(file).then((url) => {
                setUploading(false)
                if (url) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src: url })
                    )
                  )
                }
              })
            } else {
              // Fallback: insert as base64
              const reader = new FileReader()
              reader.onload = (e) => {
                const src = e.target?.result as string
                if (src) {
                  view.dispatch(
                    view.state.tr.replaceSelectionWith(
                      view.state.schema.nodes.image.create({ src })
                    )
                  )
                }
              }
              reader.readAsDataURL(file)
            }
            return true
          }
        }
        return false
      },
      handleDrop(view, event) {
        const files = event.dataTransfer?.files
        if (!files || files.length === 0) return false
        const file = files[0]
        if (!file.type.startsWith('image/')) return false
        event.preventDefault()
        const coordinates = view.posAtCoords({ left: event.clientX, top: event.clientY })
        if (!coordinates) return false
        if (onImageUpload) {
          setUploading(true)
          onImageUpload(file).then((url) => {
            setUploading(false)
            if (url) {
              const node = view.state.schema.nodes.image.create({ src: url })
              const transaction = view.state.tr.insert(coordinates.pos, node)
              view.dispatch(transaction)
            }
          })
        } else {
          const reader = new FileReader()
          reader.onload = (e) => {
            const src = e.target?.result as string
            if (src) {
              const node = view.state.schema.nodes.image.create({ src })
              const transaction = view.state.tr.insert(coordinates.pos, node)
              view.dispatch(transaction)
            }
          }
          reader.readAsDataURL(file)
        }
        return true
      }
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  // Close image menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (imageMenuRef.current && !imageMenuRef.current.contains(e.target as Node)) {
        setImageMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const insertImageFromUrl = useCallback(() => {
    setImageMenuOpen(false)
    const url = window.prompt('Enter image URL:')
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run()
    }
  }, [editor])

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !editor) return
    e.target.value = ''

    if (onImageUpload) {
      setUploading(true)
      const url = await onImageUpload(file)
      setUploading(false)
      if (url) {
        editor.chain().focus().setImage({ src: url }).run()
      }
    } else {
      // Fallback: base64
      const reader = new FileReader()
      reader.onload = (ev) => {
        const src = ev.target?.result as string
        if (src) editor.chain().focus().setImage({ src }).run()
      }
      reader.readAsDataURL(file)
    }
  }, [editor, onImageUpload])

  if (!editor) {
    return null
  }

  return (
    <div className="border border-neutral-300 rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b border-neutral-200 bg-neutral-50 p-2 flex flex-wrap gap-1">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r border-neutral-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('bold') ? 'bg-neutral-300' : ''
            }`}
            title="Bold"
            type="button"
          >
            <Bold className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('italic') ? 'bg-neutral-300' : ''
            }`}
            title="Italic"
            type="button"
          >
            <Italic className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('underline') ? 'bg-neutral-300' : ''
            }`}
            title="Underline"
            type="button"
          >
            <UnderlineIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r border-neutral-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('heading', { level: 1 }) ? 'bg-neutral-300' : ''
            }`}
            title="Heading 1"
            type="button"
          >
            <Heading1 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('heading', { level: 2 }) ? 'bg-neutral-300' : ''
            }`}
            title="Heading 2"
            type="button"
          >
            <Heading2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('heading', { level: 3 }) ? 'bg-neutral-300' : ''
            }`}
            title="Heading 3"
            type="button"
          >
            <Heading3 className="w-4 h-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r border-neutral-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('bulletList') ? 'bg-neutral-300' : ''
            }`}
            title="Bullet List"
            type="button"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('orderedList') ? 'bg-neutral-300' : ''
            }`}
            title="Numbered List"
            type="button"
          >
            <ListOrdered className="w-4 h-4" />
          </button>
        </div>

        {/* Alignment */}
        <div className="flex gap-1 border-r border-neutral-300 pr-2">
          <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive({ textAlign: 'left' }) ? 'bg-neutral-300' : ''
            }`}
            title="Align Left"
            type="button"
          >
            <AlignLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive({ textAlign: 'center' }) ? 'bg-neutral-300' : ''
            }`}
            title="Align Center"
            type="button"
          >
            <AlignCenter className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive({ textAlign: 'right' }) ? 'bg-neutral-300' : ''
            }`}
            title="Align Right"
            type="button"
          >
            <AlignRight className="w-4 h-4" />
          </button>
        </div>

        {/* Quote */}
        <div className="flex gap-1 border-r border-neutral-300 pr-2">
          <button
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={`p-2 rounded hover:bg-neutral-200 transition-colors ${
              editor.isActive('blockquote') ? 'bg-neutral-300' : ''
            }`}
            title="Quote"
            type="button"
          >
            <Quote className="w-4 h-4" />
          </button>
        </div>

        {/* Image */}
        <div className="flex gap-1 border-r border-neutral-300 pr-2" ref={imageMenuRef}>
          <div className="relative">
            <button
              onClick={() => setImageMenuOpen((v) => !v)}
              className={`p-2 rounded hover:bg-neutral-200 transition-colors flex items-center gap-0.5 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Insert Image"
              type="button"
              disabled={uploading}
            >
              {uploading ? (
                <span className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-700 rounded-full animate-spin inline-block" />
              ) : (
                <ImageIcon className="w-4 h-4" />
              )}
              <ChevronDown className="w-3 h-3" />
            </button>
            {imageMenuOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => { setImageMenuOpen(false); fileInputRef.current?.click() }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-neutral-100 transition-colors rounded-t-lg"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Upload from computer
                </button>
                <button
                  type="button"
                  onClick={insertImageFromUrl}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-neutral-100 transition-colors rounded-b-lg"
                >
                  <Link2 className="w-3.5 h-3.5" />
                  Insert from URL
                </button>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
            type="button"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded hover:bg-neutral-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
            type="button"
          >
            <Redo className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
