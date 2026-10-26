"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { LockKeyhole } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { placeOrder } from "../actions";
import { formatCardNumber, formatExpiry } from "../card";
import {
  addressSchema,
  cardFormSchema,
  personalSchema,
  toPaymentPayload,
  type AddressInput,
  type CardForm,
  type PersonalInput,
} from "../schemas";
import { Field } from "./field";
import { Stepper } from "./stepper";

const PAYMENT_TABS = [
  { value: "card", label: "Credit card" },
  { value: "apple_pay", label: "Apple pay" },
  { value: "paypal", label: "Pay pal" },
] as const;

const ADDRESS_OPTIONS = [
  { value: "home", label: "Home" },
  { value: "office", label: "Office" },
  { value: "other", label: "Other" },
] as const;

function StepTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-h3 font-extrabold">{children}</h2>;
}

function PersonalStep({ initial, onDone }: { initial?: PersonalInput; onDone: (value: PersonalInput) => void }) {
  const { register, handleSubmit, formState } = useForm<PersonalInput>({
    resolver: zodResolver(personalSchema),
    defaultValues: initial ?? { fullName: "", phone: "", email: "" },
  });
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onDone)} noValidate className="flex flex-col gap-5">
      <StepTitle>Personal information</StepTitle>
      <div className="mt-3 flex flex-col gap-5">
        <Field id="fullName" label="Full name" autoComplete="name" error={errors.fullName?.message} {...register("fullName")} />
        <Field id="phone" label="Phone number" type="tel" autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
        <Field id="email" label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email")} />
      </div>
      <Button type="submit" variant="strong" className="mt-3 w-full">
        Continue
      </Button>
    </form>
  );
}

function PaymentStep({ initial, onDone }: { initial?: CardForm; onDone: (value: CardForm) => void }) {
  const { register, handleSubmit, control, setValue, formState } = useForm<CardForm>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: initial ?? { method: "card", nameOnCard: "", cardNumber: "", expiry: "", cvv: "" },
  });
  const method = useWatch({ control, name: "method" });
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onDone)} noValidate className="flex flex-col gap-5">
      <StepTitle>Card information</StepTitle>
      <div role="tablist" aria-label="Payment method" className="mt-3 flex gap-10">
        {PAYMENT_TABS.map((tab) => {
          const selected = method === tab.value;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setValue("method", tab.value, { shouldValidate: false })}
              className={cn(
                "relative cursor-pointer rounded-sm pb-1 text-body1 outline-none focus-visible:ring-3 focus-visible:ring-ring/60",
                selected ? "font-extrabold after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-lilac-800" : "hover:text-lilac-900",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {method === "card" ? (
        <div role="tabpanel" className="flex flex-col gap-5">
          <Field id="nameOnCard" label="Name on card" autoComplete="cc-name" error={errors.nameOnCard?.message} {...register("nameOnCard")} />
          <Controller
            control={control}
            name="cardNumber"
            render={({ field }) => (
              <Field
                id="cardNumber"
                label="Card number"
                floatingLabel
                inputMode="numeric"
                autoComplete="cc-number"
                placeholder="0000 0000 0000 0000"
                error={errors.cardNumber?.message}
                {...field}
                onChange={(event) => field.onChange(formatCardNumber(event.target.value))}
              />
            )}
          />
          <div className="grid grid-cols-2 gap-5">
            <Controller
              control={control}
              name="expiry"
              render={({ field }) => (
                <Field
                  id="expiry"
                  label="Date (MM/YY)"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  error={errors.expiry?.message}
                  {...field}
                  onChange={(event) => field.onChange(formatExpiry(event.target.value))}
                />
              )}
            />
            <Field
              id="cvv"
              label="Cvv"
              inputMode="numeric"
              autoComplete="cc-csc"
              maxLength={4}
              error={errors.cvv?.message}
              {...register("cvv", { setValueAs: (value: string) => value.replace(/\D/g, "") })}
            />
          </div>
        </div>
      ) : (
        <p role="tabpanel" className="rounded-[24px] border border-lilac-400 bg-lilac-50 p-5 text-body1 text-black-400">
          You’ll confirm with {method === "apple_pay" ? "Apple Pay" : "PayPal"} when you place the order.
        </p>
      )}

      <p className="flex items-start gap-2 text-caption text-grey-800">
        <LockKeyhole aria-hidden className="mt-0.5 size-4 shrink-0" />
        Demo checkout: no payment is taken. Card details are checked in your browser and never sent or stored.
      </p>

      <Button type="submit" variant="strong" className="w-full">
        Continue
      </Button>
    </form>
  );
}

function AddressStep({
  initial,
  pending,
  onDone,
}: {
  initial?: AddressInput;
  pending: boolean;
  onDone: (value: AddressInput) => void;
}) {
  const { register, handleSubmit, formState } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: initial ?? { addressType: "home", city: "", addressLine: "", postcode: "" },
  });
  const { errors } = formState;

  return (
    <form onSubmit={handleSubmit(onDone)} noValidate className="flex flex-col gap-5">
      <StepTitle>Address information</StepTitle>
      <fieldset className="mt-3">
        <legend className="sr-only">Address type</legend>
        <div className="flex gap-9">
          {ADDRESS_OPTIONS.map((option) => (
            <label key={option.value} className="flex cursor-pointer items-center gap-2 text-body1">
              <input
                type="radio"
                value={option.value}
                {...register("addressType")}
                className="peer sr-only"
              />
              <span
                aria-hidden
                className="grid size-7 place-items-center rounded-full border-2 border-black-500 peer-focus-visible:ring-3 peer-focus-visible:ring-ring/60 after:size-4 after:scale-0 after:rounded-full after:bg-black-500 after:transition-transform peer-checked:after:scale-100"
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>
      <Field id="city" label="City" autoComplete="address-level2" error={errors.city?.message} {...register("city")} />
      <Field id="addressLine" label="Delivery address" autoComplete="street-address" error={errors.addressLine?.message} {...register("addressLine")} />
      <Field id="postcode" label="Postcode" autoComplete="postal-code" error={errors.postcode?.message} {...register("postcode")} />
      <Button type="submit" variant="strong" className="mt-3 w-full" disabled={pending} aria-busy={pending || undefined}>
        {pending ? "Placing your order…" : "Order"}
      </Button>
    </form>
  );
}

/** Three-step checkout from Figma frames "personal info", "checkout" and "adress". */
export function CheckoutFlow({ summary }: { summary: ReactNode }) {
  const [step, setStep] = useState(1);
  const [completed, setCompleted] = useState(0);
  const [personal, setPersonal] = useState<PersonalInput>();
  const [card, setCard] = useState<CardForm>();
  const [address, setAddress] = useState<AddressInput>();
  const [pending, startTransition] = useTransition();

  function advance(from: number) {
    setCompleted((value) => Math.max(value, from));
    setStep(from + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function submit(addressValue: AddressInput) {
    setAddress(addressValue);
    if (!personal || !card) {
      setStep(!personal ? 1 : 2);
      return;
    }
    startTransition(async () => {
      // On success the action redirects to the confirmation page.
      const result = await placeOrder({
        personal,
        address: addressValue,
        payment: toPaymentPayload(card),
      });
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <>
      <div className="mt-8 md:mt-8">
        <Stepper current={step} completed={completed} onSelect={setStep} />
      </div>
      <div className="mt-12 grid gap-12 md:mt-[60px] md:grid-cols-[480px_580px] md:justify-between">
        <div>
          {step === 1 && (
            <PersonalStep
              initial={personal}
              onDone={(value) => {
                setPersonal(value);
                advance(1);
              }}
            />
          )}
          {step === 2 && (
            <PaymentStep
              initial={card}
              onDone={(value) => {
                setCard(value);
                advance(2);
              }}
            />
          )}
          {step === 3 && <AddressStep initial={address} pending={pending} onDone={submit} />}
        </div>
        {summary}
      </div>
    </>
  );
}
