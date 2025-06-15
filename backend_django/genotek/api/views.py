from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Person, BasicChecks
from .serializers import (
    PersonSerializer,
    FamilyTreeResponseSerializer,
    FamilyListResponseSerializer,
    BasicChecksResponseSerializer
)
from .services import (
    get_family_tree,
    get_family_list,
    perform_basic_checks
)
from datetime import datetime
from typing import Dict, Any, Tuple, Set
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

class PersonViewSet(viewsets.ModelViewSet):
    serializer_class = PersonSerializer
    queryset = Person.objects.all()

    def get_queryset(self):
        return Person.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Получение генеалогического дерева по ID семьи",
        manual_parameters=[
            openapi.Parameter(
                'family_id',
                openapi.IN_QUERY,
                description="ID семьи",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: FamilyTreeResponseSerializer,
            404: "Family not found",
            400: "Bad Request"
        }
    )
    @action(detail=False, methods=['get'])
    def family_tree(self, request):
        family_id = request.query_params.get('family_id')
        if not family_id:
            return Response(
                {"error": "family_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            persons = Person.objects.filter(family_id=family_id)
            if not persons:
                return Response(
                    {"detail": "Family not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Получаем корневого предка (человека без родителей)
            root_person = persons.filter(relatives__relationType='parent').first()
            if not root_person:
                # Если нет корневого предка, берем первого человека из семьи
                root_person = persons.first()

            tree_data = get_family_tree(root_person)
            serializer = FamilyTreeResponseSerializer(data=tree_data)
            serializer.is_valid(raise_exception=True)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @swagger_auto_schema(
        operation_description="Проверка аномалий в генеалогическом дереве",
        manual_parameters=[
            openapi.Parameter(
                'family_id',
                openapi.IN_QUERY,
                description="ID семьи",
                type=openapi.TYPE_STRING,
                required=True
            )
        ],
        responses={
            200: openapi.Response(
                description="Результат проверки аномалий",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'family_id': openapi.Schema(type=openapi.TYPE_STRING),
                        'checks': openapi.Schema(
                            type=openapi.TYPE_OBJECT,
                            properties={
                                'missing_birthdate': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'is_it': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                        'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                                        'persons': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'person': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'missing_fields': openapi.Schema(
                                                        type=openapi.TYPE_ARRAY,
                                                        items=openapi.Schema(type=openapi.TYPE_STRING)
                                                    )
                                                }
                                            )
                                        )
                                    }
                                ),
                                'invalid_date': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'is_it': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                        'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                                        'persons': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'person': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'birthdate': openapi.Schema(
                                                        type=openapi.TYPE_OBJECT,
                                                        properties={
                                                            'day': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                            'month': openapi.Schema(type=openapi.TYPE_INTEGER),
                                                            'year': openapi.Schema(type=openapi.TYPE_INTEGER)
                                                        }
                                                    ),
                                                    'error': openapi.Schema(type=openapi.TYPE_STRING)
                                                }
                                            )
                                        )
                                    }
                                ),
                                'isolated_person': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'is_it': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                        'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                                        'persons': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'person': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'person_id': openapi.Schema(type=openapi.TYPE_STRING)
                                                }
                                            )
                                        )
                                    }
                                ),
                                'non_reciprocal_relation': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'is_it': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                        'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                                        'relations': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_OBJECT,
                                                properties={
                                                    'person_a': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'person_b': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'relation': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'expected': openapi.Schema(type=openapi.TYPE_STRING),
                                                    'error': openapi.Schema(type=openapi.TYPE_STRING)
                                                }
                                            )
                                        )
                                    }
                                ),
                                'circular_relationship': openapi.Schema(
                                    type=openapi.TYPE_OBJECT,
                                    properties={
                                        'is_it': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                                        'count': openapi.Schema(type=openapi.TYPE_INTEGER),
                                        'cycles': openapi.Schema(
                                            type=openapi.TYPE_ARRAY,
                                            items=openapi.Schema(
                                                type=openapi.TYPE_ARRAY,
                                                items=openapi.Schema(
                                                    type=openapi.TYPE_OBJECT,
                                                    properties={
                                                        'person_id': openapi.Schema(type=openapi.TYPE_STRING),
                                                        'full_name': openapi.Schema(type=openapi.TYPE_STRING)
                                                    }
                                                )
                                            )
                                        )
                                    }
                                )
                            }
                        ),
                        'has_issues': openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                )
            ),
            404: "Family not found",
            400: "Bad Request"
        }
    )
    @action(detail=False, methods=['get'])
    def check_anomalies(self, request):
        family_id = request.query_params.get('family_id')
        if not family_id:
            return Response(
                {"error": "family_id parameter is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # Проверяем, есть ли уже сохраненные результаты проверки
            saved_check = BasicChecks.objects.filter(family_id=family_id).order_by('-created_at').first()
            if saved_check:
                return Response({
                    "family_id": family_id,
                    "checks": saved_check.checks,
                    "has_issues": any(check["is_it"] for check in saved_check.checks.values())
                })

            persons = Person.objects.filter(family_id=family_id)
            if not persons:
                return Response(
                    {"detail": "Family not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            # Получаем корневого предка для проверки
            root_person = persons.filter(relatives__relationType='parent').first()
            if not root_person:
                root_person = persons.first()

            checks_data = perform_basic_checks(root_person)
            
            # Сохраняем результаты проверки
            BasicChecks.objects.create(
                family_id=family_id,
                checks=checks_data["checks"]
            )

            return Response(checks_data)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

    @swagger_auto_schema(
        operation_description="Получение списка всех семей",
        responses={
            200: openapi.Response(
                description="Список ID семей",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'family_ids': openapi.Schema(
                            type=openapi.TYPE_ARRAY,
                            items=openapi.Schema(type=openapi.TYPE_STRING)
                        ),
                        'total_families': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            ),
            400: "Bad Request"
        }
    )
    @action(detail=False, methods=['get'])
    def families(self, request):
        try:
            family_ids = Person.objects.distinct('family_id')
            response_data = {
                "family_ids": list(family_ids),
                "total_families": len(family_ids)
            }
            return Response(response_data)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST
            ) 