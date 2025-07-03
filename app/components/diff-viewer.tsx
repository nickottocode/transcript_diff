"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GitCompare, FileText, Crown, Info, Maximize, Minimize } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import type { TextSet } from "../page"
import { Button } from "@/components/ui/button"

interface DiffViewerProps {
  textSets: TextSet[]
  groupName: string
}

interface DiffResult {
  type: "equal" | "insert" | "delete"
  content: string
}

// Simple word-based diff algorithm
const generateDiff = (baseText: string, compareText: string): DiffResult[] => {
  const baseWords = baseText.split(/\s+/)
  const compareWords = compareText.split(/\s+/)
  const results: DiffResult[] = []

  let i = 0,
    j = 0

  while (i < baseWords.length || j < compareWords.length) {
    if (i >= baseWords.length) {
      // Remaining words in compareText are insertions
      results.push({ type: "insert", content: compareWords[j] })
      j++
    } else if (j >= compareWords.length) {
      // Remaining words in baseText are deletions
      results.push({ type: "delete", content: baseWords[i] })
      i++
    } else if (baseWords[i] === compareWords[j]) {
      // Words match
      results.push({ type: "equal", content: baseWords[i] })
      i++
      j++
    } else {
      // Look ahead to find matches
      let found = false
      for (let k = j + 1; k < Math.min(j + 5, compareWords.length); k++) {
        if (baseWords[i] === compareWords[k]) {
          // Insert words from compareText
          for (let l = j; l < k; l++) {
            results.push({ type: "insert", content: compareWords[l] })
          }
          results.push({ type: "equal", content: baseWords[i] })
          i++
          j = k + 1
          found = true
          break
        }
      }

      if (!found) {
        for (let k = i + 1; k < Math.min(i + 5, baseWords.length); k++) {
          if (baseWords[k] === compareWords[j]) {
            // Delete words from baseText
            for (let l = i; l < k; l++) {
              results.push({ type: "delete", content: baseWords[l] })
            }
            results.push({ type: "equal", content: baseWords[k] })
            i = k + 1
            j++
            found = true
            break
          }
        }
      }

      if (!found) {
        // No match found, treat as substitution
        results.push({ type: "delete", content: baseWords[i] })
        results.push({ type: "insert", content: compareWords[j] })
        i++
        j++
      }
    }
  }

  return results
}

export function DiffViewer({ textSets, groupName }: DiffViewerProps) {
  // Toggle to determine whether punctuation should be considered when computing diffs
  const [ignorePunctuation, setIgnorePunctuation] = useState(false)
  const [showDiff, setShowDiff] = useState(true)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const diffResults = useMemo(() => {
    // Helper to optionally lowercase & strip punctuation
    const preprocess = (text: string) =>
      ignorePunctuation ? text.toLowerCase().replace(/[^\w\s]|_/g, "") : text

    if (textSets.length === 0) return null

    if (textSets.length === 1) {
      return {
        baseText: textSets[0],
        comparisons: [],
      }
    }

    const baseText = textSets[0]
    const baseProcessed = preprocess(baseText.content)
    const comparisons = textSets.slice(1).map((textSet) => {
      const diff = showDiff ? generateDiff(baseProcessed, preprocess(textSet.content)) : []
      return {
        textSet,
        diff,
      }
    })

    return {
      baseText,
      comparisons,
    }
  }, [textSets, ignorePunctuation, showDiff])

  if (textSets.length === 0) {
    return (
      <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
            <GitCompare className="h-5 w-5 text-deepgram-teal" />
            Diff Viewer - {groupName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <GitCompare className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Select text sets from {groupName} to view differences
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!diffResults) return null

  return (
    <div
      className={cn(
        isFullScreen &&
          "fixed inset-0 z-50 overflow-y-auto p-4 bg-white dark:bg-gray-900"
      )}
    >
      <Card className="border-gray-200 shadow-sm dark:border-gray-800 dark:bg-gray-800 max-w-none">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                <GitCompare className="h-5 w-5 text-deepgram-teal" />
                Individual Text Comparison
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFullScreen((prev) => !prev)}
              className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
            >
              {isFullScreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>

          {/* Punctuation Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <span className={cn("text-sm", !ignorePunctuation ? "text-deepgram-teal font-medium" : "text-gray-500")}>With Punctuation</span>
            <Switch
              checked={ignorePunctuation}
              onCheckedChange={setIgnorePunctuation}
              className="data-[state=checked]:bg-deepgram-teal"
            />
            <span className={cn("text-sm", ignorePunctuation ? "text-deepgram-teal font-medium" : "text-gray-500")}>Without Punctuation</span>
          </div>

          {/* Diff Mode Toggle */}
          <div className="flex items-center gap-3 pt-2">
            <span className={cn("text-sm", showDiff ? "text-deepgram-teal font-medium" : "text-gray-500")}>Diff On</span>
            <Switch
              checked={!showDiff}
              onCheckedChange={(checked) => setShowDiff(!checked)}
              className="data-[state=checked]:bg-deepgram-teal"
            />
            <span className={cn("text-sm", !showDiff ? "text-deepgram-teal font-medium" : "text-gray-500")}>Diff Off</span>
          </div>

          {textSets.length > 1 && (
            <Alert className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                All comparisons are shown relative to the <strong>base text set</strong> (first in the list).
              </AlertDescription>
            </Alert>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {/* Base Text Set */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Base Text Set</h3>
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  {diffResults.baseText.source}
                </Badge>
              </div>
              <h4 className="font-medium text-gray-900 dark:text-white">{diffResults.baseText.name}</h4>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/10 dark:border-amber-800/30">
                <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100 leading-relaxed">
                  {diffResults.baseText.content}
                </p>
              </div>
            </div>

            {/* Comparison Text Sets */}
            {diffResults.comparisons.map((comparison, index) => (
              <div key={comparison.textSet.id} className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-deepgram-teal" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Comparison {index + 1}</h3>
                  <Badge
                    variant="outline"
                    className="border-gray-200 text-gray-600 dark:border-gray-600 dark:text-gray-300"
                  >
                    {comparison.textSet.source}
                  </Badge>
                </div>
                <h4 className="font-medium text-gray-900 dark:text-white">{comparison.textSet.name}</h4>

                <div className="p-4 bg-white border border-gray-200 rounded-lg dark:bg-gray-700 dark:border-gray-600">
                  {showDiff ? (
                    <div className="text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                      {comparison.diff.map((part, partIndex) => (
                        <span
                          key={partIndex}
                          className={
                            part.type === "insert"
                              ? "bg-green-100 text-green-800 px-1 py-0.5 rounded dark:bg-green-900/30 dark:text-green-300"
                              : part.type === "delete"
                                ? "bg-red-100 text-red-800 px-1 py-0.5 rounded line-through dark:bg-red-900/30 dark:text-red-300"
                                : ""
                          }
                        >
                          {part.content}
                          {partIndex < comparison.diff.length - 1 ? " " : ""}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-900 dark:text-gray-100">
                      {comparison.textSet.content}
                    </p>
                  )}
                </div>

                {showDiff && (
                  <div className="flex gap-4 text-xs text-muted-foreground dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-green-200 rounded dark:bg-green-800"></div>
                      Added (vs base)
                    </span>
                    <span className="flex items-center gap-1">
                      <div className="w-3 h-3 bg-red-200 rounded dark:bg-red-800"></div>
                      Removed (vs base)
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
