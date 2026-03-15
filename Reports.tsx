import { PageTransition } from "@/components/PageTransition";
import { useGetMonthlyReport, useGetTrends } from "@workspace/api-client-react";
import { useAppStore } from "@/store/useAppStore";
import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Reports() {
  const { selectedStateId, selectedDistrictId } = useAppStore();
  
  const currentDate = new Date();
  const { data: report } = useGetMonthlyReport({ 
    stateId: selectedStateId, 
    districtId: selectedDistrictId,
    month: currentDate.getMonth() + 1,
    year: currentDate.getFullYear()
  });

  const { data: trends } = useGetTrends({
    stateId: selectedStateId,
    districtId: selectedDistrictId,
    type: 'air',
    days: 7
  });

  const chartData = trends?.map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
    value: t.value
  })) || [];

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Analytics & Reports</h1>
            <p className="text-muted-foreground mt-1">Detailed summaries and historical compliance data.</p>
          </div>
        </div>
        <Button className="shadow-md shadow-primary/20">
          <Download className="w-4 h-4 mr-2" /> Export PDF
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <h3 className="font-display font-bold text-xl mb-6">7-Day Pollution Trend (Air Quality)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'hsl(var(--secondary))'}} contentStyle={{borderRadius: '8px', border: 'none'}} />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h3 className="font-display font-bold text-xl mb-4">Monthly Summary</h3>
            <p className="text-sm text-muted-foreground mb-4">Performance against regulatory standards for the current month.</p>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-white border border-border/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">Overall Compliance</span>
                  <span className="font-bold text-primary">{report?.complianceRate || 92}%</span>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${report?.complianceRate || 92}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-white border border-border/50 text-center">
                  <p className="text-3xl font-display font-bold text-foreground">{report?.totalAlerts || 12}</p>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">Total Alerts</p>
                </div>
                <div className="p-4 rounded-xl bg-white border border-border/50 text-center">
                  <p className="text-3xl font-display font-bold text-green-600">{report?.resolvedAlerts || 10}</p>
                  <p className="text-xs text-muted-foreground uppercase font-semibold mt-1">Resolved</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
