from pathlib import Path

from fastapi import APIRouter

from app.models.schemas import FaqAnswerResponse, FaqQuestionRequest

router = APIRouter(prefix="/faq", tags=["faq"])


def _documentation_context() -> str:
    repo_root = Path(__file__).resolve().parents[3]
    for directory_name in ("docs", "Docs"):
        directory = repo_root / directory_name
        product = directory / "product.md"
        architecture = directory / "architecture.md"
        if product.exists() and architecture.exists():
            return f"{product.read_text(encoding='utf-8')}\n\n{architecture.read_text(encoding='utf-8')}"
    return ""


def _answer_from_context(question: str) -> str:
    context = _documentation_context()
    question_words = {word.lower().strip(".,?!:;()") for word in question.split() if len(word) > 3}
    paragraphs = [paragraph.strip() for paragraph in context.split("\n\n") if paragraph.strip()]
    ranked = sorted(paragraphs, key=lambda paragraph: len(question_words & set(paragraph.lower().split())), reverse=True)
    if not ranked or not question_words:
        return "Migration Rehearsal generates adversarial data, runs the migration in an isolated shadow database, and returns measured evidence about what changed."
    best = ranked[0].replace("\n", " ")
    return best[:520] + ("..." if len(best) > 520 else "")


@router.post("/ask", response_model=FaqAnswerResponse)
async def ask_faq(request: FaqQuestionRequest) -> FaqAnswerResponse:
    return FaqAnswerResponse(answer=_answer_from_context(request.question))