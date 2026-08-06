import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, UserCog } from "lucide-react";
import { usersService } from "@/services/users.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { paymentsService } from "@/services/payments.service";
import { resumeService } from "@/services/resume.service";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";

export default function AdminUserDetail() {
  const { id = "" } = useParams();
  const qc = useQueryClient();
  const [deactivateOpen, setDeactivateOpen] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);

  const user = useQuery({
    queryKey: ["admin", "users", id],
    queryFn: async () => (await usersService.get(id)).data,
    enabled: !!id,
  });

  const subscriptions = useQuery({
    queryKey: ["admin", "users", id, "subscriptions"],
    queryFn: async () => (await subscriptionsService.list({ userId: id, pageSize: 20 })).data,
    enabled: !!id,
  });

  const payments = useQuery({
    queryKey: ["admin", "users", id, "payments"],
    queryFn: async () => (await paymentsService.list({ userId: id, pageSize: 20 })).data,
    enabled: !!id,
  });

  const counts = useQuery({
    queryKey: ["admin", "users", id, "resume-counts"],
    queryFn: async () => (await resumeService.listCounts({ userId: id, pageSize: 1 })).data,
    enabled: !!id,
  });

  const handleDeactivate = async () => {
    setIsDeactivating(true);
    try {
      await usersService.deactivate(id);
      toast({ title: "User deactivated", description: user.data?.email });
      qc.invalidateQueries({ queryKey: ["admin", "users", id] });
      setDeactivateOpen(false);
    } catch (err) {
      toast({ title: "Deactivate failed", description: String(err), variant: "destructive" });
    } finally {
      setIsDeactivating(false);
    }
  };

  const error = user.error || subscriptions.error || payments.error || counts.error;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="icon" aria-label="Back to users">
            <Link to="/users">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">{user.data?.name ?? "User"}</h1>
            <p className="text-sm text-muted-foreground font-mono mt-1">{user.data?.email ?? "—"}</p>
          </div>
        </div>
        <Button variant="destructive" onClick={() => setDeactivateOpen(true)}>
          Deactivate
        </Button>
      </header>

      <ErrorAlert message={error ? String(error) : undefined} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <p className="text-[10px] uppercase font-mono text-muted-foreground">Role</p>
            <p className="text-lg font-bold text-white">{user.data?.role ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <p className="text-[10px] uppercase font-mono text-muted-foreground">Type</p>
            <p className="text-lg font-bold text-white">{user.data?.type ?? "—"}</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <p className="text-[10px] uppercase font-mono text-muted-foreground">Status</p>
            <div className="mt-1">
              <StatusBadge status={user.data?.isActive ? "active" : "inactive"} />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-primary/20">
          <CardContent className="pt-6">
            <p className="text-[10px] uppercase font-mono text-muted-foreground">Resume count</p>
            <p className="text-lg font-bold text-white">
              {counts.data?.data[0]?.count ?? "—"}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Subscriptions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>End</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {subscriptions.data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground font-mono">
                    No subscriptions.
                  </TableCell>
                </TableRow>
              ) : (
                subscriptions.data?.data.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="text-white">{sub.plan?.title ?? sub.planId}</TableCell>
                    <TableCell>
                      <StatusBadge status={sub.status} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {sub.startDate ? new Date(sub.startDate).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {sub.endDate ? new Date(sub.endDate).toLocaleDateString() : "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="glass-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Payments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground font-mono">
                    No payments.
                  </TableCell>
                </TableRow>
              ) : (
                payments.data?.data.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-mono text-xs">{payment.payment_reference}</TableCell>
                    <TableCell className="text-white">${payment.amount}</TableCell>
                    <TableCell>
                      <StatusBadge status={payment.paymentSuccess} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={deactivateOpen}
        onOpenChange={setDeactivateOpen}
        title="Deactivate user"
        description={`This deactivates ${user.data?.email ?? "this user"}. They will no longer be able to sign in.`}
        confirmText="Deactivate"
        destructive
        isConfirming={isDeactivating}
        onConfirm={handleDeactivate}
      />
    </div>
  );
}
