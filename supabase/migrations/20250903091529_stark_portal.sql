/*
  # Add cumulative savings tracking

  1. New Tables
    - `CumulativeSavings`
      - `userId` (text, primary key)
      - `totalSavings` (float, default 0)
      - `lastUpdated` (timestamp)

  2. Security
    - This table tracks the running total of all savings for each user
    - Updated whenever savings transactions are created or deleted

  3. Changes
    - Add new table to track cumulative savings separately from monthly aggregates
    - This allows for proper carry-over of savings between months
*/

CREATE TABLE IF NOT EXISTS "CumulativeSavings" (
  "userId" TEXT NOT NULL,
  "totalSavings" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "lastUpdated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "CumulativeSavings_pkey" PRIMARY KEY ("userId")
);