import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { paymentsService } from "@/services/payments.service";
import { subscriptionsService } from "@/services/subscriptions.service";
import { ErrorAlert } from "@/components/admin/ErrorAlert";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { PaginationControls } from "@/components/admin/PaginationControls";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const PAGE_SIZE = 10;

export default function AdminPaymentsAndSubscriptions() {
  const [paymentsPage, setPaymentsPage] = useState(1);
  const [subsPage, setSubsPage] = useState(1);

  const payments = useQuery({
    queryKey: ["admin", "payments", { page: paymentsPage }],
    queryFn: async () => (await paymentsService.list({ page: paymentsPage, pageSize: PAGE_SIZE })).data,
  });

  const subscriptions = useQuery({
    queryKey: ["admin", "subscriptions", { page: subsPage }],
    queryFn: async () =>
      (await subscriptionsService.list({ page: subsPage, pageSize: PAGE_SIZE })).data,
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Payments &amp; Subscriptions</h1>
        <p className="text-sm text-muted-foreground font-mono mt-1">
          Billing activity and active subscriptions.
        </p>
      </header>

      <ErrorAlert
        message={payments.error || subscriptions.error ? String(payments.error || subscriptions.error) : undefined}
      />

      <Tabs defaultValue="payments">
        <TabsList>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="payments">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                All payments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reference</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground font-mono">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : payments.data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground font-mono">
                        No payments found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    payments.data?.data.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell className="font-mono text-xs">{payment.payment_reference}</TableCell>
                        <TableCell className="font-mono text-xs">{payment.userId}</TableCell>
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
              {payments.data && (
                <PaginationControls
                  className="mt-4"
                  page={paymentsPage}
                  pageSize={PAGE_SIZE}
                  total={payments.data.total}
                  onPageChange={setPaymentsPage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions">
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                All subscriptions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Plan</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Start</TableHead>
                    <TableHead>End</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {subscriptions.isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground font-mono">
                        Loading…
                      </TableCell>
                    </TableRow>
                  ) : subscriptions.data?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground font-mono">
                        No subscriptions found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    subscriptions.data?.data.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="text-white">{sub.plan?.title ?? sub.planId}</TableCell>
                        <TableCell className="font-mono text-xs">{sub.userId}</TableCell>
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
              {subscriptions.data && (
                <PaginationControls
                  className="mt-4"
                  page={subsPage}
                  pageSize={PAGE_SIZE}
                  total={subscriptions.data.total}
                  onPageChange={setSubsPage}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
