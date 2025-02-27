# Mind Garden

## Meet the Contributors

| **Name** | **Github Username** |
| --- | --- |
| Ji Min Ryu (Group Leader) | @jiminryuu |
| Manisha Gurukumar  | @gmanishaa |
| Hassan Khan | @hkhan701 |
| Caroline Nieminen | @cnieminen |
| Aiden Park | @orca277 |
| Colm Ukrainec | @colmukrainec |

# Project Proposal

## Vision

At Mind Garden, our mission is to cultivate a space where personal growth and mindfulness flourish through intuitive, data-driven tools. We empower users to nurture healthy habits, reflect deeply, and unlock their potential by seamlessly integrating habit tracking, journaling, and productivity tools into one cohesive experience.

## Summary

Building the habit of self-improvement through journaling can be tough, but Mind Garden is here to help. Mind Garden is a comprehensive space for bettering your mental well-being. It is somewhere to journal, record daily tasks, and track habits to understand how they affect the user’s mental health. The goal of Mind Garden is to simplify the process of consistent journaling and habit tracking. We hope the app gives the user insights into their patterns and helps them achieve their personal goals.

Long-term, we hope that Mind Garden supports the younger generation through their mental health journey. To address the challenge of staying consistent with journaling and habit tracking, we are integrating features like notifications, streaks, and badges. Along with that, we want our user experience to be simple and effective while ensuring all essential information is easily accessible.

We are looking to see a consistent growth of 10% each month. Since consistency is important when it comes to personal development, we hope to see at least 30% of our users use the app daily. By reaching these goals, we can determine that our app was successful.

## Stakeholders

Mind Garden is designed for individuals who want to cultivate mindfulness, track their habits, and enhance personal growth. While young adults looking to build a journaling habit are a key audience, the platform is suitable for:

- **Students & Professionals** – Those looking to manage their daily tasks, reflect on their progress, and maintain healthy habits.
- **Productivity Seekers** – People who want to optimize their routines, set goals, and track their achievements through habit tracking and AI-powered task management.
- **Coaches & Therapists** – Professionals who encourage journaling and habit-building as part of mental health or life coaching practices.

Of course, Mind Garden is suitable to any age, though, if they have a genuine interest in personal development.

## Main Features

Our core features for Mind Garden are the ability to create an account, voice-made daily tasks, daily data intake, a journal entry system, data visualization, and achievement progress tracking. 

- **Create an account:** The user should have the ability to create an account, so the data can follow the user to whatever device they wish to use.
- **Voice-made daily tasks:** At the start of each day, the user can record themselves discussing what needs to be accomplished that day. Mind Garden will then narrow the information down into a simple bullet point list to ensure the user stays on track for the day.
- **Daily data intake:** At the end of each day, the user will be expected to input data relating to the habits they wish to track. This can be something like how much water they drank or how much sleep they got the night prior.
- **Journal entry system:** Along with the daily data intake, the user will be prompted to write in their digital journal. Here, they can either express their feelings freely or use the provided guided questions.
- **Data visualization:** The data from the daily input and journal entries can then be used for data visualization where the user can view their habit patterns and how that might relate to their mood. Summaries from both the daily input and journal entries will be made possible using AI.
- **Achievement progress tracking:** As the user uses Mind Garden, they can achieve things like badges and streaks. For example, if the user writes in their journal every day for 20 days, they can achieve a badge to reward their consistency. The user will also have a streak of 20 days. By implementing badges and streaks, we are hoping to motivate the user to continue to use the application. We think consistency is important for self-improvement.

Our application can respond to 20 users with a total of 200 requests per minute concurrently.

## Technologies

For this project, we are leveraging modern technologies to ensure scalability, maintainability, and performance.

- **Programming Language & Framework**
    - We chose **TypeScript** for its type safety, which helps reduce bugs and improve code reliability.
    - Our framework of choice is **Next.js**, which will be used for both the front-end user interface and back-end server-side logic.
- **Database & Authentication**
    - We are using **Supabase**, a **PostgreSQL**-based solution, due to its scalability, generous free tier, and built-in authentication via **Supabase Auth**, which simplifies user authentication and management.
- **AI Integration**
    - We plan to integrate AI into our project using a local **LLM (Llama)** with an API developed in-house to enhance our features.
- **Hosting & Infrastructure**
    - For hosting, we are evaluating **Microsoft Azure** and **AWS** to determine the best fit for our needs.
    - **Docker** will be used for containerization, ensuring a seamless deployment process.
    - **GitHub Actions** will handle CI/CD to automate testing and deployment.
- **Code Quality & Standards**
    - We will enforce consistent coding standards using **ESLint**, ensuring a clean and maintainable codebase.

## User Stories

1. **Account Creation & Management**
    - As a user, I want to be able to create an account so that I can keep my records.
        - On a registration page, when a user enters a valid email address, password, and any required fields, and clicks "Sign Up", the account is created, and the user is redirected to the welcome page/dashboard. When the user enters an already registered email address and submits the form, the system displays an error message stating the email is already in use.
    - As a user, I want to be able to access my account so that I can view any records I made.
        - When the user has entered their registered email and password and the credentials are correct, the user is logged in and redirected to the dashboard. When the user enters incorrect credentials and the login form is submitted the system displays an error message indicating an incorrect email or password.
    - As a user, I want to be able to reset my password without logging in so that even if I forget my password I can still recover my account.
        - When the user clicks on "Forgot Password" from the login page and the user provides their registered email address, the system sends a password reset email with a unique link to that address. When the user enters and confirms a new password and the new password meets the system's security requirements, the password is updated, and the user is redirected to the login page with a success message.
    - As a user, I want to be able to change the credentials of my account so that in case my information changes I can correct it.
        - When the user is logged in and navigates to the account settings and requests to update email, password, or etc., the system prompts the user to enter the current password for verification. When the user enters new credentials and submits the changes, the system updates the credentials and displays a success message.
    - As a user, I want to be able to delete my account so that all records that I've made are deleted.
        - When the user is logged in and navigates to the account settings and clicks on "Delete Account", the system should ask for confirmation to ensure they want to permanently delete the account. If the user confirms the deletion request, the account and all associated data are permanently deleted from the system. After deletion, the user is logged out and redirected to the homepage.
2. **Daily Data Intake**
    - As a user, I want to be able to track multiple habits so that I can monitor my progress and goals.
        - Given that I am a logged-in user, when I open the “habit tracker” page, then the system shows me all of my habits and allows me to visually fill out whether or not I successfully completed it that day (colored in day for complete).
    - As a user, I want to be able to receive reminders about my daily habits so that I can stay on track and avoid forgetting them.
        - Given that I am a user with an account, when I do not fill out my daily habit trackers by a certain time of the day, then the system sends reminders to complete it.
    - As a user, I want to be able to track my sleep so that I can understand my sleep patterns and improve my well-being.
        - Given that I am a logged-in user, when I open the “sleep tracker” page, then the system allows me to fill in information about my sleep and also allows me to view information on days prior.
3. **Journal Entry System**
    - As a user, I want to create a journal entry so that I can document my thoughts throughout the day.
        - Given that I am a logged-in user, when I am on the homepage then the system shows me a journal entry portion of the screen and when I click create new entry then the system shows me an empty page that I can write in.
    - As a user, I want guidance for my journal entry in the form of prompts so that my ideas are better organized.
        - Given that I am a logged-in user already in the new journal entry, when I click on the options button and I click on guided journaling then I can see a prompt for me to write about above the empty page.
    - As a user, I want to be able to view my past journal entries so that I can reflect on my progress.
        - Given that I am a logged-in user, when I am on the homepage then the system shows me a journal entry portion of the screen and when I click view past journals then the system shows me all of my past journal entries with their dates.
    - As a user, I want to be able to edit my journal entry so that I can update my thoughts throughout the day.
        - Given that I am a logged-in user and already viewing my past journal entries, when I click on the edit button next to the journal entry then the system opens up that journal entry with text already in it and allows me to make changes.
    - As a user, I want to be able to delete my journal entry so that I can remove any content I do not want anymore.
        - Given that I am a logged-in user and already viewing my past journal entries, when I click on the delete button next to the journal entry then the system removes the entry and I can no longer view it.
4. **Voice-Made Daily Tasks**
    - As a user, I want to be able to speak and annotate my voice for the AI to summarize it so that I can quickly capture my thoughts and convert them into actionable tasks.
        - Given that I am a logged-in user, when I click the tasks menu on the homepage, and I click the "Record Now" button, then the system allows me to record my voice and transcribe it in real-time.
    - As a user, I want to be able to add a task manually if I do not want to use the AI.
        - Given that I am a logged-in user, and viewing my list of tasks, when I click the "Add Task" button, then the system shows an input field to add a new task.
    - As a user, I want to be able to delete a task so that I can keep my task list relevant, or if I make a mistake.
        - Given that I am a logged-in user, and that I am viewing my task list, when I click the "Delete" button next to a task, then the system removes that task, and I will no longer be able to view it.
    - As a user, I want to be able to reorder my tasks so that I can prioritize them based on importance or urgency.
        - Given that I am a logged-in user, and that I am viewing my task list, when I click and drag a task to a new position, then the system updates the order of tasks and saves the order.
    - As a user, I want to be able to mark tasks as complete, so that I can track my progress and stay motivated.
        - Given that I am a logged-in user, and that I am viewing my task list, when I click the checkbox button next to a task, then the task is visually marked as complete (strikethrough text).
5. **Achievement Progress Tracking**
    - As a user, I want to be able to view all my earned badges, so that I can see how committed I have been to my habit tracking and journaling.
        - Given that I am a logged-in user and that I am viewing the home page, when I click the badges icon, then the system displays all badges that I have earned as highlighted icons.
    - As a user, I want to be able to view my current streak, so that I can see how many days in a row I have used the app.
        - Given that I am a logged-in user and that I am viewing the home page, then the system shows my streak at the top of the page and that number is reflective of how many days in a row I have used the app.
    - As a user, I want to receive a badge for important milestones, so that I can feel like I am being rewarded for my progress.
        - Given that I am a logged-in user, when I complete a task that deserved a badge, then the system displays a pop-up displaying the badge I just earned.
    - As a user, I want to be able to view unearned badges, so that I can have a goal.
        - Given that I am a logged-in user and that I am viewing the home page, when I click the badges icon, then the system displays all badges that I have earned as unhighlighted icons.

6. **Data Visualization**

    - **As a user, I want to view my habits in a heat map so that I can quickly identify patterns in my habit tracking.**
        - Given that I am a logged-in user and on the habit tracker page, when I select the "Heat Map" view, the system displays a color-coded calendar where completed habits are highlighted with different intensities based on consistency.
    - **As a user, I want to see my longest streak for a habit so that I can track my best performance.**
        - Given that I am a logged-in user and on the habit tracker page, when I select a habit, the system displays the longest number of consecutive days I have completed it.
    - **As a user, I want to see my current streak so that I can stay motivated to maintain consistency.**
        - Given that I am a logged-in user and on the habit tracker page, when I select a habit, the system displays the number of consecutive days I have completed it without breaking the streak.
    - **As a user, I want to see my habits in a calendar view so that I can track my progress over time.**
        - Given that I am a logged-in user and on the habit tracker page, when I select the "Calendar View," the system displays a monthly calendar where each day is marked based on my habit completion.
    - **As a user, I want to view progress charts for my habits so that I can analyze my improvement over time.**
        - Given that I am a logged-in user and on the analytics dashboard, when I select a habit, the system displays a line graph showing my completion trend over weeks or months.
    - **As a user, I want to see my task completion trends in a bar chart so that I can track my productivity.**
        - Given that I am a logged-in user and on the analytics dashboard, when I select "Task Completion," the system displays a bar chart showing the number of tasks I completed each day over the past month.
    - **As a user, I want to see my journaling activity in a visual format so that I can reflect on how often I write.**
        - Given that I am a logged-in user and on the analytics dashboard, when I select "Journaling Activity," the system displays a graph indicating the number of journal entries I have made over time.
    - **As a user, I want to compare my habits, journal entries, and task completion side by side so that I can identify correlations.**
        - Given that I am a logged-in user and on the analytics dashboard, when I choose multiple data points, the system overlays charts to help visualize relationships between habits, journaling, and tasks.
    - **As a user, I want to be able to set goals based on my habits so that I can measure my progress.**
        - Given that I am a logged-in user, when I open the “habit tracker” page, then the system displays the days I completed my habits in a given month or week visually and when I click on the “add goal” button, then the system displays an input field where I can add my goal.
## Architecture Diagram
![arch](public/arch.jpg)

