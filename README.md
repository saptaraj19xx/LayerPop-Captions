# LayerPop Viral Captions

A CEP extension for Adobe Premiere Pro with:
- local faster-whisper transcription
- optional Gladia cloud transcription via the user's own API key
- word-level timing editor and SRT/ASS export
- original caption presets and Premiere bridge hooks

## Quick start
1. Copy the project folder to your CEP extensions folder (for example `%APPDATA%\Adobe\CEP\extensions\LayerPop-Viral-Captions-5.0`).
2. Install Python 3.11 x64.
3. Run `START-LOCAL-TRANSCRIPTION.bat` in the project folder to start the local Whisper service.
4. Launch Premiere Pro and open the LayerPop extension. Use the provider selector to choose Local Whisper or Gladia Cloud.

## Local transcription (free, no paid API required)
- Local mode runs on your machine and does not upload media to a third-party server.
- The first run downloads the Whisper model and Python dependencies.
- CPU mode is the default fallback for compatibility.
- GPU mode is optional when CUDA-enabled dependencies exist.

## Gladia cloud transcription
- The extension can send selected media to Gladia when a user enters their own API key.
- Free credits are limited by Gladia's current terms and are not guaranteed or unlimited.
- Cloud transcription is optional and local Whisper remains available without a paid service.

## Limitations
- Premiere integration is best-effort and should be tested in a real Premiere Pro project.
- MOGRT insertion depends on the available Premiere APIs and the current project setup.
- ASS export supports standard subtitle tags but relies on compatible renderers.

## Windows install notes
- Install Python 3.11 x64 and enable "Add Python to PATH".
- Keep the local transcription terminal open while using the extension.
- If the local service is not reachable, check `http://127.0.0.1:8765/health` in a browser.

## Security notes
- API keys are never saved by the local service. They are sent only for the active request.
- Do not hardcode any shared secrets in the project.
