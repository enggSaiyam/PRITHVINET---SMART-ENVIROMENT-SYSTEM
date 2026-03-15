import { PageTransition } from "@/components/PageTransition";
import { useGetIndustries } from "@workspace/api-client-react";
import { useAppStore } from "@/store/useAppStore";
import { Factory, ShieldCheck, ShieldAlert } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";

export default function Industries() {
  const { selectedStateId, selectedDistrictId } = useAppStore();
  const { data: industries = [], isLoading } = useGetIndustries({ stateId: selectedStateId, districtId: selectedDistrictId });

  return (
    <PageTransition className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary/10 text-primary rounded-xl">
            <Factory className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground">Industries Registry</h1>
            <p className="text-muted-foreground mt-1">Track factory compliance and operational status.</p>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden border border-border/50">
        <Table>
          <TableHeader className="bg-secondary/50">
            <TableRow>
              <TableHead>Industry Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Registration</TableHead>
              <TableHead>Compliance Status</TableHead>
              <TableHead className="text-right">Registered On</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">Loading registry data...</TableCell></TableRow>
            ) : industries.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-10 text-muted-foreground">No industries found in this district.</TableCell></TableRow>
            ) : (
              industries.map((ind) => (
                <TableRow key={ind.id} className="hover:bg-primary/5 transition-colors cursor-none">
                  <TableCell className="font-semibold text-foreground">{ind.name}</TableCell>
                  <TableCell className="text-muted-foreground capitalize">{ind.type.replace('_', ' ')}</TableCell>
                  <TableCell>{ind.location || ind.districtName}</TableCell>
                  <TableCell className="font-mono text-xs">{ind.registrationNumber || `REG-${ind.id}XYZ`}</TableCell>
                  <TableCell>
                    {ind.complianceStatus === 'compliant' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800">
                        <ShieldCheck className="w-3.5 h-3.5" /> Compliant
                      </span>
                    ) : ind.complianceStatus === 'non_compliant' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800">
                        <ShieldAlert className="w-3.5 h-3.5" /> Non-Compliant
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">
                        Under Review
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-sm">
                    {format(new Date(ind.createdAt), 'MMM dd, yyyy')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </PageTransition>
  );
}
