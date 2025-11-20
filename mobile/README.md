# TrackSmart Mobile

A comprehensive personal finance management mobile app for Android and iOS, built with React Native and Expo.

## Features

- **Transaction Management**: Track income, expenses, and savings
- **Investment Portfolio**: Monitor investments with multi-currency support
- **Financial Dashboard**: View real-time stats, balances, and net worth
- **Category Management**: Create custom categories for transactions
- **Multi-Currency Support**: Handle different currencies with exchange rates
- **Secure Authentication**: Email/password authentication with Supabase
- **Cross-Platform**: Works on both Android and iOS

## Tech Stack

- **React Native** with Expo
- **Supabase** for backend and authentication
- **React Query** for data fetching and caching
- **React Native Paper** for UI components
- **Expo Router** for navigation
- **TypeScript** for type safety

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Expo CLI
- Android Studio (for Android) or Xcode (for iOS)

### Installation

1. Navigate to the mobile directory:
```bash
cd mobile
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Running the App

Start the development server:
```bash
npm start
```

Then:
- Press `a` to open in Android emulator
- Press `i` to open in iOS simulator
- Scan the QR code with Expo Go app on your physical device

### Building for Production

#### Android APK:
```bash
eas build --platform android --profile preview
```

#### iOS:
```bash
eas build --platform ios --profile preview
```

## Project Structure

```
mobile/
├── app/                    # App screens and routes
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab screens
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry point
├── components/            # Reusable components
├── contexts/              # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                   # Utilities and configs
│   ├── supabase.ts       # Supabase client
│   ├── types.ts          # TypeScript types
│   ├── currencies.ts     # Currency utilities
│   └── helpers.ts        # Helper functions
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Key Features Implementation

### Authentication
- Email/password authentication via Supabase
- Persistent sessions with Expo SecureStore
- Protected routes with authentication checks

### Dashboard
- Real-time financial statistics
- Income, expense, savings, and balance tracking
- Cumulative savings display
- Investment portfolio value

### Transactions
- Add income, expenses, and savings
- Categorize transactions with custom categories
- Search and filter functionality
- Transaction history with date filtering

### Investments
- Track investment portfolio
- Multi-currency support
- Calculate gains/losses
- Investment categories

### Category Management
- Create custom categories for income, expenses, and savings
- Icon selection for categories
- Category-based transaction filtering

## Database Schema

The app uses the same Supabase database as the web version:
- UserSettings
- Category
- Transaction
- MonthHistory
- YearHistory
- CumulativeSavings
- Investment
- InvestmentCategory

## Environment Variables

Required environment variables:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

© 2025 Kiruti Tech™. All rights reserved.

## Support

For issues and questions, please open an issue on GitHub or contact support.
