import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Gift, Ticket } from "lucide-react";
import { f1000Service } from "@/services/f1000.service";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { StatCard } from "@/components/admin/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";

export default function AdminF1000() {
  const [code, setCode] = useState("");
  const [isClaiming, setIsClaiming] = useState(false);
  const [result, setResult] = useState<{ code: string; seq: number; alreadyClaimed: boolean } | null>(null);

  const stats = useQuery({
    queryKey: ["admin", "f1000", "stats"],
    queryFn: async () => (await f1000Service.getStats()).data,
  });

  const handleClaim = async () => {
    if (!code.trim()) {
      toast({ title: "Missing code", description: "Enter a founding-member code.", variant: "destructive" });
      return;
    }
    setIsClaiming(true);
    try {
      const res = await f1000Service.claim({ code: code.trim() });
      setResult(res.data);
      stats.refetch();
      toast({
        title: res.data.alreadyClaimed ? "Code already claimed" : "Code claimed",
        description: `${res.data.code} · #${res.data.seq}`,
      });
    } catch (err) {
      toast({ title: "Claim failed", description: String(err), variant: "destructive" });
    } finally {
      setIsClaiming(false);
    }
  };

  const pct = stats.data && stats.data.total > 0 ? (stats.data.claimed / stats.data.total) * 100 : 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">F1000 Monitor</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Founding-member promo counters and code claims.
        </p>
      </header>

      <ErrorAlert message={stats.error ? String(stats.error) : undefined} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="Total codes" value={stats.data?.total.toLocaleString()} icon={Gift} isLoading={stats.isLoading} />
        <StatCard label="Claimed" value={stats.data?.claimed.toLocaleString()} icon={Ticket} isLoading={stats.isLoading} />
        <StatCard label="Remaining" value={stats.data?.remaining.toLocaleString()} icon={Gift} isLoading={stats.isLoading} />
      </div>

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Claim progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-primary transition-all" style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <p className="text-xs text-muted-foreground font-mono mt-2">
            {pct.toFixed(1)}% claimed
          </p>
        </CardContent>
      </Card>

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Claim a code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="f1000-code">Founding-member code</Label>
            <div className="flex gap-2">
              <Input
                id="f1000-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. ARK-XXXX"
              />
              <Button onClick={handleClaim} disabled={isClaiming}>
                {isClaiming ? "Claiming…" : "Claim"}
              </Button>
            </div>
          </div>
          {result && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-1">
              <p className="font-mono text-sm text-white">
                {result.code} · #{result.seq}
              </p>
              <p className="text-xs font-mono text-muted-foreground">
                {result.alreadyClaimed ? "This code was previously claimed." : "Code claimed successfully."}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
