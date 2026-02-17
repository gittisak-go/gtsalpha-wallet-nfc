# GtsAlpha Wallet NFC - Vercel Deployment Guide

## Overview

This guide will help you deploy the GtsAlpha Wallet NFC application to Vercel with the MCP SerpAPI server.

## Prerequisites

- Vercel account (https://vercel.com)
- GitHub account with access to gittisak-go/gtsalpha-wallet-nfc
- SerpAPI API key (https://serpapi.com)

## Deployment Steps

### Step 1: Connect to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Select "Import Git Repository"
4. Search for and select `gittisak-go/gtsalpha-wallet-nfc`
5. Click "Import"

### Step 2: Configure Project Settings

1. **Project Name**: `gtsalpha-wallet-nfc` (or your preferred name)
2. **Framework Preset**: Select "Other"
3. **Root Directory**: Leave as default (.)

### Step 3: Set Environment Variables

In the "Environment Variables" section, add:

| Variable | Value | Description |
|----------|-------|-------------|
| `SERPAPI_API_KEY` | Your SerpAPI key | Required for search functionality |
| `MCP_MODE` | `http` | Server mode (http for Vercel) |
| `PORT` | `3010` | Server port (Vercel will override) |
| `NODE_ENV` | `production` | Environment |

### Step 4: Deploy

1. Click "Deploy"
2. Wait for the build to complete (usually 2-3 minutes)
3. Once deployed, you'll get a URL like `https://gtsalpha-wallet-nfc.vercel.app`

## Post-Deployment

### Verify Deployment

Test the health endpoint:
```bash
curl https://gtsalpha-wallet-nfc.vercel.app/health
```

Expected response:
```json
{
  "ok": true,
  "service": "GtsAlpha Wallet NFC",
  "version": "1.0.0",
  "timestamp": "2026-02-17T10:00:00.000Z",
  "endpoints": {
    "health": "/health",
    "mcp": "/mcp"
  }
}
```

### Test MCP Endpoints

Example search request:
```bash
curl -X POST https://gtsalpha-wallet-nfc.vercel.app/mcp \
  -H "Content-Type: application/json" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "search",
      "arguments": {
        "params": {
          "q": "bitcoin price today"
        }
      }
    }
  }'
```

## Available MCP Tools

### 1. search
Search Google with optional filters
- **Parameters**: `q` (query), `gl` (country), `hl` (language), `num` (results), `tbs` (time)
- **Mode**: `compact` or `complete`

### 2. search_news
Search Google News
- **Parameters**: `q` (query), `gl` (country), `tbs` (time)
- **Mode**: `compact` or `complete`

### 3. search_maps
Search Google Maps
- **Parameters**: `q` (query), `ll` (lat,lng), `hl` (language)
- **Mode**: `compact` or `complete`

### 4. search_shopping
Search Google Shopping
- **Parameters**: `q` (query), `gl` (country), `num` (results)
- **Mode**: `compact` or `complete`

### 5. search_crypto
Get cryptocurrency prices
- **Parameters**: `symbol` (BNB, ETH, BTC), `currency` (USD, THB, etc.)

## Troubleshooting

### 404 Error
- Ensure the project is properly deployed
- Check that all environment variables are set
- Verify the GitHub repository is public or Vercel has access

### Build Fails
- Check the build logs in Vercel dashboard
- Ensure all dependencies are listed in package.json
- Verify Node.js version compatibility

### API Returns Demo Data
- Check that `SERPAPI_API_KEY` is set correctly
- Verify the API key has sufficient credits
- Check SerpAPI status page

## Custom Domain

To use a custom domain:

1. Go to Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. Wait for DNS propagation (usually 24-48 hours)

## Monitoring

Monitor your deployment:
- **Vercel Dashboard**: https://vercel.com/dashboard
- **Analytics**: Check usage and performance metrics
- **Logs**: View function logs and errors

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- SerpAPI support: https://serpapi.com/support
- GitHub issues: https://github.com/gittisak-go/gtsalpha-wallet-nfc/issues

## Additional Resources

- [Vercel Serverless Functions](https://vercel.com/docs/functions/serverless-functions)
- [MCP Documentation](https://modelcontextprotocol.io)
- [SerpAPI Documentation](https://serpapi.com/docs)
- [Flutter Web Deployment](https://flutter.dev/docs/deployment/web)
