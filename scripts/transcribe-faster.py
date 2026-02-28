from faster_whisper import WhisperModel
import sys
import json
import os

def transcribe(audio_path, model_size="base"):
    print(f"Loading model: {model_size}", file=sys.stderr)
    model = WhisperModel(model_size, device="cpu", compute_type="int8")
    
    print(f"Transcribing: {audio_path}", file=sys.stderr)
    segments, info = model.transcribe(audio_path, word_timestamps=True)
    
    print(f"Language: {info.language}, Probability: {info.language_probability:.2f}", file=sys.stderr)
    
    words = []
    for segment in segments:
        if segment.words:
            for word in segment.words:
                words.append({
                    "word": word.word.strip(),
                    "start": round(word.start, 2),
                    "end": round(word.end, 2),
                    "speaker": "Host"
                })
        else:
            text = segment.text.strip()
            if not text:
                continue
                
            word_list = text.split()
            duration = segment.end - segment.start
            word_duration = duration / len(word_list) if word_list else 0.5
            
            for i, w in enumerate(word_list):
                words.append({
                    "word": w,
                    "start": round(segment.start + (i * word_duration), 2),
                    "end": round(segment.start + ((i + 1) * word_duration), 2),
                    "speaker": "Host"
                })
    
    return {"words": words}

if __name__ == "__main__":
    audio_file = sys.argv[1] if len(sys.argv) > 1 else "public/ElevenLabs1.mp3"
    model_size = sys.argv[2] if len(sys.argv) > 2 else "base"
    
    if not os.path.exists(audio_file):
        print(f"Error: File not found: {audio_file}", file=sys.stderr)
        sys.exit(1)
    
    try:
        result = transcribe(audio_file, model_size)
        print(json.dumps(result))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
