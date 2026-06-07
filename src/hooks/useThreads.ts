import { useState, useEffect, useCallback } from 'react'
import { v4 as uuidv4 } from 'uuid'
import type { ThreadPost } from '@/types'

const STORAGE_KEY = 'vestori:threads'

function load(): ThreadPost[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

export function useThreads() {
  const [posts, setPosts] = useState<ThreadPost[]>(load)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(posts)) } catch {}
  }, [posts])

  const addPost = useCallback((entryId: string, text: string, imageIds: string[] = []) => {
    const post: ThreadPost = {
      id: uuidv4(), entryId, text, imageIds,
      createdAt: new Date().toISOString(),
    }
    setPosts(prev => [...prev, post])
    return post.id
  }, [])

  const deletePost = useCallback((id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id))
  }, [])

  const getByEntry = useCallback((entryId: string): ThreadPost[] => {
    return posts
      .filter(p => p.entryId === entryId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
  }, [posts])

  return { posts, addPost, deletePost, getByEntry }
}
