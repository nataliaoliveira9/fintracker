import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

class FixerBaseView(APIView): # base class to handle shared logic for apilayer.com API requests
    def _fetch_from_fixer(self, endpoint, params=None, cache_key=None, cache_timeout=3600):
        # Try to return cached data first to save API quota
        if cache_key:
            cached_data = cache.get(cache_key)
            if cached_data:
                return Response(cached_data)

        url = f"https://api.apilayer.com/fixer/{endpoint}"
        headers = {"apikey": settings.APPDATA_API_KEY}

        try:
            response = requests.get(url, headers=headers, params=params, timeout=10)
            
            # Handle rate limiting specifically
            if response.status_code == 429:
                return Response({
                    "error": "API rate limit exceeded. Your Fixer.io quota is likely reached for this period.",
                    "code": "rate_limit_exceeded"
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
                
            response.raise_for_status()
            data = response.json()

            # apilayer API returns 200 OK even for business errors, so we check their custom 'success' flag
            if not data.get("success", False):
                error_info = data.get("error", {}).get("info", "Unknown API error")
                return Response({"error": error_info}, status=status.HTTP_502_BAD_GATEWAY)

            # Store in cache if successful
            if cache_key:
                cache.set(cache_key, data, cache_timeout)

            return Response(data)

        except requests.RequestException as e:
            return Response(
                {"error": f"External API connection failed: {str(e)}"}, 
                status=status.HTTP_502_BAD_GATEWAY
            )

class CurrencyListView(FixerBaseView): # returns list of supported symbols
    def get(self, request):
        # Cache symbols for 24 hours as they rarely change
        return self._fetch_from_fixer("symbols", cache_key="fixer_symbols", cache_timeout=86400)

class CurrencyConvertView(FixerBaseView): # converts an amount from one currency to another
    def get(self, request):
        params = {
            "from": request.query_params.get("from", "USD"),
            "to": request.query_params.get("to", "BRL"),
            "amount": request.query_params.get("amount", "1")
        }
        # We don't cache conversions as they depend on the 'amount' which varies widely
        return self._fetch_from_fixer("convert", params=params)

class CurrencyRatesView(FixerBaseView): # returns latest exchange rates for a base currency
    def get(self, request):
        base = request.query_params.get("base", "USD")
        params = {"base": base}
        # Cache latest rates for 1 hour
        return self._fetch_from_fixer(f"latest", params=params, cache_key=f"fixer_rates_{base}", cache_timeout=3600)