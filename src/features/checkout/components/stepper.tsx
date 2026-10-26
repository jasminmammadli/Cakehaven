import { cn } from "@/lib/utils";

export const STEPS = ["Personal information", "Card information", "Address information"] as const;

/** Figma stepper (Frame 149-151): 60px circles joined by 64px lilac rules. */
export function Stepper({
  current,
  completed,
  onSelect,
}: {
  current: number;
  completed: number;
  onSelect: (step: number) => void;
}) {
  return (
    <ol className="flex items-start justify-center" aria-label="Checkout progress">
      {STEPS.map((label, index) => {
        const step = index + 1;
        const active = step === current;
        const reachable = step <= completed + 1 && !active;
        const [first, ...rest] = label.split(" ");

        return (
          <li key={label} className="flex items-start">
            {index > 0 && <span aria-hidden className="mx-2 mt-[30px] h-px w-8 bg-lilac-700 md:mx-[11px] md:w-16" />}
            <button
              type="button"
              disabled={!reachable}
              onClick={() => onSelect(step)}
              aria-current={active ? "step" : undefined}
              className="group flex w-[85px] flex-col items-center gap-3 rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/60 enabled:cursor-pointer"
            >
              <span
                className={cn(
                  "grid size-[60px] place-items-center rounded-full text-h3 transition-colors",
                  active
                    ? "bg-lilac-700 text-white"
                    : "border border-lilac-700 text-lilac-700 group-enabled:group-hover:bg-lilac-50",
                )}
              >
                {step}
              </span>
              <span className="text-center text-body2 text-black-500 md:text-body1">
                {first}
                <br />
                {rest.join(" ")}
              </span>
              <span className="sr-only">
                {active ? "(current step)" : step <= completed ? "(completed)" : "(not started)"}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
