import { cn } from '@/lib/utils'

describe('cn utility function', () => {
  it('merges class names correctly', () => {
    const result = cn('class1', 'class2')
    expect(result).toBe('class1 class2')
  })

  it('handles conditional classes', () => {
    const isActive = true
    const result = cn('base', isActive && 'active')
    expect(result).toBe('base active')
  })

  it('filters out falsy values', () => {
    const result = cn('base', false, null, undefined, '', 'valid')
    expect(result).toBe('base valid')
  })

  it('handles empty input', () => {
    const result = cn()
    expect(result).toBe('')
  })

  it('handles single class', () => {
    const result = cn('single')
    expect(result).toBe('single')
  })

  it('merges Tailwind classes correctly', () => {
    // tailwind-merge should resolve conflicting classes
    const result = cn('px-2', 'px-4')
    expect(result).toBe('px-4')
  })

  it('merges conflicting width classes', () => {
    const result = cn('w-4', 'w-8')
    expect(result).toBe('w-8')
  })

  it('merges conflicting text color classes', () => {
    const result = cn('text-red-500', 'text-blue-500')
    expect(result).toBe('text-blue-500')
  })

  it('merges conflicting background classes', () => {
    const result = cn('bg-white', 'bg-gray-100')
    expect(result).toBe('bg-gray-100')
  })

  it('preserves non-conflicting classes', () => {
    const result = cn('px-4', 'py-2', 'text-lg', 'font-bold')
    expect(result).toBe('px-4 py-2 text-lg font-bold')
  })

  it('handles array of classes', () => {
    const result = cn(['class1', 'class2'])
    expect(result).toBe('class1 class2')
  })

  it('handles object syntax for conditional classes', () => {
    const result = cn({
      'base-class': true,
      'active-class': true,
      'disabled-class': false,
    })
    expect(result).toBe('base-class active-class')
  })

  it('handles mixed input types', () => {
    const isHover = true
    const result = cn(
      'base',
      ['array-class'],
      { 'object-class': true },
      isHover && 'hover-class'
    )
    expect(result).toBe('base array-class object-class hover-class')
  })

  it('handles complex Tailwind merging scenarios', () => {
    // More specific class should win
    const result = cn('text-sm', 'text-lg', 'hover:text-xl')
    expect(result).toBe('text-lg hover:text-xl')
  })

  it('handles margin class conflicts', () => {
    const result = cn('m-2', 'm-4')
    expect(result).toBe('m-4')
  })

  it('handles padding class conflicts', () => {
    const result = cn('p-2', 'p-6')
    expect(result).toBe('p-6')
  })

  it('handles flex classes correctly', () => {
    const result = cn('flex', 'flex-col', 'items-center', 'justify-between')
    expect(result).toBe('flex flex-col items-center justify-between')
  })

  it('handles border radius conflicts', () => {
    const result = cn('rounded', 'rounded-lg')
    expect(result).toBe('rounded-lg')
  })

  it('handles responsive class variants', () => {
    const result = cn('md:text-sm', 'lg:text-lg', 'text-base')
    expect(result).toBe('md:text-sm lg:text-lg text-base')
  })

  it('handles hover state variants', () => {
    const result = cn('hover:bg-blue-500', 'bg-blue-400')
    expect(result).toBe('hover:bg-blue-500 bg-blue-400')
  })

  it('handles focus state variants', () => {
    const result = cn('focus:ring-2', 'focus:ring-blue-500', 'focus:outline-none')
    expect(result).toBe('focus:ring-2 focus:ring-blue-500 focus:outline-none')
  })
})
