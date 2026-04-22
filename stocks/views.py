from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from twelvedata import TDClient

td = TDClient(apikey=settings.TWELVEDATA_API_KEY)

class StockSearchView(APIView):
    # search for stock symbols
    def get(self, request):
        query = request.query_params.get("q")
        if not query:
            return Response({"error": "Query param 'q' is required"}, status=400)

        try:
            # The library handles the URL and apikey injection
            data = td.symbol_search(symbol=query).as_json()
            return Response(data)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class StockCandlestickView(APIView):
    # Return OHLCV candlestick data for a symbol.
    def get(self, request):
        symbol = request.query_params.get("symbol")
        interval = request.query_params.get("interval", "1day")
        outputsize = request.query_params.get("outputsize", "90")

        if not symbol:
            return Response({"error": "Symbol is required"}, status=400)

        try:
            ts = td.time_series(
                symbol=symbol,
                interval=interval,
                outputsize=outputsize
            )
            return Response(ts.as_json())
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)


class StockQuoteView(APIView):
    # Return current quote for a symbol.
    def get(self, request):
        symbol = request.query_params.get("symbol")
        if not symbol:
            return Response({"error": "Symbol is required"}, status=400)

        try:
            quote = td.quote(symbol=symbol).as_json()
            return Response(quote)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_502_BAD_GATEWAY)