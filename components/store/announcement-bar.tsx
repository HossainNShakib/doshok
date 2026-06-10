"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

type AnnouncementData = {
  text: string
  enabled: boolean
}

export function AnnouncementBar() {
  const [data, setData] = useState<AnnouncementData>({ text: "", enabled: false })

  useEffect(() => {
    fetch("/api/homepage")
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setData({
            text: d.data?.announcementBarText ?? "",
            enabled: d.data?.announcementBarEnabled ?? false,
          })
        }
      })
      .catch(() => {})
  }, [])

  if (!data.enabled || !data.text) return null

  return (
    <div className="bg-neutral-950 text-white py-2 px-4 text-center">
      <span className="text-xs font-medium tracking-wide">{data.text}</span>
    </div>
  )
}