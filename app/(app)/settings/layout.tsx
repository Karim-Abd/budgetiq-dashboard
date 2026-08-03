import { PageHeader } from "@/components/shared/page-header";
import { SettingsNav } from "@/components/settings/settings-nav";

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl animate-fade-up">
      <PageHeader eyebrow="Settings" title="Workspace settings" />
      <SettingsNav />
      {children}
    </div>
  );
}
