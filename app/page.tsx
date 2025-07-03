"use client"

import { useState, useRef } from "react"
import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Header } from "./components/header"
import { GroupManager } from "./components/group-manager"
import { AudioUpload } from "./components/audio-upload"
import { TextInput } from "./components/text-input"
import { DiffViewer } from "./components/diff-viewer"
import { TextSetManager } from "./components/text-set-manager"
import { Trash2, FileText, Copy, Download, Upload } from "lucide-react"

export interface TextSet {
  id: string
  name: string
  content: string
  source: "manual" | "audio"
  timestamp: Date
}

export interface DiffGroup {
  id: string
  name: string
  textSets: TextSet[]
  selectedSets: string[]
}

export default function Home() {
  const [groups, setGroups] = useState<DiffGroup[]>([
    {
      id: "default",
      name: "Default Group",
      textSets: [],
      selectedSets: [],
    },
  ])
  const [activeGroupId, setActiveGroupId] = useState("default")

  const activeGroup = groups.find((group) => group.id === activeGroupId) || groups[0]

  const addTextSet = (textSet: Omit<TextSet, "id" | "timestamp">) => {
    const newSet: TextSet = {
      ...textSet,
      id: Date.now().toString(),
      timestamp: new Date(),
    }

    setGroups((prev) =>
      prev.map((group) => (group.id === activeGroupId ? { ...group, textSets: [...group.textSets, newSet] } : group)),
    )
  }

  const removeTextSet = (id: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === activeGroupId
          ? {
              ...group,
              textSets: group.textSets.filter((set) => set.id !== id),
              selectedSets: group.selectedSets.filter((setId) => setId !== id),
            }
          : group,
      ),
    )
  }

  const reorderTextSets = (newOrder: TextSet[]) => {
    setGroups((prev) => prev.map((group) => (group.id === activeGroupId ? { ...group, textSets: newOrder } : group)))
  }

  const renameTextSet = (id: string, newName: string) => {
    setGroups((prev) =>
      prev.map((group) =>
        group.id === activeGroupId
          ? {
              ...group,
              textSets: group.textSets.map((set) =>
                set.id === id ? { ...set, name: newName } : set
              ),
            }
          : group,
      ),
    )
  }

  const clearAllSets = () => {
    setGroups((prev) =>
      prev.map((group) => (group.id === activeGroupId ? { ...group, textSets: [], selectedSets: [] } : group)),
    )
  }

  const updateSelectedSets = (selectedSets: string[]) => {
    setGroups((prev) => prev.map((group) => (group.id === activeGroupId ? { ...group, selectedSets } : group)))
  }

  const addGroup = () => {
    const newGroup: DiffGroup = {
      id: Date.now().toString(),
      name: `Group ${groups.length + 1}`,
      textSets: [],
      selectedSets: [],
    }
    setGroups((prev) => [...prev, newGroup])
    setActiveGroupId(newGroup.id)
  }

  const removeGroup = (groupId: string) => {
    if (groups.length <= 1) return // Don't allow removing the last group

    setGroups((prev) => prev.filter((group) => group.id !== groupId))

    // If we're removing the active group, switch to the first remaining group
    if (activeGroupId === groupId) {
      const remainingGroups = groups.filter((group) => group.id !== groupId)
      setActiveGroupId(remainingGroups[0]?.id || groups[0]?.id)
    }
  }

  const renameGroup = (groupId: string, newName: string) => {
    setGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, name: newName } : group)))
  }

  const selectedTextSets = activeGroup.textSets.filter((set) => activeGroup.selectedSets.includes(set.id))

  // ---------------------------------------------------------------------
  // Import / Export helpers
  // ---------------------------------------------------------------------

  const fileInputRef = useRef<HTMLInputElement>(null)

  /**
   * Trigger a download of the current application state as JSON.
   */
  const exportData = () => {
    try {
      const json = JSON.stringify(groups)
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `textdiff-data-${new Date().toISOString()}.json`
      link.click()

      URL.revokeObjectURL(url)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error("Failed to export data", error)
    }
  }

  /**
   * Load application state from a previously exported JSON file.
   */
  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (ev) => {
      try {
        const raw = ev.target?.result as string
        const parsed = JSON.parse(raw)

        if (!Array.isArray(parsed)) {
          alert("Invalid file format – expected an array of groups.")
          return
        }

        // Revive Date objects that were stringified
        const revived: DiffGroup[] = parsed.map((group: DiffGroup) => ({
          ...group,
          textSets: group.textSets.map((set) => ({
            ...set,
            timestamp: new Date(set.timestamp as unknown as string),
          })),
        }))

        setGroups(revived)
        setActiveGroupId(revived[0]?.id || "default")
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("Failed to import data", err)
        alert("Failed to import data – see console for details.")
      }
    }

    reader.readAsText(file)

    // Reset the input so that the same file can be selected again if needed
    e.target.value = ""
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />

      <div className="flex">
        <GroupManager
          groups={groups}
          activeGroupId={activeGroupId}
          onGroupSelect={setActiveGroupId}
          onAddGroup={addGroup}
          onRemoveGroup={removeGroup}
          onRenameGroup={renameGroup}
        />

        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Hero Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Visualize diffs between transcripts!</h1>
                  <p className="text-lg text-gray-600 dark:text-gray-300 mt-2">
                    Currently working on: <span className="font-semibold text-deepgram-teal">{activeGroup.name}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-300"
                    onClick={exportData}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-600 dark:text-gray-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy page
                  </Button>
                </div>
              </div>

            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Input Section */}
              <div className="space-y-6">
                <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-800">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <FileText className="h-5 w-5 text-deepgram-teal" />
                      Add Text Sets to {activeGroup.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Add text manually or upload audio files for transcription
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="text" className="w-full">
                      <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-700">
                        <TabsTrigger
                          value="text"
                          className="data-[state=active]:bg-white data-[state=active]:text-deepgram-teal data-[state=active]:border-deepgram-teal dark:data-[state=active]:bg-gray-800 dark:text-gray-300"
                        >
                          Manual Text
                        </TabsTrigger>
                        <TabsTrigger
                          value="audio"
                          className="data-[state=active]:bg-white data-[state=active]:text-deepgram-teal data-[state=active]:border-deepgram-teal dark:data-[state=active]:bg-gray-800 dark:text-gray-300"
                        >
                          Audio Upload
                        </TabsTrigger>
                      </TabsList>
                      <TabsContent value="text" className="mt-6">
                        <TextInput onAddTextSet={addTextSet} />
                      </TabsContent>
                      <TabsContent value="audio" className="mt-6">
                        <AudioUpload onAddTextSet={addTextSet} />
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>

                <TextSetManager
                  textSets={activeGroup.textSets}
                  selectedSets={activeGroup.selectedSets}
                  onSelectionChange={updateSelectedSets}
                  onRemoveSet={removeTextSet}
                  onReorderSets={reorderTextSets}
                  onRenameSet={renameTextSet}
                  groupName={activeGroup.name}
                />

                {activeGroup.textSets.length > 0 && (
                  <div className="flex justify-end">
                    <Button variant="destructive" size="sm" onClick={clearAllSets} className="flex items-center gap-2">
                      <Trash2 className="h-4 w-4" />
                      Clear All from {activeGroup.name}
                    </Button>
                  </div>
                )}
              </div>

              {/* Diff Viewer Section */}
              <div className="space-y-6">
                <DiffViewer textSets={selectedTextSets} groupName={activeGroup.name} />
              </div>
            </div>

            {/* Hidden input for importing JSON data */}
            <input
              type="file"
              accept="application/json"
              ref={fileInputRef}
              onChange={importData}
              style={{ display: "none" }}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
