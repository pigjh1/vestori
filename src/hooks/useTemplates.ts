import { useState } from 'react'

export interface Template {
  id: string
  label: string
  emoji: string
  text: string
  tags: string[]
}

export const BUILTIN_TEMPLATES: Template[] = [
  {
    id: 'movie', label: '영화 감상', emoji: '🎬',
    text: '제목: \n장르: \n한 줄 감상: \n\n기억에 남는 장면:\n\n별점: /5',
    tags: ['영화']
  },
  {
    id: 'book', label: '독서', emoji: '📖',
    text: '책 제목: \n저자: \n\n인상 깊은 구절:\n\n느낀 점:\n\n별점: /5',
    tags: ['독서']
  },
  {
    id: 'travel', label: '여행', emoji: '✈️',
    text: '장소: \n\n오늘의 하이라이트:\n\n먹은 것:\n\n다음에 또 오고 싶은 이유:',
    tags: ['여행']
  },
  {
    id: 'meeting', label: '미팅 / 대화', emoji: '💬',
    text: '상대: \n\n주요 내용:\n\n느낀 점:\n\n다음 할 일:',
    tags: []
  },
  {
    id: 'daily', label: '하루 마무리', emoji: '🌙',
    text: '오늘 잘한 것:\n\n아쉬운 점:\n\n내일 할 것:',
    tags: []
  },
  {
    id: 'idea', label: '아이디어', emoji: '💡',
    text: '아이디어:\n\n배경:\n\n실행 방법:\n\n예상 결과:',
    tags: ['아이디어']
  },
]

export function useTemplates() {
  const [selected, setSelected] = useState<Template | null>(null)
  return { templates: BUILTIN_TEMPLATES, selected, setSelected, clear: () => setSelected(null) }
}
