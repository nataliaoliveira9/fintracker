from django.urls import path
from . import views


urlpatterns = [
    path('search/', views.StockSearchView.as_view()), # search for stocks
    path('candles/', views.StockCandlestickView.as_view()), # get stock candles
    path('quote/', views.StockQuoteView.as_view()), # get stock quote
]