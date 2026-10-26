"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";

import {
  catalogHref,
  FLAVOURS,
  PRICE_SLIDER_MAX,
  SHAPES,
  type CatalogFilters,
  type Flavour,
  type Shape,
} from "../filters";

type Draft = { min: string; max: string; shape: Shape[]; flavour: Flavour[] };

function toDraft(filters: CatalogFilters): Draft {
  return {
    min: filters.min?.toString() ?? "",
    max: filters.max?.toString() ?? "",
    shape: filters.shape,
    flavour: filters.flavour,
  };
}

function parseDollars(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(Math.max(Math.round(number), 0), PRICE_SLIDER_MAX) : undefined;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

/** Figma "pop up" (node 98:1252): price, forms and flavour refinements. */
export function FilterDialog({ filters, activeCount }: { filters: CatalogFilters; activeCount: number }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => toDraft(filters));

  const min = parseDollars(draft.min);
  const max = parseDollars(draft.max);
  const rangeInvalid = min !== undefined && max !== undefined && min > max;

  function handleOpenChange(next: boolean) {
    if (next) setDraft(toDraft(filters)); // start from what is applied
    setOpen(next);
  }

  function apply() {
    if (rangeInvalid) return;
    router.push(
      catalogHref({
        category: filters.category,
        q: filters.q,
        min,
        max,
        shape: draft.shape,
        flavour: draft.flavour,
      }),
    );
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="lg" className="w-auto shrink-0 px-5 md:w-[180px] md:px-[50px]" />
        }
      >
        <SlidersHorizontal aria-hidden className="size-7" strokeWidth={1.5} />
        <span className="hidden md:inline">Filter</span>
        <span className="sr-only md:hidden">Filter</span>
        {activeCount > 0 && (
          <span className="grid min-w-6 place-items-center rounded-full bg-lilac-800 px-1.5 text-caption text-white">
            {activeCount}
          </span>
        )}
      </DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="max-h-[calc(100dvh-2rem)] gap-0 overflow-y-auto rounded-[24px] bg-white p-6 text-black-500 ring-0 sm:max-w-[1015px] md:p-[60px]"
      >
        <div className="flex items-start justify-between gap-6">
          <div className="flex flex-col gap-1">
            <DialogTitle className="text-h1 font-extrabold">Type of cakes</DialogTitle>
            <DialogDescription className="text-body1 text-black-500">
              Explore cakes, pastries, and all types of delicious treats for your cravings.
            </DialogDescription>
          </div>
          <DialogClose className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full outline-none hover:bg-lilac-100 focus-visible:ring-3 focus-visible:ring-ring/60">
            <X aria-hidden className="size-7" strokeWidth={1.5} />
            <span className="sr-only">Close</span>
          </DialogClose>
        </div>

        <fieldset className="mt-10">
          <legend className="text-h3 font-extrabold">Price</legend>
          <div className="mt-2 px-1">
            <p className="mb-2 text-center text-body1" aria-live="polite">
              {min ?? 0}$ – {max === undefined ? `${PRICE_SLIDER_MAX}+` : `${max}$`}
            </p>
            <Slider
              min={0}
              max={PRICE_SLIDER_MAX}
              step={5}
              value={[min ?? 0, max ?? PRICE_SLIDER_MAX]}
              onValueChange={(value) => {
                const [low, high] = value as number[];
                setDraft((d) => ({
                  ...d,
                  min: low > 0 ? String(low) : "",
                  max: high < PRICE_SLIDER_MAX ? String(high) : "",
                }));
              }}
              aria-label="Price range"
            />
            <div className="mt-1 flex justify-between text-body1">
              <span>0</span>
              <span>{PRICE_SLIDER_MAX}+</span>
            </div>
          </div>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 sm:gap-[100px]">
            <label className="block">
              <span className="sr-only">Minimum price in dollars</span>
              <input
                inputMode="numeric"
                placeholder="min"
                value={draft.min}
                onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value.replace(/\D/g, "") }))}
                aria-invalid={rangeInvalid || undefined}
                className="h-16 w-full rounded-pill border border-black-500 px-5 text-body1 outline-none placeholder:text-black-500 focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              />
            </label>
            <label className="block">
              <span className="sr-only">Maximum price in dollars</span>
              <input
                inputMode="numeric"
                placeholder="max"
                value={draft.max}
                onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value.replace(/\D/g, "") }))}
                aria-invalid={rangeInvalid || undefined}
                className="h-16 w-full rounded-pill border border-black-500 px-5 text-body1 outline-none placeholder:text-black-500 focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive"
              />
            </label>
          </div>
          {rangeInvalid && (
            <p role="alert" className="mt-2 text-body2 text-destructive">
              The minimum price can’t be higher than the maximum.
            </p>
          )}
        </fieldset>

        <fieldset className="mt-10">
          <legend className="text-h3 font-extrabold">Forms</legend>
          <div className="mt-5 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-10">
            {SHAPES.map((shape) => {
              const selected = draft.shape.includes(shape.value);
              return (
                <button
                  key={shape.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDraft((d) => ({ ...d, shape: toggle(d.shape, shape.value) }))}
                  className={cn(
                    "h-16 cursor-pointer rounded-pill border px-4 text-body1 outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected
                      ? "border-2 border-lilac-700 text-lilac-900"
                      : "border-black-500 text-black-500 hover:bg-lilac-50",
                  )}
                >
                  {shape.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <fieldset className="mt-10">
          <legend className="text-h3 font-extrabold">Flavour</legend>
          <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3 md:grid-cols-5">
            {FLAVOURS.map((flavour) => (
              <label key={flavour.value} className="flex cursor-pointer items-center gap-1 text-body1">
                <Checkbox
                  checked={draft.flavour.includes(flavour.value)}
                  onCheckedChange={() =>
                    setDraft((d) => ({ ...d, flavour: toggle(d.flavour, flavour.value) }))
                  }
                />
                {flavour.label}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="mt-10 flex items-center justify-end gap-6 md:gap-12">
          <Button
            variant="link"
            size="lg"
            className="px-0"
            onClick={() => setDraft({ min: "", max: "", shape: [], flavour: [] })}
          >
            Reset all
          </Button>
          <Button variant="strong" size="lg" onClick={apply} disabled={rangeInvalid}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
