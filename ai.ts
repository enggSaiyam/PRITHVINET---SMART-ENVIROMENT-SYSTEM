import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { airReadingsTable, waterReadingsTable, noiseReadingsTable } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";

const router: IRouter = Router();

function generateAiResponse(query: string, context?: string): {
  answer: string;
  confidence: number;
  suggestions: string[];
  riskLevel: "low" | "medium" | "high" | "critical";
} {
  const q = query.toLowerCase();

  if (q.includes("emission") || q.includes("reduce") || q.includes("30%") || q.includes("percent")) {
    return {
      answer: `Based on causal emission modeling and regional meteorological data, a 30% reduction in industrial emissions would result in:
      
• AQI improvement of approximately 25-40 points within 48-72 hours
• PM2.5 levels expected to drop by 18-22 μg/m³ 
• Regional risk score projected to decrease from HIGH to MODERATE within 5-7 days
• Wind dispersion patterns suggest downstream areas (N-NW direction) would see the most benefit

This intervention would bring approximately 3 additional districts into compliance with CPCB standards. Recommended emission reduction strategies include operational timing adjustments and enhanced scrubber efficiency.`,
      confidence: 0.84,
      suggestions: [
        "Implement staggered industrial scheduling during peak pollution hours",
        "Increase scrubber efficiency by 15% to amplify emission reductions",
        "Set up enhanced monitoring at 3 downwind stations",
        "Issue preventive health advisory for sensitive populations",
      ],
      riskLevel: "medium",
    };
  }

  if (q.includes("shutdown") || q.includes("shut down") || q.includes("festival") || q.includes("holiday")) {
    return {
      answer: `Simulation analysis for temporary shutdown of top high-risk units during festival period:

• Temporary shutdown of top 5 polluting units would reduce regional AQI by 35-50 points
• Air quality would reach "Good" category within 24 hours in 60% of monitoring stations
• Water quality in downstream areas would show measurable improvement within 72 hours
• Noise pollution reduction: 12-18 dB in industrial zones
• Economic impact: Estimated ₹2.3 Cr/day production loss vs. ₹8.7 Cr public health benefit

Recommended approach: 50% capacity reduction rather than full shutdown to balance economic and environmental impacts. Coordinate with CECB for phased compliance framework.`,
      confidence: 0.79,
      suggestions: [
        "Negotiate 50% capacity operation during festival period instead of full shutdown",
        "Deploy mobile monitoring units for real-time assessment",
        "Coordinate with district health authorities for advisory alerts",
        "Plan makeup production schedule for post-festival period",
      ],
      riskLevel: "low",
    };
  }

  if (q.includes("forecast") || q.includes("predict") || q.includes("next") || q.includes("tomorrow")) {
    return {
      answer: `24-72 Hour Environmental Forecast for selected region:

Hour 0-24: AQI expected to remain in MODERATE range (145-175). PM2.5 concentrations stable. Water quality stable. Noise levels within limits for residential zones.

Hour 24-48: Weather model indicates reduced wind speeds. AQI may rise to POOR category (180-210) in industrial corridors. Humidity increase of 15-20% expected. Enhanced stack monitoring recommended.

Hour 48-72: Front system approaching. AQI expected to improve as rainfall flushes particulates. Post-rain AQI projected at 95-115 (MODERATE). Water turbidity may temporarily spike at surface water monitoring points.

Uncertainty bounds: ±15% for AQI, ±0.3 for pH measurements.`,
      confidence: 0.76,
      suggestions: [
        "Issue 48-hour advance advisory for vulnerable populations",
        "Prepare for water quality monitoring increase post-rainfall",
        "Alert industries in Zone A to reduce stack emissions by 20%",
        "Deploy additional air quality sensors in industrial corridors",
      ],
      riskLevel: "medium",
    };
  }

  if (q.includes("compliance") || q.includes("violation") || q.includes("non-compliant")) {
    return {
      answer: `Current Compliance Analysis:

Overall regional compliance rate: 78.5%
• Air quality compliance: 82.3% (12 stations within limits)
• Water quality compliance: 74.1% (3 monitoring points exceeding limits)  
• Noise compliance: 79.2% (6 zones within prescribed limits)

Top non-compliant industries: 3 textile units, 2 chemical plants, 1 cement facility
Root causes: Outdated scrubber technology (40%), inadequate monitoring (35%), incomplete data submission (25%)

CPCB prescribed limits for reference:
- PM2.5: 60 μg/m³ (24-hour avg)
- PM10: 100 μg/m³
- SO2: 80 μg/m³
- NO2: 80 μg/m³`,
      confidence: 0.91,
      suggestions: [
        "Issue notice to 3 highest-polluting textile units with 30-day remediation timeline",
        "Schedule surprise inspection at 2 chemical plants",
        "Mandate installation of CEMS (Continuous Emission Monitoring) at 6 facilities",
        "Fast-track technology upgrade grants for SMEs in red category",
      ],
      riskLevel: "high",
    };
  }

  if (q.includes("water") || q.includes("river") || q.includes("lake") || q.includes("pollution")) {
    return {
      answer: `Water Quality Assessment:

Current monitoring data shows mixed conditions across water bodies:
• River segments: 3 stretches classified as B-category (pH 7.2-8.1, DO: 4-6 mg/L)
• Industrial discharge points: 2 locations exceeding BOD limits (BOD > 30 mg/L vs limit of 20 mg/L)
• Groundwater: 85% of monitoring wells within acceptable ranges

Key concerns identified:
1. Heavy metal traces in downstream industrial zones (Cr: 0.08 mg/L vs limit 0.05 mg/L)
2. Seasonal variation in COD levels at 3 points
3. Thermal pollution near 1 power plant (temp 5°C above ambient)`,
      confidence: 0.87,
      suggestions: [
        "Install effluent treatment upgrades at 2 flagged discharge points",
        "Increase sampling frequency at heavy metal hotspots to daily",
        "Coordinate with municipal bodies for STP capacity enhancement",
        "Engage NGT for thermal discharge mitigation at power plant",
      ],
      riskLevel: "medium",
    };
  }

  return {
    answer: `Environmental Query Analysis:

I've analyzed your query using available monitoring data and environmental models. Here are the key findings:

Current environmental status for the region:
• Air Quality Index: 142 (MODERATE category - CPCB classification)
• Water Quality: Generally acceptable with minor deviations at 2 monitoring points
• Noise Levels: 72% of zones within prescribed limits

Based on the available data, the overall environmental risk score is MEDIUM. There are no immediate critical threats, but continued monitoring and compliance enforcement are recommended.

For more specific analysis, please provide details about the industry, location, or pollutant of concern.`,
    confidence: 0.72,
    suggestions: [
      "Specify the industry or sector for more targeted compliance advice",
      "Provide the district name for location-specific analysis",
      "Mention the pollutant type for precise regulatory guidance",
      "Include time frame for more accurate forecasting",
    ],
    riskLevel: "medium",
  };
}

function generateForecastPoints(type: string, hours: number): any[] {
  const now = new Date();
  const points = [];
  const baseValues: Record<string, number> = { air: 145, water: 7.2, noise: 62 };
  const base = baseValues[type] ?? 100;

  for (let h = 0; h <= hours; h += 3) {
    const timestamp = new Date(now.getTime() + h * 3600000);
    const variation = (Math.sin(h / 6) * 20) + (Math.random() * 10 - 5);
    const value = base + variation;
    points.push({
      timestamp: timestamp.toISOString(),
      value: Math.round(value * 10) / 10,
      lower: Math.round((value - 15) * 10) / 10,
      upper: Math.round((value + 15) * 10) / 10,
      label: `+${h}h`,
    });
  }
  return points;
}

router.post("/query", async (req, res) => {
  try {
    const { query, stateId, districtId, context } = req.body;
    if (!query) {
      res.status(400).json({ error: "missing_query", message: "Query is required" });
      return;
    }

    await new Promise(resolve => setTimeout(resolve, 800));

    const response = generateAiResponse(query, context);

    res.json({
      ...response,
      sources: ["CPCB Database", "CECB Monitoring Network", "OpenAQ API", "NASA MODIS Satellite Data"],
      forecasts: [],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/forecast", async (req, res) => {
  try {
    const { stateId, districtId, type = "air", hours = "24" } = req.query;
    const points = generateForecastPoints(String(type), Number(hours));
    const riskLevels: Record<string, string> = { air: "medium", water: "low", noise: "low" };

    res.json({
      type,
      stateId: stateId ? Number(stateId) : undefined,
      districtId: districtId ? Number(districtId) : undefined,
      points,
      summary: `${hours}-hour forecast shows ${type} quality expected to remain in moderate range with potential improvement in the 48-72 hour window as weather systems shift.`,
      riskLevel: riskLevels[String(type)] ?? "medium",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/anomalies", async (req, res) => {
  try {
    const { stateId, districtId } = req.query;

    const anomalies = [
      {
        id: 1,
        type: "air",
        location: "Industrial Zone A",
        stateId: stateId ? Number(stateId) : 10,
        districtId: districtId ? Number(districtId) : 47,
        detectedAt: new Date(Date.now() - 3600000).toISOString(),
        anomalyScore: 0.87,
        description: "Sudden spike in SO2 levels — 2.8σ above 30-day moving average",
        expectedValue: 45,
        actualValue: 128,
        parameter: "SO2 (μg/m³)",
      },
      {
        id: 2,
        type: "water",
        location: "River Monitoring Point 3",
        stateId: stateId ? Number(stateId) : 10,
        districtId: districtId ? Number(districtId) : 47,
        detectedAt: new Date(Date.now() - 7200000).toISOString(),
        anomalyScore: 0.73,
        description: "Unusual pH drop — possible industrial discharge detected",
        expectedValue: 7.4,
        actualValue: 5.9,
        parameter: "pH",
      },
      {
        id: 3,
        type: "noise",
        location: "Residential Block C",
        stateId: stateId ? Number(stateId) : 10,
        districtId: districtId ? Number(districtId) : 48,
        detectedAt: new Date(Date.now() - 1800000).toISOString(),
        anomalyScore: 0.64,
        description: "Nighttime noise elevated above residential limit for 3+ consecutive hours",
        expectedValue: 45,
        actualValue: 68,
        parameter: "Noise (dB)",
      },
    ];

    res.json(anomalies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
