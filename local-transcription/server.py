from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
from pathlib import Path
import tempfile, os, threading, time, requests

app = FastAPI(title="LayerPop Local Transcription", version="1.0.0")
app.add_middleware(CORSMiddleware, allow_origins=["null", "*"], allow_credentials=False, allow_methods=["*"], allow_headers=["*"])
_model = None
_lock = threading.Lock()
MODEL_SIZE = os.environ.get("LAYERPOP_WHISPER_MODEL", "small")
DEVICE = os.environ.get("LAYERPOP_WHISPER_DEVICE", "cpu")
COMPUTE = os.environ.get("LAYERPOP_WHISPER_COMPUTE", "int8")

def get_model():
    global _model
    with _lock:
        if _model is None:
            _model = WhisperModel(MODEL_SIZE, device=DEVICE, compute_type=COMPUTE)
    return _model

@app.get("/health")
def health():
    return {"ok": True, "engine": "faster-whisper", "model": MODEL_SIZE, "device": DEVICE}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    suffix = Path(file.filename or "media.bin").suffix or ".bin"
    tmp_path = None
    try:
        data = await file.read()
        if not data:
            raise HTTPException(status_code=400, detail="Uploaded media file is empty.")
        if len(data) > 2 * 1024 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File exceeds 2 GB limit.")
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(data); tmp_path = tmp.name
        model = get_model()
        segments, info = model.transcribe(tmp_path, word_timestamps=True, vad_filter=True, beam_size=5)
        words = []
        for segment in segments:
            for word in (segment.words or []):
                token = (word.word or "").strip()
                if token and word.end > word.start:
                    words.append({"text": token, "start": round(float(word.start), 3), "end": round(float(word.end), 3)})
        return {"language": getattr(info, "language", None), "duration": getattr(info, "duration", None), "words": words, "engine": "faster-whisper", "model": MODEL_SIZE}
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Transcription failed: {exc}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try: os.remove(tmp_path)
            except OSError: pass


@app.post("/transcribe-gladia")
async def transcribe_gladia(file: UploadFile = File(...), api_key: str = Form("")):
    """Use the user's own Gladia API key for cloud transcription. Key is never saved."""
    key = (api_key or "").strip()
    if not key:
        raise HTTPException(status_code=400, detail="Enter your Gladia API key.")
    suffix = Path(file.filename or "media.bin").suffix or ".bin"
    tmp_path = None
    headers = {"x-gladia-key": key, "accept": "application/json"}
    try:
        data = await file.read()
        if not data:
            raise HTTPException(status_code=400, detail="Selected media file is empty.")
        if len(data) > 2 * 1024 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File exceeds 2 GB limit.")
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp.write(data); tmp_path = tmp.name
        # Gladia v2 uses a two-step flow: upload then create/poll a pre-recorded job.
        with open(tmp_path, "rb") as media:
            upload = requests.post("https://api.gladia.io/v2/upload", headers=headers,
                files={"audio": (Path(file.filename or "media").name, media, file.content_type or "application/octet-stream")}, timeout=300)
        if upload.status_code >= 400:
            raise HTTPException(status_code=502, detail="Gladia upload failed (HTTP %s): %s" % (upload.status_code, upload.text[:500]))
        upload_data = upload.json()
        audio_url = upload_data.get("audio_url") or upload_data.get("url")
        if not audio_url:
            raise HTTPException(status_code=502, detail="Gladia upload response did not contain an audio_url.")
        init = requests.post("https://api.gladia.io/v2/pre-recorded", headers={**headers, "Content-Type":"application/json"},
            json={"audio_url": audio_url, "detect_language": True, "custom_vocabulary": []}, timeout=60)
        if init.status_code >= 400:
            raise HTTPException(status_code=502, detail="Gladia job creation failed (HTTP %s): %s" % (init.status_code, init.text[:500]))
        job = init.json()
        result_url = job.get("result_url")
        job_id = job.get("id")
        if not result_url and job_id:
            result_url = "https://api.gladia.io/v2/pre-recorded/" + str(job_id)
        if not result_url:
            # Some API configurations return the result immediately.
            result = job
        else:
            result = None
            for _ in range(180):
                poll = requests.get(result_url, headers=headers, timeout=30)
                if poll.status_code >= 400:
                    raise HTTPException(status_code=502, detail="Gladia result polling failed (HTTP %s): %s" % (poll.status_code, poll.text[:500]))
                candidate = poll.json()
                status = str(candidate.get("status", "")).lower()
                if status in ("done", "completed", "success") or candidate.get("result") or candidate.get("transcription"):
                    result = candidate
                    break
                if status in ("error", "failed", "cancelled"):
                    raise HTTPException(status_code=502, detail="Gladia transcription job failed: " + str(candidate.get("error") or candidate.get("message") or status))
                time.sleep(2)
            if result is None:
                raise HTTPException(status_code=504, detail="Timed out waiting for Gladia. Check your Gladia dashboard for job status.")
        # Accept the common v2 shape and nested result/transcription shapes.
        roots = [result]
        for k in ("result", "transcription", "prediction"):
            v = result.get(k) if isinstance(result, dict) else None
            if isinstance(v, dict): roots.append(v)
        words = []
        def add_word(item):
            if not isinstance(item, dict): return
            text = item.get("word") or item.get("text")
            start, end = item.get("start"), item.get("end")
            if text is not None and start is not None and end is not None:
                try:
                    a, b = float(start), float(end)
                    if b > a: words.append({"text": str(text).strip(), "start": round(a, 3), "end": round(b, 3)})
                except (TypeError, ValueError): pass
        for root in roots:
            for key_name in ("words", "utterances", "segments"):
                arr = root.get(key_name) if isinstance(root, dict) else None
                if isinstance(arr, list):
                    for item in arr:
                        if key_name == "words": add_word(item)
                        elif isinstance(item, dict):
                            nested = item.get("words")
                            if isinstance(nested, list):
                                for w in nested: add_word(w)
                            elif key_name == "segments": add_word(item)
        # Deduplicate repeated nested result paths while preserving order.
        unique=[]; seen=set()
        for w in sorted(words, key=lambda x:(x["start"],x["end"])):
            sig=(w["text"],w["start"],w["end"])
            if sig not in seen: seen.add(sig); unique.append(w)
        if not unique:
            raise HTTPException(status_code=502, detail="Gladia job finished, but no word-level timestamps were found in its response. API response schema may have changed.")
        return {"words": unique, "engine": "Gladia", "count": len(unique), "job_id": job_id}
    except HTTPException:
        raise
    except requests.RequestException as exc:
        raise HTTPException(status_code=502, detail="Could not reach Gladia: " + str(exc))
    except Exception as exc:
        raise HTTPException(status_code=500, detail="Gladia transcription failed: " + str(exc))
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try: os.remove(tmp_path)
            except OSError: pass
