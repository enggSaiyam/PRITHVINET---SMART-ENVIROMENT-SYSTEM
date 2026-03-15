import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { complaintsTable, alertsTable, statesTable, districtsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/public-data", async (req, res) => {
  try {
    const { stateId, districtId } = req.query;

    let stateName = "Select State";
    let distName = "Select District";
    if (stateId) {
      const [st] = await db.select().from(statesTable).where(eq(statesTable.id, Number(stateId)));
      stateName = st?.name ?? stateName;
    }
    if (districtId) {
      const [d] = await db.select().from(districtsTable).where(eq(districtsTable.id, Number(districtId)));
      distName = d?.name ?? distName;
    }

    const conditions = [];
    if (stateId) conditions.push(eq(alertsTable.stateId, Number(stateId)));
    if (districtId) conditions.push(eq(alertsTable.districtId, Number(districtId)));

    const nearbyAlerts = await db.select({
      id: alertsTable.id,
      type: alertsTable.type,
      severity: alertsTable.severity,
      title: alertsTable.title,
      message: alertsTable.message,
      stateId: alertsTable.stateId,
      stateName: statesTable.name,
      districtId: alertsTable.districtId,
      districtName: districtsTable.name,
      location: alertsTable.location,
      acknowledged: alertsTable.acknowledged,
      acknowledgedAt: alertsTable.acknowledgedAt,
      createdAt: alertsTable.createdAt,
    }).from(alertsTable)
      .leftJoin(statesTable, eq(alertsTable.stateId, statesTable.id))
      .leftJoin(districtsTable, eq(alertsTable.districtId, districtsTable.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(alertsTable.createdAt))
      .limit(5);

    res.json({
      stateId: stateId ? Number(stateId) : undefined,
      stateName,
      districtId: districtId ? Number(districtId) : undefined,
      districtName: distName,
      currentAqi: 142,
      aqiStatus: "moderate",
      waterQuality: "good",
      noiseLevel: 63.4,
      noiseStatus: "within_limit",
      lastUpdated: new Date().toISOString(),
      healthAdvisory: "Air quality is in the moderate range. Sensitive groups (children, elderly, people with respiratory conditions) should limit prolonged outdoor exertion. Others may continue normal activities.",
      nearbyAlerts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.post("/complaints", async (req, res) => {
  try {
    const { name, email, phone, stateId, districtId, location, type, description } = req.body;
    if (!stateId || !districtId || !type || !description) {
      res.status(400).json({ error: "missing_fields", message: "stateId, districtId, type, description are required" });
      return;
    }

    const [complaint] = await db.insert(complaintsTable).values({
      name, email, phone, stateId, districtId, location, type, description, status: "pending",
    }).returning();

    res.status(201).json(complaint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/complaints", async (req, res) => {
  try {
    const { stateId, districtId } = req.query;
    const conditions = [];
    if (stateId) conditions.push(eq(complaintsTable.stateId, Number(stateId)));
    if (districtId) conditions.push(eq(complaintsTable.districtId, Number(districtId)));

    const rows = await db.select().from(complaintsTable)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(complaintsTable.createdAt))
      .limit(50);

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
