import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { PlusIcon, Settings2Icon, Trash2Icon } from "lucide-react"
import { ComponentProps, useState } from "react"

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { useProject } from "@/context/ProjectContext"
import { DmxFixture } from "@/types/dmx"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"

export function AddFixtureButton({
  variant = "outline",
  size = "icon",
  children,
  ...props
}: ComponentProps<typeof Button>) {
  const project = useProject()
  const [open, setOpen] = useState(false)

  // État local du formulaire
  const [name, setName] = useState("")
  const [address, setAddress] = useState(1)
  const [count, setCount] = useState(1)

  const handleAdd = () => {
    if (!name) return

    project.fixtures.add({
      name: name,
      startAddress: address,
      channelCount: count,
    })

    // Reset et fermeture
    setName("")
    setAddress(address + count) // Auto-incrément pratique pour la suivante
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} {...props}>
          {children || <PlusIcon />}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-106.25">
        <DialogHeader>
          <DialogTitle>Ajouter un appareil (Fixture)</DialogTitle>
        </DialogHeader>

        <FieldSet>
          <Field>
            <FieldLabel htmlFor="name">Nom de l'appareil</FieldLabel>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ex: Lyre Wash 1"
            />
          </Field>

          <FieldGroup className="grid grid-cols-2 gap-4">
            <Field className="grid gap-2">
              <FieldLabel htmlFor="address">Adresse DMX (1-512)</FieldLabel>
              <Input
                id="address"
                type="number"
                min={1}
                max={512}
                value={address}
                onChange={(e) => setAddress(parseInt(e.target.value) || 1)}
              />
            </Field>
            <Field className="grid gap-2">
              <FieldLabel htmlFor="channels">Nombre de canaux</FieldLabel>
              <Input
                id="channels"
                type="number"
                min={1}
                max={512}
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              />
            </Field>
          </FieldGroup>
        </FieldSet>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleAdd} disabled={!name}>
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function FixtureCard({ fixture }: { fixture: DmxFixture }) {
  const project = useProject()
  return (
    <Card className="group relative overflow-hidden">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{fixture.name}</CardTitle>
            <p className="text-xs text-muted-foreground uppercase font-bold tracking-widest">
              DMX: {fixture.startAddress} —{" "}
              {fixture.startAddress + fixture.channelCount - 1}
            </p>
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings2Icon className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={() => project.fixtures.delete(fixture.id)}
            >
              <Trash2Icon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xs text-muted-foreground">
          {fixture.channelCount} canaux
        </div>
      </CardContent>
    </Card>
  )
}
