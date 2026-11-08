import TripPlan from "./TripPlan";
import { useEffect, useState } from "react";

const apiBase = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function TravelResults({ origin, destination, brief }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    async function search() {
      try {
        const query = new URLSearchParams({ origin, destination });
        const response = await fetch(`${apiBase}/api/search?${query}`, {
          signal: controller.signal,
        });
        if (!response.ok) {
          throw new Error(`Travel search returned HTTP ${response.status}.`);
        }
        const result = await response.json();
        if (!controller.signal.aborted) setData(result);
      } catch (err) {
        if (!controller.signal.aborted) {
          setError(err.message === "Failed to fetch"
            ? "Could not reach TravelMind. Check that the API window is open and reload the page."
            : err.message);
        }
      }
    }

    search();
    return () => controller.abort();
  }, [origin, destination]);

  if (error) return <p role="alert">{error}</p>;
  if (!data) return <p role="status">Searching the travel catalogue…</p>;

  return (
    <section className="brief" aria-label="Travel search results">
      <TripPlan brief={brief} data={data} />
      <h3>Options for {destination}</h3>
      <p>Historical demo prices. Results are based on the cities you entered.
        Your dates, budget, and travel mood are saved in the brief for itinerary planning.</p>

      <h4>Flights · {data.flights.length}</h4>
      {data.flights.length === 0 && <p>No sample flight for this route.</p>}
      {data.flights.map(flight => (
        <p key={flight.flight_id}>
          <strong>{flight.airline}</strong> · {flight.flight_id} · {money.format(flight.price)}
        </p>
      ))}

      <h4>Hotels · {data.hotels.length}</h4>
      {data.hotels.length === 0 && <p>No sample hotels for this city.</p>}
      {data.hotels.map(hotel => (
        <p key={hotel.hotel_id}>
          <strong>{hotel.name}</strong> · {hotel.stars} stars · {money.format(hotel.price_per_night)} per night
        </p>
      ))}

      <h4>Attractions · {data.places.length}</h4>
      {data.places.length === 0 && <p>No sample attractions for this city.</p>}
      {data.places.map(place => (
        <p key={place.place_id}>
          <strong>{place.name}</strong> · {place.type} · Rating {place.rating}
        </p>
      ))}
    </section>
  );
}

