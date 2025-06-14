from mongoengine import Document, StringField, ListField, DictField, DateTimeField, ReferenceField, EmbeddedDocument, EmbeddedDocumentField, IntField
from datetime import datetime

class BirthDate(EmbeddedDocument):
    day = IntField(required=False)
    month = IntField(required=False)
    year = IntField(required=False)

class Relative(EmbeddedDocument):
    person_id = StringField(required=True)
    relationType = StringField(required=True)

class Person(Document):
    person_id = StringField(required=True, unique=True)
    name = StringField(required=False)
    surname = StringField(required=False)
    middleName = StringField(required=False)
    birthdate = DictField(required=False)
    gender = StringField(required=True, choices=['Male', 'Female'])
    birthplace = StringField(required=False)
    relatives = ListField(EmbeddedDocumentField(Relative), required=True)
    family_id = StringField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)
    updated_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'trees',
        'indexes': [
            'person_id',
            'family_id',
            ('family_id', 'person_id')
        ]
    }

    def save(self, *args, **kwargs):
        self.updated_at = datetime.utcnow()
        return super(Person, self).save(*args, **kwargs)

class BasicChecks(Document):
    family_id = StringField(required=True)
    checks = DictField(required=True)
    created_at = DateTimeField(default=datetime.utcnow)

    meta = {
        'collection': 'basic_checks',
        'indexes': [
            'family_id',
            '-created_at'
        ]
    } 