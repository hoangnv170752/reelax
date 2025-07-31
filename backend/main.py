from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import JSONResponse
from openai import OpenAI
from dotenv import load_dotenv
import os
from typing import Optional

load_dotenv()
client = OpenAI(api_key=os.getenv("NEXT_PUBLIC_OPENAI_API_KEY"))

app = FastAPI()

def create_file(upload_file: UploadFile):
    return client.files.create(
        file=(upload_file.filename, upload_file.file, upload_file.content_type),
        purpose="vision",
    ).id

@app.post("/generate-content/")
async def generate_content(prompt: str = Form(...), image: Optional[UploadFile] = File(None)):
    if not prompt:
        return JSONResponse({"error": "Prompt is required"}, status_code=400)

    inputs = [
        {
            "type": "input_text",
            "text": prompt
        }
    ]

    if image:
        file_id = create_file(image)
        inputs.append({
            "type": "input_image",
            "file_id": file_id
        })

    response = client.responses.create(
        model="gpt-4.1-mini",  # or gpt-4-vision-preview
        input=[{
            "role": "user",
            "content": inputs
        }]
    )

    return JSONResponse({"response": response.output_text})
