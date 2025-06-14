from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict
from ...services.mongodb_service import MongoDBService
from ...services.graph_service import GraphService
from ...models.person import Person, FamilyTreeResponse, FamilyListResponse

router = APIRouter()


@router.get("/family-tree/{family_id}", response_model=FamilyTreeResponse)
async def get_family_tree(
    family_id: str,
    mongodb_service: MongoDBService = Depends()
):
    """
    Get the bidirectional family tree for a specific family.
    """
    persons_data = await mongodb_service.get_family_tree(family_id)
    if not persons_data:
        raise HTTPException(status_code=404, detail="Family not found")

    graph_service = GraphService()
    for person_data in persons_data:
        person = Person(**person_data)
        graph_service.add_person(person)

    graph_service.make_bidirectional()
    family_members = graph_service.get_family_tree(family_id)
    
    return FamilyTreeResponse(
        family_id=family_id,
        persons=family_members,
        total_persons=len(family_members)
    )


@router.get("/families", response_model=FamilyListResponse)
async def get_families(
    mongodb_service: MongoDBService = Depends()
):
    """
    Get a list of all unique family IDs in the database.
    """
    family_ids = await mongodb_service.get_unique_family_ids()
    return FamilyListResponse(
        family_ids=family_ids,
        total_families=len(family_ids)
    ) 