from django.contrib import admin
from django.urls import path, include, re_path
from rest_framework.routers import DefaultRouter
from genotek.api.views import PersonViewSet
from drf_yasg.views import get_schema_view
from drf_yasg import openapi
from rest_framework import permissions

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')

schema_view = get_schema_view(
    openapi.Info(
        title="Genotek API",
        default_version='v1',
        description="API для работы с генеалогическим деревом",
        terms_of_service="https://www.google.com/policies/terms/",
        contact=openapi.Contact(email="contact@genotek.com"),
        license=openapi.License(name="BSD License"),
    ),
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/check_anomalies/', PersonViewSet.as_view({'get': 'check_anomalies'}), name='check_anomalies'),
    # Swagger UI
    re_path(r'^swagger(?P<format>\.json|\.yaml)$', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
] 