"use client";

//Core imports
import { useEffect, useState } from "react";

// Third party imports
import { Moon, Clock } from "lucide-react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

// Utility
import { insertSleepEntry, sleepEntryExists } from "@/utils/supabase/dbfunctions";

//UI
import {Card,CardContent,CardDescription,CardFooter,CardHeader,CardTitle} from "@/components/ui/card";
import { Button } from "@/components/ui/button";


interface SleepTrackerProps {
  readonly userId: string;
}


export function SleepEntryCard({ userId }: SleepTrackerProps) {
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [entryExists, setEntryExists] = useState<boolean | null>(null);

  const checkkEntryExists = async() => {
    const entryDate = new Date().toISOString().split('T')[0];
    const { exists, error } = await sleepEntryExists(userId, entryDate);  
    if(error) {
      toast.warn("Error checking existing sleep entry!");
      return;
    }
    setEntryExists(exists);
  }

  useEffect(() => {
    checkkEntryExists();
  }, [userId]);

  const handleInsert = async() => {
    // dont allow empty inserts
    if (!startTime.trim() || !endTime.trim()) {
      toast.warn("Both start and end times are required!");
      return;
    }

    if (new Date(startTime) >= new Date(endTime)) {
      toast.warn("Start time must be before end time!");
      return;
    }

    const result = await insertSleepEntry(startTime, endTime, userId);

    if (result?.error) {
      if (typeof result.error === "string") {
        toast.warn(result.error);
      } else {
        toast.warn("Error saving sleep entry!");
      }
      return;
    }
  
    toast.success("Sleep entry saved successfully!");

    checkkEntryExists();
  }

  return (
    <div className="max-w-md mx-auto space-y-8">
      <Card className="bg-white/50 backdrop-blur-sm rounded-2xl">
        {/* Header */}
        <CardHeader>
          {/* Title and Icon */}
          <div className="flex items-center space-x-2">
            <CardTitle>Sleep Entry</CardTitle>
            <Moon className="h-6 w-6" />
          </div>
          {/* Description and Icon */}
          <div className="flex items-center space-x-2">
            <CardDescription>Log your sleep times for the day</CardDescription>
            <Clock className="h-4 w-4" />
          </div>
        </CardHeader>

        {/* Content */}
        <CardContent className="space-y-10">
          {entryExists ? (
            <div className="text-center">
              <p>Entry has been completed for today.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label>Start Time: </label>
                <input
                  type="time"
                  step="60"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label>End Time: </label>
                <input
                  type="time"
                  step="60"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </>
          )}
        </CardContent>

        {/* Footer */}
        <CardFooter>
          {!entryExists && (
            <Button onClick={handleInsert}>Save Sleep Entry</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}