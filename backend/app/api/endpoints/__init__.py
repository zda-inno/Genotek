from fastapi import APIRouter
from .family_tree import router as family_tree_router

router = APIRouter()
router.include_router(family_tree_router, prefix="/family", tags=["family"]) 