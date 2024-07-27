import type { Strings } from "@/i18n"

export const ERROR_404 = (strings: Strings) => {
  const err = new Error(strings.err404.message)
  err.code = 404
  return err
}

export const SERVER_ERROR = (code: number, strings: Strings, cause?: Error) => {
  const err = new Error(strings.errServer.replace("$1", `${code}`), { cause })
  err.code = code
  return err
}
