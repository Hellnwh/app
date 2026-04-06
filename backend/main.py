from fastapi import FastAPI, APIRouter, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid
import json
from io import BytesIO
import PyPDF2

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Contract Simplifier Pro API")
api_router = APIRouter(prefix="/api")

EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']

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
    plan: str  # "single" or "pack"
    
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
        max_size = 100 * 1024 * 1024
        if len(file_bytes) > max_size:
            raise HTTPException(status_code=400, detail="File too large. Max 100 MB.")
        
        pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        text = text.strip()
        
        if len(text) < 100:
            raise HTTPException(status_code=400, detail="Could not extract enough text from PDF.")
        
        contract_text = text[:10000]
        return await analyze_with_ai(contract_text)
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"File analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def analyze_with_ai(contract_text: str) -> dict:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=str(uuid.uuid4()),
        system_message="You are an expert contract risk analyst. Extract EXACT clauses, assign risk scores, suggest fixes, detect missing clauses, and provide actionable guidance. Use simple language only. NEVER hallucinate."
    ).with_model("openai", "gpt-5.1")
    
    prompt = f"""Analyze this contract as a CONTRACT DECISION ENGINE. Return ONLY valid JSON:

{{
  "verdict": "SAFE" or "RISKY" or "NEEDS_REVIEW",
  "risk_score": 0-100,
  "summary": "2-3 sentences in simple English",
  "key_points": ["point 1", "point 2", "point 3"],
  "risks": [
    {{
      "clause": "EXACT QUOTED TEXT from contract",
      "risk_level": "HIGH" or "MEDIUM" or "LOW",
      "reason": "Why risky in simple terms",
      "fix": "Suggested alternative or action"
    }}
  ],
  "missing_clauses": ["Missing clause 1", "Missing clause 2"],
  "obligations": ["What user must do"],
  "rights": ["What user gets"],
  "important_terms": {{
    "money": "amounts",
    "dates": "dates",
    "penalties": "penalties",
    "duration": "duration"
  }},
  "actions": ["Step 1: action", "Step 2: action"],
  "negotiation_message": "Pre-written message to send",
  "worst_case": "Realistic scenario"
}}

CRITICAL:
1. Extract EXACT clause text for risks
2. Calculate risk_score: 0-40=safe, 40-75=review, 75-100=risky
3. Provide fixes for each risk
4. Detect 2-3 missing clauses
5. Generate 3-5 actions
6. Write negotiation message
7. Use ONLY contract content

Contract:
{contract_text}
"""
    
    message = UserMessage(text=prompt)
    response = await chat.send_message(message)
    
    try:
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        
        analysis = json.loads(response_text.strip())
        return analysis
    except json.JSONDecodeError as e:
        logger.error(f"JSON error: {str(e)}")
        return {
            "verdict": "NEEDS_REVIEW",
            "risk_score": 50,
            "summary": "Analysis completed. Please review carefully.",
            "key_points": ["Contract requires review"],
            "risks": [{
                "clause": "Unable to parse contract",
                "risk_level": "MEDIUM",
                "reason": "AI had difficulty analyzing structure",
                "fix": "Seek professional review"
            }],
            "missing_clauses": ["Unable to determine"],
            "obligations": ["Review with legal counsel"],
            "rights": ["Not specified"],
            "important_terms": {"money": "N/A", "dates": "N/A", "penalties": "N/A", "duration": "N/A"},
            "actions": ["Consult a lawyer"],
            "negotiation_message": "Unable to generate",
            "worst_case": "Unknown terms could be unfavorable"
        }

@api_router.post("/payment/create")
async def create_payment(request: PaymentRequest):
    amounts = {"single": 1000, "pack": 4900}  # ₹10, ₹49 in paise
    amount = amounts.get(request.plan, 1000)
    
    # Mock order for testing
    return {
        "order_id": f"order_{uuid.uuid4().hex[:12]}",
        "amount": amount,
        "currency": "INR"
    }

@api_router.get("/health")
async def health():
    return {"status": "ok"}

app.include_router(api_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
