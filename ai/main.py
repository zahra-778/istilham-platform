from typing import Optional, Dict, List, Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, field_validator

# ============================================================
# Config
# ============================================================
ASSESSMENT_WEIGHT = 0.40
SIMULATION_WEIGHT = 0.60
DEFAULT_EXPECTED_RESPONSE_TIME = 15.0

MIN_SIMULATIONS_FOR_HIGH_CONFIDENCE = 5
MIN_EVENTS_FOR_HIGH_CONFIDENCE = 30
MIN_CHALLENGE_TYPES_FOR_HIGH_CONFIDENCE = 3

HIGH_COVERAGE_THRESHOLD = 0.80
MEDIUM_COVERAGE_THRESHOLD = 0.50
CONSISTENCY_HIGH = 0.80
CONSISTENCY_MEDIUM = 0.60

EVIDENCE_WEIGHTS = {
    "simulationCount": 0.15,
    "challengeDiversity": 0.10,
    "behaviorEvents": 0.15,
    "assessmentAvailability": 0.10,
    "assessmentSimulationConsistency": 0.20,
    "dataCoverage": 0.15,
    "indicatorEvidenceQuality": 0.15,
}


# ============================================================
# Models
# ============================================================
class IndicatorDefinition(BaseModel):
    indicator_id: str
    name: str
    name_ar: Optional[str] = None  # arabic display name
    calculation_type: str = "manual"
    config: Dict[str, Any] = Field(default_factory=dict)


class BehaviorEvent(BaseModel):
    responseSeconds: float = Field(default=15, ge=0)
    attempts: int = Field(default=1, ge=1)
    correct: Optional[bool] = None
    changedDecision: bool = False
    usedHint: bool = False
    creativeAction: bool = False
    requestedTeamHelp: bool = False
    explainedDecision: bool = False
    leadershipAction: bool = False
    expectedResponseTime: Optional[float] = Field(default=None, ge=0)
    simulation_id: Optional[str] = None
    challenge_type: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)


class AssessmentScores(BaseModel):
    scores: Dict[str, float] = Field(default_factory=dict)

    @field_validator("scores")
    @classmethod
    def validate_scores(cls, value):
        for indicator_id, score in value.items():
            if score < 0 or score > 100:
                raise ValueError(
                    f"Score for '{indicator_id}' must be between 0 and 100."
                )
        return value


class CareerProfile(BaseModel):
    career_id: str
    career_name: str
    weights: Dict[str, float]

    @field_validator("weights")
    @classmethod
    def validate_weights(cls, value):
        if not value:
            raise ValueError("Career must have at least one indicator weight.")

        for indicator_id, weight in value.items():
            if weight < 0 or weight > 1:
                raise ValueError(
                    f"Weight for '{indicator_id}' must be between 0 and 1."
                )

        total = sum(value.values())
        if abs(total - 1.0) > 0.001:
            raise ValueError(
                f"Career weights must equal 1.0 (100%). Received: {round(total, 4)}"
            )
        return value


class AnalysisRequest(BaseModel):
    student_id: str
    indicators: List[IndicatorDefinition] = Field(default_factory=list)
    assessment_scores: Optional[AssessmentScores] = None
    behavior_events: List[BehaviorEvent] = Field(default_factory=list)
    career_profiles: List[CareerProfile] = Field(default_factory=list)


# ============================================================
# Validation
# ============================================================
def validate_indicator_configuration(indicators, career_profiles, assessment_scores):
    indicator_ids = {i.indicator_id for i in indicators}

    for career in career_profiles:
        unknown = set(career.weights.keys()) - indicator_ids
        if unknown:
            raise ValueError(
                f"Career '{career.career_name}' uses unknown indicators: "
                f"{', '.join(unknown)}"
            )

    if assessment_scores:
        unknown = set(assessment_scores.scores.keys()) - indicator_ids
        if unknown:
            raise ValueError(
                "Assessment contains unknown indicators: " + ", ".join(unknown)
            )

    return True


# ============================================================
# Indicator scoring
# ============================================================
def calculate_indicator_score(indicator, events):
    calculation_type = indicator.calculation_type
    config = indicator.config

    if not events:
        return None

    if calculation_type == "manual":
        return None

    if calculation_type == "accuracy":
        valid_events = [e for e in events if e.correct is not None]
        if not valid_events:
            return None
        correct_count = sum(1 for e in valid_events if e.correct)
        return round((correct_count / len(valid_events)) * 100, 2)

    if calculation_type == "persistence":
        scores = []
        for event in events:
            if event.correct is True and event.attempts > 1:
                score = 95
            elif event.correct is True:
                score = 80
            elif event.attempts >= 3:
                score = 75
            elif event.attempts == 2:
                score = 60
            else:
                score = 40
            scores.append(score)
        return round(sum(scores) / len(scores), 2)

    if calculation_type == "response_time":
        scores = []
        target_time = config.get("expectedResponseTime", DEFAULT_EXPECTED_RESPONSE_TIME)
        for event in events:
            expected_time = (
                event.expectedResponseTime
                if event.expectedResponseTime is not None
                else target_time
            )
            difference = abs(event.responseSeconds - expected_time)
            score = 100 - (difference * 4)
            scores.append(max(0, min(100, score)))
        return round(sum(scores) / len(scores), 2)

    if calculation_type == "creative_action":
        creative_count = sum(1 for e in events if e.creativeAction)
        ratio = creative_count / len(events)
        return round(40 + (60 * ratio), 2)

    if calculation_type == "communication":
        relevant = [e for e in events if e.requestedTeamHelp or e.explainedDecision]
        if not relevant:
            return None
        scores = []
        for event in relevant:
            score = 50
            if event.requestedTeamHelp:
                score += 20
            if event.explainedDecision:
                score += 30
            scores.append(min(100, score))
        return round(sum(scores) / len(scores), 2)

    if calculation_type == "leadership":
        relevant = [e for e in events if e.leadershipAction]
        if not relevant:
            return None
        return 70.0

    return None


def extract_behavioral_features(indicators, events):
    return {
        indicator.indicator_id: calculate_indicator_score(indicator, events)
        for indicator in indicators
    }


def combine_scores(indicators, assessment_scores, simulation_scores):
    final_scores = {}
    assessment_dict = assessment_scores.scores if assessment_scores else {}

    for indicator in indicators:
        indicator_id = indicator.indicator_id
        assessment_value = assessment_dict.get(indicator_id)
        simulation_value = simulation_scores.get(indicator_id)

        if assessment_value is not None and simulation_value is not None:
            final_scores[indicator_id] = round(
                (assessment_value * ASSESSMENT_WEIGHT)
                + (simulation_value * SIMULATION_WEIGHT),
                2,
            )
        elif assessment_value is not None:
            final_scores[indicator_id] = round(assessment_value, 2)
        elif simulation_value is not None:
            final_scores[indicator_id] = round(simulation_value, 2)
        else:
            final_scores[indicator_id] = None

    return final_scores


# ============================================================
# Career scoring
# ============================================================
def calculate_career_score(behavioral_profile, weights):
    weighted_score = 0.0
    available_weight = 0.0
    total_weight = sum(weights.values())

    if total_weight <= 0:
        return None, 0.0

    for indicator_id, weight in weights.items():
        score = behavioral_profile.get(indicator_id)
        if score is None:
            continue
        weighted_score += score * weight
        available_weight += weight

    if available_weight <= 0:
        return None, 0.0

    score = weighted_score / available_weight
    data_coverage = available_weight / total_weight

    return round(max(0, min(100, score)), 2), round(data_coverage, 2)


def get_indicator_name(indicator_id, indicators):
    for indicator in indicators:
        if indicator.indicator_id == indicator_id:
            return indicator.name_ar or indicator.name
    return indicator_id


def get_career_strengths(behavioral_profile, weights, indicators):
    contributions = []

    for indicator_id, weight in weights.items():
        score = behavioral_profile.get(indicator_id)
        if score is None:
            continue
        contributions.append(
            {
                "indicator": indicator_id,
                "name": get_indicator_name(indicator_id, indicators),
                "score": round(score, 2),
                "weight": round(weight, 2),
                "contribution": round(score * weight, 2),
            }
        )

    contributions.sort(key=lambda x: x["contribution"], reverse=True)
    return contributions[:3]


def get_development_areas(behavioral_profile, weights, indicators):
    areas = []

    for indicator_id, weight in weights.items():
        score = behavioral_profile.get(indicator_id)
        if score is None:
            continue
        if score < 70:
            areas.append(
                {
                    "indicator": indicator_id,
                    "name": get_indicator_name(indicator_id, indicators),
                    "score": round(score, 2),
                    "weight": round(weight, 2),
                    "gap": round(70 - score, 2),
                }
            )

    areas.sort(key=lambda x: x["weight"], reverse=True)
    return areas[:3]


def generate_recommendations(
    behavioral_profile: Dict[str, Optional[float]],
    career_profiles: List[CareerProfile],
    indicators: List[IndicatorDefinition],
    assessment_scores: Dict[str, float],
    simulation_scores: Dict[str, Optional[float]],
    behavior_events: List[BehaviorEvent],
):
    recommendations = []

    for career in career_profiles:
        score, _coverage = calculate_career_score(behavioral_profile, career.weights)

        career_evidence = calculate_career_evidence(
            career, indicators, assessment_scores, simulation_scores, behavior_events
        )

        recommendations.append(
            {
                "career_id": career.career_id,
                "career_name": career.career_name,
                "score": round(score, 2) if score is not None else None,
                "dataCoverage": career_evidence["dataCoverage"],
                "evidenceQuality": career_evidence["evidenceQuality"],
                "strengths": get_career_strengths(
                    behavioral_profile, career.weights, indicators
                ),
                "developmentAreas": get_development_areas(
                    behavioral_profile, career.weights, indicators
                ),
            }
        )

    # Fix: careers with score=None used to crash the sort (None vs float).
    recommendations.sort(
        key=lambda item: item["score"] if item["score"] is not None else -1,
        reverse=True,
    )

    return recommendations


# ============================================================
# Evidence quality
# ============================================================
def calculate_simulation_count(events: List[BehaviorEvent]) -> int:
    return len({e.simulation_id for e in events if e.simulation_id})


def calculate_challenge_diversity(events: List[BehaviorEvent]) -> int:
    return len({e.challenge_type for e in events if e.challenge_type})


def calculate_event_evidence(events: List[BehaviorEvent]) -> float:
    count = len(events)
    if count <= 0:
        return 0.0
    return min(count / MIN_EVENTS_FOR_HIGH_CONFIDENCE, 1.0)


def calculate_simulation_evidence(events: List[BehaviorEvent]) -> float:
    count = calculate_simulation_count(events)
    if count <= 0:
        return 0.0
    return min(count / MIN_SIMULATIONS_FOR_HIGH_CONFIDENCE, 1.0)


def calculate_challenge_diversity_score(events: List[BehaviorEvent]) -> float:
    diversity = calculate_challenge_diversity(events)
    if diversity <= 0:
        return 0.0
    return min(diversity / MIN_CHALLENGE_TYPES_FOR_HIGH_CONFIDENCE, 1.0)


def calculate_assessment_simulation_consistency(
    assessment_scores: Dict[str, float],
    simulation_scores: Dict[str, Optional[float]],
) -> Optional[float]:
    common = [
        i
        for i in assessment_scores
        if i in simulation_scores and simulation_scores[i] is not None
    ]

    if not common:
        return None

    differences = [
        abs(assessment_scores[i] - simulation_scores[i]) / 100.0 for i in common
    ]

    consistency = 1.0 - (sum(differences) / len(differences))
    return round(max(0.0, min(1.0, consistency)), 4)


def calculate_indicator_evidence_quality(
    indicator_id: str,
    assessment_scores: Dict[str, float],
    simulation_scores: Dict[str, Optional[float]],
    events: List[BehaviorEvent],
) -> float:
    assessment_available = indicator_id in assessment_scores
    simulation_available = (
        indicator_id in simulation_scores
        and simulation_scores[indicator_id] is not None
    )

    evidence_sources = int(assessment_available) + int(simulation_available)

    if evidence_sources == 0:
        return 0.0

    # Two independent sources = stronger evidence
    base_quality = 1.0 if evidence_sources == 2 else 0.60

    event_quality = calculate_event_evidence(events)

    if simulation_available:
        base_quality = base_quality * 0.70 + event_quality * 0.30

    return round(min(1.0, base_quality), 4)


def calculate_evidence_quality(
    indicators: List[IndicatorDefinition],
    assessment_scores: Dict[str, float],
    simulation_scores: Dict[str, Optional[float]],
    behavior_events: List[BehaviorEvent],
) -> Dict[str, Any]:
    simulation_count = calculate_simulation_count(behavior_events)
    challenge_diversity = calculate_challenge_diversity(behavior_events)

    simulation_evidence = calculate_simulation_evidence(behavior_events)
    challenge_evidence = calculate_challenge_diversity_score(behavior_events)
    event_evidence = calculate_event_evidence(behavior_events)

    assessment_available = len(assessment_scores) > 0
    assessment_score = 1.0 if assessment_available else 0.0

    consistency = calculate_assessment_simulation_consistency(
        assessment_scores, simulation_scores
    )
    consistency_score = consistency if consistency is not None else 0.0

    total_indicators = len(indicators)
    available_indicators = 0

    for indicator in indicators:
        iid = indicator.indicator_id
        has_assessment = iid in assessment_scores
        has_simulation = iid in simulation_scores and simulation_scores[iid] is not None
        if has_assessment or has_simulation:
            available_indicators += 1

    data_coverage = (
        available_indicators / total_indicators if total_indicators > 0 else 0.0
    )

    indicator_qualities = [
        calculate_indicator_evidence_quality(
            indicator.indicator_id,
            assessment_scores,
            simulation_scores,
            behavior_events,
        )
        for indicator in indicators
    ]

    indicator_evidence_quality = (
        sum(indicator_qualities) / len(indicator_qualities)
        if indicator_qualities
        else 0.0
    )

    evidence_score = (
        simulation_evidence * EVIDENCE_WEIGHTS["simulationCount"]
        + challenge_evidence * EVIDENCE_WEIGHTS["challengeDiversity"]
        + event_evidence * EVIDENCE_WEIGHTS["behaviorEvents"]
        + assessment_score * EVIDENCE_WEIGHTS["assessmentAvailability"]
        + consistency_score * EVIDENCE_WEIGHTS["assessmentSimulationConsistency"]
        + data_coverage * EVIDENCE_WEIGHTS["dataCoverage"]
        + indicator_evidence_quality * EVIDENCE_WEIGHTS["indicatorEvidenceQuality"]
    )

    return {
        "simulationCount": simulation_count,
        "challengeDiversity": challenge_diversity,
        "behaviorEvents": len(behavior_events),
        "assessmentAvailable": assessment_available,
        "assessmentSimulationConsistency": (
            round(consistency, 4) if consistency is not None else None
        ),
        "dataCoverage": round(data_coverage, 4),
        "indicatorEvidenceQuality": round(indicator_evidence_quality, 4),
        "evidenceScore": round(min(1.0, evidence_score), 4),
    }


def calculate_career_evidence(
    career: CareerProfile,
    indicators: List[IndicatorDefinition],
    assessment_scores: Dict[str, float],
    simulation_scores: Dict[str, Optional[float]],
    behavior_events: List[BehaviorEvent],
) -> Dict[str, Any]:
    relevant_indicators = [i for i, w in career.weights.items() if w > 0]

    available = 0
    qualities = []

    for iid in relevant_indicators:
        has_assessment = iid in assessment_scores
        has_simulation = iid in simulation_scores and simulation_scores[iid] is not None

        if has_assessment or has_simulation:
            available += 1

        qualities.append(
            calculate_indicator_evidence_quality(
                iid, assessment_scores, simulation_scores, behavior_events
            )
        )

    coverage = available / len(relevant_indicators) if relevant_indicators else 0.0
    evidence_quality = sum(qualities) / len(qualities) if qualities else 0.0

    return {
        "dataCoverage": round(coverage, 4),
        "evidenceQuality": round(evidence_quality, 4),
    }


def get_top_strengths(behavioral_profile, indicators):
    strengths = []

    for indicator_id, score in behavioral_profile.items():
        if score is None:
            continue
        strengths.append(
            {
                "indicator": indicator_id,
                "name": get_indicator_name(indicator_id, indicators),
                "score": round(score, 2),
            }
        )

    strengths.sort(key=lambda x: x["score"], reverse=True)
    return strengths[:5]


def calculate_confidence(evidence_score: float) -> float:
    return round(max(0.0, min(0.95, evidence_score)), 2)


# ============================================================
# App
# ============================================================
app = FastAPI(title="Istilham AI Service", version="3.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "success": True,
        "service": "Istilham AI Service",
        "version": "3.0.0",
        "status": "running",
        "dynamic_indicators": True,
        "dynamic_careers": True,
        "dynamic_weights": True,
    }


@app.get("/health")
def health():
    return {
        "success": True,
        "status": "healthy",
        "version": "3.0.0",
        "dynamic_indicators": True,
        "dynamic_careers": True,
        "dynamic_weights": True,
    }


@app.post("/analyze")
def analyze(request: AnalysisRequest):
    try:
        if not request.indicators:
            raise HTTPException(
                status_code=400,
                detail=(
                    "No indicators were provided. "
                    "Backend must send the current indicator definitions."
                ),
            )

        if not request.career_profiles:
            raise HTTPException(
                status_code=400, detail="No career profiles were provided."
            )

        validate_indicator_configuration(
            request.indicators, request.career_profiles, request.assessment_scores
        )

        simulation_scores = extract_behavioral_features(
            request.indicators, request.behavior_events
        )

        assessment_scores_dict = (
            request.assessment_scores.scores if request.assessment_scores else {}
        )

        evidence = calculate_evidence_quality(
            indicators=request.indicators,
            assessment_scores=assessment_scores_dict,
            simulation_scores=simulation_scores,
            behavior_events=request.behavior_events,
        )

        confidence = calculate_confidence(evidence["evidenceScore"])

        behavioral_profile = combine_scores(
            request.indicators, request.assessment_scores, simulation_scores
        )

        strengths = get_top_strengths(behavioral_profile, request.indicators)

        recommendations = generate_recommendations(
            behavioral_profile=behavioral_profile,
            career_profiles=request.career_profiles,
            indicators=request.indicators,
            assessment_scores=assessment_scores_dict,
            simulation_scores=simulation_scores,
            behavior_events=request.behavior_events,
        )

        available_indicators = sum(
            1 for score in behavioral_profile.values() if score is not None
        )
        total_indicators = len(request.indicators)
        indicator_coverage = round(available_indicators / total_indicators, 2)

        return {
            "success": True,
            "data": {
                "student_id": request.student_id,
                "behavioral_profile": behavioral_profile,
                "simulation_analysis": simulation_scores,
                "strengths": strengths,
                "recommendations": recommendations,
                "confidence": confidence,
                "data_quality": {
                    "availableIndicators": available_indicators,
                    "totalIndicators": total_indicators,
                    "indicatorCoverage": indicator_coverage,
                    "behaviorEvents": len(request.behavior_events),
                    "careersAnalyzed": len(request.career_profiles),
                },
            },
        }

    except HTTPException:
        raise

    except ValueError as e:
        # validation errors (unknown indicators etc.) are client errors, not 500s
        raise HTTPException(status_code=400, detail=str(e))

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
