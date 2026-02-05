import { PropsWithChildren } from "react"
import { AppFooter } from "./footer"
import { AppHeader } from "./header"

export function AppLayout({ children }: PropsWithChildren) {
  return (
    <div className="h-dvh w-full flex flex-col overflow-hidden">
      <AppHeader />
      <main className="grow p-6 overflow-y-auto">{children}</main>
      <AppFooter />
    </div>
  )
}
