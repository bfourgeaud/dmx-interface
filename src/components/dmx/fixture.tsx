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
import { CHANNEL_TYPES } from "@/lib/constants"
import { ChannelType, DmxFixture } from "@/types/dmx"
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

export function AddFixtureButton({
  onSuccess,
  variant = "outline",
  size = "icon",
  children,
  ...props
}: ComponentProps<typeof Button> & {
  onSuccess?: () => void
}) {
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
    onSuccess?.()
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
            <FixtureUpdateTrigger variant="ghost" size="icon" fixture={fixture}>
              <Settings2Icon />
            </FixtureUpdateTrigger>
            <Button
              variant="ghost"
              size="icon"
              className="text-destructive hover:text-destructive"
              onClick={() => project.fixtures.delete(fixture.id)}
            >
              <Trash2Icon />
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

export function FixtureUpdateTrigger({
  children,
  variant = "ghost",
  size = "icon",
  fixture,
  ...props
}: ComponentProps<typeof Button> & { fixture: DmxFixture }) {
  const project = useProject()
  const [open, setOpen] = useState(false)
  const [tempFixture, setTempFixture] = useState<DmxFixture>(fixture)

  const handleSave = () => {
    project.fixtures.update(tempFixture)
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} {...props}>
          {children || <Settings2Icon />}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Éditer {fixture.name}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name">Nom</Label>
            <Input
              id="name"
              className="col-span-3"
              value={tempFixture.name}
              onChange={(e) =>
                setTempFixture({ ...tempFixture, name: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="address">Adresse DMX</Label>
            <Input
              id="address"
              type="number"
              className="col-span-3"
              value={tempFixture.startAddress}
              onChange={(e) =>
                setTempFixture({
                  ...tempFixture,
                  startAddress: parseInt(e.target.value),
                })
              }
            />
          </div>

          <div className="mt-4">
            <h4 className="mb-2 font-medium border-b pb-1">
              Configuration des canaux
            </h4>
            <div className="space-y-3">
              {tempFixture.channels.map((channel, index) => (
                <div
                  key={channel.id}
                  className="grid grid-cols-12 gap-2 items-center bg-muted/30 p-2 rounded-md"
                >
                  <span className="col-span-1 text-xs font-mono text-muted-foreground">
                    #{channel.number + 1}
                  </span>
                  <Select
                    value={channel.type}
                    onValueChange={(val: ChannelType) => {
                      const newChannels = [...tempFixture.channels]
                      newChannels[index].type = val
                      setTempFixture({ ...tempFixture, channels: newChannels })
                    }}
                  >
                    <SelectTrigger className="col-span-6 h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(CHANNEL_TYPES).map(([key, label]) => (
                        <SelectItem key={key} value={key}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer les modifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
