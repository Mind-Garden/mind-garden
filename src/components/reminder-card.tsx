'use client';

import React, { useEffect, useState } from 'react';
import { IReminders } from '@/supabase/schema';
import {
  getReminders,
  sendReminders,
  updateReminders,
} from '@/actions/reminders';
import { convertToLocalTime, convertToUtcTime } from '@/lib/time';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Props interface defining expected props for this component
interface ReminderCardProps {
  userId: string;
}

// Main component handling reminder settings for a user
function ReminderCard({ userId }: ReminderCardProps) {
  // State for managing fetched reminders and user selections
  const [reminders, setReminders] = useState<IReminders | null>(null);

  // Time selection (hour and AM/PM)
  const [selectedHour, setSelectedHour] = useState<number>(9);
  const [selectedAmPm, setSelectedAmPm] = useState<'AM' | 'PM'>('AM');

  // Toggle states for the three reminder types
  const [journalReminders, setJournalReminders] = useState<boolean>(false);
  const [dataIntakeReminders, setDataIntakeReminders] =
    useState<boolean>(false);
  const [activityReminders, setActivityReminders] = useState<boolean>(false);

  // Loading states for data fetching and button interaction
  const [loading, setLoading] = useState<boolean>(true);
  const [buttonLoading, setButtonLoading] = useState<boolean>(false);

  // Track whether any changes have been made
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Initial state for comparison when checking for unsaved changes
  const [initialState, setInitialState] = useState<{
    hour: number;
    ampm: 'AM' | 'PM';
    journal: boolean;
    dataIntake: boolean;
    activity: boolean;
  } | null>(null);

  // Fetch initial reminder settings when the component loads
  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const fetchedReminders = await getReminders(userId);

        if (fetchedReminders) {
          setReminders(fetchedReminders);

          // Initialize toggle states based on fetched data
          const journal = fetchedReminders.journal_reminders;
          const dataIntake = fetchedReminders.data_intake_reminders;
          const activity = fetchedReminders.activity_reminders;

          setJournalReminders(journal);
          setDataIntakeReminders(dataIntake);
          setActivityReminders(activity);

          // Convert and initialize the time selection state
          if (fetchedReminders.reminder_time) {
            const localTime = convertToLocalTime(
              fetchedReminders.reminder_time,
            );
            const [hourStr] = localTime.split(':');
            const hour24 = parseInt(hourStr, 10);
            const initialHour = hour24 % 12 || 12;
            const initialAmPm = hour24 >= 12 ? 'PM' : 'AM';

            setSelectedHour(initialHour);
            setSelectedAmPm(initialAmPm);

            // Store initial state for later change detection
            setInitialState({
              hour: initialHour,
              ampm: initialAmPm,
              journal,
              dataIntake,
              activity,
            });
          }
        }
      } catch (error) {
        toast.error('Failed to load reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, [userId]);

  // Compare current settings with initial state to detect unsaved changes
  const checkForUnsavedChanges = () => {
    if (!initialState) return;

    const selected24Hour =
      (selectedHour % 12) + (selectedAmPm === 'PM' ? 12 : 0);
    const initial24Hour =
      (initialState.hour % 12) + (initialState.ampm === 'PM' ? 12 : 0);

    const isSame =
      selected24Hour === initial24Hour &&
      selectedAmPm === initialState.ampm &&
      journalReminders === initialState.journal &&
      dataIntakeReminders === initialState.dataIntake &&
      activityReminders === initialState.activity;

    setHasUnsavedChanges(!isSame);
  };

  // Re-run change detection whenever any relevant state changes
  useEffect(() => {
    checkForUnsavedChanges();
  }, [
    selectedHour,
    selectedAmPm,
    journalReminders,
    dataIntakeReminders,
    activityReminders,
  ]);

  // Handle saving updated reminder settings to the server
  const handleSubmit = async () => {
    if (reminders) {
      setButtonLoading(true);

      // Convert selected hour to 24-hour time and UTC
      const selected24Hour =
        (selectedHour % 12) + (selectedAmPm === 'PM' ? 12 : 0);
      const localTime = `${selected24Hour.toString().padStart(2, '0')}:00`;
      const utcTime = convertToUtcTime(localTime);

      try {
        await updateReminders(
          userId,
          utcTime,
          journalReminders,
          dataIntakeReminders,
          activityReminders,
        );

        // Sync initial state with current after successful save
        setInitialState({
          hour: selectedHour,
          ampm: selectedAmPm,
          journal: journalReminders,
          dataIntake: dataIntakeReminders,
          activity: activityReminders,
        });

        setHasUnsavedChanges(false);
        toast.success('Reminders updated successfully!');
      } catch (error) {
        toast.error('Failed to update reminders');
      } finally {
        setButtonLoading(false);
      }
    }
  };

  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-2xl border-none py-4 px-6 min-w-[300px]">
      <p className="font-title text-2xl">Reminders</p>

      {loading ? (
        <div className="flex justify-center items-center py-16">
          <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {/* Hour selection grid */}
          <div className="space-y-2">
            <p className="font-body font-medium">Select Hour</p>
            <div className="grid grid-cols-4 gap-2">
              {Array.from({ length: 12 }, (_, i) => i + 1).map((hour) => (
                <Button
                  key={hour}
                  variant={hour === selectedHour ? 'default' : 'outline'}
                  className="font-body font-medium"
                  onClick={() => setSelectedHour(hour)}
                >
                  {hour}
                </Button>
              ))}
            </div>
          </div>

          {/* AM/PM toggle */}
          <div className="space-y-2">
            <p className="font-body font-medium">AM/PM</p>
            <div className="flex gap-2">
              <Button
                variant={selectedAmPm === 'AM' ? 'default' : 'outline'}
                onClick={() => setSelectedAmPm('AM')}
                className="font-body font-medium"
              >
                AM
              </Button>
              <Button
                variant={selectedAmPm === 'PM' ? 'default' : 'outline'}
                onClick={() => setSelectedAmPm('PM')}
                className="font-body font-medium"
              >
                PM
              </Button>
            </div>
          </div>

          {/* Reminder toggles */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="font-body font-medium">Journal Reminders</p>
              <Switch
                checked={journalReminders}
                onCheckedChange={setJournalReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="font-body font-medium">Habit/Sleep Reminders</p>
              <Switch
                checked={dataIntakeReminders}
                onCheckedChange={setDataIntakeReminders}
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="font-body font-medium">Activity Reminders</p>
              <Switch
                checked={activityReminders}
                onCheckedChange={setActivityReminders}
              />
            </div>
          </div>

          <div className="flex justify-center items-center">
            <p
              className={
                'max-w-sm text-center font-body font-normal text-gray-400'
              }
            >
              Mind Garden will never send you more than one reminder per day.
            </p>
          </div>

          {/* Save button with loading/saved state */}
          <Button
            onClick={handleSubmit}
            className="mt-4 w-full font-body font-medium flex justify-center items-center"
            disabled={buttonLoading || !hasUnsavedChanges}
          >
            {buttonLoading ? (
              <>
                <LoaderCircle className="h-5 w-5 animate-spin mr-2" />
                <span>Saving...</span>
              </>
            ) : !hasUnsavedChanges ? (
              <span>Saved</span>
            ) : (
              <span>Save Reminders</span>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

export default ReminderCard;
