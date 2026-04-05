from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from io import BytesIO
import PyPDF2
import docx
from emergentintegrations.llm.chat import LlmChat, UserMessage
import razorpay
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageBreak
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Environment variables
JWT_SECRET = os.environ.get('JWT_SECRET', 'contract_simplifier_secret')
EMERGENT_LLM_KEY = os.environ['EMERGENT_LLM_KEY']
RAZORPAY_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RAZORPAY_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')

# Create the main app
app = FastAPI()
api_router = APIRouter(prefix="/api")
security = HTTPBearer()

# Razorpay client
if RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET:
    razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
else:
    razorpay_client = None

# Models
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: str
    name: str
    password_hash: str
    subscription_plan: str = "free"  # free or premium
    documents_analyzed_today: int = 0
    last_analysis_date: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class DocumentAnalysis(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    title: str
    original_text: str
    summary: Optional[str] = None
    key_points: Optional[List[str]] = None
    important_clauses: Optional[List[Dict[str, Any]]] = None
    obligations: Optional[List[str]] = None
    rights: Optional[List[str]] = None
    risks: Optional[List[Dict[str, Any]]] = None
    key_terms: Optional[Dict[str, Any]] = None
    confidence_level: Optional[str] = None
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class ChatMessage(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    document_id: str
    user_id: str
    question: str
    answer: str
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class AnalyzeRequest(BaseModel):
    document_id: str
    language: str = "english"  # english or hinglish

class ChatRequest(BaseModel):
    document_id: str
    question: str
    language: str = "english"

class PaymentOrderRequest(BaseModel):
    amount: int
    currency: str = "INR"

class PaymentVerifyRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str

# Helper functions
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str, email: str) -> str:
    payload = {
        'user_id': user_id,
        'email': email,
        'exp': datetime.now(timezone.utc) + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm='HS256')

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=['HS256'])
        user = await db.users.find_one({"id": payload['user_id']}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return User(**user)
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Invalid token")

def extract_text_from_pdf(file_bytes: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(BytesIO(file_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract PDF text: {str(e)}")

def extract_text_from_docx(file_bytes: bytes) -> str:
    try:
        doc = docx.Document(BytesIO(file_bytes))
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text.strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to extract DOCX text: {str(e)}")

async def analyze_contract_with_ai(text: str, language: str = "english") -> Dict[str, Any]:
    try:
        language_instruction = "" if language == "english" else "Respond in Hinglish (mix of Hindi and English using Roman script)."
        
        # Step 1: Summarize and extract
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message=f"You are a legal contract analysis expert. {language_instruction} Analyze contracts accurately."
        ).with_model("openai", "gpt-5.1")
        
        analysis_prompt = f"""Analyze this legal contract and provide a structured analysis:

Contract Text:
{text[:8000]}

Provide the following in JSON format:
1. summary: A simple 2-3 sentence summary (explain like to a 15-year-old)
2. key_points: Array of 5-7 most important points
3. important_clauses: Array of objects with 'clause' and 'explanation' (simplified)
4. obligations: Array of what the signing party MUST do
5. rights: Array of what the signing party GETS
6. risks: Array of objects with 'risk', 'severity' (low/medium/high), and 'explanation'
7. key_terms: Object with 'dates', 'amounts', 'penalties', 'duration', 'renewal'
8. confidence_level: Your confidence in this analysis (high/medium/low)

IMPORTANT: Only analyze what's in the document. Do not invent clauses. Be accurate.

Return ONLY valid JSON."""
        
        message = UserMessage(text=analysis_prompt)
        response = await chat.send_message(message)
        
        # Parse AI response
        import json
        try:
            # Extract JSON from response
            response_text = response.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:]
            if response_text.startswith("```"):
                response_text = response_text[3:]
            if response_text.endswith("```"):
                response_text = response_text[:-3]
            
            analysis = json.loads(response_text.strip())
            return analysis
        except json.JSONDecodeError:
            # Fallback parsing
            return {
                "summary": "Contract analysis completed. Please review the document carefully.",
                "key_points": ["Contract requires careful review"],
                "important_clauses": [],
                "obligations": [],
                "rights": [],
                "risks": [{"risk": "Unable to fully parse contract", "severity": "medium", "explanation": "AI analysis encountered formatting issues"}],
                "key_terms": {},
                "confidence_level": "low"
            }
    except Exception as e:
        logging.error(f"AI analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

async def answer_question_with_ai(document_text: str, question: str, language: str = "english") -> str:
    try:
        language_instruction = "" if language == "english" else "Respond in Hinglish (mix of Hindi and English using Roman script)."
        
        chat = LlmChat(
            api_key=EMERGENT_LLM_KEY,
            session_id=str(uuid.uuid4()),
            system_message=f"You are a helpful legal assistant. {language_instruction} Answer questions based ONLY on the provided contract. If the answer is not in the contract, say so clearly."
        ).with_model("openai", "gpt-5.1")
        
        prompt = f"""Contract:
{document_text[:8000]}

Question: {question}

Answer based ONLY on this contract. If not mentioned in the contract, say "This information is not specified in the contract." Keep answer simple and clear."""
        
        message = UserMessage(text=prompt)
        response = await chat.send_message(message)
        return response
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

def generate_pdf_report(analysis: Dict[str, Any], document_title: str) -> bytes:
    try:
        buffer = BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=letter)
        styles = getSampleStyleSheet()
        story = []
        
        # Custom styles
        title_style = ParagraphStyle(
            name='CustomTitle',
            parent=styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#143C78'),
            spaceAfter=30,
            alignment=TA_CENTER
        )
        
        heading_style = ParagraphStyle(
            name='CustomHeading',
            parent=styles['Heading2'],
            fontSize=14,
            textColor=colors.HexColor('#143C78'),
            spaceAfter=12,
            spaceBefore=12
        )
        
        # Title
        story.append(Paragraph("Contract Analysis Report", title_style))
        story.append(Paragraph(f"Document: {document_title}", styles['Normal']))
        story.append(Paragraph(f"Generated: {datetime.now(timezone.utc).strftime('%B %d, %Y')}", styles['Normal']))
        story.append(Spacer(1, 0.3*inch))
        
        # Disclaimer
        disclaimer_style = ParagraphStyle(
            name='Disclaimer',
            parent=styles['Normal'],
            fontSize=10,
            textColor=colors.red,
            alignment=TA_CENTER,
            spaceAfter=20
        )
        story.append(Paragraph("⚠️ AI can make mistakes. This is NOT legal advice. ⚠️", disclaimer_style))
        story.append(Spacer(1, 0.2*inch))
        
        # Summary
        story.append(Paragraph("Executive Summary", heading_style))
        story.append(Paragraph(analysis.get('summary', 'N/A'), styles['Normal']))
        story.append(Spacer(1, 0.2*inch))
        
        # Key Points
        if analysis.get('key_points'):
            story.append(Paragraph("Key Points", heading_style))
            for point in analysis['key_points']:
                story.append(Paragraph(f"• {point}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Risks
        if analysis.get('risks'):
            story.append(Paragraph("Risk Assessment", heading_style))
            
            risk_data = [["Risk", "Severity", "Explanation"]]
            for risk in analysis['risks']:
                risk_data.append([
                    risk.get('risk', ''),
                    risk.get('severity', 'medium').upper(),
                    risk.get('explanation', '')
                ])
            
            risk_table = Table(risk_data, colWidths=[2*inch, 1*inch, 3*inch])
            risk_table.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#143C78')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, -1), 10),
                ('GRID', (0, 0), (-1, -1), 1, colors.black),
                ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
                ('LEFTPADDING', (0, 0), (-1, -1), 6),
                ('RIGHTPADDING', (0, 0), (-1, -1), 6),
                ('TOPPADDING', (0, 0), (-1, -1), 8),
                ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
            ]))
            
            story.append(risk_table)
            story.append(Spacer(1, 0.2*inch))
        
        # Key Terms
        if analysis.get('key_terms'):
            story.append(Paragraph("Key Terms", heading_style))
            for key, value in analysis['key_terms'].items():
                if value:
                    story.append(Paragraph(f"<b>{key.title()}:</b> {value}", styles['Normal']))
            story.append(Spacer(1, 0.2*inch))
        
        # Build PDF
        doc.build(story)
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        logging.error(f"PDF generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

# Auth endpoints
@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    try:
        # Check if user exists
        existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        user = User(
            email=user_data.email,
            name=user_data.name,
            password_hash=hash_password(user_data.password)
        )
        
        doc = user.model_dump()
        await db.users.insert_one(doc)
        
        # Create token
        token = create_token(user.id, user.email)
        
        return {
            "token": token,
            "user": {
                "id": user.id,
                "email": user.email,
                "name": user.name,
                "subscription_plan": user.subscription_plan
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Registration error: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    try:
        user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
        if not user or not verify_password(credentials.password, user['password_hash']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        token = create_token(user['id'], user['email'])
        
        return {
            "token": token,
            "user": {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "subscription_plan": user['subscription_plan']
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

# Document endpoints
@api_router.post("/documents/upload")
async def upload_document(
    file: UploadFile = File(...),
    title: str = Form(...),
    current_user: User = Depends(get_current_user)
):
    try:
        # Check daily limit for free users
        if current_user.subscription_plan == "free":
            today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
            if current_user.last_analysis_date == today and current_user.documents_analyzed_today >= 1:
                raise HTTPException(
                    status_code=403,
                    detail="Daily limit reached. Upgrade to premium for unlimited uploads."
                )
        
        # Read file
        file_bytes = await file.read()
        
        # Extract text based on file type
        if file.filename.endswith('.pdf'):
            text = extract_text_from_pdf(file_bytes)
        elif file.filename.endswith('.docx'):
            text = extract_text_from_docx(file_bytes)
        elif file.filename.endswith('.txt'):
            text = file_bytes.decode('utf-8')
        else:
            raise HTTPException(status_code=400, detail="Unsupported file type. Use PDF, DOCX, or TXT.")
        
        if len(text) < 50:
            raise HTTPException(status_code=400, detail="Document text too short. Please upload a valid contract.")
        
        # Create document
        document = DocumentAnalysis(
            user_id=current_user.id,
            title=title,
            original_text=text
        )
        
        doc = document.model_dump()
        await db.documents.insert_one(doc)
        
        # Update user's daily count
        today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        if current_user.last_analysis_date == today:
            await db.users.update_one(
                {"id": current_user.id},
                {"$inc": {"documents_analyzed_today": 1}}
            )
        else:
            await db.users.update_one(
                {"id": current_user.id},
                {"$set": {"documents_analyzed_today": 1, "last_analysis_date": today}}
            )
        
        return {
            "id": document.id,
            "title": document.title,
            "text_preview": text[:500],
            "text_length": len(text)
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@api_router.post("/documents/analyze")
async def analyze_document(
    request: AnalyzeRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Get document
        document = await db.documents.find_one(
            {"id": request.document_id, "user_id": current_user.id},
            {"_id": 0}
        )
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Analyze with AI
        analysis = await analyze_contract_with_ai(document['original_text'], request.language)
        
        # Update document with analysis
        await db.documents.update_one(
            {"id": request.document_id},
            {"$set": {
                "summary": analysis.get('summary'),
                "key_points": analysis.get('key_points'),
                "important_clauses": analysis.get('important_clauses'),
                "obligations": analysis.get('obligations'),
                "rights": analysis.get('rights'),
                "risks": analysis.get('risks'),
                "key_terms": analysis.get('key_terms'),
                "confidence_level": analysis.get('confidence_level')
            }}
        )
        
        return analysis
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Analysis error: {str(e)}")
        raise HTTPException(status_code=500, detail="Analysis failed")

@api_router.post("/documents/chat")
async def chat_with_document(
    request: ChatRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        # Check if user has premium
        if current_user.subscription_plan != "premium":
            raise HTTPException(
                status_code=403,
                detail="Chat feature is only available for premium users. Please upgrade."
            )
        
        # Get document
        document = await db.documents.find_one(
            {"id": request.document_id, "user_id": current_user.id},
            {"_id": 0}
        )
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        # Get answer from AI
        answer = await answer_question_with_ai(
            document['original_text'],
            request.question,
            request.language
        )
        
        # Save chat history
        chat_message = ChatMessage(
            document_id=request.document_id,
            user_id=current_user.id,
            question=request.question,
            answer=answer
        )
        
        await db.chat_history.insert_one(chat_message.model_dump())
        
        return {
            "question": request.question,
            "answer": answer
        }
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Chat error: {str(e)}")
        raise HTTPException(status_code=500, detail="Chat failed")

@api_router.get("/documents/download-report/{document_id}")
async def download_report(
    document_id: str,
    current_user: User = Depends(get_current_user)
):
    try:
        # Get document
        document = await db.documents.find_one(
            {"id": document_id, "user_id": current_user.id},
            {"_id": 0}
        )
        if not document:
            raise HTTPException(status_code=404, detail="Document not found")
        
        if not document.get('summary'):
            raise HTTPException(status_code=400, detail="Document not analyzed yet. Analyze first.")
        
        # Generate PDF
        analysis_data = {
            'summary': document.get('summary'),
            'key_points': document.get('key_points'),
            'risks': document.get('risks'),
            'key_terms': document.get('key_terms')
        }
        
        pdf_bytes = generate_pdf_report(analysis_data, document['title'])
        
        return StreamingResponse(
            BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename={document['title'].replace(' ', '_')}_report.pdf"}
        )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Download error: {str(e)}")
        raise HTTPException(status_code=500, detail="Download failed")

@api_router.get("/documents/saved")
async def get_saved_documents(current_user: User = Depends(get_current_user)):
    try:
        # Premium feature
        if current_user.subscription_plan != "premium":
            raise HTTPException(
                status_code=403,
                detail="Saving contracts is a premium feature. Please upgrade."
            )
        
        documents = await db.documents.find(
            {"user_id": current_user.id},
            {"_id": 0, "original_text": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {"documents": documents}
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get documents error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch documents")

# Payment endpoints
@api_router.post("/payment/create-order")
async def create_payment_order(
    request: PaymentOrderRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        if not razorpay_client:
            raise HTTPException(status_code=503, detail="Payment service not configured")
        
        order = razorpay_client.order.create({
            "amount": request.amount,
            "currency": request.currency,
            "payment_capture": 1
        })
        
        return {
            "order_id": order['id'],
            "amount": order['amount'],
            "currency": order['currency']
        }
    except Exception as e:
        logging.error(f"Payment order error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create payment order")

@api_router.post("/payment/verify")
async def verify_payment(
    request: PaymentVerifyRequest,
    current_user: User = Depends(get_current_user)
):
    try:
        if not razorpay_client:
            raise HTTPException(status_code=503, detail="Payment service not configured")
        
        # Verify signature
        params_dict = {
            'razorpay_order_id': request.razorpay_order_id,
            'razorpay_payment_id': request.razorpay_payment_id,
            'razorpay_signature': request.razorpay_signature
        }
        
        razorpay_client.utility.verify_payment_signature(params_dict)
        
        # Update user to premium
        await db.users.update_one(
            {"id": current_user.id},
            {"$set": {"subscription_plan": "premium"}}
        )
        
        return {
            "success": True,
            "message": "Payment verified. You are now a premium user!"
        }
    except Exception as e:
        logging.error(f"Payment verification error: {str(e)}")
        raise HTTPException(status_code=400, detail="Payment verification failed")

@api_router.get("/user/subscription")
async def get_subscription(current_user: User = Depends(get_current_user)):
    return {
        "subscription_plan": current_user.subscription_plan,
        "documents_analyzed_today": current_user.documents_analyzed_today,
        "last_analysis_date": current_user.last_analysis_date
    }

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()