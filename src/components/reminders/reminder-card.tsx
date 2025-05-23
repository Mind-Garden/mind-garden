'use client';

import { LoaderCircle } from 'lucide-react';
import { motion } from 'motion/react';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

import { getReminders, updateReminders } from '@/actions/reminders';
import { Button } from '@/components/shadcn/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/shadcn/card';
import { Switch } from '@/components/shadcn/switch';
import FloatingShapes from '@/components/ui/floating-shapes';
import { convertToLocalTime, convertToUtcTime } from '@/lib/time';
import { IReminders } from '@/supabase/schema';

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
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="bg-white/50 backdrop-blur-sm border-violet-400 border-2 overflow-hidden rounded-2xl">
        <FloatingShapes colors={['bg-violet-100', 'bg-violet-200']} />

        <CardHeader className="pb-0">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <CardTitle className="font-title text-2xl">Reminders</CardTitle>
          </motion.div>
        </CardHeader>

        {loading ? (
          <CardContent className="flex items-center justify-center">
            <LoaderCircle className="h-12 w-12 text-violet-500 animate-spin" />
          </CardContent>
        ) : (
          <CardContent className="mt-4 space-y-4">
            {/* Hour selection grid */}
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-body font-medium">Select Hour</p>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 12 }, (_, i) => i + 1).map(
                  (hour, index) => (
                    <motion.button
                      key={hour}
                      variants={{
                        hidden: { opacity: 0, y: 10 },
                        visible: (i: number) => ({
                          opacity: 1,
                          y: 0,
                          transition: { delay: i * 0.05 },
                        }),
                      }}
                      initial="hidden"
                      animate="visible"
                      custom={index}
                      whileTap={{ scale: 0.9 }}
                      className={`font-body font-medium px-4 py-2 rounded-md ${
                        hour === selectedHour
                          ? 'bg-violet-400 hover:bg-violet-500'
                          : 'border border-gray-300'
                      }`}
                      onClick={() => setSelectedHour(hour)}
                    >
                      {hour}
                    </motion.button>
                  ),
                )}
              </div>
            </motion.div>

            {/* AM/PM toggle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-2"
            >
              <p className="font-body font-medium">AM/PM</p>
              <div className="flex gap-2">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedAmPm === 'AM' ? 'default' : 'outline'}
                    onClick={() => setSelectedAmPm('AM')}
                    className={`font-body font-medium ${selectedAmPm === 'AM' ? 'bg-violet-400 hover:bg-violet-500' : ''}`}
                  >
                    AM
                  </Button>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={selectedAmPm === 'PM' ? 'default' : 'outline'}
                    onClick={() => setSelectedAmPm('PM')}
                    className={`font-body font-medium ${selectedAmPm === 'PM' ? 'bg-violet-400 hover:bg-violet-500' : ''}`}
                  >
                    PM
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Reminder toggles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <p className="font-body font-medium">Journal Reminders</p>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Switch
                    checked={journalReminders}
                    onCheckedChange={setJournalReminders}
                    className="data-[state=checked]:bg-violet-400"
                  />
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-body font-medium">Habit/Sleep Reminders</p>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Switch
                    checked={dataIntakeReminders}
                    onCheckedChange={setDataIntakeReminders}
                    className="data-[state=checked]:bg-violet-400"
                  />
                </motion.div>
              </div>

              <div className="flex items-center justify-between">
                <p className="font-body font-medium">Activity Reminders</p>
                <motion.div whileTap={{ scale: 0.9 }}>
                  <Switch
                    checked={activityReminders}
                    onCheckedChange={setActivityReminders}
                    className="data-[state=checked]:bg-violet-400"
                  />
                </motion.div>
              </div>
            </motion.div>

            <div className="flex justify-center items-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="max-w-sm text-center font-body font-normal text-gray-400"
              >
                Mind Garden will never send you more than one reminder per day.
              </motion.p>
            </div>
          </CardContent>
        )}

        <CardFooter className="px-6 pb-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="w-full"
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleSubmit}
                className={`w-full font-body font-medium flex justify-center items-center ${hasUnsavedChanges ? 'bg-violet-400 hover:bg-violet-500' : 'bg-violet-400/60'}`}
                disabled={buttonLoading || !hasUnsavedChanges}
              >
                {buttonLoading ? (
                  <>
                    <LoaderCircle className="h-5 w-5 mr-2 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : !hasUnsavedChanges ? (
                  <span>Saved</span>
                ) : (
                  <span>Save Reminders</span>
                )}
              </Button>
            </motion.div>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  );
}

export default ReminderCard;
