from fastapi import APIRouter
from app.services.eval_service import eval_service

router = APIRouter(prefix="/evaluation", tags=["Evaluation"])

@router.get("")
async def get_evaluation_results():
    return eval_service.get_results()

@router.post("/run")
async def trigger_evaluation_run():
    return eval_service.run_benchmark()
