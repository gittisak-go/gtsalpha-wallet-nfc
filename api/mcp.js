import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import fetch from "node-fetch";

const SERPAPI_KEY = process.env.SERPAPI_API_KEY || "";

async function serpSearch(params) {
  if (!SERPAPI_KEY) {
    return {
      search_metadata: { status: "Demo" },
      organic_results: [
        {
          title: "Demo Mode",
          link: "https://example.com",
          snippet: "Set SERPAPI_API_KEY environment variable to use this service"
        }
      ]
    };
  }
  const qs = new URLSearchParams({
    api_key: SERPAPI_KEY,
    ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)]))
  });
  const res = await fetch(`https://serpapi.com/search?${qs}`);
  if (!res.ok) throw new Error(`SerpAPI ${res.status}`);
  return res.json();
}

function compact(data) {
  const r = data.organic_results || data.news_results || [];
  const lines = r.slice(0, 8).map((x, i) => `${i + 1}. **${x.title || ""}**\n   ${x.link || ""}\n   ${x.snippet || ""}`);
  if (data.answer_box?.answer) lines.unshift(`💡 **${data.answer_box.answer}**\n`);
  return lines.join("\n\n") || "ไม่พบผลลัพธ์";
}

function createServer() {
  const s = new McpServer({ name: "gtsalpha-serpapi", version: "1.0.0" });

  s.tool("search", "Google Search via SerpAPI", {
    params: z.object({
      q: z.string(),
      gl: z.string().optional().default("th"),
      hl: z.string().optional().default("th"),
      num: z.number().optional().default(10),
      tbs: z.string().optional()
    }).passthrough(),
    mode: z.enum(["complete", "compact"]).optional().default("compact")
  }, async ({ params, mode }) => {
    try {
      const d = await serpSearch({ engine: "google", ...params });
      return {
        content: [{
          type: "text",
          text: mode === "compact" ? compact(d) : JSON.stringify(d, null, 2)
        }]
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `❌ ${e.message}` }],
        isError: true
      };
    }
  });

  s.tool("search_news", "Google News", {
    params: z.object({
      q: z.string(),
      gl: z.string().optional().default("th"),
      tbs: z.string().optional()
    }),
    mode: z.enum(["complete", "compact"]).optional().default("compact")
  }, async ({ params, mode }) => {
    try {
      const d = await serpSearch({ engine: "google", tbm: "nws", ...params });
      const r = d.news_results || [];
      return {
        content: [{
          type: "text",
          text: mode === "compact"
            ? r.slice(0, 8).map((x, i) => `${i + 1}. **${x.title}** (${x.source?.name || ""} · ${x.date || ""})\n   ${x.link}`).join("\n\n")
            : JSON.stringify(d, null, 2)
        }]
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `❌ ${e.message}` }],
        isError: true
      };
    }
  });

  s.tool("search_maps", "Google Maps Local Search", {
    params: z.object({
      q: z.string(),
      ll: z.string().optional(),
      hl: z.string().optional().default("th")
    }),
    mode: z.enum(["complete", "compact"]).optional().default("compact")
  }, async ({ params, mode }) => {
    try {
      const d = await serpSearch({ engine: "google_maps", ...params });
      const r = d.local_results || [];
      return {
        content: [{
          type: "text",
          text: mode === "compact"
            ? r.slice(0, 6).map((x, i) => `${i + 1}. **${x.title}** ⭐${x.rating || "?"}\n   📍 ${x.address || ""}\n   📞 ${x.phone || "-"}`).join("\n\n")
            : JSON.stringify(d, null, 2)
        }]
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `❌ ${e.message}` }],
        isError: true
      };
    }
  });

  s.tool("search_shopping", "Google Shopping", {
    params: z.object({
      q: z.string(),
      gl: z.string().optional().default("th"),
      num: z.number().optional().default(10)
    }),
    mode: z.enum(["complete", "compact"]).optional().default("compact")
  }, async ({ params, mode }) => {
    try {
      const d = await serpSearch({ engine: "google_shopping", ...params });
      const r = d.shopping_results || [];
      return {
        content: [{
          type: "text",
          text: mode === "compact"
            ? r.slice(0, 8).map((x, i) => `${i + 1}. **${x.title}**\n   💰 ${x.price || "?"} | ⭐${x.rating || "?"}`).join("\n\n")
            : JSON.stringify(d, null, 2)
        }]
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `❌ ${e.message}` }],
        isError: true
      };
    }
  });

  s.tool("search_crypto", "Crypto Price", {
    symbol: z.string().describe("BNB, ETH, BTC"),
    currency: z.string().optional().default("USD")
  }, async ({ symbol, currency }) => {
    try {
      const d = await serpSearch({
        engine: "google",
        q: `${symbol} to ${currency} price today`,
        gl: "us",
        hl: "en"
      });
      const b = d.answer_box;
      return {
        content: [{
          type: "text",
          text: b ? `💰 **${symbol}/${currency}**\n${b.answer || b.snippet || ""}` : compact(d)
        }]
      };
    } catch (e) {
      return {
        content: [{ type: "text", text: `❌ ${e.message}` }],
        isError: true
      };
    }
  });

  return s;
}

export default async function handler(req, res) {
  const server = createServer();
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined
  });

  res.on("close", () => transport.close());

  try {
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.error("MCP Error:", error);
    res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}
