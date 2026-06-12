import { useState, useEffect } from 'react'

const STORAGE_KEY = 'vestori:profile'

export interface Profile {
  nickname: string
  tagline: string       // 한 마디로 (좌우명 + 소개 통합)
  interests: string     // 관심사 / 취미
  yearlyGoal: string    // 올해의 목표
  currentFocus: string  // 지금 집중하는 것
}

function load(): Profile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? { nickname: '', tagline: '', interests: '', yearlyGoal: '', currentFocus: '', ...JSON.parse(raw) } : { nickname: '', tagline: '', interests: '', yearlyGoal: '', currentFocus: '' }
  } catch { return { nickname: '', tagline: '', interests: '', yearlyGoal: '', currentFocus: '' } }
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(load)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(profile)) } catch {}
  }, [profile])

  return {
    profile,
    update: (next: Partial<Profile>) => setProfile(prev => ({ ...prev, ...next })),
  }
}
