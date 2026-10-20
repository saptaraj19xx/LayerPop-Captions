# LayerPop Viral Captions 5.2

LayerPop Viral Captions is a Premiere-oriented caption workflow for creating, editing, styling, and exporting word-level subtitles for video content.

It is designed to help creators and editors move faster from transcript to finished caption file with a clean UI, live preview, flexible styling, and support for common subtitle export formats.

## What this project includes

- 36 original caption style presets with color controls and live preview
- Editable word cues and timeline-based timing controls
- SRT import/export and ASS export support
- Local speech transcription workflow powered by a local companion
- Optional Gladia cloud transcription using a user-provided API key
- Premiere CEP bridge diagnostics and best-effort selected-MOGRT insertion

## Supported export formats

- SRT
- ASS
- Premiere-oriented generation workflow for word-level caption placement

## Why this project exists

Subtitle work is often slow, repetitive, and highly manual. LayerPop aims to simplify that process by combining:

- rapid caption generation
- easy word-level editing
- live visual styling
- export-ready subtitle formats
- flexible transcription options

## Features

### Caption workflow
- Create subtitle blocks from transcript text
- Split transcripts into word-level cues
- Adjust start/end timing for individual words
- Import SRT files and preserve timing metadata

### Styling
- Choose from multiple preset looks
- Adjust accent color, text color, and font size
- Preview styles live before export
- Control animation style and caption placement

### Transcription
- Local transcription using a free local-processing workflow
- Optional cloud transcription through Gladia
- Compatibility with audio and video inputs

### Export
- Export timed subtitle files as SRT
- Export styled subtitle files as ASS
- Prepare a workflow for Premiere-based generation and placement

## Supported use cases

- Social media captions
- Short-form video subtitles
- Podcast subtitle workflows
- Creator and editor production pipelines
- Multilingual subtitle preparation

## Setup

1. Back up your current extension folder.
2. Copy this project into your Adobe CEP extensions folder.
3. Install Python 3.11 x64.
4. Run `START-LOCAL-TRANSCRIPTION.bat` and leave the terminal open.
5. Restart Premiere Pro and launch LayerPop from the Extensions menu.
6. Use either the local transcription mode or the Gladia cloud mode depending on your workflow.

## Local transcription

The local transcription companion uses a free local processing pipeline. On first run, it installs required Python dependencies and downloads the speech model needed for transcription.

## Gladia cloud transcription

Cloud transcription is optional and uses your own Gladia API key. The selected media is uploaded to Gladia for processing, and the key is used only for that request.

## Privacy and cost notes

- Local mode processes media on your PC after dependencies and model files are downloaded.
- Cloud mode sends selected media to Gladia. Credits and quotas are managed by Gladia and are not guaranteed.
- Do not use cloud mode for sensitive media unless you are comfortable with external processing.
- The local companion binds only to `127.0.0.1` and is intended for local extension use.

## Important limitations

This is an in-progress CEP extension and not a fully feature-complete clone of a commercial caption suite.

- Style presets are previewed in the UI, but not every preset has been fully verified in native Premiere graphics.
- ASS export includes subtitle styling and simple timed effects for compatible ASS renderers; it does not create fully native Premiere editable graphics.
- Selected MOGRT insertion is best-effort and requires live Premiere validation.
- Gladia integration requires a valid API key and a live end-to-end test in a real environment.

## Project status

This project is under active development and focuses on subtitle generation, caption styling, and export workflows for modern video production.

## License

Please check the repository for the current license file if one is included in this project.

## Repository overview

This repository includes:

- web-based UI for caption creation and styling
- editor logic for word-level subtitles
- export routines for SRT and ASS
- local transcription companion support
- Premiere bridge integration points
- configuration and workflow support for cloud transcription
