export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") { res.status(204).end(); return; }

  const token = process.env.KV_REST_API_TOKEN;
  const url = process.env.KV_REST_API_URL;

  if (!token || !url) { res.status(500).json({ error: "Missing env vars" }); return; }

  try {
    if (req.method === "GET") {
      const [leadsRes, histRes] = await Promise.all([
        fetch(`${url}/get/zova_leads`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${url}/get/zova_history`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      const leadsData = await leadsRes.json();
      const histData = await histRes.json();
      res.status(200).json({
        leads: leadsData.result ? JSON.parse(leadsData.result) : [],
        history: histData.result ? JSON.parse(histData.result) : []
      });
    } else if (req.method === "POST") {
      const { leads, history } = req.body;
      const ops = [];
      if (leads !== undefined) ops.push(fetch(`${url}/set/zova_leads`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ value: JSON.stringify(leads) }) }));
      if (history !== undefined) ops.push(fetch(`${url}/set/zova_history`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: JSON.stringify({ value: JSON.stringify(history) }) }));
      await Promise.all(ops);
      res.status(200).json({ ok: true });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
