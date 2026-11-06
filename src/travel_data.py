"""Search tools for the supplied travel demonstration datasets."""

import json
from datetime import datetime
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"


def load_records(filename):
    """Read a JSON array, including files saved with a UTF-8 BOM."""
    path = DATA_DIR / filename
    with path.open(encoding="utf-8-sig") as file:
        records = json.load(file)

    if not isinstance(records, list):
        raise ValueError(f"{filename} must contain a JSON array.")
    if not all(isinstance(record, dict) for record in records):
        raise ValueError(f"{filename} must contain JSON objects.")
    return records


def matches(value, target):
    """Compare city names without case or surrounding-space differences."""
    return str(value).strip().casefold() == str(target).strip().casefold()


def flight_duration(flight):
    """Calculate the duration in minutes from the dataset timestamps."""
    departure = datetime.fromisoformat(flight["departure_time"])
    arrival = datetime.fromisoformat(flight["arrival_time"])
    minutes = (arrival - departure).total_seconds() / 60
    if minutes <= 0:
        raise ValueError("Flight arrival must be after departure.")
    return minutes


def search_flights(origin, destination, sort_by="cheapest"):
    """Return demo flights for a route; these are not live availability."""
    if sort_by not in {"cheapest", "fastest"}:
        raise ValueError("Choose cheapest or fastest.")

    results = [
        flight
        for flight in load_records("flights.json")
        if matches(flight.get("from", ""), origin)
        and matches(flight.get("to", ""), destination)
    ]

    if sort_by == "fastest":
        return sorted(
            results,
            key=lambda flight: (flight_duration(flight), float(flight["price"])),
        )

    return sorted(results, key=lambda flight: float(flight["price"]))


def search_hotels(city, max_price=None, min_stars=1):
    """Filter demo hotels and rank by nightly price, then star category."""
    results = [
        hotel
        for hotel in load_records("hotels.json")
        if matches(hotel.get("city", ""), city)
        and float(hotel["stars"]) >= min_stars
        and (
            max_price is None
            or float(hotel["price_per_night"]) <= max_price
        )
    ]

    return sorted(
        results,
        key=lambda hotel: (
            float(hotel["price_per_night"]),
            -float(hotel["stars"]),
        ),
    )


def search_places(city, interests=None):
    """Filter demo attractions by category and rank by dataset rating."""
    categories = {
        str(interest).strip().casefold()
        for interest in (interests or [])
    }

    results = [
        place
        for place in load_records("places.json")
        if matches(place.get("city", ""), city)
        and (
            not categories
            or str(place.get("type", "")).strip().casefold() in categories
        )
    ]

    return sorted(
        results,
        key=lambda place: float(place.get("rating", 0)),
        reverse=True,
    )


def verify_data():
    """Load each dataset and demonstrate searches using its first flight."""
    flights = load_records("flights.json")
    hotels = load_records("hotels.json")
    places = load_records("places.json")

    print(f"Flights loaded: {len(flights)}")
    print(f"Hotels loaded: {len(hotels)}")
    print(f"Places loaded: {len(places)}")

    if not flights:
        raise ValueError("The flight dataset is empty.")

    first = flights[0]
    origin, destination = first["from"], first["to"]

    print(f"\nDemo route: {origin} -> {destination}")

    route_flights = search_flights(origin, destination)
    city_hotels = search_hotels(destination)
    city_places = search_places(destination)

    print("\nCheapest demo flight:")
    print(json.dumps(route_flights[0], indent=2, ensure_ascii=False))

    print(f"\nMatching hotels: {len(city_hotels)}")
    print(f"Matching attractions: {len(city_places)}")
    print("\nDataset loading and basic searches completed successfully.")


if __name__ == "__main__":
    verify_data()
