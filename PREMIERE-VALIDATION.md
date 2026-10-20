# Premiere Host Validation Guide

This is the final real-world validation pass for LayerPop Viral Captions 5.2. It must be run inside Adobe Premiere Pro on a Windows machine because the CEP bridge and MOGRT behavior are host-dependent and cannot be validated from a browser-only environment.

## Preconditions
- Windows 10/11
- Adobe Premiere Pro installed
- The LayerPop extension copied into `%APPDATA%\Adobe\CEP\extensions\LayerPop-Viral-Captions-5.0`
- A project file ready to open
- At least one valid media file for transcription
- A valid MOGRT file for insertion testing
- Optional: a valid Gladia API key

## 1) Install the extension
1. Copy the project folder into:
   `%APPDATA%\Adobe\CEP\extensions\LayerPop-Viral-Captions-5.0`
2. Make sure the folder contains:
   - `index.html`
   - `app.js`
   - `styles.css`
   - `CSInterface.js`
   - `jsx\main.jsx`
3. Restart Premiere if it is already running.

## 2) Launch the extension
1. Open Premiere Pro.
2. Go to `Window` > `Extensions` > `LayerPop Viral Captions` (or the extension name shown in your install).
3. Confirm the panel opens and the bridge status is visible.

## 3) Validate the bridge status
Expected result:
- The top bar should display a status such as `Premiere bridge connected` or a meaningful message if unavailable.

Checks:
- If the panel says `CEP host bridge unavailable`, the CEP runtime is not initializing correctly.
- If the panel says `Premiere bridge unavailable`, check that the CEP extension is loaded and the host is awake.

Important notes:
- This is a host-only feature; the browser cannot emulate the Adobe CEP environment.

## 4) Validate the active sequence state
1. Open or create a project with an active sequence.
2. In the extension, check whether the bridge status reflects the active sequence.
3. Confirm the extension does not crash when there is no active sequence.

Expected result:
- If a sequence exists, the status should reflect a valid project/sequence state.
- If no sequence exists, the panel should remain stable and show a safe message.

## 5) Validate the style workflow
In the first panel:
- select a preset
- confirm the active preset highlight is visible
- change accent color
- change text color
- change font size
- confirm the live preview updates instantly

Pass condition:
- No visual lag, no broken rendering, no console errors.

## 6) Validate the text & timing workflow
### SRT import
1. Prepare a small `.srt` file with 3–10 timed entries.
2. Import it through the SRT import UI.
3. Confirm the word list populates correctly.
4. Confirm the word count updates.
5. Confirm the timeline renders correctly.

Expected result:
- Words are split and visible in the editor
- Start/end values populate correctly
- Timeline uses the imported timestamps

### Transcript split
1. Paste a short transcript into the transcript modal.
2. Enter a realistic duration.
3. Click `Split into words`.
4. Confirm the word editor fills with tokens.

Expected result:
- Transcript is split into editable words
- No malformed tokens or blank rows

### Manual word edit
1. Edit several word texts.
2. Adjust start/end values for a couple rows.
3. Confirm timeline changes reflect the adjusted timing.

Expected result:
- UI remains stable after editing
- no row duplication or broken layout

## 7) Validate export flow
### SRT export
1. Create a few words with valid timing.
2. Click `Export SRT`.
3. Confirm the browser downloads a valid SRT file.
4. Open it in a text editor and check the formatting.

Expected result:
- Valid cue numbering
- Correct time format
- Each cue has a text value

### ASS export
1. Select a preset color and animation style.
2. Click `Export ASS`.
3. Confirm a file downloads successfully.
4. Open the file and inspect the script structure.

Expected result:
- Valid `[Script Info]` and `[Events]` blocks
- Sane style data
- No malformed dialogue

## 8) Validate local transcription
1. Start `START-LOCAL-TRANSCRIPTION.bat` in the project folder.
2. Wait for dependencies and the model to finish downloading.
3. Make sure the service is listening on `http://127.0.0.1:8765`.
4. In LayerPop, click `Transcribe locally (free)`.
5. Choose a short audio/video file.
6. Wait for import.

Expected result:
- Word timestamps populate the timeline
- Word count increases
- Panel remains responsive
- No browser JS errors

If it fails:
- Check the Python/FFmpeg environment
- Verify the server is still running
- Check the terminal output for model install or runtime errors
- Confirm the file is a supported format

## 9) Validate Gladia cloud transcription
1. Enter a valid Gladia API key.
2. Choose a short media file.
3. Click `Transcribe with Gladia`.
4. Wait for the upload + polling lifecycle.

Expected result:
- Import completes successfully
- Word timestamps appear correctly
- The panel remains stable after the import

If it fails:
- Check API key validity
- Check account credit availability
- Confirm the local companion service is still running
- Review the server terminal output

## 10) Validate MOGRT selection and insertion
1. In the layout panel, click `Choose file`.
2. Select a valid `.mogrt` file.
3. Confirm the file status updates to the chosen filename.
4. Click the import or insert action if available in your build.
5. Confirm the host accepts the request without crashing.

Expected result:
- File path is captured correctly
- Status text updates
- Host receives the request without error

Important: This is a best-effort integration and is not guaranteed to work for every MOGRT type or project structure.

## 11) Final pass/fail criteria
Pass if all of the following are true:
- The panel loads inside Premiere without crashes
- The bridge status reflects the host environment correctly
- SRT import/export works
- ASS export works
- Transcript split flow works
- Local transcription works on at least one valid media file
- Gladia flow works with a valid key
- MOGRT selection shows valid status and host integration remains stable

Fail if any of the following happen:
- extension fails to load
- bridge status remains unavailable in a valid host environment
- panel crashes when sequence is active or absent
- exports generate malformed files
- transcription imports no words or throws runtime errors
- MOGRT selection fails silently or crashes the host

## 12) Capture evidence for release
Before release, collect:
- screenshots of the panel in Premiere
- screenshots of bridge status and file selection responses
- exported SRT and ASS file examples
- a short video or notes of local transcription working
- MOGRT validation notes with actual host behavior

## 13) Release recommendation
This validation pass is required before calling the build a true production release.

The browser build is already polished and functionally stable. The host-side validation is the final proof required for a real public release because CEP and MOGRT behavior depend on Adobe Premiere runtime conditions.
