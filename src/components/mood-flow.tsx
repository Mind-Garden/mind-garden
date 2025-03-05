"use client"

import { useState, useEffect } from "react"
import { Line } from "react-chartjs-2"
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from "chart.js"
import { Card, CardContent, CardDescription, CardTitle } from "@/components/ui/card"
import { selectMoodDataByDateRange } from "@/actions/data-visualization"
import { getLocalISOString } from '@/lib/utils';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)


interface MoodDataPoint {
    entry_date: string
    scale_rating: number
}

interface MoodFlowProps {
    // Array of mood data points with date and mood level
    userId: string
    title?: string
}

export default function MoodFlow({ userId, title = "Mood Flow" }: Readonly<MoodFlowProps>) {
    const [moodData, setMoodData] = useState<MoodDataPoint[]>([])

    const todaysDate = getLocalISOString();
    const lastMonthDate = getLocalISOString(new Date(new Date().setMonth(new Date().getMonth() - 1)));

    useEffect(() => {

        const fetchMoodData = async () => {
            const response = await selectMoodDataByDateRange(userId, lastMonthDate, todaysDate)
            if (Array.isArray(response.data) && response.data.every(item => 'entry_date' in item && 'scale_rating' in item)) {
                const moodData = response.data as MoodDataPoint[]
                setMoodData(moodData)
            } else {
                console.error("Unexpected response data format", response.data)
            }
        }
        fetchMoodData()

    }, [])
    // Extract dates and mood levels for the chart
    const dates = moodData.map((item) => item.entry_date)
    const levels = moodData.map((item) => item.scale_rating)

    // Chart configuration
    const chartData = {
        labels: dates,
        datasets: [
            {
                data: levels,
                borderColor: "rgb(0, 100, 10)",
                backgroundColor: "transparent",
                pointBackgroundColor: "rgb(0, 100, 10)",
                pointBorderColor: "rgb(0, 100, 10)",
                zIndex: 10
            },
        ],
    }

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                min: 0,
                max: 6,
                display: false,
                // Make axis border more visible
                border: {
                    display: true,
                    width: 1,
                },
                ticks: {
                    font: {
                        size: 12,
                    },
                    padding: 8, // Add padding between ticks and axis
                },
                grid: {
                    color: "rgba(0, 0, 0, 0.1)", // Lighter grid lines
                },
            },
            x: {
                grid: {
                    display: true,
                    color: "rgba(0, 0, 0, 0.05)", // Even lighter x-axis grid
                },
                ticks: {
                    font: {
                        size: 11,
                    },
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true,
                padding: 10,
                backgroundColor: "rgba(0,0,0,0.7)",
                titleFont: {
                    size: 14,
                },
                bodyFont: {
                    size: 13,
                },

            },
        },
        elements: {
            point: {
                radius: 4,
                hoverRadius: 12,
                borderWidth: 2,
                hitRadius: 25, // Makes points easier to hover
            },
            line: {
                tension: 0.2, // Adds a slight curve to the line
                borderWidth: 3, // Thicker line
            }
        },
        // Add padding around the chart
        layout: {
            padding: {
                left: 10,
                right: 20,
                top: 20,
                bottom: 10
            }
        }
    }

    return (
        <div>
            <Card className="bg-white backdrop-blur-sm rounded-2xl border-none w-1/3">
                <CardTitle className="text-2xl font-bold mb-2 opacity-50 text-center">
                    {title}
                </CardTitle>
                <CardDescription className="text-center text-muted-foreground">
                    from {lastMonthDate} to {todaysDate}
                </CardDescription>
                <CardContent>
                    {moodData.length === 0 ? (
                        // If no moodData
                        <div className="h-16 text-center">No data yet! :( </div>

                    ) : (
                        // If there is moodData, render the chart
                        <div className="h-64 mx-auto">
                            <Line data={chartData} options={chartOptions} />
                        </div>                       
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

