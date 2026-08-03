import type { Metadata } from "next";

import { IntegrationsList } from "@/components/settings/integrations-list";

export const metadata: Metadata = {
  title: "Integrations",
};

export default function IntegrationsPage() {
  return (
    <div>
      <div className="mb-4">
        <h2 className="text-sm font-semibold">Integrations</h2>
        <p className="text-xs text-muted-foreground">
          Connect the services that feed the OS. These are credential shells — live
          syncing gets wired up per connector.
        </p>
      </div>
      <IntegrationsList />
      <p className="mt-4 font-mono text-[11px] text-muted-foreground">
        Need another connector? Request it in #ops and we&apos;ll add the shell.
      </p>
    </div>
  );
}
