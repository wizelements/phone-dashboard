# Phone Dashboard

Live file sharing from phone to laptop via Vercel.

## Features
- 📸 Send screenshots instantly
- 📝 Send text notes
- 📁 Send any file type
- 🔄 Auto-refreshing dashboard
- 🗑️ Delete files from dashboard

## Setup

### 1. Deploy to Vercel

```bash
cd ~/projects/apps/phone-dashboard
pnpm install
vercel
```

### 2. Add Vercel Blob Storage

1. Go to Vercel Dashboard → Your Project → Storage
2. Click "Create Database" → Select "Blob"
3. Follow prompts to create blob store
4. Vercel automatically adds `BLOB_READ_WRITE_TOKEN` to your project

### 3. Optional: Add Upload Secret

For security, add an upload secret:

```bash
vercel env add UPLOAD_SECRET
# Enter a random secret string
```

### 4. Configure Termux

Add to `~/.env.supercharge`:

```bash
PHONE_DASHBOARD_URL=https://your-project.vercel.app
PHONE_DASHBOARD_SECRET=your-secret-here  # if you set UPLOAD_SECRET
```

## Usage

### CLI Commands

```bash
# Send a file
send-to-dashboard /path/to/file.png

# Send screenshot
send-to-dashboard --screenshot
# or
send-screenshot

# Send text note
send-to-dashboard --text "Remember to call mom"
# or
send-note "Remember to call mom"
```

### Widgets (Termux:Widget)
- **send-screenshot** - Take & send screenshot
- **send-to-laptop** - Pick file to send
- **quick-note** - Send text note

### Voice Commands (after Tasker setup)
- "Send screenshot to laptop"
- "Send to laptop [filename]"

## Dashboard

Open your Vercel URL on your laptop. The dashboard:
- Auto-refreshes every 3 seconds
- Groups files by type (images, text, code, other)
- Shows text/code file contents inline
- Allows deleting files

## Tasker Import

Import these tasks from `~/storage/shared/Tasker/`:
- `Voice_SendScreenshot.tsk.xml`
- `Voice_SendToLaptop.tsk.xml`

Create AutoVoice profiles:
- "send screenshot to laptop" → Voice_SendScreenshot
