import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { guinService } from "@/services/guin.service";
import type { GuinProfile } from "@/types/guin";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { SubscriptionTab } from "@/components/profile/SubscriptionTab";
import { PrivacyTab } from "@/components/profile/PrivacyTab";
import { ArkReportDownloadButton } from "@/components/ArkReportDownloadButton";
import { Link } from "react-router-dom";
import { FEATURES } from "@shared/featureFlags";
import { User, CreditCard, AlertTriangle } from "lucide-react";

type TabKey = "profile" | "subscription" | "privacy";

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; feature?: keyof typeof FEATURES }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "subscription", label: "Subscription", icon: CreditCard },
  { key: "privacy", label: "Privacy", icon: AlertTriangle },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [guin, setGuin] = useState<GuinProfile | null>(null);
  const handleTabChange = (value: string) => {
    setActiveTab(value as TabKey);
  };

  // `user.username` is an app-layer field not returned by /auth/*, so it's
  // never populated in the auth cache. Fetch the GUIN+ profile instead, which
  // carries the real username used for the public /u/:username link.
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const { data } = await guinService.getByUserId(user.id);
        if (active) setGuin(data);
      } catch {
        if (active) setGuin(null);
      }
    })();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const publicUsername = guin?.user.username ?? user?.username;

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto min-h-[60vh] flex flex-col items-center justify-center">
        <p className="font-mono text-sm text-muted-foreground uppercase">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-display font-bold text-primary tracking-widest uppercase" data-testid="text-profile-title">
            User Profile
          </h1>
          <p className="text-muted-foreground font-mono text-sm mt-2">
            ACCOUNT CONFIGURATION // {user.username}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <ArkReportDownloadButton />
          {FEATURES.guinPublic && publicUsername && (
            <Link
              to={`/u/${publicUsername}`}
              data-testid="link-view-public-profile"
              className="px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider border border-purple-300/30 bg-purple-300/10 text-purple-200 hover:bg-purple-300/20 transition-colors"
            >
              View Public Profile →
            </Link>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3 gap-1 bg-muted/50 p-1 rounded-lg">
          {TAB_CONFIG.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.key}
                value={tab.key}
                className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono uppercase tracking-wider data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
                disabled={tab.feature && !FEATURES[tab.feature]}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <ProfileTab user={user} updateUser={updateUser} />
        </TabsContent>

        <TabsContent value="subscription" className="mt-6">
          <SubscriptionTab user={user} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
