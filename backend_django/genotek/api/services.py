from typing import Dict, Any, List, Set
from .models import Person, BasicChecks
from datetime import datetime
import calendar

def get_family_tree(root_person: Person) -> Dict[str, Any]:
    """Получает генеалогическое дерево для указанного человека."""
    family_id = root_person.family_id
    persons = Person.objects.filter(family_id=family_id)
    
    return {
        "family_id": family_id,
        "persons": [person.to_mongo().to_dict() for person in persons],
        "total_persons": persons.count()
    }

def get_family_list() -> Dict[str, Any]:
    """Получает список всех семей."""
    family_ids = Person.objects.distinct('family_id')
    return {
        "family_ids": list(family_ids),
        "total_families": len(family_ids)
    }

def is_valid_date(day: int, month: int, year: int) -> tuple[bool, str]:
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

def perform_basic_checks(root_person: Person) -> Dict[str, Any]:
    """Выполняет базовые проверки генеалогического дерева."""
    family_id = root_person.family_id
    persons = Person.objects.filter(family_id=family_id)
    
    # Инициализация результата
    checks = {
        "missing_birthdate": {
            "is_it": False,
            "count": 0,
            "persons": []
        },
        "invalid_date": {
            "is_it": False,
            "count": 0,
            "persons": []
        },
        "isolated_person": {
            "is_it": False,
            "count": 0,
            "persons": []
        },
        "non_reciprocal_relation": {
            "is_it": False,
            "count": 0,
            "relations": []
        },
        "circular_relationship": {
            "is_it": False,
            "count": 0,
            "cycles": []
        }
    }
    
    all_person_ids = {p.person_id for p in persons}
    persons_by_id = {p.person_id: p for p in persons}
    
    # Построение графа отношений
    graph = {}
    for person in persons:
        person_id = person.person_id
        graph[person_id] = {}
        for rel in person.relatives:
            rel_id = rel.person_id
            graph[person_id][rel_id] = rel.relationType

    # Проверка 1: Отсутствие даты рождения
    for person in persons:
        birthdate = person.birthdate
        full_name = f"{person.surname or ''} {person.name or ''} {person.middleName or ''}".strip()
        
        missing_fields = []
        if not birthdate:
            missing_fields = ["day", "month", "year"]
        else:
            if not birthdate.get('day'):
                missing_fields.append("day")
            if not birthdate.get('month'):
                missing_fields.append("month")
            if not birthdate.get('year'):
                missing_fields.append("year")
        
        if missing_fields:
            checks["missing_birthdate"]["is_it"] = True
            checks["missing_birthdate"]["count"] += 1
            checks["missing_birthdate"]["persons"].append({
                "person": full_name,
                "missing_fields": missing_fields
            })

    # Проверка 2: Невалидные даты рождения
    for person in persons:
        birthdate = person.birthdate
        if not birthdate:
            continue
            
        full_name = f"{person.surname or ''} {person.name or ''} {person.middleName or ''}".strip()
        
        # Пропускаем если какие-то поля отсутствуют
        if not all([birthdate.get('day'), birthdate.get('month'), birthdate.get('year')]):
            continue

        valid, error = is_valid_date(birthdate['day'], birthdate['month'], birthdate['year'])
        if not valid:
            checks["invalid_date"]["is_it"] = True
            checks["invalid_date"]["count"] += 1
            checks["invalid_date"]["persons"].append({
                "person": full_name,
                "birthdate": birthdate,
                "error": error
            })

    # Проверка 3: Изолированные люди
    for person in persons:
        full_name = f"{person.surname or ''} {person.name or ''} {person.middleName or ''}".strip()
        
        # Считаем валидные связи (только с людьми из дерева)
        valid_relations = sum(1 for rel in person.relatives if rel.person_id in all_person_ids)
        
        if valid_relations == 0:
            checks["isolated_person"]["is_it"] = True
            checks["isolated_person"]["count"] += 1
            checks["isolated_person"]["persons"].append({
                "person": full_name,
                "person_id": person.person_id
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
            person_a = persons_by_id[person_a_id]
            person_b = persons_by_id[person_b_id]
            person_a_name = f"{person_a.surname or ''} {person_a.name or ''}".strip()
            person_b_name = f"{person_b.surname or ''} {person_b.name or ''}".strip()
            
            checks["non_reciprocal_relation"]["is_it"] = True
            checks["non_reciprocal_relation"]["count"] += 1
            checks["non_reciprocal_relation"]["relations"].append({
                "person_a": person_a_name,
                "person_b": person_b_name,
                "relation": relation,
                "expected": expected_reverse,
                "error": error
            })
            processed_pairs.add(pair_key)

    # Проверка 5: Циклические связи
    # Инициализация графов
    detailed_graph = {pid: {} for pid in all_person_ids}  # Для хранения типов отношений
    directed_graph = {pid: [] for pid in all_person_ids}  # Для поиска циклов
    
    # Построение графов
    for person in persons:
        current_id = person.person_id
        for rel in person.relatives:
            rel_id = rel.person_id
            if rel_id not in all_person_ids:
                continue
            relation_type = rel.relationType
            
            if relation_type == "parent":
                # Родитель (rel_id) -> ребенок (current_id)
                if current_id not in detailed_graph[rel_id]:
                    detailed_graph[rel_id][current_id] = set()
                detailed_graph[rel_id][current_id].add("parent")
                directed_graph[rel_id].append(current_id)
                
            elif relation_type == "child":
                # Ребенок (rel_id) <- родитель (current_id)
                if rel_id not in detailed_graph[current_id]:
                    detailed_graph[current_id][rel_id] = set()
                detailed_graph[current_id][rel_id].add("parent")
                directed_graph[current_id].append(rel_id)
                
            elif relation_type == "spouse":
                # Двунаправленная связь
                if rel_id not in detailed_graph[current_id]:
                    detailed_graph[current_id][rel_id] = set()
                detailed_graph[current_id][rel_id].add("spouse")
                directed_graph[current_id].append(rel_id)
                
                if current_id not in detailed_graph[rel_id]:
                    detailed_graph[rel_id][current_id] = set()
                detailed_graph[rel_id][current_id].add("spouse")
                directed_graph[rel_id].append(current_id)

    # Поиск циклов с помощью DFS
    color = {node: 0 for node in directed_graph}  # 0=белый, 1=серый, 2=черный
    cycles = set()
    path_stack = []
    
    def dfs(node):
        color[node] = 1
        path_stack.append(node)
        
        for neighbor in directed_graph[node]:
            if color[neighbor] == 0:
                dfs(neighbor)
            elif color[neighbor] == 1:
                # Обнаружен цикл
                idx = path_stack.index(neighbor)
                cycle_tuple = tuple(path_stack[idx:])
                cycles.add(cycle_tuple)
                
        path_stack.pop()
        color[node] = 2
    
    # Запуск DFS для всех узлов
    for node in directed_graph:
        if color[node] == 0:
            dfs(node)
    
    # Фильтрация циклов (исключаем допустимые циклы из двух супругов)
    problematic_cycles = []
    for cycle in cycles:
        if len(cycle) == 2:
            a, b = cycle
            # Проверяем что связь двусторонняя и только супружеская
            if (b in detailed_graph[a] and 
                a in detailed_graph[b] and 
                "spouse" in detailed_graph[a][b] and 
                "spouse" in detailed_graph[b][a] and 
                len(detailed_graph[a][b]) == 1 and 
                len(detailed_graph[b][a]) == 1):
                continue  # Пропускаем допустимый цикл супругов
        problematic_cycles.append(cycle)
    
    # Добавляем найденные проблемные циклы в результат
    if problematic_cycles:
        checks["circular_relationship"]["is_it"] = True
        checks["circular_relationship"]["count"] = len(problematic_cycles)
        
        for cycle in problematic_cycles:
            cycle_info = []
            for person_id in cycle:
                p = persons_by_id[person_id]
                full_name = f"{p.surname or ''} {p.name or ''} {p.middleName or ''}".strip()
                cycle_info.append({
                    "person_id": person_id,
                    "full_name": full_name
                })
            checks["circular_relationship"]["cycles"].append(cycle_info)

    return {
        "family_id": family_id,
        "checks": checks,
        "has_issues": any(check["is_it"] for check in checks.values())
    } 