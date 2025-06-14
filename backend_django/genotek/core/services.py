from typing import Dict, Any, List
from datetime import datetime
from genotek.api.models import Person

def check_tree_anomalies(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Check for anomalies in the family tree data.
    """
    anomalies = {
        "date_conflicts": [],
        "relationship_conflicts": [],
        "data_inconsistencies": []
    }
    
    try:
        # Get all persons from the data
        persons = data.get("persons", [])
        
        # Check for date conflicts
        for person in persons:
            birth_date = person.get("birth_date")
            death_date = person.get("death_date")
            
            if birth_date and death_date:
                birth = datetime.strptime(birth_date, "%Y-%m-%d")
                death = datetime.strptime(death_date, "%Y-%m-%d")
                
                if death < birth:
                    anomalies["date_conflicts"].append({
                        "person_id": person.get("person_id"),
                        "type": "death_before_birth",
                        "details": f"Death date ({death_date}) is before birth date ({birth_date})"
                    })
        
        # Check for relationship conflicts
        for person in persons:
            parent_ids = person.get("parent_ids", [])
            spouse_ids = person.get("spouse_ids", [])
            
            # Check if person is married to their parent
            for parent_id in parent_ids:
                if parent_id in spouse_ids:
                    anomalies["relationship_conflicts"].append({
                        "person_id": person.get("person_id"),
                        "type": "parent_spouse_conflict",
                        "details": f"Person is married to their parent (ID: {parent_id})"
                    })
        
        # Check for data inconsistencies
        for person in persons:
            if not person.get("name"):
                anomalies["data_inconsistencies"].append({
                    "person_id": person.get("person_id"),
                    "type": "missing_name",
                    "details": "Person has no name"
                })
            
            if not person.get("gender"):
                anomalies["data_inconsistencies"].append({
                    "person_id": person.get("person_id"),
                    "type": "missing_gender",
                    "details": "Person has no gender specified"
                })
        
        return anomalies
        
    except Exception as e:
        raise Exception(f"Error checking tree anomalies: {str(e)}") 