from django.contrib import admin
from django.urls import path
from handleDataset.views import DataApi  # Import your view

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/data/', DataApi, name='data_api'),  # Add the DataApi endpoint
]
