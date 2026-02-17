# GtsAlpha Wallet + NFC Scanner

Flutter Crypto Wallet พร้อม NFC Scanner, ID Card OCR, QR/Barcode และ MCP SerpAPI Server

## Deploy URL
https://gtsalpha-wallet.vercel.app

## โครงสร้าง
```
wallet/lib/features/nfc_scanner/
├── models/    - NfcScanResult, ThaiIdCardData, PassportData
├── services/  - NfcService, IdOcrService
├── screens/   - NfcScannerScreen
└── widgets/   - NfcRippleWidget, ScanResultCard

mcp-serpapi/src/index.ts  - MCP Server (search/news/maps/shopping/crypto)
```

## Quick Start
```bash
cd wallet && flutter pub get && flutter run
cd mcp-serpapi && npm install && npm run build
```
