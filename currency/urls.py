from django.urls import path
from . import views

urlpatterns = [
    path('list/', views.CurrencyListView.as_view()),
    path('convert/', views.CurrencyConvertView.as_view()),
    path('rates/', views.CurrencyRatesView.as_view()),
]