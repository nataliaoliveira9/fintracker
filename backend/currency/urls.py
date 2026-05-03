from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.CurrencyListView.as_view()), # list of currencies
    path('convert/', views.CurrencyConvertView.as_view()), # convert currency
    path('rates/', views.CurrencyRatesView.as_view()), # get currency rates
]