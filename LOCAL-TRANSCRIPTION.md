# LayerPop local transcription (Windows)

This optional companion service runs speech recognition on your PC using faster-whisper. No paid cloud API key is required. It returns word-level timestamps which the CEP panel imports into the word editor.

## Requirements
- Windows 10/11 x64
- Python 3.11 x64 from python.org (enable **Add Python to PATH**)
- Internet access for first-time package/model downloads
- Free disk space for Python packages and the Whisper model

## Start it
1. Double-click `START-LOCAL-TRANSCRIPTION.bat` in the LayerPop project folder.
2. Wait for pip to install the packages. On first transcription, faster-whisper downloads the `small` model (model size can be changed with `LAYERPOP_WHISPER_MODEL`).
3. Keep the terminal window open while using LayerPop. It listens only on `127.0.0.1:8765`.
4. In Premiere, open LayerPop, go to **Text & timing**, click **Transcribe media locally**, choose a media file and wait for the result.

## Accuracy and performance
- The service requests word timestamps from faster-whisper. Timing/word segmentation quality depends on audio quality, language, model and speaker overlap. Review the word editor before export.
- CPU mode is the default for broad compatibility and can be slow on long media. `small` is a practical default; `medium`/`large-v3` may improve some languages but use more memory and run slower.
- This service processes media locally after required packages/model are downloaded. It does not call a paid cloud transcription API.
- Uploaded media is sent from the panel to your own computer's loopback address and is stored temporarily for processing, then deleted.

## Troubleshooting
- If the panel says it cannot connect, start the batch file and check `http://127.0.0.1:8765/health` in a browser.
- If `py -3.11` fails, install Python 3.11 x64, then rerun the batch file.
- Media decoding relies on faster-whisper's bundled CTranslate2/FFmpeg support. Some unusual containers/codecs may fail.
- This is a local companion service, not a standalone installer. The Python packages and model download are not bundled in the ZIP.


## Gladia cloud mode (optional)
1. Create/sign into a Gladia account at https://app.gladia.io and copy your API key.
2. Start the same local companion with `START-LOCAL-TRANSCRIPTION.bat`.
3. In LayerPop, paste the key into the Gladia API key field, click **Transcribe with Gladia**, and choose your media file.
4. The companion uploads the selected file to Gladia's v2 API and polls for the word-timestamp result. The key is not saved to disk by the companion.

Cloud transcription uses your Gladia account's available credits and limits. It is not unlimited free service. Selected media is uploaded to Gladia.
