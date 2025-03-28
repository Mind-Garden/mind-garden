

*ChangeLog*

| Version  | Change Date | By | Description  |
| :---: | ----- | :---: | :---: |
|  1.0 | Feb 14, 2025 | Hassan Khan | Initial Draft |
| 1.1 | Feb 26, 2025 | Caroline | Sprint 2 |
| 1.2 | Mar 20, 2025 | Caroline & Hassan | Sprint 3 |
| 1.3 | Mar 27, 2025 | Hassan Khan | Sprint 4 |

# **Introduction**

 ##  **Scope**

Scope defines the features and functional or non-functional requirements of the software that **will be** tested.

Testing Scope:

1. Account Management  
   1. Account Creation  
   2. Account Login  
   3. Account Deletion  
   4. Account Information Modification  
   5. Password Change  
2. Daily Data Intake  
   1. Habit Tracker  
   2. Reminders  
   3. Sleep Tracker  
3. Journal Entry System  
   1. Create Journal Entry  
   2. Edit Journal Entry  
   3. Delete Journal Entry  
   4. Journal Entry Prompt  
   5. View Journal Entries  
4. Voice-Made Daily Tasks  
   1. AI Summarization of Tasks with Speech Synthesis  
   2. Add task manually  
   3. Delete Task  
   4. See previously uncompleted tasks  
   5. Mark Tasks as Complete  
5. Reminders   
   1. Set reminder time \#101  
   2. Receive reminders about data intake and journal  
   3. Receive reminders when inactive  
   4. Format reminder messages  
   5. Disable reminders  
6. Data Visualization  
   1. Heat map for tracking data entry  
   2. View quantifiable data   
   3. Sleep chart   
   4. Moodbar/Moodflow visualization  
   5. AI summary of sleep data and mood data  
   6. Create functionality for creating personalized habit tracking

## **Roles and Responsibilities** 

| Name | GitHub username | Role |
| :---- | :---- | :---- |
| Ji Min Ryu | @jiminryuu | Back-end Developer |
| Hassan Khan | @hkhan701 | Full-stack Developer |
| Manisha Gurukumar | @gmanishaa | Front-end Developer |
| Caroline Nieminen | @cnieminen | Full-stack Developer |
| Colm Ukrainec | @colmukrainec | Full-stack Developer |
| Aiden Park | @orca277 | Test Manager/Back-end Developer |

Role Details:

1. Front-end Developer  
- Focused on creating user-friendly UI and UX  
2. Back-end Developer  
- Focused on creating the logic and managing the database, which will be displayed by the front-end  
3. Test Manager  
- Responsible for managing the Testing Suite for our application

Other group roles such as QA or documentation are spread out evenly between members.

# **Test Methodology**

## **Test Levels**

### We will be conducting both unit, integration, and acceptance testing

* Account system:  
  * Log in a user   
    * Email and corresponding password  
    * Email and password that don’t match  
  * Sign up a user   
    * Unique email  
    * Long enough password  
    * First and last name are not missing or too short  
  * Log out user  
  * Delete user account  
  * Modify user account (first name, last name, email)  
    * Email is unique still  
    * First and last name are not missing or too short  
  * Modify password  
    * Password is long enough  
    * Password is not long enough  
* Journal entry system:  
  * Save journal entry  
    * Entry contains text  
    * Entry is empty  
  * Fetch journal entry  
  * Update journal entry  
    * Updated entry is empty  
    * Updated entry contains text  
  * Test UndoConversion Utility function  
  * Delete journal entry  
    * Entry that exists  
    * Entry that does not exist  
  * Get random prompt  
* Daily data intake:  
  * Get categories  
  * Get attributes  
  * Get responses for a given user and date  
    * Empty when no data  
  * Insert responses  
  * Update responses  
* Voice-Made Daily Tasks  
  * AI Summarization of Tasks with Speech Synthesis  
  * Add task manually  
  * Delete Task  
  * See previously uncompleted tasks  
  * Mark Tasks as Complete  
* Reminders  
  * Get reminder data  
  * Update reminder data  
  * Send email successfully  
  * Send correct reminder  
    * No reminders selected  
    * Skip if database query fails  
    * Don’t send if forms were completed  
    * Send reminder when no activity for 2+ days  
    * Send if forms were incomplete  
    * Send journal reminder if journal entry was incomplete  
    * Send data intake reminder if data entry was incomplete  
    * Handle user with no entries  
* Data visualizations  
  * Get sleep data  
    * Empty when no data  
  * Convert to 24hr time  
  * Get sleep duration  
  * Get bar colour  
  * Get correct time (AM/PM)  
  * Get mood data  
    * Empty when no data  
  * Get mood frequency  
    * Empty when no data  
  * Get work data  
  * Get study data  
  * Get data by date range  
    * Work data  
    * Study data  
    * Water data  
  * Get heatmap data

### Load Testing 

All load testing for each feature was done using 20 accounts that make 20 requests each resulting in a total of at least 400 requests. All the tests complete in under 2 minutes completing the requirement of handling 20 users with 200 concurrent requests.

*(At least 2 types of requests for each feature)*

Account System:

- Testing the login and logout requests

Journal Entry:

- Testing save entry and delete entry requests

Daily Data Intake

- Testing fetching and saving sleep entry requests
- Testing fetching and submitting rate your day requests

Task Manager:

- Testing adding a task and deleting a task requests

Reminders:

- Testing fetching the current reminders and updating reminder requests

Data Visualization:

- Testing fetching added habit and personalized categories requests

**Local AI LLM Load Testing:**

Tools Used:

- Programming Language: Python (using asyncio for concurrency)
- HTTP Client: aiohttp (for sending asynchronous requests)
- Testing Target: Ollama API running locally (http://localhost:11434/api/chat)
- Concurrency Framework: asyncio.gather() (to send multiple requests simultaneously)

Completed Test Report Link: [Local LLM Load Testing Report](https://github.com/Mind-Garden/mind-garden/wiki/Local-LLM-Load-Testing-Report)

## **Test Completeness**

* 100% back-end code coverage (mandatory for this project), all the back-end source code should be covered by test cases.

# **Resource & Environment Needs**

## **Testing Tools**

* Jest
* Playwright
* Artillery

## **Test Environment**

* Our GitHub Actions uses ubuntu-latest, but can be run on Windows/macOS
* Load testing was completed locally on a powerful machine that can run multiple browser tabs at once

Hardware Requirements:

- A computer with a stable internet connection  
- A computer capable of running a basic development

# **Terms/Acronyms** 

Make a mention of any terms or acronyms used in the project

| TERM/ACRONYM | DEFINITION |
| :---- | :---- |
| API | Application Program Interface |
| AUT | Application Under Test |

