from django.urls import path
from . import views


urlpatterns = [
    path('search/', views.StockSearchView.as_view()),
    path('candles/', views.StockCandlestickView.as_view()),
    path('quote/', views.StockQuoteView.as_view()),
]