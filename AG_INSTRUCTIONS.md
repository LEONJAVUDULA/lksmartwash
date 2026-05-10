# Project Instruction: Persistent Artifact Sync 🔄

**Target**: Every session update (Audits, Implementation Plans, Screenshots) must be synced to the user's Desktop for offline review.

## 📁 Desktop Destination
`C:\Users\leonj\OneDrive\Desktop\LK_Smart_Wash_Project_Updates`

## 📋 Synchronization Policy
- **When**: 
    - At the end of every major feature implementation.
    - Before any break (1 hour or more).
    - At the end of every working day.
- **What to Sync**:
    - All `.md` artifacts (Walkthroughs, Plans, Tasks).
    - All `.png` / `.webp` / `.mp4` (Media/Screenshots).
    - Any critical code audits.

## 🛠️ How to Sync (PowerShell)
Execute the following to copy files from the current conversation's brain folder:
`copy "$env:APPDATA\..\Local\Programs\antigravity\brain\<CONVERSATION_ID>\*" "C:\Users\leonj\OneDrive\Desktop\LK_Smart_Wash_Project_Updates\" -Recurse`
