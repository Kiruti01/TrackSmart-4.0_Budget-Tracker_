# TrackSmart Mobile - Setup Guide

## Prerequisites

Before you begin, make sure you have the following installed:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/

2. **npm** or **yarn**
   - Comes with Node.js

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

4. **Mobile Development Tools**:
   - **For Android**: Android Studio with Android SDK
   - **For iOS**: Xcode (Mac only)
   - **For Testing**: Expo Go app on your phone

## Step 1: Install Dependencies

Navigate to the mobile directory and install all dependencies:

```bash
cd mobile
npm install
```

## Step 2: Configure Supabase

1. Copy the environment file:
```bash
cp .env.example .env
```

2. Get your Supabase credentials:
   - Go to your Supabase project dashboard
   - Navigate to Settings > API
   - Copy the Project URL and anon/public key

3. Update `.env` file:
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Step 3: Database Setup

The mobile app uses the same database as the web version. Make sure you have:

1. Run all migrations from the `supabase/migrations` folder
2. Enabled Row Level Security (RLS) on all tables
3. Set up authentication policies

You can verify this by checking the Supabase dashboard.

## Step 4: Run the App

Start the Expo development server:

```bash
npm start
```

This will open Expo Dev Tools in your browser.

### Testing Options:

**Option 1: Physical Device**
1. Install Expo Go app from App Store or Play Store
2. Scan the QR code shown in the terminal
3. The app will load on your device

**Option 2: Android Emulator**
1. Start Android Studio
2. Open AVD Manager and start an emulator
3. Press `a` in the terminal to open in Android

**Option 3: iOS Simulator (Mac only)**
1. Make sure Xcode is installed
2. Press `i` in the terminal to open in iOS simulator

## Step 5: Test Authentication

1. Create a test account using the Sign Up screen
2. Complete the wizard to set your currency
3. You should be redirected to the dashboard

## Step 6: Add Test Data

1. Create some categories in the Manage tab
2. Add test transactions using the FAB (Floating Action Button)
3. Verify data appears in the Dashboard and Transactions tabs

## Building for Production

### Android APK (for testing):

```bash
npm install -g eas-cli
eas login
eas build --platform android --profile preview
```

### iOS (requires Apple Developer account):

```bash
eas build --platform ios --profile preview
```

## Common Issues

### Issue: "Cannot connect to Metro bundler"
**Solution**: Make sure your phone and computer are on the same Wi-Fi network

### Issue: "Module not found"
**Solution**: Delete node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

### Issue: "Supabase connection failed"
**Solution**:
1. Verify your .env file has correct credentials
2. Check if Supabase project is active
3. Restart the Expo server

### Issue: "Expo Go not loading app"
**Solution**:
1. Clear Expo Go cache
2. Restart Expo development server
3. Try scanning QR code again

## Project Structure

```
mobile/
├── app/                    # Screens using Expo Router
│   ├── (auth)/            # Authentication flow
│   │   ├── sign-in.tsx
│   │   ├── sign-up.tsx
│   │   └── wizard.tsx
│   ├── (tabs)/            # Main app tabs
│   │   ├── dashboard.tsx
│   │   ├── transactions.tsx
│   │   ├── manager.tsx
│   │   └── profile.tsx
│   ├── add-transaction.tsx
│   ├── add-category.tsx
│   └── add-investment.tsx
├── contexts/              # React contexts
│   └── AuthContext.tsx
├── lib/                   # Utilities
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   ├── currencies.ts     # Currency helpers
│   └── helpers.ts
└── package.json
```

## Next Steps

1. Customize the app theme in `app/_layout.tsx`
2. Add more investment categories
3. Implement charts and analytics
4. Add notifications for bill reminders
5. Implement data export features

## Support

If you encounter any issues:
1. Check the Expo documentation: https://docs.expo.dev/
2. Check Supabase documentation: https://supabase.com/docs
3. Review error logs in the terminal

## Development Tips

1. **Hot Reload**: Changes are automatically reflected in the app
2. **Debugging**: Shake your device to open developer menu
3. **Logs**: Check terminal for error messages
4. **React Query**: All data is cached for better performance
5. **Navigation**: Uses Expo Router (file-based routing)

Happy coding! 🚀
