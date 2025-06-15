from typing import List, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient
from ..models.person import Person
from ..core.config import settings


class MongoDBService:
    def __init__(self):
        self.client = AsyncIOMotorClient(settings.MONGODB_URL)
        self.db = self.client[settings.MONGODB_DB_NAME]
        self.collection = self.db.trees

    async def get_all_persons(self) -> List[Dict]:
        cursor = self.collection.find({})
        return await cursor.to_list(length=None)

    async def get_person_by_id(self, person_id: str) -> Optional[Dict]:
        return await self.collection.find_one({"person_id": person_id})

    async def create_person(self, person: Person) -> Dict:
        person_dict = person.model_dump()
        await self.collection.insert_one(person_dict)
        return person_dict

    async def update_person(self, person_id: str, person: Person) -> Optional[Dict]:
        person_dict = person.model_dump()
        result = await self.collection.update_one(
            {"person_id": person_id},
            {"$set": person_dict}
        )
        if result.modified_count:
            return person_dict
        return None

    async def delete_person(self, person_id: str) -> bool:
        result = await self.collection.delete_one({"person_id": person_id})
        return result.deleted_count > 0

    async def get_family_tree(self, family_id: str) -> List[Dict]:
        cursor = self.collection.find({"family_id": family_id})
        return await cursor.to_list(length=None)

    async def get_unique_family_ids(self) -> List[str]:
        pipeline = [
            {"$group": {"_id": "$family_id"}},
            {"$project": {"_id": 0, "family_id": "$_id"}}
        ]
        cursor = self.collection.aggregate(pipeline)
        results = await cursor.to_list(length=None)
        return [doc["family_id"] for doc in results]

    async def close(self):
        self.client.close() 