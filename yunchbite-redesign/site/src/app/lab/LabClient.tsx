"use client";
import { useRef, useState } from "react";
import { FilterPills } from "@/components/sections/FilterPills";
import { PillFaq, type PillFaqItem } from "@/components/sections/PillFaq";
import { RingBurst, type RingBurstHandle } from "@/components/motion/RingBurst";
import { FlavourBuddy, type FlavourBuddyHandle } from "@/components/product/FlavourBuddy";
import { Button } from "@/components/ui/ButtonLink";
import { useMenu } from "@/components/layout/MenuContext";
import { useCursorLabel } from "@/components/layout/CursorLabel";
import type { Flavour } from "@/data/types";

export function OpenMenuButton() {
  const { toggle } = useMenu();
  return (
    <Button onClick={toggle} variant="solid" data-testid="lab-open-menu">
      Open menu (also: header MENU)
    </Button>
  );
}

export function RingBurstDemo() {
  const ring = useRef<RingBurstHandle>(null);
  return (
    <div className="flex items-center gap-8">
      <div className="relative grid size-40 place-items-center">
        <div className="size-24 rounded-full bg-red" />
        <RingBurst ref={ring} color="#D61610" />
      </div>
      <Button variant="ghost" onClick={() => ring.current?.burst()}>
        Burst
      </Button>
    </div>
  );
}

export function FilterDemo() {
  const [v, setV] = useState("all");
  return (
    <div className="space-y-4">
      <FilterPills
        label="Filter by range"
        value={v}
        onChange={setV}
        options={[
          { value: "all", label: "All", count: 21 },
          { value: "makhana", label: "Makhana", count: 14 },
          { value: "popcorn", label: "Popcorn", count: 3 },
          { value: "dry-fruits", label: "Dry Fruits", count: 4 },
        ]}
      />
      <p className="text-sm">
        Selected: <strong data-testid="filter-value">{v}</strong>
      </p>
    </div>
  );
}

export function FaqDemo({ items }: { items: PillFaqItem[] }) {
  return <PillFaq items={items} />;
}

export function CursorDemo() {
  const handlers = useCursorLabel("Taste me →");
  return (
    <div {...handlers} className="grid h-40 place-items-center rounded-card bg-yellow text-lg font-bold" tabIndex={-1}>
      Hover here (fine pointer): the label trails the cursor
    </div>
  );
}

export function BuddyDemo({ flavours }: { flavours: Pick<Flavour, "key" | "name" | "ingredient" | "color">[] }) {
  const refs = useRef<Record<string, FlavourBuddyHandle | null>>({});
  return (
    <ul className="grid grid-cols-2 gap-6 sm:grid-cols-4 lg:grid-cols-7">
      {flavours.map((f) => (
        <li key={f.key} className="flex flex-col items-center gap-2 text-center">
          <div className="grid aspect-square w-full place-items-end rounded-card p-3" style={{ background: f.color }}>
            <FlavourBuddy
              flavour={f}
              width="70%"
              ref={(h) => {
                refs.current[f.key] = h;
              }}
              className="mx-auto"
            />
          </div>
          <span className="text-sm font-semibold">{f.name}</span>
          <Button size="sm" variant="ghost" onClick={() => refs.current[f.key]?.pop()}>
            Pop
          </Button>
        </li>
      ))}
    </ul>
  );
}
