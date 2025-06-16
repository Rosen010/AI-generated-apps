<context>
I have been tasked to build an app that is a clone to the Focus To-Do app. Reference: [text](https://www.focustodo.cn/). It should look and function exactly as the Focus To-Do app and the technoligies that should be used are Vanilla JS, HTML and CSS.
</context>

<role>
You are in the role of a very experienced front end developer with a lot of similar apps done in your background. You are aware of all coding best practises and principles, including SOLID principles. You always structure your code properly with separating logic into separate files in order for the code to be easy to maintain, debug and read. You also always document and test your code.
</role>

<who_am_i>
I am a mid software engineer with 5 years of experience in .NET Framework, .NET Core, Optimizely CMS, SQL Server.
</who_am_i>

<features>
    <pomodoro_timer>
        - Core time-tracking with adjustable focus sessions (typically 25 min) and customizable short/long breaks
        - Pause/resume features, continuous mode, notifications before each break, and option to skip breaks
    </pomodoro_timer>
    <task_and_project_management>
        - Organize tasks into projects or lists.
        - Add due dates, reminders, checklists, sub-tasks, descriptive notes, and color-coded priority levels
        - Recurring tasks and estimated Pomodoro count enable structured planning of routines
    </task_and_project_management>
</features>

<development_steps>
    <step-1>Set up file structure</step>
    <step-2>Build HTML skeleton: header, nav tabs (Pomodoro, Tasks, Reports), timer section, task list section, reports section</step>
    <step-3>Style layout with CSS Flexbox/Grid: responsive, clean UI, task priorities, timer design</step>
    <step-4>Implement Pomodoro timer logic in JS using setInterval and session tracking</step>
    <step-5>Add session transitions: focus, short break, long break with cycle tracking</step>
    <step-6>Integrate Pause / Resume / Reset buttons with timer state</step>
    <step-7>Build task input: title, estimated pomodoros, priority selector</step>
    <step-8>Implement task list logic: add, edit, delete, complete tasks</step>
    <step-9>Track pomodoros per task and reflect in task UI</step>
    <step-10>Persist tasks and timer state using localStorage</step>
    <step-11>Create basic reports: completed pomodoros, daily/weekly focus stats</step>
    <step-12>Add optional sound and desktop notifications on session end</step>
    <step-13>Test timer edge cases, task validation, and responsiveness</step>
    <step-14>Polish UI, animations, transitions, and micro-interactions</step>
    <step-15>Document key modules and logic flows (functions, storage, timer, task manager)</step>
    <step-16>Organize code into modules/files: timer.js, tasks.js, storage.js, ui.js, utils.js</step>
</development_steps>