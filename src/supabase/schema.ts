import { WeekNumberLabel } from 'react-day-picker';

export interface IUsers {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

export interface IJournalEntries {
  id: string;
  user_id: string;
  entry_date: string;
  journal_text: string;
}

export interface ISleepEntries {
  id: string;
  user_id: string;
  start: string;
  end: string;
  entry_date: string;
  quality: number;
}

export interface IResponses {
  id: string;
  user_id: string;
  scale_rating: number;
  attribute_ids?: Array<string>;
  entry_date: string;
  water: number;
  work_hours: number;
  work_rating: number;
  study_hours: number;
  study_rating: number;
}

export interface IAttributes {
  id: string;
  category_id: string;
  name: string;
}

export interface ICategories {
  id: string;
  name: string;
}

export interface ITask {
  id: string;
  user_id: string;
  description: string;
  is_completed: boolean;
  created_at: string;
}

export interface SleepDataPoint {
  entry_date: string;
  start: string;
  end: string;
}

export interface ProcessedSleepDataPoint {
  date: string;
  start: string;
  end: string;
  start24Format: number;
  sleepDuration: number;
}

export interface MoodDistribution {
  id: string;
  percentage: number;
}

export interface MoodCountData {
  scale_rating: number;
  count: number;
}

export interface IReminders {
  id: string;
  user_id: string;
  reminder_time: string;
  journal_reminders: boolean;
  data_intake_reminders: boolean;
  activity_reminders: boolean;
}

export interface IReminderWithLatestDates {
  id: number;
  user_id: string;
  reminder_time: string;
  journal_reminders: boolean;
  data_intake_reminders: boolean;
  activity_reminders: boolean;
  email: string;
  latest_journal_entry_date: string | null;
  latest_data_intake_entry_date: string | null;
}
