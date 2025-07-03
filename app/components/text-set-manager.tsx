"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Trash2, FileText, Mic, GripVertical, Crown, Info } from "lucide-react"
import type { TextSet } from "../page"

interface TextSetManagerProps {
  textSets: TextSet[]
  selectedSets: string[]
  onSelectionChange: (selectedSets: string[]) => void
  onRemoveSet: (id: string) => void
  onReorderSets: (newOrder: TextSet[]) => void
  onRenameSet: (id: string, newName: string) => void
  groupName: string
}

export function TextSetManager({
  textSets,
  selectedSets,
  onSelectionChange,
  onRemoveSet,
  onReorderSets,
  onRenameSet,
  groupName,
}: TextSetManagerProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)

  const handleSelectionChange = (setId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedSets, setId])
    } else {
      onSelectionChange(selectedSets.filter((id) => id !== setId))
    }
  }

  const selectAll = () => {
    onSelectionChange(textSets.map((set) => set.id))
  }

  const selectNone = () => {
    onSelectionChange([])
  }

  const handleDragStart = (e: React.DragEvent, setId: string) => {
    setDraggedItem(setId)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, setId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverItem(setId)
  }

  const handleDragLeave = () => {
    setDragOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()

    if (!draggedItem || draggedItem === targetId) {
      setDraggedItem(null)
      setDragOverItem(null)
      return
    }

    const draggedIndex = textSets.findIndex((set) => set.id === draggedItem)
    const targetIndex = textSets.findIndex((set) => set.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newOrder = [...textSets]
    const [draggedSet] = newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedSet)

    onReorderSets(newOrder)
    setDraggedItem(null)
    setDragOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
  }

  if (textSets.length === 0) {
    return (
      <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <CardHeader>
          <CardTitle className="text-gray-900 dark:text-white">Text Sets in {groupName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 dark:text-gray-400 text-center py-12">
            No text sets in {groupName} yet. Add some text or upload audio files to get started.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-gray-900 dark:text-white">
            Text Sets in {groupName} ({textSets.length})
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
              className="border-gray-200 text-gray-600 hover:text-deepgram-teal hover:border-deepgram-teal bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:text-deepgram-teal dark:hover:border-deepgram-teal"
            >
              Select All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={selectNone}
              className="border-gray-200 text-gray-600 hover:text-deepgram-teal hover:border-deepgram-teal bg-transparent dark:border-gray-600 dark:text-gray-300 dark:hover:text-deepgram-teal dark:hover:border-deepgram-teal"
            >
              Select None
            </Button>
          </div>
        </div>

        {textSets.length > 1 && (
          <Alert className="mt-4 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
            <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              <strong>Tip:</strong> Drag and drop to reorder text sets. The first text set will be used as the base for
              comparisons.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {textSets.map((textSet, index) => (
            <div
              key={textSet.id}
              draggable
              onDragStart={(e) => handleDragStart(e, textSet.id)}
              onDragOver={(e) => handleDragOver(e, textSet.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, textSet.id)}
              onDragEnd={handleDragEnd}
              className={`flex items-start gap-3 p-4 border rounded-lg transition-all duration-200 cursor-move ${
                dragOverItem === textSet.id
                  ? "border-deepgram-teal bg-deepgram-teal-light dark:bg-deepgram-teal/20"
                  : draggedItem === textSet.id
                    ? "border-gray-300 bg-gray-100 opacity-50 dark:border-gray-600 dark:bg-gray-600"
                    : index === 0
                      ? "border-deepgram-teal/50 bg-deepgram-teal-light/30 hover:bg-deepgram-teal-light/50 dark:border-deepgram-teal/30 dark:bg-deepgram-teal/10 dark:hover:bg-deepgram-teal/20"
                      : "border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Checkbox
                  id={`set-${textSet.id}`}
                  checked={selectedSets.includes(textSet.id)}
                  onCheckedChange={(checked) => handleSelectionChange(textSet.id, checked as boolean)}
                  className="border-gray-300 data-[state=checked]:bg-deepgram-teal data-[state=checked]:border-deepgram-teal dark:border-gray-600"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {index === 0 && <Crown className="h-4 w-4 text-amber-500" aria-label="Base text set for comparisons" />}
                  {textSet.source === "manual" ? (
                    <FileText className="h-4 w-4 text-deepgram-teal" />
                  ) : (
                    <Mic className="h-4 w-4 text-green-500" />
                  )}
                  <h4
                    contentEditable
                    suppressContentEditableWarning
                    onBlur={(e) =>
                      onRenameSet(textSet.id, (e.currentTarget.textContent || "").trim())
                    }
                    className="font-medium truncate text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-deepgram-teal"
                  >
                    {textSet.name}
                  </h4>
                  <div className="flex items-center gap-1">
                    <Badge
                      variant="secondary"
                      className="text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                    >
                      {textSet.source}
                    </Badge>
                    {index === 0 && (
                      <Badge className="text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                        Base
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2">{textSet.content}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Added {textSet.timestamp.toLocaleString()}
                </p>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveSet(textSet.id)}
                className="text-gray-400 hover:text-red-500 dark:text-gray-500 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
