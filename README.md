# LayerPop Viral Captions 5.2 — CEP + Cloud/Local Transcription

## What is included in this build
- 36 original caption style presets, color controls and live preview.
- Editable word cues/timing timeline.
- SRT import/export and ASS export with basic fade/pop/scale tags and top/center/bottom placement. ASS effects depend on the player/editor interpreting the tags.
- Local speech transcription companion powered by faster-whisper (free local processing; downloads Python packages and a model on first run).
- Optional Gladia cloud transcription using your own API key and account credits. Selected media is uploaded to Gladia; the key is sent to the local companion for that request and is not written to disk by this extension.
- CEP bridge diagnostic and best-effort selected-MOGRT insertion.

## Setup
1. Back up your current extension folder. Copy this folder into `%APPDATA%\Adobe\CEP\extensions\LayerPop-Viral-Captions-5.0` (folder name can remain as shown).
2. Install Python 3.11 x64, then run `START-LOCAL-TRANSCRIPTION.bat`. Leave its terminal open. The first run installs dependencies.
3. Restart Premiere Pro and open LayerPop from the Extensions menu.
4. For local transcription, click **Transcribe locally (free)** and choose media. For cloud, enter your Gladia API key, click **Transcribe with Gladia**, and choose media. Create a Gladia account/key at https://app.gladia.io.

## Cost and privacy
- Local mode processes media on your PC after dependencies/model are downloaded.
- Gladia mode sends the selected media to Gladia. Free credits/quotas are controlled by Gladia and are not unlimited or guaranteed to renew. Do not use cloud mode for sensitive media unless you are comfortable sending it to the provider.
- The companion binds to `127.0.0.1` only; it is intended for the local extension.

## Important limitations (not hidden)
- This is an in-progress CEP extension, not a feature-complete SubKick clone.
- The style picker previews presets, but not every preset has been verified in a native Premiere graphic.
- ASS export includes subtitle styling and basic timed effects for compatible ASS renderers; it does not create native editable Premiere graphics.
- The selected MOGRT insertion is a best-effort call and needs live Premiere testing. Generic replacement of arbitrary MOGRT text and generating one native animated Premiere graphic per word is not implemented in this build.
- Gladia integration is coded against the documented v2 upload/pre-recorded workflow but requires a real API key and a live end-to-end test.
