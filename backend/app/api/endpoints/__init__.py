from fastapi import APIRouter
from .family_tree import router as family_tree_router
from .basic_checks import router as basic_checks_router

router = APIRouter()
router.include_router(family_tree_router, prefix="/family", tags=["family"])
router.include_router(basic_checks_router, prefix="/checks", tags=["checks"]) 