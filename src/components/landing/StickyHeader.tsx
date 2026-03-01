'use client'

import { useState, useEffect, ReactNode } from 'react'

interface StickyHeaderProps {
  children: ReactNode
  className?: string
}

export function StickyHeader({ children, className = '' }: StickyHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    // Check initial scroll position
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`sticky-header ${isScrolled ? 'scrolled' : ''} ${className}`}
    >
      {children}
    </header>
  )
}
