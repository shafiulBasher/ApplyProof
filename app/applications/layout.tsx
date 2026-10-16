import AppShell from "@/components/AppShell";

export default function ApplicationsLayout({ children }: LayoutProps<"/applications">) {
  return <AppShell>{children}</AppShell>;
}
