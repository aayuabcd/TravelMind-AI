import { useEffect, useState } from "react";

// Goa uses Panaji as the forecast location.
const cities = {
  goa: [15.4909, 73.8278, "Panaji, Goa"],
  delhi: [28.6139, 77.2090, "Delhi"],
  "new delhi": [28.6139, 77.2090, "New Delhi"],
  mumbai: [19.0760, 72.8777, "Mumbai"],
  hyderabad: [17.3850, 78.4867, "Hyderabad"],
  bangalore: [12.9716, 77.5946, "Bengaluru"],
  bengaluru: [12.9716, 77.5946, "Bengaluru"],
  chennai: [13.0827, 80.2707, "Chennai"],
  kolkata: [22.5726, 88.3639, "Kolkata"],
  pune: [18.5204, 73.8567, "Pune"],
  jaipur: [26.9124, 75.7873, "Jaipur"],
};

export function tripDateKey(start, offset) {
  const date = new Date(`${start}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

export function useTripWeather(destination) {
  const city = destination.trim().toLowerCase();
  const [forecast, setForecast] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        let location = cities[city];

        if (!location) {
          const params = new URLSearchParams({
            name: city, count: "10", language: "en", countryCode: "IN",
          });
          const response = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?${params}`,
            { signal: controller.signal }
          );
          if (!response.ok) throw new Error("Location lookup failed");
          const body = await response.json();
          const match = body.results?.find(
            place => place.country_code === "IN" &&
              place.name.toLowerCase() === city
          );
          if (!match) {
            setForecast({ city, message: "Weather location unavailable for this city." });
            return;
          }
          location = [match.latitude, match.longitude, match.name];
        }

        const [latitude, longitude, label] = location;
        const params = new URLSearchParams({
          latitude: String(latitude),
          longitude: String(longitude),
          timezone: "Asia/Kolkata",
          forecast_days: "16",
          daily: "temperature_2m_min,temperature_2m_max,precipitation_probability_max",
        });

        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?${params}`,
          { signal: controller.signal }
        );
        if (!response.ok) throw new Error("Forecast request failed");

        const { daily } = await response.json();
        const byDate = Object.fromEntries(daily.time.map((date, i) => [
          date,
          {
            low: daily.temperature_2m_min[i],
            high: daily.temperature_2m_max[i],
            rain: daily.precipitation_probability_max[i],
          },
        ]));

        if (!controller.signal.aborted) setForecast({ city, label, byDate });
      } catch {
        if (!controller.signal.aborted) {
          setForecast({ city, message: "Weather is temporarily unavailable." });
        }
      }
    }

    load();
    return () => controller.abort();
  }, [city]);

  return forecast?.city === city ? forecast : null;
}

export function DailyWeather({ forecast, date }) {
  if (!forecast) return <p>Loading forecast…</p>;
  if (forecast.message) return <p>{forecast.message}</p>;

  const day = forecast.byDate[date];
  if (!day) return <p>This date is outside the available forecast.</p>;

  const details = [];
  if (Number.isFinite(day.low)) details.push(`Low ${Math.round(day.low)}°C`);
  if (Number.isFinite(day.high)) details.push(`High ${Math.round(day.high)}°C`);
  if (Number.isFinite(day.rain)) details.push(`${day.rain}% chance of rain`);

  return <p>{forecast.label} · {details.join(" · ") || "Forecast details unavailable"}</p>;
}
