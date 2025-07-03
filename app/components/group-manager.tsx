"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Edit2, Check, X, Folder, FolderOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import type { DiffGroup } from "../page"

interface GroupManagerProps {
  groups: DiffGroup[]
  activeGroupId: string
  onGroupSelect: (groupId: string) => void
  onAddGroup: () => void
  onRemoveGroup: (groupId: string) => void
  onRenameGroup: (groupId: string, newName: string) => void
}

export function GroupManager({
  groups,
  activeGroupId,
  onGroupSelect,
  onAddGroup,
  onRemoveGroup,
  onRenameGroup,
}: GroupManagerProps) {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState("")

  const startEditing = (group: DiffGroup) => {
    setEditingGroupId(group.id)
    setEditingName(group.name)
  }

  const saveEdit = () => {
    if (editingGroupId && editingName.trim()) {
      onRenameGroup(editingGroupId, editingName.trim())
    }
    setEditingGroupId(null)
    setEditingName("")
  }

  const cancelEdit = () => {
    setEditingGroupId(null)
    setEditingName("")
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveEdit()
    } else if (e.key === "Escape") {
      cancelEdit()
    }
  }

  return (
    <aside className="w-80 bg-white border-r border-gray-200 h-screen overflow-y-auto dark:bg-gray-900 dark:border-gray-800">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Diff Groups</h2>
          <Button onClick={onAddGroup} size="sm" className="bg-deepgram-teal hover:bg-deepgram-teal/90 text-white">
            <Plus className="h-4 w-4 mr-1" />
            Add Group
          </Button>
        </div>

        <div className="space-y-3">
          {groups.map((group) => (
            <Card
              key={group.id}
              className={cn(
                "cursor-pointer transition-all duration-200 hover:shadow-md group",
                group.id === activeGroupId
                  ? "border-deepgram-teal bg-deepgram-teal-light dark:bg-deepgram-teal/20 dark:border-deepgram-teal"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 dark:bg-gray-800",
              )}
              onClick={() => onGroupSelect(group.id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {group.id === activeGroupId ? (
                      <FolderOpen className="h-4 w-4 text-deepgram-teal flex-shrink-0" />
                    ) : (
                      <Folder className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                    )}

                    {editingGroupId === group.id ? (
                      <div className="flex items-center gap-1 flex-1">
                        <Input
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          onKeyDown={handleKeyPress}
                          onBlur={saveEdit}
                          className="h-7 text-sm px-2 py-1 border-deepgram-teal focus:ring-deepgram-teal dark:bg-gray-700"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            saveEdit()
                          }}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          onClick={(e) => {
                            e.stopPropagation()
                            cancelEdit()
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <CardTitle
                          className={cn(
                            "text-sm font-medium truncate cursor-pointer",
                            group.id === activeGroupId ? "text-deepgram-teal" : "text-gray-900 dark:text-white",
                          )}
                          onDoubleClick={(e) => {
                            e.stopPropagation()
                            startEditing(group)
                          }}
                          title="Double-click to rename"
                        >
                          {group.name}
                        </CardTitle>
                        <div className="flex items-center gap-1 ml-auto">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-gray-400 hover:text-deepgram-teal hover:bg-gray-100 dark:text-gray-500 dark:hover:text-deepgram-teal dark:hover:bg-gray-700 transition-colors"
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditing(group)
                            }}
                            title="Rename group"
                          >
                            <Edit2 className="h-3 w-3" />
                          </Button>
                          {groups.length > 1 && (
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 w-7 p-0 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:text-gray-500 dark:hover:text-red-400 dark:hover:bg-red-900/20 transition-colors"
                              onClick={(e) => {
                                e.stopPropagation()
                                onRemoveGroup(group.id)
                              }}
                              title="Delete group"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600 dark:text-gray-400">
                      {group.textSets.length} text set{group.textSets.length !== 1 ? "s" : ""}
                    </span>
                    {group.selectedSets.length > 0 && (
                      <Badge variant="secondary" className="text-xs px-2 py-0">
                        {group.selectedSets.length} selected
                      </Badge>
                    )}
                  </div>
                  {group.id === activeGroupId && (
                    <Badge className="bg-deepgram-teal text-white text-xs px-2 py-0">Active</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {groups.length === 0 && (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No groups yet. Create your first group!</p>
          </div>
        )}

        <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">About Groups</h3>
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
            <p>
              Groups help you organize related text sets. Each group is independent - text sets from different groups
              cannot be compared with each other.
            </p>
            <p className="flex items-center gap-1">
              <Edit2 className="h-3 w-3" />
              <strong>Tip:</strong> Double-click a group name or use the edit icon to rename it.
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
