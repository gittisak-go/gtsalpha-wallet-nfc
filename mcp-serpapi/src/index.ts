// MCP SerpAPI Server - Tools: search, news, maps, shopping, crypto
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { z } from "zod";
import express from "express";
import fetch from "node-fetch";

const SERPAPI_KEY = process.env.SERPAPI_API_KEY || "";
const PORT = parseInt(process.env.PORT || "3010");
const MODE = process.env.MCP_MODE || "stdio";

async function serpSearch(params: Record<string, string | number | boolean>): Promise<any> {
  if (!SERPAPI_KEY) return { search_metadata: { status: "Demo" }, organic_results: [{ title: "Demo", link: "https://example.com", snippet: "Set SERPAPI_API_KEY" }] };
  const qs = new URLSearchParams({ api_key: SERPAPI_KEY, ...Object.fromEntries(Object.entries(params).map(([k, v]) => [k, String(v)])) });
  const res = await fetch(`https://serpapi.com/search?${qs}`);
  if (!res.ok) throw new Error(`SerpAPI ${res.status}`);
  return res.json();
}

function compact(data: any): string {
  const r = data.organic_results || data.news_results || [];
  const lines = r.slice(0, 8).map((x: any, i: number) => `${i+1}. **${x.title||""}**\n   ${x.link||""}\n   ${x.snippet||""}`);
  if (data.answer_box?.answer) lines.unshift(`💡 **${data.answer_box.answer}**\n`);
  return lines.join("\n\n") || "ไม่พบผลลัพธ์";
}

function createServer(): McpServer {
  const s = new McpServer({ name: "gtsalpha-serpapi", version: "1.0.0" });

  s.tool("search", "Google Search via SerpAPI", {
    params: z.object({ q: z.string(), gl: z.string().optional().default("th"), hl: z.string().optional().default("th"), num: z.number().optional().default(10), tbs: z.string().optional() }).passthrough(),
    mode: z.enum(["complete","compact"]).optional().default("compact")
  }, async ({ params, mode }) => { try { const d = await serpSearch({ engine: "google", ...params }); return { content: [{ type: "text", text: mode==="compact" ? compact(d) : JSON.stringify(d,null,2) }] }; } catch(e:any) { return { content:[{type:"text",text:`❌ ${e.message}`}], isError:true }; } });

  s.tool("search_news", "Google News", {
    params: z.object({ q: z.string(), gl: z.string().optional().default("th"), tbs: z.string().optional() }),
    mode: z.enum(["complete","compact"]).optional().default("compact")
  }, async ({ params, mode }) => { try { const d = await serpSearch({ engine:"google", tbm:"nws", ...params }); const r = d.news_results||[]; return { content:[{type:"text",text: mode==="compact" ? r.slice(0,8).map((x:any,i:number)=>`${i+1}. **${x.title}** (${x.source?.name||""} · ${x.date||""})\n   ${x.link}`).join("\n\n") : JSON.stringify(d,null,2)}] }; } catch(e:any) { return { content:[{type:"text",text:`❌ ${e.message}`}], isError:true }; } });

  s.tool("search_maps", "Google Maps Local Search", {
    params: z.object({ q: z.string(), ll: z.string().optional(), hl: z.string().optional().default("th") }),
    mode: z.enum(["complete","compact"]).optional().default("compact")
  }, async ({ params, mode }) => { try { const d = await serpSearch({ engine:"google_maps", ...params }); const r = d.local_results||[]; return { content:[{type:"text",text: mode==="compact" ? r.slice(0,6).map((x:any,i:number)=>`${i+1}. **${x.title}** ⭐${x.rating||"?"}\n   📍 ${x.address||""}\n   📞 ${x.phone||"-"}`).join("\n\n") : JSON.stringify(d,null,2)}] }; } catch(e:any) { return { content:[{type:"text",text:`❌ ${e.message}`}], isError:true }; } });

  s.tool("search_shopping", "Google Shopping", {
    params: z.object({ q: z.string(), gl: z.string().optional().default("th"), num: z.number().optional().default(10) }),
    mode: z.enum(["complete","compact"]).optional().default("compact")
  }, async ({ params, mode }) => { try { const d = await serpSearch({ engine:"google_shopping", ...params }); const r = d.shopping_results||[]; return { content:[{type:"text",text: mode==="compact" ? r.slice(0,8).map((x:any,i:number)=>`${i+1}. **${x.title}**\n   💰 ${x.price||"?"} | ⭐${x.rating||"?"}`).join("\n\n") : JSON.stringify(d,null,2)}] }; } catch(e:any) { return { content:[{type:"text",text:`❌ ${e.message}`}], isError:true }; } });

  s.tool("search_crypto", "Crypto Price", {
    symbol: z.string().describe("BNB, ETH, BTC"),
    currency: z.string().optional().default("USD")
  }, async ({ symbol, currency }) => { try { const d = await serpSearch({ engine:"google", q:`${symbol} to ${currency} price today`, gl:"us", hl:"en" }); const b = d.answer_box; return { content:[{type:"text",text: b ? `💰 **${symbol}/${currency}**\n${b.answer||b.snippet||""}` : compact(d)}] }; } catch(e:any) { return { content:[{type:"text",text:`❌ ${e.message}`}], isError:true }; } });

  return s;
}

async function runStdio() { await createServer().connect(new StdioServerTransport()); console.error("🔌 GtsAlpha SerpAPI MCP ready"); }
async function runHttp() {
  const app = express();
  app.use(express.json());
  app.get("/health", (_, res) => res.json({ ok: true, port: PORT }));
  app.all("/mcp", async (req, res) => { const s = createServer(); const t = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined }); res.on("close", () => t.close()); await s.connect(t); await t.handleRequest(req, res, req.body); });
  app.listen(PORT, () => console.log(`🚀 http://localhost:${PORT}/mcp`));
}

MODE === "http" ? runHttp().catch(console.error) : runStdio().catch(console.error);
