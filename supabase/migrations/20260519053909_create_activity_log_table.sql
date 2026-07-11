/*
  # Create activity log table for audit trail

  1. New Tables
    - `activity_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `action` (text: created, updated, deleted, completed)
      - `entity_type` (text: task, goal)
      - `entity_id` (uuid)
      - `entity_name` (text)
      - `details` (json)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on activity_logs table
    - Users can only read their own logs
*/

CREATE TABLE IF NOT EXISTS activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'updated', 'deleted', 'completed', 'reopened')),
  entity_type text NOT NULL CHECK (entity_type IN ('task', 'goal')),
  entity_id uuid,
  entity_name text NOT NULL,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS activity_logs_user_id_idx ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS activity_logs_created_at_idx ON activity_logs(created_at DESC);

ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own activity logs"
  ON activity_logs FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own activity logs"
  ON activity_logs FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
