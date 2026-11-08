"""HTTP API for the TravelMind demonstration datasets."""

import logging
from typing import Literal

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware

from src.travel_data import (
    load_records,
    search_flights,
    search_hotels,
    search_places,
)

app = FastAPI(
    title="TravelMind AI API",
    description="Search demonstration travel data. No live bookings.",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["GET"],
    allow_headers=["Content-Type"],
)

logger = logging.getLogger(__name__)


@app.get("/api/health")
def health():
    """Confirm that the API process is running."""
    return {"status": "ok", "service": "TravelMind API"}


@app.get("/api/catalog")
def catalog():
    """Return routes and attraction categories from the supplied files."""
    try:
        flights = load_records("flights.json")
        places = load_records("places.json")

        routes = sorted({
            (flight["from"], flight["to"])
            for flight in flights
            if flight["from"] != flight["to"]
        })

        return {
            "routes": [
                {"origin": origin, "destination": destination}
                for origin, destination in routes
            ],
            "categories": sorted({place["type"] for place in places}),
            "data_mode": "demo",
        }
    except (OSError, ValueError, KeyError, TypeError):
        logger.exception("Unable to load travel catalogue")
        raise HTTPException(
            status_code=503,
            detail="Travel datasets could not be loaded. Check the backend terminal.",
        )


@app.get("/api/search")
def search(
    origin: str = Query(min_length=1, max_length=80),
    destination: str = Query(min_length=1, max_length=80),
    sort_by: Literal["cheapest", "fastest"] = "cheapest",
    max_hotel_price: float | None = Query(default=None, gt=0),
    min_stars: int = Query(default=1, ge=1, le=5),
    category: str | None = Query(default=None, max_length=80),
):
    """Search historical/sample options without claiming live availability."""
    origin = origin.strip()
    destination = destination.strip()

    if not origin or not destination:
        raise HTTPException(422, "Enter both departure and destination cities.")

    if origin.casefold() == destination.casefold():
        raise HTTPException(422, "Departure and destination must be different.")

    try:
        flights = search_flights(origin, destination, sort_by)
        hotels = search_hotels(destination, max_hotel_price, min_stars)
        places = search_places(
            destination,
            [category.strip()] if category and category.strip() else None,
        )

        return {
            "origin": origin,
            "destination": destination,
            "data_mode": "demo",
            "notice": (
                "Historical/sample dataset options only. "
                "Travel dates and live availability have not been checked. "
                "No bookings are made."
            ),
            "flights": flights,
            "hotels": hotels,
            "places": places,
            "counts": {
                "flights": len(flights),
                "hotels": len(hotels),
                "places": len(places),
            },
        }
    except (OSError, ValueError, KeyError, TypeError):
        logger.exception("Travel search failed")
        raise HTTPException(
            status_code=503,
            detail="Travel search is unavailable. Check the backend terminal.",
        )
