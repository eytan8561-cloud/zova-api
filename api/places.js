export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  const { query, type } = req.query;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    res.status(500).json({ error: "API key not configured" });
    return;
  }

  try {
    if (type === "search") {
      const url = `https://places.googleapis.com/v1/places:searchText`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Goog-Api-Key": apiKey,
          "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.rating,places.userRatingCount,places.primaryTypeDisplayName,places.websiteUri,places.nationalPhoneNumber,places.regularOpeningHours,places.businessStatus",
        },
        body: JSON.stringify({ textQuery: query, maxResultCount: 20 }),
      });
      const data = await response.json();
      res.status(200).json(data);
    } else {
      res.status(400).json({ error: "Unknown type" });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
