from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Optional
from datetime import datetime
from pydantic import BaseModel
from ...services.mongodb_service import MongoDBService
from ...services.graph_service import GraphService
from ...models.person import Person

router = APIRouter()

class AgeCheckResponse(BaseModel):
    result: int  # 0 - нет аномалий, 1 - есть аномалии
    checks: Dict[str, Dict] = {
        "negative_age": {
            "is_it": False,
            "persons": []
        },
        "large_age": {
            "is_it": False,
            "persons": []
        }
    }

@router.get("/checks/basic/{family_id}", response_model=AgeCheckResponse)
async def check_family_tree_ages(
    family_id: str,
    mongodb_service: MongoDBService = Depends()
):
    """
    Проверяет возрастные аномалии в генеалогическом дереве:
    - отрицательный возраст
    - возраст более 100 лет
    """
    # Получаем данные о семье
    persons_data = await mongodb_service.get_family_tree(family_id)
    if not persons_data:
        raise HTTPException(status_code=404, detail="Family not found")

    # Инициализируем результат
    result = AgeCheckResponse(result=0)
    current_year = datetime.now().year

    # Проверяем каждого человека
    for person_data in persons_data:
        person = Person(**person_data)
        
        # Проверяем наличие даты рождения
        if person.birthdate and person.birthdate.year:
            age = current_year - person.birthdate.year
            
            # Проверка на отрицательный возраст
            if age < 0:
                result.result = 1
                result.checks["negative_age"]["is_it"] = True
                result.checks["negative_age"]["persons"].append({
                    "person": f"{person.surname or ''} {person.name or ''} {person.middleName or ''}".strip(),
                    "age": age
                })
            
            # Проверка на слишком большой возраст
            if age > 100:
                result.result = 1
                result.checks["large_age"]["is_it"] = True
                result.checks["large_age"]["persons"].append({
                    "person": f"{person.surname or ''} {person.name or ''} {person.middleName or ''}".strip(),
                    "age": age
                })

    return result
