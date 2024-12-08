from django.contrib import admin
from django.urls import path
from handleDataset.views import DataApi, PurchaseDetailsApi,generate_recipe  # Import your views

urlpatterns = [
    path('admin/', admin.site.urls),  # Admin panel
    path('api/data/', DataApi, name='data_api'),  # DataApi endpoint for recommendations
    path('api/purchase-details/', PurchaseDetailsApi, name='purchase_details_api'),  # New endpoint for purchase details
    path('generate-recipe/', generate_recipe, name='generate_recipe'),
]
