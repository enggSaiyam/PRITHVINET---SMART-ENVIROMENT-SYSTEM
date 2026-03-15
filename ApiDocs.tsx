import { PageTransition } from "@/components/PageTransition";
import { Code, Server, Shield } from "lucide-react";

export default function ApiDocs() {
  return (
    <PageTransition className="space-y-8 max-w-4xl mx-auto">
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center p-3 bg-slate-100 text-slate-800 rounded-full mb-4">
          <Code className="w-8 h-8" />
        </div>
        <h1 className="text-4xl font-display font-bold text-foreground">API Management</h1>
        <p className="text-muted-foreground mt-2">Documentation and access points for third-party integrations.</p>
      </div>

      <div className="grid gap-6">
        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-primary">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-5 h-5 text-primary" />
            <h3 className="font-bold text-lg">Base URL</h3>
          </div>
          <code className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-sm block">
            https://api.prithvinet.cecb.gov.in/v1
          </code>
        </div>

        <div className="glass-card p-6 rounded-2xl border-l-4 border-l-accent">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="w-5 h-5 text-accent-foreground" />
            <h3 className="font-bold text-lg">Authentication</h3>
          </div>
          <p className="text-muted-foreground text-sm">Most endpoints require a JWT bearer token passed in the Authorization header.</p>
          <code className="bg-slate-100 text-slate-800 px-4 py-2 rounded-lg text-sm block mt-3">
            Authorization: Bearer {'<token>'}
          </code>
        </div>
        
        <div className="mt-8 space-y-4">
          <h2 className="text-2xl font-display font-bold">Key Endpoints</h2>
          
          {[
            { method: "GET", path: "/monitoring/air", desc: "Retrieve real-time air quality telemetry" },
            { method: "POST", path: "/monitoring/water", desc: "Submit manual water testing results" },
            { method: "GET", path: "/alerts", desc: "List active environmental alerts based on region" },
            { method: "POST", path: "/ai/query", desc: "Interact with the AI Compliance Copilot" },
          ].map((ep, i) => (
            <div key={i} className="glass-card p-4 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4 hover-elevate transition-all">
              <div className={`px-3 py-1 rounded text-xs font-bold w-16 text-center shrink-0 ${ep.method === 'GET' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                {ep.method}
              </div>
              <div className="font-mono text-sm font-semibold flex-1">
                {ep.path}
              </div>
              <div className="text-sm text-muted-foreground sm:text-right">
                {ep.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
