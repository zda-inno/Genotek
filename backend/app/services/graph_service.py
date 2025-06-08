from typing import List, Dict, Set
from ..models.person import Person, Relative


class GraphService:
    def __init__(self):
        self.persons: Dict[str, Person] = {}

    def add_person(self, person: Person):
        self.persons[person.person_id] = person

    def make_bidirectional(self):
        """Convert one-directional graph to bidirectional by adding missing relations."""
        for person_id, person in self.persons.items():
            for relative in person.relatives:
                relative_person = self.persons.get(relative.person_id)
                if relative_person:
                    # Check if the reverse relation exists
                    reverse_relation = self._get_reverse_relation(relative.relationType)
                    if not self._has_relation(relative_person, person_id, reverse_relation):
                        relative_person.relatives.append(
                            Relative(person_id=person_id, relationType=reverse_relation)
                        )
                        print(f"Added reverse relation: {relative_person.name} - {reverse_relation} -> {person.name}")

    def _get_reverse_relation(self, relation: str) -> str:
        """Get the reverse relation type."""
        relation_map = {
            "parent": "child",
            "child": "parent",
            "spouse": "spouse",
            "sibling": "sibling"
        }
        return relation_map.get(relation, relation)

    def _has_relation(self, person: Person, target_id: str, relation_type: str) -> bool:
        """Check if a person has a specific relation to another person."""
        return any(
            r.person_id == target_id and r.relationType == relation_type
            for r in person.relatives
        )

    def get_family_tree(self, family_id: str) -> List[Dict]:
        """Get the family tree for a specific family."""
        family_members = [
            person for person in self.persons.values()
            if person.family_id == family_id
        ]
        return [person.model_dump() for person in family_members]

    def clear(self):
        """Clear all stored persons."""
        self.persons.clear() 