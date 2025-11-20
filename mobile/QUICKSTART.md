# TrackSmart Mobile - Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Smartphone with Expo Go app installed
  - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)
  - [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

## Step 1: Install Dependencies

```bash
cd mobile
npm install
```

## Step 2: Configure Supabase

1. Create `.env` file:
```bash
cp .env.example .env
```

2. Get your credentials from the web app's `.env` file:
```bash
cat ../.env | grep SUPABASE
```

3. Update `mobile/.env`:
```
EXPO_PUBLIC_SUPABASE_URL=<your_url>
EXPO_PUBLIC_SUPABASE_ANON_KEY=<your_key>
```

## Step 3: Start the App

```bash
npm start
```

A QR code will appear in your terminal.

## Step 4: Open on Your Phone

1. Open Expo Go app on your phone
2. Scan the QR code
3. Wait for the app to load

## Step 5: Test the App

1. **Sign Up**: Create a new account
2. **Select Currency**: Choose your preferred currency
3. **Add Categories**: Go to Manager tab → Add categories
4. **Add Transaction**: Use the + button on dashboard
5. **View Dashboard**: See your financial stats

## Troubleshooting

### Can't scan QR code?
- Make sure phone and computer are on same WiFi
- Try typing the URL manually in Expo Go

### Module not found error?
```bash
rm -rf node_modules
npm install
```

### Metro bundler issues?
```bash
npm start -- --clear
```

### Supabase connection fails?
- Double check `.env` credentials
- Verify Supabase project is active
- Restart the development server

## Next Steps

- Read [SETUP.md](./SETUP.md) for detailed instructions
- Check [FEATURES.md](./FEATURES.md) for complete feature list
- See [README.md](./README.md) for full documentation

## Need Help?

1. Check terminal for error messages
2. Review Expo documentation: https://docs.expo.dev
3. Check Supabase docs: https://supabase.com/docs

Happy tracking! 💰📱
