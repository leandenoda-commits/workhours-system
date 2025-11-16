/*
  # Create work management schema

  1. New Tables
    - `individuals` - 個人マスターテーブル
      - `id` (uuid, primary key)
      - `name` (text, 個人名)
      - `created_at` (timestamp)
    
    - `work_records` - 労働記録テーブル
      - `id` (uuid, primary key)
      - `individual_id` (uuid, foreign key)
      - `work_date` (date, 出勤日)
      - `clock_in` (time, 出勤時刻)
      - `clock_out` (time, 退勤時刻)
      - `break_start` (time, 休憩開始時刻、nullable)
      - `break_end` (time, 休憩終了時刻、nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Notes
    - 時間は24時間形式で保存（HH:MM）
    - 日を跨ぐ退勤時刻は翌日の時刻として保存
*/

DROP TABLE IF EXISTS work_records CASCADE;
DROP TABLE IF EXISTS individuals CASCADE;

CREATE TABLE individuals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE work_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  individual_id uuid NOT NULL REFERENCES individuals(id) ON DELETE CASCADE,
  work_date date NOT NULL,
  clock_in time NOT NULL,
  clock_out time NOT NULL,
  break_start time,
  break_end time,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(individual_id, work_date)
);

CREATE INDEX idx_work_records_individual_id ON work_records(individual_id);
CREATE INDEX idx_work_records_work_date ON work_records(work_date);
CREATE INDEX idx_work_records_individual_date ON work_records(individual_id, work_date);

-- Enable RLS
ALTER TABLE individuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_records ENABLE ROW LEVEL SECURITY;