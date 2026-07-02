from pydantic import BaseModel, Field
from typing import List
from datetime import datetime

class AIChatRequest(BaseModel):
    query: str = Field(..., examples=["What should the operations team prioritize right now?"])

class AIChatResponse(BaseModel):
    answer: str
    context_orders: int
    model: str
    generated_at: datetime

class AIInsightsResponse(BaseModel):
    headline: str
    summary: List[str]
    recommendations: List[str]
    priority: str
    generated_at: datetime
