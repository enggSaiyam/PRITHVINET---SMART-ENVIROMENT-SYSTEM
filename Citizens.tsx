import { useState, useEffect } from "react";
import { PageTransition } from "@/components/PageTransition";
import { useAppStore } from "@/store/useAppStore";
import { useToast } from "@/hooks/use-toast";
import {
  Users, HeartPulse, Send, MessageSquare, Search, Filter, Clock,
  CheckCircle, AlertCircle, XCircle, Eye, Phone, Mail, MapPin,
  TrendingUp, BarChart2, FileText, Download, RefreshCw, Bell, Camera,
  ChevronDown, Flag, Hash, Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type ComplaintStatus = "pending" | "under_review" | "investigating" | "resolved" | "rejected";
type Priority = "low" | "medium" | "high" | "critical";
type Tab = "portal" | "my_complaints" | "dashboard" | "analytics";

const STATUS_CONFIG: Record<ComplaintStatus, { label: string; color: string; icon: any }> = {
  pending:       { label: "Pending",        color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: Clock },
  under_review:  { label: "Under Review",   color: "bg-blue-100 text-blue-800 border-blue-200",     icon: Eye },
  investigating: { label: "Investigating",  color: "bg-orange-100 text-orange-800 border-orange-200", icon: Search },
  resolved:      { label: "Resolved",       color: "bg-green-100 text-green-800 border-green-200",   icon: CheckCircle },
  rejected:      { label: "Rejected",       color: "bg-red-100 text-red-800 border-red-200",         icon: XCircle },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  low:      { label: "Low",      color: "bg-gray-100 text-gray-700" },
  medium:   { label: "Medium",   color: "bg-blue-100 text-blue-700" },
  high:     { label: "High",     color: "bg-orange-100 text-orange-700" },
  critical: { label: "Critical", color: "bg-red-100 text-red-700" },
};

const ISSUE_TYPES = [
  { value: "air", label: "Air Pollution / Smoke", icon: "💨" },
  { value: "water", label: "Water Contamination", icon: "💧" },
  { value: "noise", label: "Noise Pollution", icon: "🔊" },
  { value: "industrial", label: "Industrial Emission Violation", icon: "🏭" },
  { value: "waste", label: "Illegal Waste Dumping", icon: "🗑️" },
  { value: "dust", label: "Construction Dust", icon: "🏗️" },
  { value: "sewage", label: "Sewage/Drainage Issue", icon: "🚰" },
  { value: "chemical", label: "Chemical Spill/Leak", icon: "⚗️" },
  { value: "deforestation", label: "Illegal Deforestation", icon: "🌳" },
  { value: "crop_burning", label: "Crop Burning", icon: "🔥" },
  { value: "other", label: "Other Environmental Issue", icon: "⚠️" },
];

const URGENCY_TIPS: Record<string, string> = {
  air: "Include: direction of smoke, color, nearby factory name, time started",
  water: "Include: water color, odor, fish kill, distance from source, river/well name",
  noise: "Include: noise type (machinery/music/traffic), decibel estimate, time pattern",
  industrial: "Include: company name, chimney details, effluent color, registration plate if vehicle",
  waste: "Include: type of waste (plastic/chemical/medical), volume estimate, GPS if possible",
  chemical: "CRITICAL - Also call emergency helpline 1800-113-7335 immediately",
  crop_burning: "Include: field size estimate, wind direction toward residential area",
  default: "Be as specific as possible with location, time, and observable signs",
};

// Simulated complaints for the demo
const DEMO_COMPLAINTS = [
  { id: "CMP-2024-1847", type: "industrial", description: "Black smoke from NTPC Korba chimney since 3 AM. Visibility reduced to less than 200 meters in our colony.", location: "Janta Colony, Korba", status: "investigating" as ComplaintStatus, priority: "critical" as Priority, submittedAt: "2024-03-14 06:22", trackingId: "CMP-2024-1847", response: "Field team dispatched to Korba site. NTPC served notice.", assignedTo: "Sh. Ramesh Kumar, Sr. EO" },
  { id: "CMP-2024-1802", type: "water", description: "Sheonath river water has turned grey near Durg city intake point. Foul odor and dead fish observed.", location: "Durg City Intake, Sheonath River", status: "under_review" as ComplaintStatus, priority: "high" as Priority, submittedAt: "2024-03-13 14:45", trackingId: "CMP-2024-1802", response: "Water sample collected. Lab results awaited." },
  { id: "CMP-2024-1756", type: "waste", description: "Illegal dumping of construction debris in forest area near Raipur bypass.", location: "Raipur Bypass, Near Km 18", status: "resolved" as ComplaintStatus, priority: "medium" as Priority, submittedAt: "2024-03-12 09:15", trackingId: "CMP-2024-1756", response: "Site cleared. FIR registered against contractor." },
  { id: "CMP-2024-1738", type: "noise", description: "Crusher plant operating 24x7 including night hours (11PM-5AM) violating noise norms.", location: "Mandhar Industrial Area, Raipur", status: "pending" as ComplaintStatus, priority: "medium" as Priority, submittedAt: "2024-03-11 22:08", trackingId: "CMP-2024-1738" },
  { id: "CMP-2024-1712", type: "air", description: "Crop burning by farmers near Bilaspur. Thick smoke affecting highway visibility and nearby schools.", location: "Seepat Road, Bilaspur", status: "resolved" as ComplaintStatus, priority: "low" as Priority, submittedAt: "2024-03-10 15:30", trackingId: "CMP-2024-1712", response: "Farmers counseled. Warning notices issued to 12 farmers." },
];

const ANALYTICS_DATA = [
  { month: "Oct", total: 42, resolved: 31 },
  { month: "Nov", total: 58, resolved: 44 },
  { month: "Dec", total: 71, resolved: 55 },
  { month: "Jan", total: 89, resolved: 62 },
  { month: "Feb", total: 76, resolved: 65 },
  { month: "Mar", total: 94, resolved: 58 },
];

export default function Citizens() {
  const { selectedStateId, selectedDistrictId } = useAppStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>("portal");
  const [issueType, setIssueType] = useState("air");
  const [priority, setPriority] = useState<Priority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchComplaint, setSearchComplaint] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedComplaint, setExpandedComplaint] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState("");
  const [trackedComplaint, setTrackedComplaint] = useState<typeof DEMO_COMPLAINTS[0] | null>(null);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", location: "", description: "", isAnonymous: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description.trim() || !formData.location.trim()) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Location and description are required." });
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/citizens/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stateId: selectedStateId || 5,
          districtId: selectedDistrictId || 1,
          type: issueType,
          description: formData.description,
          location: formData.location,
          name: formData.isAnonymous ? undefined : formData.name,
          email: formData.isAnonymous ? undefined : formData.email,
          phone: formData.isAnonymous ? undefined : formData.phone,
          priority,
          status: "pending",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        const trackId = `CMP-2024-${1847 + Math.floor(Math.random() * 100)}`;
        toast({
          title: "✅ Complaint Registered",
          description: `Tracking ID: ${trackId}. You will receive updates via email.`,
        });
        setFormData({ name: "", email: "", phone: "", location: "", description: "", isAnonymous: false });
        setActiveTab("my_complaints");
      } else {
        throw new Error("Submission failed");
      }
    } catch {
      toast({ variant: "destructive", title: "Submission Failed", description: "Please try again or call 1800-123-4567." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTrack = () => {
    const found = DEMO_COMPLAINTS.find(c => c.trackingId === trackingInput.trim().toUpperCase());
    setTrackedComplaint(found || null);
    if (!found) toast({ variant: "destructive", title: "Not Found", description: "No complaint found with that ID." });
  };

  const filteredComplaints = DEMO_COMPLAINTS.filter(c => {
    if (statusFilter !== "all" && c.status !== statusFilter) return false;
    if (searchComplaint && !c.description.toLowerCase().includes(searchComplaint.toLowerCase()) && !c.location.toLowerCase().includes(searchComplaint.toLowerCase())) return false;
    return true;
  });

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: "portal", label: "Submit Report", icon: Send },
    { id: "my_complaints", label: "Track Complaints", icon: Hash },
    { id: "dashboard", label: "Transparency Board", icon: BarChart2 },
    { id: "analytics", label: "Analytics", icon: TrendingUp },
  ];

  return (
    <PageTransition className="space-y-5 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-primary/10"><Users className="w-6 h-6 text-primary" /></div>
            Citizens Portal
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Report environmental issues · Track complaints · View public data — Powered by CECB
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <a href="tel:1800-113-7335" className="flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-700 border border-red-200 rounded-xl font-bold hover:bg-red-100 transition-all">
            <Phone className="w-3.5 h-3.5" /> Emergency: 1800-113-7335
          </a>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-primary/5 text-primary border border-primary/20 rounded-xl font-bold hover:bg-primary/10 transition-all text-xs">
            <Download className="w-3.5 h-3.5" /> Download App
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-secondary/50 rounded-2xl p-1 gap-1">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={cn("flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold transition-all",
              activeTab === tab.id ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}>
            <tab.icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ SUBMIT REPORT TAB ═══ */}
      {activeTab === "portal" && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Form */}
          <div className="lg:col-span-3 glass-card rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <MessageSquare className="w-5 h-5 text-primary" />
              <h2 className="font-display font-bold text-lg">Report an Environmental Issue</h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Issue type grid */}
              <div>
                <label className="text-xs font-bold text-foreground mb-2 block uppercase tracking-wider">Issue Type *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ISSUE_TYPES.map(t => (
                    <button key={t.value} type="button" onClick={() => setIssueType(t.value)}
                      className={cn("flex items-center gap-2 p-2.5 rounded-xl border-2 text-left transition-all text-xs",
                        issueType === t.value ? "border-primary bg-primary/5" : "border-border/50 bg-white/50 hover:border-primary/30"
                      )}>
                      <span className="text-base">{t.icon}</span>
                      <span className={cn("font-semibold text-[11px]", issueType === t.value ? "text-primary" : "text-foreground")}>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-xs font-bold text-foreground mb-2 block uppercase tracking-wider">Severity / Priority *</label>
                <div className="flex gap-2">
                  {(Object.entries(PRIORITY_CONFIG) as [Priority, any][]).map(([p, conf]) => (
                    <button key={p} type="button" onClick={() => setPriority(p)}
                      className={cn("flex-1 py-2 rounded-xl text-xs font-bold border-2 transition-all",
                        priority === p ? `${conf.color} border-current opacity-100` : "border-border/50 text-muted-foreground hover:border-border"
                      )}>
                      {conf.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">Exact Location *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={formData.location}
                    onChange={e => setFormData(p => ({ ...p, location: e.target.value }))}
                    required placeholder="Street / Colony / Landmark / GPS Coordinates"
                    className="pl-10 bg-white/70"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-foreground mb-1.5 block uppercase tracking-wider">Detailed Description *</label>
                <p className="text-[11px] text-primary/80 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2 mb-2">
                  💡 Tip: {URGENCY_TIPS[issueType] || URGENCY_TIPS.default}
                </p>
                <Textarea
                  value={formData.description}
                  onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                  required
                  placeholder="Describe what you observed — the more detail the better..."
                  className="bg-white/70 min-h-[110px] text-sm"
                />
                <p className="text-[10px] text-muted-foreground mt-1 text-right">{formData.description.length}/1000 chars</p>
              </div>

              {/* Anonymous toggle */}
              <div className="flex items-center gap-3 p-3 bg-secondary/30 rounded-xl">
                <button type="button" onClick={() => setFormData(p => ({ ...p, isAnonymous: !p.isAnonymous }))}
                  className={cn("w-10 h-6 rounded-full transition-all relative", formData.isAnonymous ? "bg-primary" : "bg-border")}>
                  <span className={cn("absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all", formData.isAnonymous ? "right-1" : "left-1")} />
                </button>
                <div>
                  <p className="text-xs font-bold text-foreground">Submit Anonymously</p>
                  <p className="text-[10px] text-muted-foreground">Your identity will be kept confidential from all parties</p>
                </div>
              </div>

              {/* Contact info (conditional) */}
              {!formData.isAnonymous && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { key: "name", icon: Users, placeholder: "Your full name", label: "Name" },
                    { key: "email", icon: Mail, placeholder: "email@example.com", label: "Email" },
                    { key: "phone", icon: Phone, placeholder: "+91 XXXXX XXXXX", label: "Phone" },
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-[10px] font-bold text-foreground mb-1 block">{field.label} (optional)</label>
                      <div className="relative">
                        <field.icon className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                          value={(formData as any)[field.key]}
                          onChange={e => setFormData(p => ({ ...p, [field.key]: e.target.value }))}
                          placeholder={field.placeholder}
                          className="pl-8 bg-white/70 text-xs h-9"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <Button type="submit" className="w-full h-12 text-base shadow-lg shadow-primary/20" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Submitting...</span>
                ) : (
                  <span className="flex items-center gap-2"><Send className="w-4 h-4" /> Submit Report to CECB</span>
                )}
              </Button>
            </form>
          </div>

          {/* Right: Current conditions + Track */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {/* Air quality widget */}
            <div className="glass-card rounded-2xl p-5 bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-emerald-900 text-sm">Current AQI — Chhattisgarh</h3>
                <span className="text-[10px] font-bold bg-orange-100 text-orange-700 px-2 py-1 rounded-full">Moderate</span>
              </div>
              <div className="text-6xl font-display font-black text-orange-600 mb-2">182</div>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                {[{ l: "PM2.5", v: "78 µg/m³" }, { l: "PM10", v: "132 µg/m³" }, { l: "AQI", v: "Moderate" }].map((s, i) => (
                  <div key={i} className="bg-white/60 rounded-lg p-2 text-center">
                    <p className="text-muted-foreground font-medium">{s.l}</p>
                    <p className="font-bold text-foreground">{s.v}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Health advisory */}
            <div className="glass-card rounded-2xl p-5 bg-blue-50 border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <HeartPulse className="w-4 h-4 text-blue-600" />
                <h3 className="font-bold text-blue-900 text-sm">Health Advisory</h3>
              </div>
              <p className="text-blue-800 text-xs leading-relaxed">
                Air quality is in the <strong>moderate</strong> range. Sensitive groups (children, elderly, people with respiratory or heart conditions) should limit prolonged outdoor exertion. Consider wearing masks near industrial zones.
              </p>
            </div>

            {/* Tracking */}
            <div className="glass-card rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Hash className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Track Your Complaint</h3>
              </div>
              <div className="flex gap-2">
                <Input
                  value={trackingInput}
                  onChange={e => setTrackingInput(e.target.value)}
                  placeholder="e.g. CMP-2024-1847"
                  className="bg-white/70 text-xs h-9"
                />
                <Button onClick={handleTrack} size="sm" className="h-9 text-xs px-3">Track</Button>
              </div>
              {trackedComplaint && (
                <div className="mt-3 p-3 rounded-xl bg-white border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-foreground">{trackedComplaint.trackingId}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border", STATUS_CONFIG[trackedComplaint.status].color)}>
                      {STATUS_CONFIG[trackedComplaint.status].label}
                    </span>
                  </div>
                  <p className="text-[11px] text-muted-foreground mb-1 truncate">{trackedComplaint.location}</p>
                  {trackedComplaint.response && (
                    <p className="text-[11px] text-green-700 bg-green-50 rounded-lg px-2 py-1.5 mt-1">✓ {trackedComplaint.response}</p>
                  )}
                  {trackedComplaint.assignedTo && (
                    <p className="text-[10px] text-muted-foreground mt-1">Assigned: {trackedComplaint.assignedTo}</p>
                  )}
                </div>
              )}
            </div>

            {/* Helplines */}
            <div className="glass-card rounded-2xl p-4">
              <h3 className="font-bold text-xs text-foreground mb-3 uppercase tracking-wider">CECB Helplines</h3>
              <div className="space-y-2 text-xs">
                {[
                  { label: "Environmental Emergency", number: "1800-113-7335", color: "text-red-600" },
                  { label: "CECB Main Office (Raipur)", number: "0771-2237800", color: "text-primary" },
                  { label: "Water Board Complaint Cell", number: "0771-2510800", color: "text-blue-600" },
                  { label: "Pollution Control Hotline", number: "0771-2427301", color: "text-orange-600" },
                ].map((h, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-border/30 last:border-0">
                    <span className="text-muted-foreground">{h.label}</span>
                    <a href={`tel:${h.number}`} className={cn("font-bold hover:underline", h.color)}>{h.number}</a>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ TRACK COMPLAINTS TAB ═══ */}
      {activeTab === "my_complaints" && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input value={searchComplaint} onChange={e => setSearchComplaint(e.target.value)}
                placeholder="Search complaints..." className="pl-10 bg-white/70" />
            </div>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="h-10 px-3 rounded-xl border border-border/50 bg-white/70 text-sm focus:outline-none focus:border-primary/40">
              <option value="all">All Status</option>
              {Object.entries(STATUS_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {filteredComplaints.map(c => {
              const sc = STATUS_CONFIG[c.status];
              const pc = PRIORITY_CONFIG[c.priority];
              const isExpanded = expandedComplaint === c.id;
              return (
                <div key={c.id} className="glass-card rounded-2xl border border-border/40 overflow-hidden">
                  <div className="p-4 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-xl shrink-0">
                      {ISSUE_TYPES.find(t => t.value === c.type)?.icon || "⚠️"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="font-bold text-foreground text-xs font-mono">{c.trackingId}</span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1", sc.color)}>
                          <sc.icon className="w-3 h-3" />{sc.label}
                        </span>
                        <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", pc.color)}>{pc.label}</span>
                      </div>
                      <p className="text-sm text-foreground font-medium mb-1 line-clamp-2">{c.description}</p>
                      <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.submittedAt}</span>
                      </div>
                    </div>
                    <button onClick={() => setExpandedComplaint(isExpanded ? null : c.id)}
                      className="text-muted-foreground hover:text-foreground shrink-0">
                      <ChevronDown className={cn("w-5 h-5 transition-transform", isExpanded && "rotate-180")} />
                    </button>
                  </div>
                  {isExpanded && (
                    <div className="border-t border-border/40 px-4 py-4 bg-secondary/20 space-y-3">
                      {c.response && (
                        <div className="p-3 bg-green-50 border border-green-200 rounded-xl">
                          <p className="text-xs font-bold text-green-800 mb-1 flex items-center gap-1.5">
                            <CheckCircle className="w-3.5 h-3.5" /> Official Response
                          </p>
                          <p className="text-xs text-green-800">{c.response}</p>
                        </div>
                      )}
                      {c.assignedTo && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Shield className="w-3.5 h-3.5 text-primary" /> Assigned to: <span className="font-semibold text-foreground">{c.assignedTo}</span>
                        </p>
                      )}
                      <div className="flex gap-2">
                        <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline">
                          <Bell className="w-3.5 h-3.5" /> Subscribe to Updates
                        </button>
                        <button className="text-xs text-muted-foreground font-semibold flex items-center gap-1 hover:underline ml-auto">
                          <Flag className="w-3.5 h-3.5" /> Escalate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {filteredComplaints.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No complaints found for selected filters</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ TRANSPARENCY BOARD ═══ */}
      {activeTab === "dashboard" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Total Complaints (2024)", value: "430", sub: "Chhattisgarh", color: "bg-blue-50 border-blue-200 text-blue-800" },
            { label: "Resolved", value: "315", sub: "73.2% resolution rate", color: "bg-green-50 border-green-200 text-green-800" },
            { label: "Avg Resolution Time", value: "4.2 Days", sub: "Target: 7 days", color: "bg-teal-50 border-teal-200 text-teal-800" },
            { label: "Pending / Critical", value: "12 / 3", sub: "Requiring immediate action", color: "bg-red-50 border-red-200 text-red-800" },
          ].map((s, i) => (
            <div key={i} className={cn("rounded-2xl p-5 border", s.color)}>
              <p className="text-3xl font-display font-black mb-1">{s.value}</p>
              <p className="text-xs font-bold">{s.label}</p>
              <p className="text-[11px] opacity-70 mt-0.5">{s.sub}</p>
            </div>
          ))}

          <div className="col-span-2 md:col-span-4 glass-card rounded-2xl p-5">
            <h3 className="font-display font-bold text-base mb-4">Monthly Complaint Resolution Trend — Chhattisgarh 2024</h3>
            <div className="flex items-end gap-3 h-32">
              {ANALYTICS_DATA.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center gap-0.5">
                    <div className="w-full bg-primary/20 rounded-t-lg relative" style={{ height: `${(d.total / 100) * 100}px`, minHeight: 8 }}>
                      <div className="absolute bottom-0 left-0 right-0 bg-primary rounded-t-lg" style={{ height: `${(d.resolved / d.total) * 100}%` }} />
                    </div>
                  </div>
                  <p className="text-[9px] text-muted-foreground font-semibold">{d.month}</p>
                  <p className="text-[9px] font-bold text-foreground">{d.total}</p>
                </div>
              ))}
              <div className="flex flex-col gap-1 ml-2 shrink-0">
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-3 h-3 rounded bg-primary inline-block" /> Resolved</div>
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground"><span className="w-3 h-3 rounded bg-primary/20 inline-block" /> Total</div>
              </div>
            </div>
          </div>

          <div className="col-span-2 glass-card rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm mb-3">By Issue Type</h3>
            <div className="space-y-2">
              {[
                { type: "Air Pollution", count: 142, pct: 33 },
                { type: "Industrial Emission", count: 98, pct: 23 },
                { type: "Water Contamination", count: 86, pct: 20 },
                { type: "Waste Dumping", count: 58, pct: 13 },
                { type: "Noise Violation", count: 46, pct: 11 },
              ].map((t, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{t.type}</span>
                    <span className="text-muted-foreground">{t.count}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${t.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="col-span-2 glass-card rounded-2xl p-5">
            <h3 className="font-display font-bold text-sm mb-3">District-wise Status (Top 6)</h3>
            <div className="space-y-2 text-xs">
              {[
                { district: "Korba", pending: 8, total: 42, resolved: 31 },
                { district: "Raipur", pending: 3, total: 38, resolved: 33 },
                { district: "Durg-Bhilai", pending: 5, total: 35, resolved: 28 },
                { district: "Raigarh", pending: 6, total: 31, resolved: 23 },
                { district: "Bilaspur", pending: 2, total: 28, resolved: 25 },
                { district: "Rajnandgaon", pending: 1, total: 21, resolved: 20 },
              ].map((d, i) => (
                <div key={i} className="flex items-center gap-3 py-1.5 border-b border-border/30 last:border-0">
                  <span className="w-5 text-center text-[10px] text-muted-foreground font-bold">#{i + 1}</span>
                  <span className="flex-1 font-semibold text-foreground">{d.district}</span>
                  <span className="text-green-700 font-bold">{d.resolved} ✓</span>
                  {d.pending > 0 && <span className="text-red-600 font-bold text-[10px] bg-red-50 px-2 py-0.5 rounded-full">{d.pending} pending</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══ ANALYTICS TAB ═══ */}
      {activeTab === "analytics" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[
            { title: "Most Complained Locations", items: [
              { name: "Korba Industrial Zone", count: 89, badge: "Critical" },
              { name: "Bhilai Steel Plant Area", count: 67, badge: "High" },
              { name: "Raigarh Industrial Corridor", count: 58, badge: "High" },
              { name: "SECL Mines, Korba", count: 44, badge: "Medium" },
              { name: "Balco Smelter, Korba", count: 41, badge: "Medium" },
            ]},
            { title: "Industries with Most Violations", items: [
              { name: "NTPC Korba (Unit 3)", count: 23, badge: "Non-Compliant" },
              { name: "SAIL Bhilai (Coke Plant)", count: 19, badge: "Non-Compliant" },
              { name: "Vedanta-Balco", count: 17, badge: "Under Review" },
              { name: "Raigarh Sponge Iron", count: 15, badge: "Under Review" },
              { name: "ACC Cement Jamul", count: 12, badge: "Warning Issued" },
            ]},
          ].map((panel, pi) => (
            <div key={pi} className="glass-card rounded-2xl p-5">
              <h3 className="font-display font-bold text-sm mb-4">{panel.title}</h3>
              <div className="space-y-2">
                {panel.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-xl hover:bg-secondary/30 transition-all">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">{item.name}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{item.count}</span>
                    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full",
                      item.badge.includes("Critical") ? "bg-red-100 text-red-700" :
                      item.badge.includes("Non") ? "bg-red-100 text-red-700" :
                      item.badge.includes("High") ? "bg-orange-100 text-orange-700" :
                      item.badge.includes("Under") ? "bg-yellow-100 text-yellow-700" :
                      "bg-blue-100 text-blue-700"
                    )}>{item.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </PageTransition>
  );
}
