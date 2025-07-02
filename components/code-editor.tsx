"use client"

import type React from "react"

import { useEffect, useRef } from "react"

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: string
  readOnly?: boolean
}

export function CodeEditor({ value, onChange, language, readOnly = false }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.value = value
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!readOnly) {
      const newValue = e.target.value
      onChange(newValue)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (readOnly) return

    if (e.key === "Tab") {
      e.preventDefault()
      const textarea = e.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const newValue = textarea.value.substring(0, start) + "  " + textarea.value.substring(end)
      textarea.value = newValue
      textarea.selectionStart = textarea.selectionEnd = start + 2
      onChange(newValue)
    }
  }

  return (
    <div className="h-full relative">
      <textarea
        ref={textareaRef}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        className={`w-full h-full p-4 font-mono text-sm border-0 resize-none focus:outline-none ${
          readOnly ? "bg-gray-50 cursor-not-allowed text-gray-600" : "bg-gray-50"
        }`}
        placeholder={
          readOnly
            ? "This code is automatically generated from your components..."
            : "Paste your HTML components here or add components using the buttons above..."
        }
        spellCheck={false}
        readOnly={readOnly}
      />
      <style jsx>{`
        textarea {
          tab-size: 2;
          -moz-tab-size: 2;
        }
      `}</style>
    </div>
  )
}
