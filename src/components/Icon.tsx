interface IconProps { size?: number; className?: string }

const props = (size = 16, className = '') => ({
  width: size, height: size, viewBox: '0 0 16 16', fill: 'none',
  stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const,
  className,
})

export const IconMapPin = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8 4.5 8s4.5-4.5 4.5-8c0-2.5-2-4.5-4.5-4.5z"/>
    <circle cx="8" cy="6" r="1.5"/>
  </svg>
)

export const IconClock = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <circle cx="8" cy="8" r="6"/>
    <path d="M8 5v3l2 1.5"/>
  </svg>
)

export const IconStar = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M8 2l1.5 3.5 3.5.5-2.5 2.5.5 3.5L8 10.5 5 12l.5-3.5L3 6l3.5-.5z"/>
  </svg>
)

export const IconSearch = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <circle cx="7" cy="7" r="4.5"/>
    <path d="M10.5 10.5L14 14"/>
  </svg>
)

export const IconX = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M3 3l10 10M13 3L3 13"/>
  </svg>
)

export const IconExternalLink = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9"/>
  </svg>
)

export const IconChevronLeft = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M10 3L5 8l5 5"/>
  </svg>
)

export const IconChevronRight = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M6 3l5 5-5 5"/>
  </svg>
)

export const IconChevronDown = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M3 6l5 5 5-5"/>
  </svg>
)

export const IconChevronUp = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M3 10l5-5 5 5"/>
  </svg>
)

export const IconPlus = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M8 3v10M3 8h10"/>
  </svg>
)

export const IconArrowUp = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M8 13V3M4 7l4-4 4 4"/>
  </svg>
)

export const IconArrowDown = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M8 3v10M4 9l4 4 4-4"/>
  </svg>
)

export const IconPackage = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M2 5l6-3 6 3v6l-6 3-6-3V5z"/>
    <path d="M8 2v13M2 5l6 3 6-3"/>
  </svg>
)

export const IconFolder = ({ size = 16, className = '' }: IconProps) => (
  <svg {...props(size, className)}>
    <path d="M2 4a1 1 0 011-1h3l2 2h5a1 1 0 011 1v6a1 1 0 01-1 1H3a1 1 0 01-1-1V4z"/>
  </svg>
)
