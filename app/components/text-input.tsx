"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import type { TextSet } from "../page"

interface TextInputProps {
  onAddTextSet: (textSet: Omit<TextSet, "id" | "timestamp">) => void
}

export function TextInput({ onAddTextSet }: TextInputProps) {
  const [name, setName] = useState("")
  const [content, setContent] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !content.trim()) return

    onAddTextSet({
      name: name.trim(),
      content: content.trim(),
      source: "manual",
    })

    setName("")
    setContent("")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="text-name" className="dark:text-gray-200">
          Name
        </Label>
        <Input
          id="text-name"
          placeholder="Enter a name for this text set"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border-gray-200 focus:border-deepgram-teal focus:ring-deepgram-teal dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="text-content" className="dark:text-gray-200">
          Text Content
        </Label>
        <Textarea
          id="text-content"
          placeholder="Paste or type your text here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={8}
          className="border-gray-200 focus:border-deepgram-teal focus:ring-deepgram-teal dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full flex items-center gap-2 bg-deepgram-teal hover:bg-deepgram-teal/90 text-white font-medium"
      >
        <Plus className="h-4 w-4" />
        Add Text Set
      </Button>
    </form>
  )
}
