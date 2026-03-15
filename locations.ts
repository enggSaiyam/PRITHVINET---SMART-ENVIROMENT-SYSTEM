import { Router } from "express";
import type { IRouter } from "express";
import { db, statesTable, districtsTable } from "../db";
import { eq } from "drizzle-orm";

const router: IRouter = Router();

router.get("/states", async (_req, res) => {
  try {
    const states = await db.select().from(statesTable).orderBy(statesTable.name);
    res.json(states);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

router.get("/districts", async (req, res) => {
  try {
    const { stateId } = req.query;
    let query = db.select({
      id: districtsTable.id,
      name: districtsTable.name,
      stateId: districtsTable.stateId,
      stateName: statesTable.name,
    }).from(districtsTable).leftJoin(statesTable, eq(districtsTable.stateId, statesTable.id));

    if (stateId) {
      const districts = await db.select({
        id: districtsTable.id,
        name: districtsTable.name,
        stateId: districtsTable.stateId,
        stateName: statesTable.name,
      }).from(districtsTable)
        .leftJoin(statesTable, eq(districtsTable.stateId, statesTable.id))
        .where(eq(districtsTable.stateId, Number(stateId)))
        .orderBy(districtsTable.name);
      res.json(districts);
    } else {
      const districts = await query.orderBy(districtsTable.name);
      res.json(districts);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server_error" });
  }
});

export default router;
