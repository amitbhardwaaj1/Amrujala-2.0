import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

// Parse request body for POST requests
app.use(express.json());

// Unified standard header set to mimic real browser request
const headers = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept": "*/*",
  "Accept-Language": "en-US,en;q=0.9",
};

// 1. Amar Ujala Downloader (POST)
app.post("/api/download/amar-ujala", async (req, res) => {
  try {
    const response = await fetch("https://d1h47qec6ptx2j.cloudfront.net/amarujala/v1/download", {
      method: "POST",
      headers: {
        ...headers,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Failed to download pages from cloudfront" });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Amar Ujala Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 2. Dainik Jagran Downloader (GET)
app.get("/api/download/dainik-jagran", async (req, res) => {
  try {
    const { citySlug, day, month, year } = req.query;
    if (!citySlug || !day || !month || !year) {
      return res.status(400).json({ error: "Missing required query parameters" });
    }
    const targetUrl = `https://d1h47qec6ptx2j.cloudfront.net/dainikjagran/v1/download?citySlug=${citySlug}&day=${day}&month=${month}&year=${year}`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Failed to download Dainik Jagran" });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Dainik Jagran Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 3. Hindustan Times Downloader (GET)
app.get("/api/download/hindustan-times", async (req, res) => {
  try {
    const { citySlug, editionDate } = req.query;
    if (!citySlug || !editionDate) {
      return res.status(400).json({ error: "Missing citySlug or editionDate" });
    }
    const targetUrl = `https://d1h47qec6ptx2j.cloudfront.net/hindustantimes/v2/download?citySlug=${encodeURIComponent(
      citySlug as string
    )}&editionDate=${encodeURIComponent(editionDate as string)}`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Failed to download Hindustan Times" });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Hindustan Times Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 4. Times of India Downloader (GET)
app.get("/api/download/times-of-india", async (req, res) => {
  try {
    const { citySlug, day, month, year, page } = req.query;
    if (!citySlug || !day || !month || !year || !page) {
      return res.status(400).json({ error: "Missing query parameters for Times of India" });
    }
    const targetUrl = `https://d1h47qec6ptx2j.cloudfront.net/toi/v1/download?citySlug=${citySlug}&day=${day}&month=${month}&year=${year}&page=${page}`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Failed to download Times of India" });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Times of India Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 5. Hindustan Downloader (GET)
app.get("/api/download/hindustan", async (req, res) => {
  try {
    const { editionId, editionDate } = req.query;
    if (!editionId || !editionDate) {
      return res.status(400).json({ error: "Missing editionId or editionDate" });
    }

    const targetUrl = `https://epaperinhouse.livehindustan.com/be/downloadEditionUrl?editionid=${encodeURIComponent(
      editionId as string
    )}&editiondate=${encodeURIComponent(editionDate as string)}`;

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Failed to download Hindustan" });
    }

    const data = await response.json();
    if (!data?.url || typeof data.url !== "string") {
      return res.status(502).json({ error: "Hindustan API returned no download URL" });
    }

    return res.json({ url: data.url });
  } catch (error: any) {
    console.error("Hindustan Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

app.get("/api/hindustan-direct/edition/:citySlug", async (req, res) => {
  try {
    const { citySlug } = req.params;
    const { date } = req.query;
    if (!citySlug || !date) {
      return res.status(400).json({ error: "Missing city slug or date" });
    }

    const targetUrl = `https://epaper.livehindustan.com/edition/${encodeURIComponent(
      citySlug as string
    )}?date=${encodeURIComponent(date as string)}`;
    console.log(`Scraping Hindustan fallback route: ${targetUrl}`);

    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Hindustan direct fallback page not found" });
    }

    const html = await response.text();
    const nextDataRegex = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/gi;
    const match = nextDataRegex.exec(html);
    if (!match) {
      return res.status(404).json({ error: "E-paper structure not found on livehindustan page." });
    }

    const json = JSON.parse(match[1]);
    const edition = json.props?.pageProps?.edition;
    if (!edition || !edition.pages || edition.pages.length === 0) {
      return res.status(404).json({ error: "No pages listed for this edition on this date on livehindustan." });
    }

    const htmlContent = edition.pages
      .map((p: any) => `<div style="width:100%"><img src="${p.viewerSrc}" referrerPolicy="no-referrer" /></div>`)
      .join("\n");

    return res.json({
      status: "success",
      data: {
        htmlContent,
        totalPage: edition.pages.length,
      },
    });
  } catch (error: any) {
    console.error("Hindustan Direct Scraping Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error during direct fallback scraping" });
  }
});

// 6. Hindustan Times Edition Hierarchy (GET)
app.get("/api/ht/editions", async (req, res) => {
  try {
    const { EditionDate } = req.query;
    if (!EditionDate) {
      return res.status(400).json({ error: "Missing EditionDate" });
    }
    const targetUrl = `https://epaper.hindustantimes.com/Home/GetEditionSupplementHierarchy?EditionDate=${EditionDate}`;
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Failed to fetch HT editions" });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("HT Editions Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// 7. Hindustan Locations (GET)
app.get("/api/hindustan/locations", async (req, res) => {
  try {
    const targetUrl = "https://epaperinhouse.livehindustan.com/be/api/v1/locations";
    
    const response = await fetch(targetUrl, {
      method: "GET",
      headers,
    });
    
    if (!response.ok) {
      const text = await response.text();
      return res.status(response.status).json({ error: text || "Failed to fetch Hindustan locations" });
    }
    
    const data = await response.json();
    return res.json(data);
  } catch (error: any) {
    console.error("Hindustan Locations Proxy Error:", error);
    return res.status(500).json({ error: error.message || "Internal server error" });
  }
});

// Vite server / production routing setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
