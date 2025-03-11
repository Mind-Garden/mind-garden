// emailTemplates.ts

const APP_LINK = 'https://mindgarden.vercel.app';
const REMINDERS_LINK = 'https://mindgarden.vercel.app/reminders';
const JOURNAL_LINK = 'https://mindgarden.vercel.app/journal';
const HABITS_LINK = 'https://mindgarden.vercel.app/data-intake';

// Reminder 1: No App Usage in Over a Day
export const NO_USAGE_SUBJECT = 'We Miss You — Check In With Yourself Today';

export const NO_USAGE_TEXT = `
Hi there,

We noticed you haven’t checked in with Mind Garden for a little while — we just wanted to gently remind you that your well-being matters, and we’re here whenever you’re ready.

Even just a few minutes today can help you stay in touch with how you’re feeling. Your journal, habits, and reflection tools are ready when you are!

Take a moment for yourself — you deserve it.

${APP_LINK}

Take care,  
The Mind Garden Team
`;

export const NO_USAGE_HTML = `
<p>Hi there,</p>
<p>We noticed you haven’t checked in with Mind Garden for a little while — we just wanted to gently remind you that your well-being matters, and we’re here whenever you’re ready.</p>
<p>Even just a few minutes today can help you stay in touch with how you’re feeling. Your journal, habits, and reflection tools are ready when you are!</p>
<p><a href="${APP_LINK}" style="color:#4CAF50; text-decoration:none; font-weight:bold;">Open Mind Garden</a></p>
<p>Take care,<br>The Mind Garden Team</p>
`;

// Reminder 2: Both Journal & Habit Form Incomplete
export const BOTH_FORMS_INCOMPLETE_SUBJECT = 'Don’t Forget Your Daily Check-In';

export const BOTH_FORMS_INCOMPLETE_TEXT = `
Hi there,

Just a quick reminder — you haven’t completed your journal entry or habit form for today.

Taking a few moments to reflect and track your progress can make a big difference in understanding your patterns and celebrating your wins, big or small.

It’s never too late to check in with yourself.

${APP_LINK}

Take care,  
The Mind Garden Team
`;

export const BOTH_FORMS_INCOMPLETE_HTML = `
<p>Hi there,</p>
<p>Just a quick reminder — you haven’t completed your journal entry or habit form for today.</p>
<p>Taking a few moments to reflect and track your progress can make a big difference in understanding your patterns and celebrating your wins, big or small.</p>
<p>It’s never too late to check in with yourself. <a href="${APP_LINK}">Complete your daily check-in here</a>.</p>
<p>Take care,<br>The Mind Garden Team</p>
`;

// Reminder 3: Journal Incomplete
export const JOURNAL_INCOMPLETE_SUBJECT = 'Your Daily Journal Awaits';

export const JOURNAL_INCOMPLETE_TEXT = `
Hi there,

We noticed you haven’t completed your journal entry for today. Taking just a few moments to write down your thoughts can help you better understand your feelings and reflect on your day.

Even a short entry can be valuable — every check-in counts!

${JOURNAL_LINK}

Take care,  
The Mind Garden Team
`;

export const JOURNAL_INCOMPLETE_HTML = `
<p>Hi there,</p>
<p>We noticed you haven’t completed your journal entry for today. Taking just a few moments to write down your thoughts can help you better understand your feelings and reflect on your day.</p>
<p>Even a short entry can be valuable — every check-in counts!</p>
<p><a href="${JOURNAL_LINK}/journal">Write your journal entry here</a></p>
<p>We’re here for you,<br>The Mind Garden Team</p>
`;

// Reminder 4: Habit Form Incomplete
export const HABIT_FORM_INCOMPLETE_SUBJECT =
  'Don’t Forget to Track Your Habits';

export const HABIT_FORM_INCOMPLETE_TEXT = `
Hi there,

This is just a gentle reminder that your habit form for today hasn’t been completed yet. Tracking your habits helps you celebrate progress and stay mindful of your goals — no step is too small.

${HABITS_LINK}

Take care,  
The Mind Garden Team
`;

export const HABIT_FORM_INCOMPLETE_HTML = `
<p>Hi there,</p>
<p>This is just a gentle reminder that your habit form for today hasn’t been completed yet. Tracking your habits helps you celebrate progress and stay mindful of your goals — no step is too small.</p>
<p><a href="${HABITS_LINK}/daily-intake">Complete your habit form here</a></p>
<p>You’ve got this,<br>The Mind Garden Team</p>
`;
