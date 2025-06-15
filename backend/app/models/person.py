from typing import Optional, List, Dict
from pydantic import BaseModel
from datetime import datetime


class BirthDate(BaseModel):
    day: Optional[int] = None
    month: Optional[int] = None
    year: Optional[int] = None


class Relative(BaseModel):
    person_id: str
    relationType: str


class Person(BaseModel):
    name: Optional[str] = None
    birthdate: Optional[BirthDate] = None
    gender: str
    birthplace: Optional[str] = None
    surname: Optional[str] = None
    relatives: List[Relative]
    middleName: Optional[str] = None
    family_id: str
    person_id: str

    class Config:
        json_schema_extra = {
            "example": {
                "name": "Иван",
                "birthdate": {"day": 3, "month": 5, "year": 1932},
                "gender": "Male",
                "birthplace": "Россия, Ярославская обл",
                "surname": "Лебедев",
                "relatives": [
                    {"person_id": "abc123", "relationType": "parent"}
                ],
                "middleName": "Павлович",
                "family_id": "family123",
                "person_id": "person123"
            }
        }


class FamilyTreeResponse(BaseModel):
    family_id: str
    persons: List[Person]
    total_persons: int

    class Config:
        json_schema_extra = {
            "example": {
                "family_id": "family123",
                "persons": [
                    {
                        "name": "Иван",
                        "birthdate": {"day": 3, "month": 5, "year": 1932},
                        "gender": "Male",
                        "birthplace": "Россия, Ярославская обл",
                        "surname": "Лебедев",
                        "relatives": [
                            {"person_id": "abc123", "relationType": "parent"}
                        ],
                        "middleName": "Павлович",
                        "family_id": "family123",
                        "person_id": "person123"
                    }
                ],
                "total_persons": 1
            }
        }


class FamilyListResponse(BaseModel):
    family_ids: List[str]
    total_families: int

    class Config:
        json_schema_extra = {
            "example": {
                "family_ids": ["3aUKKgFQvO2v", "8aUKKgFOsO2v", "4adUKKgFQvO2v"],
                "total_families": 3
            }
        } 