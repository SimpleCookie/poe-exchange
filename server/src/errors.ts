export class ApiError extends Error {
  public readonly status: number
  public readonly payload: unknown

  constructor(status: number, message: string, payload: unknown = null) {
    super(message)
    this.status = status
    this.payload = payload
  }
}
