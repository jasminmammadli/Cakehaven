import { Shell } from "@/components/layout/shell";

// The Figma auth screens show the header but no footer.
export default function AuthLayout({ children }: LayoutProps<"/">) {
  return <Shell footer={false}>{children}</Shell>;
}
