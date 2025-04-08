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

export interface IPersonalizedCategories {
  id: string;
  name: string;
}

export interface IAddedCategory {
  user: string;
  added_habit: string;
  tracking_method: string[];
}

export interface IAddedResp {
  id: string;
  user_id: string;
  habit: string;
  tracking_method?: Record<string, any>;
  entry_date: string;
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
  count: number;
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

export interface DataPoint {
  x: string; // Date as string
  y: number; // Value
}

export interface MoodDataPoint {
  entry_date: string;
  scale_rating: number;
}

export interface MoodFlowProps {
  // Array of mood data points with date and mood level
  userId: string;
  title?: string;
}
