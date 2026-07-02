from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from utils.database import get_db
from ai_assistant import schemas, ai_assistant

router = APIRouter()

@router.post("/chat", response_model=schemas.AIChatResponse)
def chat_with_ai(request: schemas.AIChatRequest, db: Session = Depends(get_db)):
    """
    Ask the AI Operations Assistant questions about live operational data.
    
    Example queries:
    - "What should the operations team prioritize right now?"
    - "Which orders are most likely to miss SLA?"
    - "Why are there so many delayed orders?"
    - "Which lens powers should we stock more?"
    - "Summarize today's operational bottlenecks."
    """
    try:
        result = ai_assistant.process_chat_query(db=db, query=request.query)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except RuntimeError as e:
        raise HTTPException(status_code=502, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail="An unexpected error occurred.")

@router.get("/insights", response_model=schemas.AIInsightsResponse)
def get_operational_insights(page: str = "home", db: Session = Depends(get_db)):
    """
    Get an AI-generated executive briefing of current operational status.
    Uses cached data if available (60 second TTL).
    """
    try:
        result = ai_assistant.generate_operational_insights(db=db, page=page)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
@router.post("/insights/invalidate")
def invalidate_insights_cache(keys: list[str] = None):
    """
    Invalidate specific page caches. If no keys are provided, invalidate all.
    """
    ai_assistant.invalidate_cache(keys)
    return {"message": "Cache invalidated"}
