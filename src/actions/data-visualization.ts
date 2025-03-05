import {selectData} from "@/supabase/dbfunctions";


export async function selectMoodDataByDateRange(userId: string, startDate: string, endDate: string) {

    const table = 'responses'; 
    const columns = ['scale_rating', 'entry_date'];
    const conditions = {
      user_id: userId,
    };
  
    const { data, error } = await selectData(table, conditions, columns, startDate, endDate);
  
    if (error) {
      console.error("Error fetching mood data:", error.message);
      return { error: error.message };
    }
  
    return { data }
  }
