import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  try {
    if (req.method === "GET") {
      const leads = await redis.get("zova_leads");
      const history = await redis.get("zova_history");
      res.status(200).json({ leads: leads || [], history: history || [] });
    } else if (req.method === "POST") {
      const { leads, history } = req.body;
      if (leads !== undefined) await redis.set("zova_leads", leads);
      if (history !== undefined) await redis.set("zova_history", history);
      res.status(200).json({ ok: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
