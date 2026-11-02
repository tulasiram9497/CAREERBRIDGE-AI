"""
CareerBridge AI URL Configuration
"""
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('apps.accounts.urls')),
    path('api/v1/profiles/', include('apps.profiles.urls')),
    path('api/v1/opportunities/', include('apps.opportunities.urls')),
    path('api/v1/people/', include('apps.people.urls')),
    path('api/v1/networking/', include('apps.networking.urls')),
    path('api/v1/applications/', include('apps.applications.urls')),
    path('api/v1/ai/', include('apps.ai_engine.urls')),
    path('api/v1/automation/', include('apps.automation.urls')),
]
