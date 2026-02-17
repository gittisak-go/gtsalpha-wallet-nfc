export default function handler(req, res) {
  res.status(200).json({
    ok: true,
    service: "GtsAlpha Wallet NFC",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    endpoints: {
      health: "/health",
      mcp: "/mcp"
    }
  });
}
