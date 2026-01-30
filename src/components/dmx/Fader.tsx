import { useDmx } from "@/context/DMXContext"
import { cn } from "@/lib/utils"
import { ComponentProps, createContext, useContext } from "react"
import { NumberInput } from "../ui/number-input"
import { Slider } from "../ui/slider"

const FaderContext = createContext<{
  value: number
  setValue: (val: number) => void
} | null>(null)

function useFaderContext() {
  const ctx = useContext(FaderContext)
  if (!ctx) throw new Error("Fader sub-components must be used within DMXFader")
  return ctx
}

interface DMXFaderProps extends React.ComponentProps<"div"> {
  address: number
  initialValue?: number
}

export function DMXFader({
  address,
  initialValue = 0,
  className,
  ...props
}: DMXFaderProps) {
  const { value, setValue } = useDmx(address)

  return (
    <FaderContext.Provider value={{ value, setValue }}>
      <div
        className={cn(
          "px-2 py-1 border w-fit flex flex-col items-center",
          className,
        )}
        {...props}
        data-slot="dmx-fader"
      />
    </FaderContext.Provider>
  )
}

export function DMXFaderLabel({ className, ...props }: ComponentProps<"span">) {
  return (
    <span
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export function DMXFaderValue() {
  const { value, setValue } = useFaderContext()

  return (
    <NumberInput
      min={0}
      max={255}
      value={value}
      onChange={(val) => setValue(val ?? 0)}
      className="w-16"
    />
  )
}

export function DMXFaderSlider() {
  const { value, setValue } = useFaderContext()

  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-muted-foreground text-sm">255</span>
      <Slider
        min={0}
        max={255}
        orientation="vertical"
        value={[value]}
        onValueChange={(vals) => setValue(vals.at(0) ?? 0)}
      />
      <span className="text-muted-foreground text-sm">0</span>
    </div>
  )
}
