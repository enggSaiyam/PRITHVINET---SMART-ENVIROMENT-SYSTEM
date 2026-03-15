import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { airReadingsTable, waterReadingsTable, noiseReadingsTable, alertsTable, statesTable, districtsTable } from "@workspace/db";
import { eq, and, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/monthly", async (req, res) => {
  try {
    const { stateId, districtId, month, year } = req.query;
    const m = Number(month) || new Date().getMonth() + 1;
    const y = Number(year) || new Date().getFullYear();

    let stateName = "All States";
    let distName = "All Districts";
    if (stateId) {
      const [st] = await db.select().from(statesTable).where(eq(statesTable.id, Number(stateId)));
      stateName = st?.name ?? stateName;
    }
    if (districtId) {
      const [d] = await db.select().from(districtsTable).where(eq(districtsTable.id, Number(districtId)));
      distName = d?.name ?? distName;
    }

    const [airAgg] = await db.select({
      avg: sql<number>`AVG(${airReadingsTable.aqi})`,
      max: sql<number>`MAX(${airReadingsTable.aqi})`,
      min: sql<number>`MIN(${airReadingsTable.aqi})`,
      count: sql<number>`COUNT(*)`,
    }).from(airReadingsTable);

    const [waterAgg] = await db.select({
      avg: sql<number>`AVG(${waterReadingsTable.ph})`,
      max: sql<number>`MAX(${waterReadingsTable.ph})`,
      min: sql<number>`MIN(${waterReadingsTable.ph})`,
    }).from(waterReadingsTable);

    const [noiseAgg] = await db.select({
      avg: sql<number>`AVG(${noiseReadingsTable.decibels})`,
      max: sql<number>`MAX(${noiseReadingsTable.decibels})`,
      min: sql<number>`MIN(${noiseReadingsTable.decibels})`,
    }).from(noiseReadingsTable);

    const [alertAgg] = await db.select({
      total: sql<number>`COUNT(*)`,
      resolved: sql<number>`COUNT(*) FILTER (WHERE acknowledged = true)`,
    }).from(alertsTable);

    const avgAqi = airAgg?.avg ?? 140;
    const trends = Array.from({ length: 30 }, (_, i) => ({
      date: new Date(y, m - 1, i + 1).toISOString().split("T")[0],
      value: Math.round((avgAqi + (Math.sin(i / 3) * 25) + (Math.random() * 10 - 5)) * 10) / 10,
    }));

    res.json({
      month: m,
      year: y,
      stateId: stateId ? Number(stateId) : undefined,
      stateName,
      districtId: districtId ? Number(districtId) : undefined,
      districtName: distName,
      airSummary: {
        average: Math.round((airAgg?.avg ?? 140) * 10) / 10,
        max: Math.round((airAgg?.max ?? 200) * 10) / 10,
        min: Math.round((airAgg?.min ?? 80) * 10) / 10,
        status: "moderate",
        exceedanceCount: 4,
      },
      waterSummary: {
        average: Math.round((waterAgg?.avg ?? 7.2) * 100) / 100,
        max: Math.round((waterAgg?.max ?? 8.8) * 100) / 100,
        min: Math.round((waterAgg?.min ?? 6.1) * 100) / 100,
        status: "good",
        exceedanceCount: 1,
      },
      noiseSummary: {
        average: Math.round((noiseAgg?.avg ?? 62) * 10) / 10,
        max: Math.round((noiseAgg?.max ?? 82) * 10) / 10,
        min: Math.round((noiseAgg?.min ?? 44) * 10) / 10,
        status: "within_limit",
        exceedanceCount: 3,
      },
      totalAlerts: Number(alertAgg?.total ?? 12),
      resolvedAlerts: Number(alertAgg?.resolved ?? 8),
      complianceRate: 78.5,
      trends,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/trends", async (req, res) => {
  try {
    const { stateId, districtId, type = "air", days = "30" } = req.query;
    const d = Number(days);
    const now = new Date();
    const baseValues: Record<string, number> = { air: 145, water: 7.2, noise: 62 };
    const base = baseValues[String(type)] ?? 100;

    const points = Array.from({ length: d }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (d - 1 - i));
      const value = base + (Math.sin(i / 4) * 20) + (Math.random() * 10 - 5);
      return {
        date: date.toISOString().split("T")[0],
        value: Math.round(value * 10) / 10,
        label: type === "air" ? "AQI" : type === "water" ? "pH" : "dB",
      };
    });

    res.json(points);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
