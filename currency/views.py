import requests
from django.conf import settings
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class FixerBaseView(APIView):
    # Base class to handle shared logic for Fixer API requests.
    def _fetch_from_fixer(self, endpoint, params=None):
        url = f"https://api.apilayer.com/fixer/{endpoint}"
        headers = {"apikey": settings.APPDATA_API_KEY}

        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()

            # Fixer API returns 200 OK even for business errors, 
            # so we check their custom 'success' flag.
            if not data.get("success", False):
                error_info = data.get("error", {}).get("info", "Unknown API error")
                return Response({"error": error_info}, status=status.HTTP_502_BAD_GATEWAY)

            return Response(data)

        except requests.RequestException as e:
            return Response(
                {"error": f"External API connection failed: {str(e)}"}, 
                status=status.HTTP_502_BAD_GATEWAY
            )

class CurrencyListView(FixerBaseView):
    # Returns list of supported symbols
    def get(self, request):
        return self._fetch_from_fixer("symbols")

class CurrencyConvertView(FixerBaseView):
    # Converts an amount from one currency to another
    def get(self, request):
        params = {
            "from": request.query_params.get("from", "USD"),
            "to": request.query_params.get("to", "BRL"),
            "amount": request.query_params.get("amount", "1")
        }
        return self._fetch_from_fixer("convert", params=params)

class CurrencyRatesView(FixerBaseView):
    # Returns latest exchange rates for a base currency
    def get(self, request):
        params = {
            "base": request.query_params.get("base", "USD")
        }
        return self._fetch_from_fixer("latest", params=params)