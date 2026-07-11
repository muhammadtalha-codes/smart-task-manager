/*
  # Create goals table for tracking progress goals

  1. New Tables
    - `goals`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `title` (text)
      - `description` (text)
      - `deadline` (timestamp)
      - `status` (text: active, completed, archived)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on goals table
    - Users can only read/modify their own goals
*/

CREATE TABLE IF NOT EXISTS goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  deadline timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS goals_user_id_idx ON goals(user_id);
CREATE INDEX IF NOT EXISTS goals_status_idx ON goals(status);

ALTER TABLE goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own goals"
  ON goals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own goals"
  ON goals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON goals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON goals FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
