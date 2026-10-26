"use client";

import Image from "next/image";
import { useId, useState, type KeyboardEvent } from "react";
import { Rotate3d } from "lucide-react";

import { Button } from "@/components/ui/button";
import { addCustomCakeToBasket } from "@/features/basket/actions";
import { useBasketAction } from "@/features/basket/use-add-to-basket";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  CAKE_TEXT_MAX,
  DEFAULT_DESIGN,
  DESIGNER_GROUPS,
  designerPrice,
  type DesignerGroupKey,
  type DesignerOptions,
} from "../options";

type TabKey = DesignerGroupKey | "text";
const TABS: { key: TabKey; label: string }[] = [
  ...DESIGNER_GROUPS.map((group) => ({ key: group.key, label: group.label })),
  { key: "text", label: "text" },
];

export function CakeDesigner({ initial, editLineId }: { initial?: DesignerOptions; editLineId?: string }) {
  const [options, setOptions] = useState<DesignerOptions>(initial ?? DEFAULT_DESIGN);
  const [tab, setTab] = useState<TabKey>("cream");
  const [flipped, setFlipped] = useState(false);
  const { pending, run } = useBasketAction();
  const baseId = useId();

  const group = DESIGNER_GROUPS.find((g) => g.key === tab);

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const delta = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta) return;
    event.preventDefault();
    const next = TABS[(index + delta + TABS.length) % TABS.length];
    setTab(next.key);
    document.getElementById(`${baseId}-tab-${next.key}`)?.focus();
  }

  return (
    <div className="flex flex-col">
      {/* Preview (Figma Rectangle 2, 1180x496) */}
      <div className="relative aspect-[1180/496] min-h-[240px] w-full overflow-hidden bg-[#8fb3d3] [perspective:1200px]">
        <div
          className={cn(
            "absolute inset-0 transition-transform duration-700 ease-in-out motion-reduce:transition-none",
            flipped && "[transform:rotateY(180deg)]",
          )}
        >
          <Image
            src="/images/design-preview.png"
            alt="Preview of your cake"
            fill
            priority
            sizes="(min-width: 1220px) 1180px, 100vw"
            className="object-cover"
          />
        </div>
        <button
          type="button"
          onClick={() => setFlipped((value) => !value)}
          aria-pressed={flipped}
          className="absolute bottom-[29px] left-1/2 inline-flex -translate-x-1/2 cursor-pointer items-center gap-2 rounded-pill bg-white px-5 py-2.5 text-body1 text-black-500 outline-none hover:bg-lilac-50 focus-visible:ring-3 focus-visible:ring-ring"
        >
          <Rotate3d aria-hidden className="size-6" strokeWidth={1.5} />
          Flip the cake
        </button>
      </div>

      {/* Option tabs (Figma Frame 10) */}
      <div
        role="tablist"
        aria-label="Cake options"
        className="scrollbar-none mt-[30px] flex overflow-x-auto border-b border-black-500 md:justify-center"
      >
        {TABS.map((item, index) => {
          const selected = item.key === tab;
          return (
            <button
              key={item.key}
              id={`${baseId}-tab-${item.key}`}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`${baseId}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setTab(item.key)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={cn(
                "relative shrink-0 cursor-pointer px-6 pb-[2px] text-h3 whitespace-nowrap text-black-500 outline-none focus-visible:ring-3 focus-visible:ring-ring/60 md:px-[56px]",
                selected ? "font-extrabold" : "font-normal hover:text-lilac-900",
                index > 0 && "before:absolute before:top-0 before:left-0 before:h-[34px] before:w-px before:bg-grey-300",
              )}
            >
              <span className="block py-[3px]">{item.label}</span>
            </button>
          );
        })}
      </div>

      <div id={`${baseId}-panel`} role="tabpanel" aria-labelledby={`${baseId}-tab-${tab}`} className="mt-8">
        {group ? (
          <div role="radiogroup" aria-label={group.label} className="flex flex-wrap justify-center gap-4 md:gap-[74px]">
            {group.options.map((option) => {
              const selected = options[group.key] === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setOptions((prev) => ({ ...prev, [group.key]: option.value }))}
                  className={cn(
                    "h-[68px] min-w-[137px] cursor-pointer rounded-pill px-6 text-h3 whitespace-nowrap outline-none transition-colors focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected
                      ? "border-2 border-lilac-700 text-lilac-700"
                      : "border border-grey-600 text-grey-600 hover:border-black-300 hover:text-black-300",
                  )}
                >
                  {option.label}
                  {option.priceCents > 0 && <span className="sr-only">, plus {formatPrice(option.priceCents)}</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mx-auto max-w-[480px]">
            <label htmlFor={`${baseId}-text`} className="text-body1 font-extrabold">
              Text on the cake
            </label>
            <input
              id={`${baseId}-text`}
              value={options.text}
              maxLength={CAKE_TEXT_MAX}
              placeholder="e.g. Happy birthday, Sam!"
              onChange={(event) => setOptions((prev) => ({ ...prev, text: event.target.value }))}
              className="mt-3 h-16 w-full rounded-pill border border-black-300 px-5 text-body1 outline-none focus-visible:border-lilac-800 focus-visible:ring-3 focus-visible:ring-ring/40"
            />
            <p className="mt-1 px-5 text-caption text-grey-700">
              Optional, {CAKE_TEXT_MAX - options.text.length} characters left
            </p>
          </div>
        )}
      </div>

      <div className="mt-10 flex items-center justify-between gap-6 md:px-[100px]">
        <p className="text-h2" aria-live="polite">
          Total: <strong className="font-extrabold">{formatPrice(designerPrice(options))}</strong>
        </p>
        <Button
          variant="strong"
          className="w-[180px]"
          disabled={pending}
          aria-busy={pending || undefined}
          onClick={() =>
            run(() => addCustomCakeToBasket({ options, editLineId }), { then: "basket" })
          }
        >
          {pending ? "Adding…" : editLineId ? "Update" : "Order"}
        </Button>
      </div>
    </div>
  );
}
