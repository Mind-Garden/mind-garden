"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from "date-fns"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { getDataHeatmap } from "@/actions/data-visualization"

// Define the type for a single day's habit data
type HabitData = {
  date: string
  journal_text: string
  start: string
  scale_rating: string
}

interface HeatmapProps {
  readonly userId: string;
}

export default function HabitHeatmap( { userId }: HeatmapProps ) {
  // State to track the current month being displayed
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const [habitData, setHabitData] = useState<HabitData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const habitData = await getDataHeatmap(userId);
      setHabitData(habitData.data);
    };
    fetchData();
  }, []);

  // Get all days in the current month
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Calculate the day of the week for the first day of the month (0 = Sunday, 6 = Saturday)
  const startDay = getDay(monthStart)

  // Navigation functions for changing months
  const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1))
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1))

  // Function to get habit data for a specific date
  const getHabitDataForDate = (date: Date) => {
    const formattedDate = format(date, "yyyy-MM-dd")
    return habitData?.find((data) => data.date === formattedDate)
  }

  // Function to calculate the completion percentage for a day
  const getCompletionPercentage = (data?: HabitData) => {
    if (!data) return 0
    const completed = [data.journal_text, data.start, data.scale_rating].filter(item => item != null).length
    return (completed / 3) * 100
  }

  // Function to get the appropriate background color based on completion percentage
  const getBackgroundColor = (percentage: number) => {
    if (percentage === 0) return "bg-muted"
    if (percentage <= 34) return "!bg-green-300 dark:!bg-green-800"
    if (percentage <= 67) return "!bg-green-500 dark:!bg-green-650"
    return "!bg-green-700 dark:!bg-green-500"
  }

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Habit Tracker</h2>
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="icon" onClick={previousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h3>
          <Button variant="outline" size="icon" onClick={nextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>


      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Empty cells for days before the start of the month */}
        {Array.from({ length: startDay }).map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square"></div>
        ))}

        {/* Days of the month */}
        <TooltipProvider>
          {daysInMonth.map((day) => {
            const dayData = getHabitDataForDate(day)
            const completionPercentage = getCompletionPercentage(dayData)
            const backgroundColor = getBackgroundColor(completionPercentage)

            return (
              <Tooltip key={day.toString()}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "aspect-square rounded-md flex items-center justify-center cursor-pointer transition-colors",
                      backgroundColor,
                    )}
                  >
                    <span className="text-sm">{format(day, "d")}</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <div className="text-sm">
                    <p className="font-medium">{format(day, "MMMM d, yyyy")}</p>
                    {dayData ? (
                      <div className="mt-1">
                        <p>Journal: {dayData.journal_text ? "✅" : "❌"}</p>
                        <p>Data Intake: {dayData.scale_rating ? "✅" : "❌"}</p>
                        <p>Sleep: {dayData.start ? "✅" : "❌"}</p>
                      </div>
                    ) : (
                      <p className="mt-1">No data recorded</p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>
      </div>
    </div>
  )
}

