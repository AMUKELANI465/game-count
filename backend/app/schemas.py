from typing import List, Optional
from pydantic import BaseModel


class BBox(BaseModel):
    x1: int
    y1: int
    x2: int
    y2: int


class Detection(BaseModel):
    species: str
    confidence: float
    bbox: BBox


class AnalyzeResponse(BaseModel):
    success: bool
    demo: bool
    total_animals: int
    species_counts: dict
    detections: List[Detection]
    average_confidence: float
    processing_time: float
    image_url: str
    annotated_image_url: str


class SpeciesCountIn(BaseModel):
    species: str
    ai_count: int
    verified_count: int
    average_confidence: float = 0.0


class SurveyCreate(BaseModel):
    survey_name: str
    survey_date: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    image_path: Optional[str] = None
    annotated_image_path: Optional[str] = None
    ai_total: int = 0
    verified_total: int = 0
    average_confidence: float = 0.0
    processing_time: float = 0.0
    status: str = "verified"
    species_counts: List[SpeciesCountIn] = []


class SpeciesCountUpdate(BaseModel):
    species: str
    verified_count: int


class SurveyUpdate(BaseModel):
    survey_name: Optional[str] = None
    survey_date: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    verified_total: Optional[int] = None
    status: Optional[str] = None
    species_counts: Optional[List[SpeciesCountUpdate]] = None
