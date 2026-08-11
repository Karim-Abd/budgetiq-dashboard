import { PageHeader } from "@/components/shared/page-header";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <PageHeader eyebrow="Settings" title="Team accounts" />
      {children}
    </div>
  );
}
