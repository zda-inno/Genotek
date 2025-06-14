from rest_framework import serializers
from .models import Person, BasicChecks, BirthDate, Relative

class BirthDateSerializer(serializers.Serializer):
    day = serializers.IntegerField(required=False, allow_null=True)
    month = serializers.IntegerField(required=False, allow_null=True)
    year = serializers.IntegerField(required=False, allow_null=True)

class RelativeSerializer(serializers.Serializer):
    person_id = serializers.CharField(required=True)
    relationType = serializers.CharField(required=True)

class PersonSerializer(serializers.Serializer):
    person_id = serializers.CharField(required=True)
    name = serializers.CharField(required=False, allow_null=True)
    surname = serializers.CharField(required=False, allow_null=True)
    middleName = serializers.CharField(required=False, allow_null=True)
    birthdate = serializers.DictField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=['Male', 'Female'], required=True)
    birthplace = serializers.CharField(required=False, allow_null=True)
    relatives = RelativeSerializer(many=True, required=True)
    family_id = serializers.CharField(required=True)

    def create(self, validated_data):
        return Person.objects.create(**validated_data)

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

class FamilyTreeResponseSerializer(serializers.Serializer):
    family_id = serializers.CharField()
    persons = PersonSerializer(many=True)
    total_persons = serializers.IntegerField()

class FamilyListResponseSerializer(serializers.Serializer):
    family_ids = serializers.ListField(child=serializers.CharField())
    total_families = serializers.IntegerField()

class BasicChecksResponseSerializer(serializers.Serializer):
    family_id = serializers.CharField()
    checks = serializers.DictField()
    has_issues = serializers.BooleanField() 