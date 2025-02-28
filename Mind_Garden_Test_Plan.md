

*ChangeLog*

| Version  | Change Date | By | Description  |
| :---: | :---: | :---: | :---: |
|  1.0 | Feb 14, 2025 | Hassan Khan | Initial Draft |
| 1.1 | Feb 26, 2025 | Caroline | Sprint 2 |
|  |  |  |  |

 # **Introduction**

   ##  **Scope**

  Scope defines the features and functional or non-functional requirements of the software that **will be** tested.

  Testing Scope for Sprint 2:

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

### Unit/Integration test

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


## **Test Completeness**

* 100% back-end code coverage (mandatory for this project), all the back-end source code should be covered by test cases.

# **Resource & Environment Needs**

## **Testing Tools**

* Jest

## **Test Environment**

* Our GitHub Actions uses ubuntu-latest, but can be run on Windows/macOS

# **Terms/Acronyms** 

* None.

