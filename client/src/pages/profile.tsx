import { useEffect, useState } from "react";
import { useAuth } from "@/lib/useAuth";
import { profileService } from "@/services/profile.service";
import { resumeService } from "@/services/resume.service";
import { guinService } from "@/services/guin.service";
import type { GuinProfile } from "@/types/guin";
import type { ProfileCredits, SpcSalesSummary } from "@/types/profile";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileTab } from "@/components/profile/ProfileTab";
import { SubscriptionTab } from "@/components/profile/SubscriptionTab";
import { SecurityTab } from "@/components/profile/SecurityTab";
import { AITab } from "@/components/profile/AITab";
import { MarketplaceTab } from "@/components/profile/MarketplaceTab";
import { PortfolioTab } from "@/components/profile/PortfolioTab";
import { PrivacyTab } from "@/components/profile/PrivacyTab";
import { ArkReportDownloadButton } from "@/components/ArkReportDownloadButton";
import { Link } from "react-router-dom";
import { FEATURES } from "@shared/featureFlags";
import { User, CreditCard, ShieldCheck, Cpu, ShoppingBag, FileText, AlertTriangle } from "lucide-react";

type TabKey = "profile" | "subscription" | "security" | "ai" | "marketplace" | "portfolio" | "privacy";

const TAB_CONFIG: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }>; feature?: keyof typeof FEATURES }[] = [
  { key: "profile", label: "Profile", icon: User },
  { key: "subscription", label: "Subscription", icon: CreditCard },
  { key: "security", label: "Security", icon: ShieldCheck },
  { key: "ai", label: "AI Engine", icon: Cpu },
  { key: "marketplace", label: "Marketplace", icon: ShoppingBag },
  { key: "portfolio", label: "Portfolio", icon: FileText },
  { key: "privacy", label: "Privacy", icon: AlertTriangle },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
    const handleTabChange = (value: string) => {
      setActiveTab(value as TabKey);
    };

    const [credits, setCredits] = useState<ProfileCredits | null>(null);
  const [sales, setSales] = useState<SpcSalesSummary | null>(null);
  const [guin, setGuin] = useState<GuinProfile | null>(null);
  const [matchedCardIds, setMatchedCardIds] = useState<string[] | null>(null);

  const loadGuin = async () => {
    if (!user) return;
    try {
      const { data } = await guinService.getByUserId(user.id);
      setGuin(data);
    } catch {
      setGuin(null);
    }
  };

  const loadProfileData = async () => {
    if (!user) return;

    try {
      const [creditsRes, salesRes, resumeRes] = await Promise.all([
        profileService.getCredits(user.id),
        profileService.getSpcSales(user.id),
        resumeService.getLatest(user.id),
      ]);
      setCredits(creditsRes.data);
      setSales(salesRes.data);
      setMatchedCardIds(resumeRes.data.matchedCardIds ?? []);
    } catch {
      setCredits(null);
      setSales(null);
      setMatchedCardIds([]);
    }

    await loadGuin();
  };

  useEffect(() => {
    loadProfileData();
  }, [user?.id]);

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
          {FEATURES.guinPublic && (
            <Link to={`/u/${user.username}`} data-testid="link-view-public-profile">
              <a className="px-3 py-1.5 rounded-lg font-mono text-[11px] uppercase tracking-wider border border-purple-300/30 bg-purple-300/10 text-purple-200 hover:bg-purple-300/20 transition-colors">
                View Public Profile →
              </a>
            </Link>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 gap-1 bg-muted/50 p-1 rounded-lg">
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

        <TabsContent value="security" className="mt-6">
          <SecurityTab />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AITab userId={user.id} />
        </TabsContent>

        <TabsContent value="marketplace" className="mt-6">
          <MarketplaceTab credits={credits} sales={sales} />
        </TabsContent>

        <TabsContent value="portfolio" className="mt-6">
          <PortfolioTab matchedCardIds={matchedCardIds} guin={guin} onLoadGuin={loadGuin} />
        </TabsContent>

        <TabsContent value="privacy" className="mt-6">
          <PrivacyTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}