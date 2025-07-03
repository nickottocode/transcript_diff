"use client"

import { useState } from "react"
import { ChevronRight, Home, HelpCircle, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

const sidebarItems = [
  { icon: Home, label: "Home", active: true },
  { icon: HelpCircle, label: "Support" },
  { icon: FileText, label: "Changelog" },
]

const sidebarSections = [
  {
    title: "Trust & Security",
    items: ["Security Policy", "Data Privacy Compliance", "Information Security & Privacy"],
  },
  {
    title: "Features",
    items: ["Text Comparison", "Audio Transcription", "Diff Visualization"],
  },
  {
    title: "Guides",
    items: ["Getting Started", "Best Practices", "Use Cases", "Integrations"],
  },
]

export function Sidebar() {
  const [expandedSections, setExpandedSections] = useState<string[]>(["Features"])

  const toggleSection = (title: string) => {
    setExpandedSections((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen overflow-y-auto dark:bg-gray-900 dark:border-gray-800">
      <div className="p-6">
        <nav className="space-y-1">
          {sidebarItems.map((item) => (
            <a
              key={item.label}
              href="#"
              className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm rounded-md transition-colors",
                item.active
                  ? "bg-deepgram-teal-light text-deepgram-teal font-medium dark:bg-deepgram-teal/20"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </a>
          ))}
        </nav>

        <div className="mt-8 space-y-4">
          {sidebarSections.map((section) => (
            <div key={section.title}>
              <button
                onClick={() => toggleSection(section.title)}
                className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-50 rounded-md dark:text-white dark:hover:bg-gray-800"
              >
                {section.title}
                <ChevronRight
                  className={cn(
                    "h-4 w-4 transition-transform text-gray-500 dark:text-gray-400",
                    expandedSections.includes(section.title) && "rotate-90",
                  )}
                />
              </button>
              {expandedSections.includes(section.title) && (
                <div className="mt-1 space-y-1">
                  {section.items.map((item) => (
                    <a
                      key={item}
                      href="#"
                      className="block px-6 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md dark:text-gray-300 dark:hover:text-white dark:hover:bg-gray-800"
                    >
                      {item}
                    </a>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
