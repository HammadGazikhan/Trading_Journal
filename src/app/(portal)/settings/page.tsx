import { PageHeader } from "@/components/shared/page-header";
import { SettingsContent } from "@/components/settings/settings-content";

export const metadata = {
  title: "Settings | Trading Journal",
  description: "Manage your account settings",
};

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Manage your account and preferences"
      />
      <SettingsContent />
    </div>
  );
}
