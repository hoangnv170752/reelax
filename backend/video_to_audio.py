from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import Optional

load_dotenv()
client = OpenAI(api_key=os.getenv("NEXT_PUBLIC_OPENAI_API_KEY"))

app = FastAPI()

def transcribe_audio_with_whisper(audio_path: str):
    try:
        with open(audio_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file
            )
        return transcript.text
    except Exception as e:
        print(f"Error transcribing audio: {e}")
        return None

def generate_chatgpt_like_response(prompt_text: str, transcript: Optional[str], image_file_id: Optional[str] = None):
    inputs = []

    if transcript:
        inputs.append({"type": "input_text", "text": f"Transcript from video/audio:\n{transcript}"})

    if prompt_text:
        inputs.append({"type": "input_text", "text": f"User Prompt:\n{prompt_text}"})


    response = client.responses.create(
        model="gpt-4.1-mini",
        input=[{"role": "user", "content": inputs}]
    )

    return response.output_text

@app.post("/upload-and-ask/")
async def upload_and_ask(
    file: Optional[UploadFile] = File(None),
    prompt: str = Form(...)
):
    try:
        transcript = None
        if file:
            temp_path = f"/tmp/{file.filename}"
            with open(temp_path, "wb") as f:
                f.write(await file.read())
            transcript = transcribe_audio_with_whisper(temp_path)


        generated_response = generate_chatgpt_like_response(
            prompt_text=prompt,
            transcript=transcript,
        )

        return JSONResponse({
            "response": generated_response
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)
