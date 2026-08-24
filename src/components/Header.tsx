'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const NAV = [
  { href: '/reviews', label: 'Reviews' },
  { href: '/interviews', label: 'Interviews' },
  { href: '/about', label: 'About' },
]

export const Header = () => {
  const pathname = usePathname()

  return (
    <header className="ph-header">
      <div className="ph-header__inner">
        <Link className="ph-wordmark" href="/">
          P4LEHORSE
        </Link>
        <nav aria-label="Primary">
          <ul className="ph-nav">
            {NAV.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href}>
                  <Link href={item.href} aria-current={active ? 'page' : undefined}>
                    {item.label}
                  </Link>
                </li>
              )
            })}
            <li>
              <Link href="/search" aria-label="Search">
                Search
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
