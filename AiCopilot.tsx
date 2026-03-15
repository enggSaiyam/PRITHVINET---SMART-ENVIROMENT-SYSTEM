import { useState, useRef, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useAppStore } from "@/store/useAppStore";
import { useGetAiForecast, useGetAnomalies } from "@workspace/api-client-react";
import {
  Cpu, Send, Sparkles, User, BrainCircuit, AlertTriangle, Zap,
  Wind, Droplets, Volume2, ChevronDown, ChevronUp, Lightbulb,
  ShieldAlert, TreePine, HeartPulse, Wrench, BookOpen, Bell
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StructuredResponse {
  problem?: string;
  possibleCauses?: string;
  impactOnEnvironment?: string;
  healthRisks?: string;
  immediateSolutions?: string;
  longTermSolutions?: string;
  preventiveMeasures?: string;
  riskLevel?: string;
  rawAnswer?: string;
  isStructured: boolean;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  structured?: StructuredResponse;
  timestamp: Date;
}

const SUGGESTED_QUERIES = [
  "What happens if industry X reduces emissions by 30%?",
  "Analyze air pollution in Korba industrial zone",
  "What is the impact of crop burning on AQI?",
  "Detect anomalies in water quality data",
  "Forecast AQI for next 72 hours",
  "Which industries are non-compliant this month?",
  "Analyze urban heat island effect in Delhi",
  "What should citizens do during high pollution days?",
];

function parseStructuredResponse(answer: string): StructuredResponse {
  const sections = [
    { key: "problem", patterns: ["Problem:", "PROBLEM:", "**Problem**", "Environmental Problem:"] },
    { key: "possibleCauses", patterns: ["Possible Causes:", "POSSIBLE CAUSES:", "**Possible Causes**", "Causes:"] },
    { key: "impactOnEnvironment", patterns: ["Impact on Environment:", "IMPACT:", "**Impact on Environment**"] },
    { key: "healthRisks", patterns: ["Health Risks:", "HEALTH RISKS:", "**Health Risks**"] },
    { key: "immediateSolutions", patterns: ["Immediate Solutions:", "IMMEDIATE SOLUTIONS:", "**Immediate Solutions**"] },
    { key: "longTermSolutions", patterns: ["Long-term Solutions:", "LONG-TERM SOLUTIONS:", "**Long-term Solutions**"] },
    { key: "preventiveMeasures", patterns: ["Preventive Measures:", "PREVENTIVE MEASURES:", "**Preventive Measures**"] },
  ];

  const result: any = { isStructured: false };
  let hasStructure = false;

  for (const section of sections) {
    for (const pattern of section.patterns) {
      if (answer.includes(pattern)) {
        hasStructure = true;
        const start = answer.indexOf(pattern) + pattern.length;
        const nextSectionStarts = sections
          .filter(s => s.key !== section.key)
          .flatMap(s => s.patterns)
          .map(p => answer.indexOf(p, start))
          .filter(i => i > start);
        const end = nextSectionStarts.length > 0 ? Math.min(...nextSectionStarts) : answer.length;
        result[section.key] = answer.slice(start, end).trim().replace(/^[:\n]+/, "").trim();
        break;
      }
    }
  }

  if (hasStructure) {
    result.isStructured = true;
  } else {
    result.rawAnswer = answer;
  }
  return result;
}

function StructuredCard({ icon: Icon, title, content, colorClass }: { icon: any; title: string; content?: string; colorClass: string }) {
  const [expanded, setExpanded] = useState(true);
  if (!content) return null;
  return (
    <div className={cn("rounded-xl border p-4 mb-3", colorClass)}>
      <button
        className="w-full flex items-center gap-2 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <Icon className="w-4 h-4 shrink-0" />
        <span className="font-bold text-sm flex-1">{title}</span>
        {expanded ? <ChevronUp className="w-3.5 h-3.5 text-muted-foreground" /> : <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />}
      </button>
      {expanded && (
        <div className="mt-2 text-xs leading-relaxed text-foreground/80 whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}

function AiMessage({ msg }: { msg: Message }) {
  const s = msg.structured;
  if (!s || !s.isStructured) {
    return (
      <div className="p-4 rounded-2xl bg-white border border-border/50 text-sm leading-relaxed text-foreground rounded-tl-sm shadow-sm whitespace-pre-wrap">
        {msg.text}
      </div>
    );
  }
  return (
    <div className="rounded-2xl bg-white border border-primary/20 shadow-md overflow-hidden">
      <div className="bg-gradient-to-r from-primary/10 to-emerald-500/10 px-4 py-3 border-b border-border/30 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-primary" />
        <span className="text-xs font-bold text-primary uppercase tracking-wider">AI Environmental Analysis</span>
        {s.riskLevel && (
          <span className={cn("ml-auto text-[10px] font-bold px-2 py-1 rounded-full uppercase",
            s.riskLevel === 'critical' ? "bg-purple-100 text-purple-700" :
            s.riskLevel === 'high' ? "bg-red-100 text-red-700" :
            s.riskLevel === 'medium' ? "bg-orange-100 text-orange-700" :
            "bg-green-100 text-green-700"
          )}>
            {s.riskLevel} Risk
          </span>
        )}
      </div>
      <div className="p-4">
        <StructuredCard icon={AlertTriangle} title="Problem Identified" content={s.problem} colorClass="bg-red-50 border-red-200 text-red-900" />
        <StructuredCard icon={Zap} title="Possible Causes" content={s.possibleCauses} colorClass="bg-orange-50 border-orange-200 text-orange-900" />
        <StructuredCard icon={Wind} title="Impact on Environment" content={s.impactOnEnvironment} colorClass="bg-yellow-50 border-yellow-200 text-yellow-900" />
        <StructuredCard icon={HeartPulse} title="Health Risks" content={s.healthRisks} colorClass="bg-rose-50 border-rose-200 text-rose-900" />
        <StructuredCard icon={Wrench} title="Immediate Solutions" content={s.immediateSolutions} colorClass="bg-blue-50 border-blue-200 text-blue-900" />
        <StructuredCard icon={TreePine} title="Long-term Solutions" content={s.longTermSolutions} colorClass="bg-green-50 border-green-200 text-green-900" />
        <StructuredCard icon={ShieldAlert} title="Preventive Measures" content={s.preventiveMeasures} colorClass="bg-teal-50 border-teal-200 text-teal-900" />
      </div>
    </div>
  );
}

const STRUCTURED_PROMPT_SUFFIX = `

Please respond with the following structured format:

Problem:
[Identify the environmental problem]

Possible Causes:
[Detect possible pollution sources - traffic, industry, weather, construction, crop burning, etc.]

Impact on Environment:
[Analyze contributing factors and environmental impacts]

Health Risks:
[Predict health risks for different population groups]

Immediate Solutions:
[Suggest actionable solutions for government authorities]

Long-term Solutions:
[Recommend long-term environmental strategies]

Preventive Measures:
[Suggest preventive actions for citizens and industries]`;

export default function AiCopilot() {
  const { selectedStateId, selectedDistrictId } = useAppStore();
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([{
    role: 'ai',
    text: 'Hello! I am your PrithviNet Environmental Copilot. I analyze air, water & noise pollution data to provide structured environmental assessments.\n\nI can help with:\n• Air pollution analysis & compliance\n• Water contamination detection\n• Industrial emission violations\n• Health risk prediction\n• 24-72hr pollution forecasting\n• Anomaly detection\n\nHow can I assist you today?',
    structured: { isStructured: false, rawAnswer: '' },
    timestamp: new Date(),
  }]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: forecast } = useGetAiForecast(
    { stateId: selectedStateId, districtId: selectedDistrictId, type: 'air', hours: 24 },
    { query: { refetchInterval: 30000 } }
  );

  const { data: anomalies = [] } = useGetAnomalies(
    { stateId: selectedStateId, districtId: selectedDistrictId },
    { query: { refetchInterval: 30000 } }
  );

  const handleSend = async (queryText: string = query) => {
    if (!queryText.trim()) return;
    const userMessage: Message = { role: 'user', text: queryText, timestamp: new Date() };
    setMessages(prev => [...prev, userMessage]);
    setQuery("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/ai/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryText + STRUCTURED_PROMPT_SUFFIX,
          stateId: selectedStateId,
          districtId: selectedDistrictId,
        }),
      });
      const data = await res.json();
      const structured = parseStructuredResponse(data.answer || "");
      structured.riskLevel = data.riskLevel;
      const aiMessage: Message = {
        role: 'ai',
        text: data.answer,
        structured,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'ai',
        text: "Sorry, I encountered an error. Please try again.",
        structured: { isStructured: false },
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const chartData = forecast?.points?.slice(0, 8).map(p => ({
    time: format(new Date(p.timestamp), 'HH:mm'),
    predicted: Math.round(p.value),
    lower: Math.round(p.lower),
    upper: Math.round(p.upper),
  })) || [];

  return (
    <PageTransition className="h-full flex flex-col gap-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <Cpu className="w-6 h-6 text-primary" /> AI Environmental Copilot
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Structured environmental analysis • 7-section intelligent reports</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4" style={{ minHeight: 0 }}>
        {/* Chat Interface */}
        <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden border border-primary/20 shadow-xl shadow-primary/5 min-h-[500px]">
          <div className="bg-gradient-to-r from-primary to-emerald-500 p-4 text-white flex items-center gap-3 shrink-0">
            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-base leading-tight">PrithviNet AI Copilot</h2>
              <p className="text-xs text-white/80">Powered by environmental data + CPCB + OpenAQ</p>
            </div>
            <div className="flex items-center gap-1.5 bg-white/20 px-2 py-1 rounded-full text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-green-300 animate-pulse" />
              Online
            </div>
          </div>

          {/* Suggested queries */}
          <div className="shrink-0 px-4 pt-3 pb-2 border-b border-border/30">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Quick Queries</p>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
              {SUGGESTED_QUERIES.slice(0, 4).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="shrink-0 text-[11px] px-3 py-1.5 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-full transition-all font-medium"
                >
                  {q.length > 40 ? q.slice(0, 38) + "…" : q}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-3", msg.role === 'user' ? 'flex-row-reverse' : '')}>
                <div className={cn(
                  "w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-white text-xs font-bold",
                  msg.role === 'user' ? 'bg-slate-700' : 'bg-gradient-to-br from-primary to-emerald-500'
                )}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                </div>
                <div className={cn("flex-1 max-w-[90%]", msg.role === 'user' ? 'items-end flex flex-col' : '')}>
                  {msg.role === 'user' ? (
                    <div className="p-3 rounded-2xl bg-primary text-primary-foreground text-sm rounded-tr-sm max-w-sm ml-auto">
                      {msg.text}
                    </div>
                  ) : (
                    <AiMessage msg={msg} />
                  )}
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">
                    {format(msg.timestamp, 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-primary to-emerald-500 flex items-center justify-center text-white">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="p-4 rounded-2xl bg-white border border-border/50 rounded-tl-sm flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Analyzing environmental data...</span>
                  <div className="flex gap-1">
                    {[0, 150, 300].map(d => (
                      <span key={d} className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: `${d}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 bg-white/50 border-t border-border/50 shrink-0">
            <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex items-center gap-2">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Ask about pollution, compliance, forecasts, or health risks..."
                className="flex-1 h-11 rounded-xl bg-white border-primary/20 focus-visible:ring-primary/30"
                disabled={isLoading}
              />
              <Button
                type="submit"
                size="icon"
                className="h-11 w-11 rounded-xl shadow-lg shadow-primary/20 shrink-0"
                disabled={isLoading || !query.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </div>
        </div>

        {/* Right Column */}
        <div className="w-full md:w-[360px] flex flex-col gap-4 shrink-0">
          {/* Forecast chart */}
          <div className="glass-card rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <BrainCircuit className="w-5 h-5 text-primary" />
              <h3 className="font-display font-bold text-sm text-foreground">24hr AQI Forecast</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">AI multi-step forecast with uncertainty bounds</p>
            <div className="h-[180px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="forecastFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="time" tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Area type="monotone" dataKey="upper" stroke="transparent" fill="hsl(var(--primary) / 0.1)" />
                  <Area type="monotone" dataKey="predicted" stroke="hsl(var(--primary))" strokeWidth={2.5} fill="url(#forecastFill)" />
                  <Area type="monotone" dataKey="lower" stroke="transparent" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Anomaly Detection */}
          <div className="glass-card rounded-2xl p-5 flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="w-4 h-4 text-orange-500" />
              <h3 className="font-display font-bold text-sm text-foreground">Anomaly Alerts</h3>
            </div>
            <div className="space-y-3">
              {anomalies.map((anomaly, i) => (
                <div key={i} className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full uppercase",
                      anomaly.type === 'air' ? "bg-blue-100 text-blue-700" :
                      anomaly.type === 'water' ? "bg-cyan-100 text-cyan-700" :
                      "bg-amber-100 text-amber-700"
                    )}>
                      {anomaly.type}
                    </span>
                    <span className="text-[10px] font-bold text-orange-700 ml-auto">
                      Score: {(anomaly.anomalyScore * 100).toFixed(0)}%
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-orange-900">{anomaly.parameter}</p>
                  <p className="text-[11px] text-orange-700 mt-0.5 leading-relaxed">{anomaly.description}</p>
                  <p className="text-[10px] text-orange-600 mt-1 flex items-center gap-1">
                    📍 {anomaly.location}
                  </p>
                </div>
              ))}
              {anomalies.length === 0 && (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground/40" />
                  No anomalies detected in selected region
                </div>
              )}
            </div>
          </div>

          {/* Capability info */}
          <div className="glass-card rounded-2xl p-4 bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
            <h3 className="font-display font-bold text-xs text-violet-800 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Copilot Capabilities
            </h3>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-violet-900">
              {[
                "Air pollution analysis", "Water contamination", "Illegal waste detection",
                "Emission violations", "Crop burning effects", "Urban heat island",
                "Micro-zone mapping", "Policy simulation", "Compliance tracking", "Citizen reporting"
              ].map((cap, i) => (
                <div key={i} className="flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-violet-500 shrink-0" />
                  {cap}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
