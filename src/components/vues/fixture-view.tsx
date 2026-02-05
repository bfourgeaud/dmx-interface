import { useProject } from "@/context/ProjectContext"
import { CHANNEL_TYPES } from "@/lib/constants"
import { pluralString } from "@/lib/helpers/string"
import { ChannelType } from "@/types/dmx"
import { ChevronRightIcon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { AddFixtureButton } from "../dmx/fixture"
import { Button } from "../ui/button"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "../ui/empty"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
} from "../ui/field"
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "../ui/item"
import { NumberInput } from "../ui/number-input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"

export function FixtureView() {
  const { data, fixtures } = useProject()
  const [selectedFixture, setSelectedFixture] = useState(data.fixtures.at(0))

  if (data.fixtures.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Aucun fixture</EmptyTitle>
          <EmptyDescription>
            Vous devez d'abord ajouter un fixture.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <AddFixtureButton>Ajouter un fixture</AddFixtureButton>
        </EmptyContent>
      </Empty>
    )
  }

  return (
    <div className="size-full flex">
      <aside className="border-r p-2">
        <h2>Fixtures</h2>
        <ItemGroup>
          {data.fixtures.map((f) => (
            <Item
              key={f.id}
              onClick={() => setSelectedFixture(f)}
              className="cursor-pointer hover:bg-accent"
              size={"sm"}
            >
              <ItemMedia>
                <p>{`#${f.startAddress}`}</p>
              </ItemMedia>
              <ItemContent>
                <ItemTitle>{f.name}</ItemTitle>
                <ItemDescription>
                  {pluralString(f.channelCount, "canal", "canaux")}
                </ItemDescription>
              </ItemContent>
              <ItemActions>
                <ChevronRightIcon />
              </ItemActions>
            </Item>
          ))}
        </ItemGroup>
        <AddFixtureButton size={"default"}>
          <PlusIcon /> Ajouter un fixture
        </AddFixtureButton>
      </aside>
      <div className="p-2">
        {selectedFixture && (
          <FieldSet className="w-full max-w-md">
            <FieldLegend>{selectedFixture.name}</FieldLegend>
            <FieldDescription>
              Modifier les paramètres du fixture
            </FieldDescription>

            <FieldGroup>
              <Field>
                <FieldLabel>Adresse DMX</FieldLabel>
                <NumberInput
                  min={1}
                  max={512}
                  value={selectedFixture.startAddress}
                  onChange={(v) =>
                    setSelectedFixture({
                      ...selectedFixture,
                      startAddress: v ?? 0,
                    })
                  }
                />
              </Field>

              {selectedFixture.channels.map((c, idx) => (
                <FieldGroup key={c.id}>
                  <Field>
                    <FieldLabel>{`Canal ${idx + 1}`}</FieldLabel>
                    <Select
                      value={c.type}
                      onValueChange={(val: ChannelType) => {
                        setSelectedFixture({
                          ...selectedFixture,
                          channels: selectedFixture.channels.map((ch) =>
                            ch.id === c.id ? { ...ch, type: val } : ch,
                          ),
                        })
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {Object.entries(CHANNEL_TYPES).map(([key, label]) => (
                            <SelectItem key={key} value={key}>
                              {label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                </FieldGroup>
              ))}

              <Field orientation={"horizontal"}>
                <Button onClick={() => fixtures.update(selectedFixture)}>
                  Enregistrer
                </Button>
                <Button
                  variant={"outline"}
                  onClick={() =>
                    setSelectedFixture(
                      data.fixtures.find((f) => f.id === selectedFixture.id),
                    )
                  }
                >
                  Annuler
                </Button>
              </Field>
            </FieldGroup>
          </FieldSet>
        )}
      </div>
    </div>
  )
}
