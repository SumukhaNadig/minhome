export class HttpError extends Error {
  constructor(public status: number, message: string, public detail?: unknown) {
    super(message)
    this.name = 'HttpError'
  }
}

export class NotFoundError extends HttpError {
  constructor(resource: string, id?: string) {
    super(404, id ? `${resource} not found: ${id}` : `${resource} not found`)
    this.name = 'NotFoundError'
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, detail?: unknown) {
    super(400, message, detail)
    this.name = 'BadRequestError'
  }
}
