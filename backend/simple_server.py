from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os
import logging
from pathlib import Path
from emergentintegrations.llm.chat import LlmChat, UserMessage
import uuid
import json

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

app = FastAPI(title="Contract Simplifier API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Environment
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class AnalyzeRequest(BaseModel):
    contract_text: str

class AnalysisResponse(BaseModel):
    summary: str
    key_points: list[str]
    risks: list[dict]
    obligations: list[str]
    important_terms: dict
    worst_case_scenario: str
    final_verdict: dict

@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "Contract Simplifier AI"}

@app.post("/api/analyze")
async def analyze_contract(request: AnalyzeRequest):
    try:
        if not request.contract_text or len(request.contract_text.strip()) < 100:
            raise HTTPException(
                status_code=400,
                detail="Contract text too short. Please provide at least 100 characters."
            )
        
        # Limit input to reduce costs (max 8000 chars)
        contract_text = request.contract_text[:8000]
        
        # AI Analysis with strict prompt
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message="You are a contract risk analyst. Provide clear, simple analysis. NEVER invent information."
        ).with_model("openai", "gpt-5.1")
        
        analysis_prompt = f"""Analyze this contract and return ONLY valid JSON with this exact structure:

{{
  "summary": "Simple 2-3 sentence summary in easy English (no legal jargon)",
  "key_points": ["point 1", "point 2", "point 3"],
  "risks": [
    {{"risk": "description", "severity": "low", "explanation": "why risky"}},
    {{"risk": "description", "severity": "medium", "explanation": "why risky"}}
  ],
  "obligations": ["what user must do", "another obligation"],
  "important_terms": {{
    "money": "payment amounts if any",
    "dates": "important dates",
    "penalties": "penalties if any",
    "duration": "contract duration"
  }},
  "worst_case_scenario": "What's the worst that could happen? Be realistic and specific.",
  "final_verdict": {{
    "status": "safe" or "risky" or "needs_review",
    "reason": "Short explanation why"
  }}
}}

RULES:
1. Use ONLY information from the contract below
2. Do NOT invent anything
3. Use simple, clear language
4. Focus on real-world impact
5. Return ONLY valid JSON

Contract:
{contract_text}
"""
        
        message = UserMessage(text=analysis_prompt)
        response = await chat.send_message(message)
        
        # Parse JSON response
        try:
            response_text = response.strip()
            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            analysis = json.loads(response_text.strip())
            
            return AnalysisResponse(**analysis)
            
        except json.JSONDecodeError as e:
            logger.error(f"JSON parsing error: {str(e)}")
            logger.error(f"Response: {response}")
            
            # Fallback response
            return AnalysisResponse(
                summary="Analysis completed. Please review the contract carefully.",
                key_points=["Contract requires careful review"],
                risks=[{
                    "risk": "Unable to fully parse contract",
                    "severity": "medium",
                    "explanation": "AI had difficulty analyzing the document structure"
                }],
                obligations=["Review contract with legal counsel"],
                important_terms={
                    "money": "Not specified",
                    "dates": "Not specified",
                    "penalties": "Not specified",
                    "duration": "Not specified"
                },
                worst_case_scenario="Without proper analysis, you may agree to unfavorable terms.",
                final_verdict={
                    "status": "needs_review",
                    "reason": "Analysis incomplete - seek professional review"
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)