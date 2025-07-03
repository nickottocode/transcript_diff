"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Loader2, AlertCircle, FileAudio, Trash2, Settings, Play } from "lucide-react"
import type { TextSet } from "../page"
import { cn } from "@/lib/utils"

interface AudioUploadProps {
  onAddTextSet: (textSet: Omit<TextSet, "id" | "timestamp">) => void
}

interface UploadedFile {
  file: File
  uploadedAt: Date
}

interface TranscriptionHistory {
  id: string
  parameters: string
  isStreaming: boolean
  textSetName: string
  timestamp: Date
}

export function AudioUpload({ onAddTextSet }: AudioUploadProps) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)
  const [apiKey, setApiKey] = useState("")
  const [parameters, setParameters] = useState("")
  const [isStreaming, setIsStreaming] = useState(true)
  const [isTranscribing, setIsTranscribing] = useState(false)
  const [error, setError] = useState("")
  const [transcriptionHistory, setTranscriptionHistory] = useState<TranscriptionHistory[]>([])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setUploadedFile({
        file: selectedFile,
        uploadedAt: new Date(),
      })
      setError("")
      setTranscriptionHistory([]) // Clear history when new file is uploaded
    }
  }

  const clearUploadedFile = () => {
    setUploadedFile(null)
    setTranscriptionHistory([])
    const fileInput = document.getElementById("audio-file") as HTMLInputElement
    if (fileInput) fileInput.value = ""
  }

  const buildApiUrl = () => {
    const baseUrl = "https://api.deepgram.com/v1/listen"

    if (!parameters.trim()) return baseUrl

    // Handle both JSON format and query string format
    let queryParams = ""
    try {
      // Try to parse as JSON first
      const jsonParams = JSON.parse(parameters)
      const searchParams = new URLSearchParams()
      Object.entries(jsonParams).forEach(([key, value]) => {
        searchParams.append(key, String(value))
      })
      queryParams = searchParams.toString()
    } catch {
      // If not JSON, treat as query string
      queryParams = parameters.startsWith("?") ? parameters.slice(1) : parameters
    }

    queryParams = isStreaming ? `emulate_streaming=true&${queryParams}` : queryParams
    return queryParams ? `${baseUrl}?${queryParams}` : baseUrl
  }

  const transcribeAudio = async () => {
    if (!uploadedFile || !apiKey.trim()) {
      setError("Please upload a file and enter your Deepgram API key")
      return
    }

    setIsTranscribing(true)
    setError("")

    try {
      // Send the raw file so we can explicitly set the correct Content-Type header
      const audioBlob = uploadedFile.file
      const contentType = audioBlob.type || "audio/wav" // fallback for browsers that don't set type

      const apiUrl = buildApiUrl()

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          Authorization: `Token ${apiKey.trim()}`,
          "Content-Type": contentType,
        },
        body: audioBlob,
      })

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.status} ${response.statusText}`)
      }

      const result = await response.json()
      const transcript = result.results?.channels?.[0]?.alternatives?.[0]?.transcript

      if (!transcript) {
        throw new Error("No transcript found in the response")
      }

      // Create a descriptive name for this transcription
      const paramSummary = parameters.trim()
        ? ` (${isStreaming ? "Streaming" : "Batch"}${parameters.length > 20 ? " + params" : `: ${parameters.slice(0, 20)}...`})`
        : ` (${isStreaming ? "Streaming" : "Batch"})`

      const textSetName = `${uploadedFile.file.name}${paramSummary}`

      onAddTextSet({
        name: textSetName,
        content: transcript,
        source: "audio",
      })

      // Add to transcription history
      const historyEntry: TranscriptionHistory = {
        id: Date.now().toString(),
        parameters: parameters.trim() || "default",
        isStreaming,
        textSetName,
        timestamp: new Date(),
      }
      setTranscriptionHistory((prev) => [...prev, historyEntry])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to transcribe audio")
    } finally {
      setIsTranscribing(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert className="border-deepgram-teal/20 bg-deepgram-teal-light dark:border-deepgram-teal/30 dark:bg-deepgram-teal/10">
        <AlertCircle className="h-4 w-4 text-deepgram-teal" />
        <AlertDescription className="text-gray-700 dark:text-gray-200">
          You'll need a Deepgram API key to transcribe audio. Get one at{" "}
          <a
            href="https://console.deepgram.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-deepgram-teal underline hover:no-underline font-medium"
          >
            console.deepgram.com
          </a>
        </AlertDescription>
      </Alert>

      {/* API Key */}
      <div className="space-y-2">
        <Label htmlFor="api-key" className="dark:text-gray-200">
          Deepgram API Key
        </Label>
        <Input
          id="api-key"
          type="password"
          placeholder="Enter your Deepgram API key"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          className="border-gray-200 focus:border-deepgram-teal focus:ring-deepgram-teal dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      {/* File Upload Section */}
      {!uploadedFile ? (
        <div className="space-y-2">
          <Label htmlFor="audio-file" className="dark:text-gray-200">
            Audio File
          </Label>
          <Input
            id="audio-file"
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="border-gray-200 focus:border-deepgram-teal focus:ring-deepgram-teal dark:border-gray-600 dark:bg-gray-700 dark:text-white file:text-gray-700 dark:file:text-gray-300"
          />
        </div>
      ) : (
        <Card className="border-deepgram-teal/20 bg-deepgram-teal-light/50 dark:border-deepgram-teal/30 dark:bg-deepgram-teal/5">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-900 dark:text-white flex items-center gap-2">
                <FileAudio className="h-4 w-4 text-deepgram-teal" />
                Uploaded Audio File
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearUploadedFile}
                className="text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{uploadedFile.file.name}</p>
              <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-300">
                <span>{(uploadedFile.file.size / 1024 / 1024).toFixed(2)} MB</span>
                <span>Uploaded {uploadedFile.uploadedAt.toLocaleTimeString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {uploadedFile && (
        <>
          <Separator />

          {/* Transcription Configuration */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-deepgram-teal" />
              <Label className="text-sm font-medium dark:text-gray-200">Transcription Configuration</Label>
            </div>

            {/* Streaming/Batch Toggle */}
            <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg dark:border-gray-600">
              <div className="space-y-1">
                <Label className="text-sm font-medium dark:text-gray-200">Processing Mode</Label>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {isStreaming ? "Streaming: Real-time processing" : "Batch: File-based processing"}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn("text-sm", !isStreaming ? "text-gray-500" : "text-deepgram-teal font-medium")}>
                  Streaming
                </span>
                <Switch
                  checked={!isStreaming}
                  onCheckedChange={(checked) => setIsStreaming(!checked)}
                  className="data-[state=checked]:bg-deepgram-teal"
                />
                <span className={cn("text-sm", isStreaming ? "text-gray-500" : "text-deepgram-teal font-medium")}>
                  Batch
                </span>
              </div>
            </div>

            {/* Parameters */}
            <div className="space-y-2">
              <Label htmlFor="parameters" className="dark:text-gray-200">
                API Parameters (Optional)
              </Label>
              <Textarea
                id="parameters"
                placeholder='Enter as JSON: {"model": "nova-2", "language": "en"} or query string: model=nova-2&language=en'
                value={parameters}
                onChange={(e) => setParameters(e.target.value)}
                rows={3}
                className="border-gray-200 focus:border-deepgram-teal focus:ring-deepgram-teal dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 text-sm font-mono"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Supports JSON format or query string format. Leave empty for default settings.
              </p>
            </div>

            {error && (
              <Alert variant="destructive" className="dark:border-red-800 dark:bg-red-900/20">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="dark:text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <Button
              onClick={transcribeAudio}
              disabled={!uploadedFile || !apiKey.trim() || isTranscribing}
              className="w-full flex items-center gap-2 bg-deepgram-teal hover:bg-deepgram-teal/90 text-white font-medium disabled:opacity-50"
            >
              {isTranscribing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Transcribing...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Transcribe with {isStreaming ? "Streaming" : "Batch"} Mode
                </>
              )}
            </Button>
          </div>

          {/* Transcription History */}
          {transcriptionHistory.length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <Label className="text-sm font-medium dark:text-gray-200 flex items-center gap-2">
                  <FileAudio className="h-4 w-4 text-deepgram-teal" />
                  Transcription History ({transcriptionHistory.length})
                </Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {transcriptionHistory.map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 border border-gray-200 rounded-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {entry.textSetName}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {entry.isStreaming ? "Streaming" : "Batch"}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                        <span className="font-mono bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded">
                          {entry.parameters}
                        </span>
                        <span>{entry.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
