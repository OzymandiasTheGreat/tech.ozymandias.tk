import { useEffect, useState } from "react"
import { usePathname } from "expo-router"
import matter from "gray-matter"
import { strings } from "@/i18n"
import { ERROR_404, SERVER_ERROR } from "@/lib/errors"

const FILENAME = /\/post\/([\w\-\.]+\.md)/i

export interface Post {
  data: {
    title: string
    slug: string
    author: string
    published: string
    edited?: string
    source?: string
  }
  content: string
}

const useFilename = (): string | null => {
  const pathname = usePathname()
  const match = pathname.match(FILENAME)
  if (!match) return null
  const filename = match[1]
  return filename
}

export const usePost = () => {
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const filename = useFilename()

  useEffect(() => {
    ;(async () => {
      setLoading(true)

      if (!filename) {
        setError(ERROR_404(strings))
        setPost(null)
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/content/posts/${filename}`)

        if (response.status !== 200) {
          if (response.status === 404) {
            setError(ERROR_404(strings))
          } else {
            setError(SERVER_ERROR(response.status, strings))
          }
          setPost(null)
          setLoading(false)
          return
        }

        const markdown = await response.text()
        const { data, content } = matter(markdown)

        setError(null)
        setPost({ data: data as Post["data"], content })
        setLoading(false)
      } catch (err: any) {
        setError(SERVER_ERROR(-1, strings, err))
        setPost(null)
        setLoading(false)
      }
    })()
  }, [filename, strings])

  return { ...post, loading, error }
}
