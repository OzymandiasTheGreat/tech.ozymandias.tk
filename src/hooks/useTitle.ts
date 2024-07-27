import { createContext, useContext } from "react"

export const TitleContext = createContext<string>("")
export const UpdateTitleContext = createContext<(title: string) => void>(() => {})

export const useTitle = (): [string, (title: string) => void] => {
  const title = useContext(TitleContext)
  const update = useContext(UpdateTitleContext)
  return [title, update]
}
