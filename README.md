# Premium 3D Interactive Love Experience Website

A production-grade, 13-scene interactive film & romantic keepsake experience featuring Three.js 3D memory shapes, procedural canvas gardens, OLED single-line SVG rooftop sketches, SHA-256 passcode security, Web Audio synthesis, and live in-browser personalisation.

## Quick Start & Passcode
- **Default Passcode:** `0214` (Valentine's Day: Feb 14)
- **SHA-256 Hash in `config.js`:** `025ac3ddef52e0aaa62896954c6fe57948a7c144cb203610499a912b832fd473`

## How to Customise (No Coding Required)

### Method 1: Live In-Browser Edit Mode (Gear Icon `⚙ Edit`)
1. Unlock Scene 2 with passcode `0214`.
2. Click **`⚙ Edit`** in the top navigation bar.
3. Click **`Customise Every Detail`** to change names, dates, passcode (automatically hashed with SHA-256), transition styles, wish text, and love letter paragraphs.
4. Click or drag-and-drop any photo or video from your device onto any memory card, polaroid, cameo frame, or character stage to preview it immediately via `FileReader`.
5. Click **`⬇ Export config.json`** to save your configuration, or **`⬆ Import JSON`** to restore it anytime.
   *(Privacy Note: All uploaded photos and videos stay strictly on your device.)*

### Method 2: Editing `config.js` Directly
Open `config.js` in any text editor and modify `window.LOVE_CONFIG`:
- **`names`**: `from`, `to`, `initials`
- **`relationshipStartDate`**: ISO timestamp (`"YYYY-MM-DDTHH:mm:ss"`) used by Scene 10's live counter
- **`passcodeHash`**: 64-character SHA-256 hex digest of your 4–6 digit code
- **`heartWords`**: Array of words traced in Scene 3
- **`quiz`**: Accepted dates (`YYYY-MM-DD`), cameo caption, and playful wrong-answer messages
- **`photos[]`**: Array of `{ id, src, caption, date, story, tilt, nextScene }`
- **`videos[]`**: Array of `{ id, src, youtubeUrl, poster, title, caption, nextScene }`
- **`music[]`**: Array of `{ id, title, artist, src, cover, tempo, notes }`
- **`characters`**: `boyName`, `girlName`, `boyColor`, `girlColor`, `boyHair`, `girlHair`, `customArtworkSrc`
