from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Optional, Tuple
from datetime import datetime
from pydantic import BaseModel
import calendar
from ...services.mongodb_service import MongoDBService
from ...models.person import Person

router = APIRouter()

class BasicChecksResponse(BaseModel):
    result: int  # 0 - нет аномалий, 1 - есть аномалии
    checks: Dict[str, Dict] = {
        "missing_birthdate": {
            "is_it": False,
            "count": 0,
            "persons": []  # {person: str, missing_fields: List[str]}
        },
        "invalid_date": {
            "is_it": False,
            "count": 0,
            "persons": []  # {person: str, birthdate: dict, error: str}
        },
        "isolated_person": {
            "is_it": False,
            "count": 0,
            "persons": []  # {person: str, person_id: str}
        },
        "non_reciprocal_relation": {
            "is_it": False,
            "count": 0,
            "relations": []  # {person_a: str, person_b: str, relation: str, expected: str}
        }
    }

def is_valid_date(day: int, month: int, year: int) -> Tuple[bool, str]:
    """Проверяет валидность даты рождения"""
    current_date = datetime.now()
    
    # Проверка на отрицательные значения
    if any(x < 0 for x in (day, month, year)):
        return False, "Отрицательное значение в дате"
    
    # Проверка года (не будущее)
    if year > current_date.year:
        return False, "Год рождения в будущем"
    
    # Проверка месяца
    if month < 1 or month > 12:
        return False, "Некорректный месяц (должен быть 1-12)"
    
    # Проверка дня
    try:
        _, last_day = calendar.monthrange(year, month)
        if day < 1 or day > last_day:
            return False, f"Некорректный день (должен быть 1-{last_day})"
    except ValueError:
        return False, "Некорректная комбинация года и месяца"
    
    # Проверка что дата не в будущем
    if year == current_date.year:
        if month > current_date.month:
            return False, "Дата рождения в будущем"
        if month == current_date.month and day > current_date.day:
            return False, "Дата рождения в будущем"
    
    return True, ""

def reverse_relation(relation: str) -> str:
    """Возвращает обратный тип отношения"""
    if relation == "child":
        return "parent"
    elif relation == "parent":
        return "child"
    return relation  # spouse остается spouse

@router.get("/checks/basic/{family_id}", response_model=BasicChecksResponse)
async def check_family_tree_basic(
    family_id: str,
    mongodb_service: MongoDBService = Depends()
):
    # Получаем данные о семье
    persons_data = await mongodb_service.get_family_tree(family_id)
    if not persons_data:
        raise HTTPException(status_code=404, detail="Family not found")

    # Инициализация результата
    result = BasicChecksResponse(result=0)
    current_date = datetime.now()
    all_person_ids = {p["person_id"] for p in persons_data}
    
    # Для проверки связей: строим граф отношений
    graph = {}
    persons_by_id = {}
    
    # Подготовка данных
    for person_data in persons_data:
        person_id = person_data["person_id"]
        persons_by_id[person_id] = person_data
        graph[person_id] = {}
        
        for rel in person_data["relatives"]:
            rel_id = rel["person_id"]
            graph[person_id][rel_id] = rel["relationType"]

    # Проверка 1: Отсутствие даты рождения
    for person_data in persons_data:
        person_id = person_data["person_id"]
        birthdate = person_data.get("birthdate")
        full_name = f"{person_data.get('surname', '')} {person_data.get('name', '')} {person_data.get('middleName', '')}".strip()
        
        missing_fields = []
        if not birthdate:
            missing_fields = ["day", "month", "year"]
        else:
            if "day" not in birthdate or birthdate["day"] is None:
                missing_fields.append("day")
            if "month" not in birthdate or birthdate["month"] is None:
                missing_fields.append("month")
            if "year" not in birthdate or birthdate["year"] is None:
                missing_fields.append("year")
        
        if missing_fields:
            result.result = 1
            result.checks["missing_birthdate"]["is_it"] = True
            result.checks["missing_birthdate"]["count"] += 1
            result.checks["missing_birthdate"]["persons"].append({
                "person": full_name,
                "missing_fields": missing_fields
            })

    # Проверка 2: Невалидные даты рождения
    for person_data in persons_data:
        birthdate = person_data.get("birthdate")
        if not birthdate:
            continue
            
        full_name = f"{person_data.get('surname', '')} {person_data.get('name', '')} {person_data.get('middleName', '')}".strip()
        
        # Пропускаем если какие-то поля отсутствуют (уже проверено)
        if any(key not in birthdate or birthdate[key] is None for key in ["day", "month", "year"]):
            continue

        day = birthdate["day"]
        month = birthdate["month"]
        year = birthdate["year"]
        
        valid, error = is_valid_date(day, month, year)
        if not valid:
            result.result = 1
            result.checks["invalid_date"]["is_it"] = True
            result.checks["invalid_date"]["count"] += 1
            result.checks["invalid_date"]["persons"].append({
                "person": full_name,
                "birthdate": {"day": day, "month": month, "year": year},
                "error": error
            })

    # Проверка 3: Изолированные люди
    for person_data in persons_data:
        person_id = person_data["person_id"]
        full_name = f"{person_data.get('surname', '')} {person_data.get('name', '')} {person_data.get('middleName', '')}".strip()
        
        # Считаем валидные связи (только с людьми из дерева)
        valid_relations = 0
        for rel in person_data["relatives"]:
            if rel["person_id"] in all_person_ids:
                valid_relations += 1
        
        if valid_relations == 0:
            result.result = 1
            result.checks["isolated_person"]["is_it"] = True
            result.checks["isolated_person"]["count"] += 1
            result.checks["isolated_person"]["persons"].append({
                "person": full_name,
                "person_id": person_id
            })

    # Проверка 4: Невзаимные связи
    processed_pairs = set()
    
    for person_a_id, relations in graph.items():
        for person_b_id, relation in relations.items():
            # Пропускаем связи с людьми вне дерева
            if person_b_id not in all_person_ids:
                continue
                
            # Пропускаем уже обработанные пары
            pair_key = tuple(sorted([person_a_id, person_b_id]))
            if pair_key in processed_pairs:
                continue
                
            expected_reverse = reverse_relation(relation)
            reverse_relations = graph.get(person_b_id, {})
            
            # Проверяем наличие обратной связи
            if person_a_id not in reverse_relations:
                error = "Отсутствует обратная связь"
            else:
                actual_reverse = reverse_relations[person_a_id]
                if actual_reverse != expected_reverse:
                    error = f"Ожидается {expected_reverse}, найдено {actual_reverse}"
                else:
                    # Связь валидна, помечаем пару как обработанную
                    processed_pairs.add(pair_key)
                    continue

            # Если дошли сюда - найдена ошибка
            person_a_name = f"{persons_by_id[person_a_id].get('surname', '')} {persons_by_id[person_a_id].get('name', '')}".strip()
            person_b_name = f"{persons_by_id[person_b_id].get('surname', '')} {persons_by_id[person_b_id].get('name', '')}".strip()
            
            result.result = 1
            result.checks["non_reciprocal_relation"]["is_it"] = True
            result.checks["non_reciprocal_relation"]["count"] += 1
            result.checks["non_reciprocal_relation"]["relations"].append({
                "person_a": person_a_name,
                "person_b": person_b_name,
                "relation": relation,
                "expected": expected_reverse,
                "error": error
            })
            processed_pairs.add(pair_key)

    return result