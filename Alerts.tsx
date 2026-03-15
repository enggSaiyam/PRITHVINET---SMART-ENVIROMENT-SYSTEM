import { PageTransition } from "@/components/PageTransition";
import { useAppStore } from "@/store/useAppStore";
import { useGetAlerts, useAcknowledgeAlert, getGetAlertsQueryKey } from "@workspace/api-client-react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Wind, Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

export default function Alerts() {
  const { selectedStateId, selectedDistrictId } = useAppStore();
  const queryClient = useQueryClient();

  const { data: alerts = [], isLoading } = useGetAlerts(
    { stateId: selectedStateId, districtId: selectedDistrictId },
    { query: { refetchInterval: 5000 } }
  );

  const ackMutation = useAcknowledgeAlert({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAlertsQueryKey() });
      }
    }
  });

  const getSeverityStyle = (severity: string) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'air': return <Wind className="w-5 h-5" />;
      case 'water': return <Droplets className="w-5 h-5" />;
      default: return <ShieldAlert className="w-5 h-5" />;
    }
  };

  return (
    <PageTransition className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-destructive/10 text-destructive rounded-xl">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Alerts & Notifications</h1>
          <p className="text-muted-foreground mt-1">Manage critical environmental events and compliance breaches.</p>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          Array.from({length: 3}).map((_, i) => <div key={i} className="h-24 bg-white/50 animate-pulse rounded-2xl" />)
        ) : alerts.length === 0 ? (
          <div className="text-center p-12 glass-card rounded-2xl">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-foreground">All Clear</h3>
            <p className="text-muted-foreground mt-1">No active alerts for the selected region.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className={cn(
              "glass-card rounded-2xl p-5 border-l-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center transition-all",
              alert.acknowledged ? "border-l-border opacity-75" : 
                alert.severity === 'critical' ? "border-l-red-500 shadow-md" : "border-l-orange-500"
            )}>
              <div className={cn("p-3 rounded-full shrink-0", getSeverityStyle(alert.severity))}>
                {getTypeIcon(alert.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className={cn("text-xs font-bold px-2 py-0.5 rounded uppercase border", getSeverityStyle(alert.severity))}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">
                    {alert.type} • {alert.location || alert.districtName}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-foreground">{alert.title}</h3>
                <p className="text-muted-foreground text-sm mt-1">{alert.message}</p>
                <div className="text-xs text-muted-foreground mt-3 flex items-center gap-1">
                  Detected: {format(new Date(alert.createdAt), 'MMM dd, yyyy HH:mm')}
                </div>
              </div>
              
              <div className="shrink-0 w-full sm:w-auto">
                {!alert.acknowledged ? (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-auto border-primary/30 text-primary hover:bg-primary/10"
                    onClick={() => ackMutation.mutate({ id: alert.id })}
                    disabled={ackMutation.isPending}
                  >
                    Acknowledge
                  </Button>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-600 font-medium px-4 py-2 bg-green-50 rounded-lg">
                    <CheckCircle2 className="w-4 h-4" /> Acknowledged
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </PageTransition>
  );
}
