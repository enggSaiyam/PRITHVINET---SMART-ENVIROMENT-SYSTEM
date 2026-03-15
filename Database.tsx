import { PageTransition } from "@/components/PageTransition";
import { useGetAirData } from "@workspace/api-client-react";
import { useAppStore } from "@/store/useAppStore";
import { Database as DbIcon, RefreshCcw } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function Database() {
  const { selectedStateId, selectedDistrictId } = useAppStore();
  
  // Using AirData as a representative table for the raw database viewer
  const { data: rawRecords = [], isLoading, refetch, isFetching } = useGetAirData(
    { stateId: selectedStateId, districtId: selectedDistrictId, limit: 100 }
  );

  return (
    <PageTransition className="space-y-6 flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <DbIcon className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Raw Data Explorer</h1>
            <p className="text-muted-foreground mt-1">Direct access to underlying telemetry tables.</p>
          </div>
        </div>
        <button 
          onClick={() => refetch()} 
          className={`p-2 rounded-full hover:bg-secondary transition-all ${isFetching ? 'animate-spin text-primary' : 'text-muted-foreground'}`}
        >
          <RefreshCcw className="w-5 h-5" />
        </button>
      </div>

      <div className="glass-card rounded-2xl overflow-auto border border-border/50 flex-1">
        <Table>
          <TableHeader className="bg-secondary/50 sticky top-0 backdrop-blur-md">
            <TableRow>
              <TableHead>Record ID</TableHead>
              <TableHead>Timestamp (UTC)</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Location Node</TableHead>
              <TableHead className="text-right">AQI Value</TableHead>
              <TableHead className="text-right">PM2.5</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">Querying database...</TableCell></TableRow>
            ) : rawRecords.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10">No records found.</TableCell></TableRow>
            ) : (
              rawRecords.map((rec) => (
                <TableRow key={rec.id} className="font-mono text-sm hover:bg-primary/5 cursor-none">
                  <TableCell className="text-muted-foreground">#{rec.id}</TableCell>
                  <TableCell>{format(new Date(rec.recordedAt), 'yyyy-MM-dd HH:mm:ss')}</TableCell>
                  <TableCell>
                    <span className="px-2 py-0.5 bg-slate-100 rounded text-xs">{rec.source}</span>
                  </TableCell>
                  <TableCell>{rec.location || `Node-${rec.districtId}`}</TableCell>
                  <TableCell className="text-right font-bold">{rec.aqi}</TableCell>
                  <TableCell className="text-right text-muted-foreground">{rec.pm25}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageTransition>
  );
}
