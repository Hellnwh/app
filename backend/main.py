from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from pathlib import Path
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid
import json
from io import BytesIO
import PyPDF2

app = FastAPI(title="Contract Simplifier Pro API")
api_router = APIRouter(prefix="/api")

# safer env loading
EMERGENT_LLM_KEY = os.getenv("EMERGENT_LLM_KEY")
if not EMERGENT_LLM_KEY:
    raise Exception("Missing EMERGENT_LLM_KEY environment variable")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyzeRequest(BaseModel):
    contract_text: str

class PaymentRequest(BaseModel):
    plan: str

@api_router.get("/")
def root():
    return {"status": "running"}

@api_router.post("/analyze")
async def analyze_contract(request: AnalyzeRequest):
    try:
        if not request.contract_text or len(request.contract_text.strip()) < 100:
            raise HTTPException(status_code=400, detail="Contract text too short.")
        
        contract_text = request.contract_text[:10000]
        return await analyze_with_ai(contract_text)

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/analyze-file")
async def analyze_file(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith('.pdf'):
            raise HTTPException(status_code=400, detail="Only PDF files supported.")
        
        file_bytes = await file.read()

        if len(file_bytes) > 100 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large.")

        pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
        text = ""

        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"

        text = text.strip()

        if len(text) < 100:
            raise HTTPException(status_code=400, detail="Not enough text in PDF.")

        return await analyze_with_ai(text[:10000])

    except Exception as e:
        logger.error(f"File error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def analyze_with_ai(contract_text: str):
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=str(uuid.uuid4()),
        system_message="You are a contract risk analyst. Be accurate and simple."
    ).with_model("openai", "gpt-4o-mini")  # safer model

    prompt = f"""
    Analyze contract and return JSON with:
    verdict, risk_score, summary, risks, actions.
    Contract:
    {contract_text}
    """

    response = await chat.send_message(UserMessage(text=prompt))

    try:
        return json.loads(response.strip())
    except:
        return {"error": "Failed to parse AI response"}

@api_router.get("/health")
def health():
    return {"status": "ok"}

app.include_router(api_router)
