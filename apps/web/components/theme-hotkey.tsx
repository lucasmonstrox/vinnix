"use client"

import * as React from "react"
import { useTheme } from "next-themes"

const TYPING_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT"])

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  return target.isContentEditable || TYPING_TAGS.has(target.tagName)
}

function hasModifier(event: KeyboardEvent) {
  return event.metaKey || event.ctrlKey || event.altKey
}

function shouldIgnoreHotkey(event: KeyboardEvent) {
  return [
    event.defaultPrevented,
    event.repeat,
    hasModifier(event),
    event.key.toLowerCase() !== "d",
    isTypingTarget(event.target),
  ].some(Boolean)
}

function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (shouldIgnoreHotkey(event)) {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export { ThemeHotkey }
