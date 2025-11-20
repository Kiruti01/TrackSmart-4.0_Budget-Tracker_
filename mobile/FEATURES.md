# TrackSmart Mobile - Features Overview

## Core Features

### 1. Authentication & Onboarding

**Sign Up / Sign In**
- Email and password authentication via Supabase
- Secure session management with Expo SecureStore
- Persistent login across app restarts

**Currency Setup Wizard**
- First-time user onboarding
- Select from 11+ global currencies
- Currency preference saved to user profile

### 2. Dashboard

**Financial Overview**
- Real-time stats cards showing:
  - Income this month
  - Expenses this month
  - Current balance
  - Savings this month
  - Total cumulative savings
  - Investment portfolio value
  - Net worth calculation

**Quick Actions (FAB Menu)**
- Add Income transaction
- Add Expense transaction
- Add Savings transaction
- Add Investment
- Color-coded action buttons

**Pull to Refresh**
- Refresh all dashboard data
- Update financial statistics

### 3. Transactions

**Transaction List**
- View all transactions in chronological order
- Color-coded by type (income=green, expense=red, savings=blue)
- Shows category icon, name, description, amount, and date
- Pull to refresh functionality

**Search & Filter**
- Search by description or category
- Filter by type: All, Income, Expense, Savings
- Real-time search results

**Transaction Details**
- Category with icon
- Amount with currency
- Description
- Date

### 4. Add Transaction

**Income/Expense/Savings Form**
- Enter amount (numeric keyboard)
- Add description (multiline text)
- Select category from dropdown
- Auto-saves with current date

**Category Selection**
- Dropdown menu with all user categories
- Shows icon and name
- Type-specific categories

**Validation**
- Required fields: amount, description, category
- Numeric validation for amount
- Real-time error feedback

### 5. Investment Portfolio

**Investment Tracking**
- Track multiple investments
- Multi-currency support
- Automatic exchange rate handling
- Calculate gains/losses

**Add Investment**
- Investment name
- Amount invested
- Currency selection
- Category selection
- Optional notes
- Date tracking

**Investment Categories**
- System default categories
- User-created custom categories
- Icon-based identification

### 6. Category Management

**View Categories**
- Separate sections for Income, Expense, and Savings
- Display icon and name
- Quick add button for each type

**Create Category**
- Enter category name
- Select icon from emoji grid
- Type-specific categorization
- Instant availability

**Delete Categories**
- Remove unused categories
- Confirmation dialog
- Cascade handling

### 7. Profile & Settings

**User Profile**
- Display email address
- Account information

**App Information**
- App version
- About section
- Privacy policy link
- Terms of service link

**Account Actions**
- Sign out with confirmation
- Clear session data

### 8. Data Synchronization

**Real-time Sync**
- All data synced with Supabase
- React Query caching for offline access
- Automatic background updates

**Cumulative Calculations**
- Auto-update total savings
- Calculate net worth
- Track investment portfolio value

## Technical Features

### Security
- Row Level Security (RLS) on all database tables
- Secure token storage
- Authenticated API requests
- Session persistence

### Performance
- React Query for data caching
- Optimistic updates
- Pull to refresh
- Lazy loading

### User Experience
- Bottom tab navigation
- Modal screens for actions
- Loading states
- Error handling
- Success feedback
- Smooth animations

### Accessibility
- Screen reader support
- Proper labeling
- Color contrast
- Touch target sizes

### Cross-Platform
- iOS support (iPhone & iPad)
- Android support (phones & tablets)
- Responsive layouts
- Platform-specific behaviors

## Future Enhancements

### Planned Features
1. **Charts & Analytics**
   - Spending trends
   - Category breakdown charts
   - Monthly comparison graphs
   - Investment performance charts

2. **Budgeting**
   - Set monthly budgets
   - Budget tracking
   - Overspending alerts
   - Budget recommendations

3. **Recurring Transactions**
   - Set up recurring income/expenses
   - Automatic transaction creation
   - Edit/delete recurring items

4. **Bill Reminders**
   - Add bill due dates
   - Push notifications
   - Payment tracking

5. **Export Data**
   - Export to CSV
   - PDF reports
   - Email reports
   - Date range selection

6. **Multi-Account Support**
   - Track multiple bank accounts
   - Credit cards
   - Cash
   - Account transfers

7. **Goal Setting**
   - Savings goals
   - Progress tracking
   - Goal completion notifications

8. **Biometric Authentication**
   - Face ID / Touch ID
   - Fingerprint login
   - Quick access

9. **Dark Mode**
   - System preference detection
   - Manual toggle
   - Themed UI components

10. **Offline Mode**
    - Offline transaction creation
    - Sync when online
    - Conflict resolution

## API Endpoints Used

The mobile app uses the same Supabase database as the web version:

**Authentication**
- `supabase.auth.signUp()`
- `supabase.auth.signInWithPassword()`
- `supabase.auth.signOut()`
- `supabase.auth.getSession()`

**User Settings**
- GET/POST `UserSettings` table

**Categories**
- GET `Category` table (filtered by type and userId)
- POST `Category` table

**Transactions**
- GET `Transaction` table (filtered by userId)
- POST `Transaction` table

**Investments**
- GET `investments` table
- POST `investments` table
- GET `investment_categories` table

**Savings**
- GET/POST/UPDATE `CumulativeSavings` table

## Data Models

See `lib/types.ts` for complete TypeScript type definitions:
- UserSettings
- Category
- Transaction
- Investment
- InvestmentCategory
- InvestmentUpdate

## Dependencies

Key packages used:
- `expo` - Development platform
- `expo-router` - File-based navigation
- `@supabase/supabase-js` - Backend client
- `@tanstack/react-query` - Data fetching & caching
- `react-native-paper` - UI components
- `expo-secure-store` - Secure storage
- `date-fns` - Date utilities
- `zod` - Schema validation
