import { PropsWithChildren } from "react"
import { AppFooter } from "./footer"
import { AppHeader } from "./header"

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-dvh w-full flex flex-col">
      <AppHeader />
      <main className="grow p-6">{children}</main>
      <AppFooter />
    </div>
  )
}
