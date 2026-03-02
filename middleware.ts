import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Toujours accessible
  if (pathname === '/login') return NextResponse.next()

  // Vérification du cookie de session (posé au login Firebase)
  const session = request.cookies.get('artvault-session')
  if (!session?.value) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
