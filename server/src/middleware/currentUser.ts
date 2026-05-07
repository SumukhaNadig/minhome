import { Request, Response, NextFunction } from 'express'

export type CurrentUser = { email: string; name: string }

declare global {
  namespace Express {
    interface Request {
      currentUser: CurrentUser
    }
  }
}

const DEFAULT_USER: CurrentUser = {
  email: 'jane.coordinator@minhome.test',
  name: 'Jane Coordinator',
}

export function currentUser(req: Request, _res: Response, next: NextFunction) {
  const headerEmail = req.header('x-current-user')?.trim()
  if (headerEmail) {
    req.currentUser = { email: headerEmail, name: deriveName(headerEmail) }
  } else {
    req.currentUser = DEFAULT_USER
  }
  next()
}

function deriveName(email: string): string {
  const local = email.split('@')[0]
  return local
    .split(/[.\-_]/)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')
}
