# Deploy GtsAlpha Wallet NFC to Vercel

## Quick Start - 3 Steps

### Step 1: Go to Vercel Dashboard
Visit https://vercel.com/dashboard

### Step 2: Import Project
1. Click "Add New..." → "Project"
2. Click "Import Git Repository"
3. Search for: `gittisak-go/gtsalpha-wallet-nfc`
4. Click "Import"

### Step 3: Configure & Deploy
1. **Project Name**: `gtsalpha-wallet-nfc` (or your preferred name)
2. **Framework Preset**: Select "Other"
3. **Root Directory**: Leave as default (.)

#### Add Environment Variables:
```
SERPAPI_API_KEY = your_api_key_here
MCP_MODE = http
PORT = 3010
NODE_ENV = production
```

4. Click "Deploy"

## After Deployment

### Get Your URL
After deployment completes, you'll see a URL like:
```
https://gtsalpha-wallet-nfc.vercel.app
```

### Test the Service
```bash
# Check health
curl https://your-domain.vercel.app/health

# Expected response:
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

## Get SerpAPI Key

1. Go to https://serpapi.com
2. Sign up for free account
3. Copy your API key
4. Add it to Vercel Environment Variables

## Custom Domain (Optional)

1. In Vercel project settings
2. Go to "Domains"
3. Add your custom domain
4. Follow DNS configuration
5. Wait 24-48 hours for DNS propagation

## Troubleshooting

### 404 Error
- Wait 2-3 minutes for deployment to complete
- Check that environment variables are set
- Verify SERPAPI_API_KEY is correct

### Build Failed
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node.js version compatibility

### API Returns Demo Data
- Check SERPAPI_API_KEY is set
- Verify API key has credits
- Check SerpAPI status

## Support

- Vercel Docs: https://vercel.com/docs
- SerpAPI Docs: https://serpapi.com/docs
- GitHub Issues: https://github.com/gittisak-go/gtsalpha-wallet-nfc/issues
