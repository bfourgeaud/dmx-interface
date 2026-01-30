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
import { PlusIcon, Settings2Icon } from "lucide-react"
import { useState } from "react"

import { Field, FieldGroup, FieldLabel, FieldSet } from "@/components/ui/field"
import { useProject } from "@/context/ProjectContext"
import { DmxFixture } from "@/types/dmx"
import {
  Card,
  CardAction,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card"

export function AddFixtureButton() {
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
        <Button variant="outline" size="icon">
          <PlusIcon className="h-4 w-4" />
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
  return (
    <Card>
      <CardHeader>
        <CardTitle>{fixture.name}</CardTitle>
        <CardDescription>{`Addr : ${fixture.startAddress} | Canaux : ${fixture.channelCount}`}</CardDescription>
        <CardAction>
          <Button variant="ghost" size={"icon"}>
            <Settings2Icon />
          </Button>
        </CardAction>
      </CardHeader>
    </Card>
  )
}
