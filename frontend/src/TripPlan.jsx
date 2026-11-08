import TripRehearsal from "./TripRehearsal";
import { DailyWeather, tripDateKey, useTripWeather } from "./TripWeather";
import { useState } from "react";

const rupees = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function dayLabel(start, offset) {
  const date = new Date(`${start}T12:00:00`);
  date.setDate(date.getDate() + offset);
  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default function TripPlan({ brief, data }) {
  const [allowance, setAllowance] = useState(800);
  const forecast = useTripWeather(brief.destination);
  const days = Number(brief.days);
  const nights = days - 1;
  const budget = Number(brief.budget);

  // The API returns flights and hotels in ascending price order by default.
  const flight = data.flights[0];
  const hotel = data.hotels[0];
  const flightCost = flight ? Number(flight.price) : null;
  const stayCost = hotel ? Number(hotel.price_per_night) * nights : null;
  const localCost = Number(allowance) * days;
  const complete = flightCost !== null && stayCost !== null;
  const total = (flightCost ?? 0) + (stayCost ?? 0) + localCost;
  const balance = budget - total;

  // Keep the API's rating order and give each attraction one day.
  const schedule = Array.from({ length: days }, () => []);
  data.places.slice(0, days * 2).forEach((place, index) => {
    schedule[index % days].push(place);
  });

  return (
    <section className="brief" aria-label="Trip plan and budget">
      <h3>Your {days}-day plan for {brief.destination}</h3>
      <p>Estimate for one traveller, one room, and a one-way flight.
        Prices come from the demo catalogue.</p>

      <label>
        Daily food and local transport allowance (₹)
        <select value={allowance} onChange={event => setAllowance(Number(event.target.value))}>
          {[500, 800, 1200, 2000].map(amount => (
            <option key={amount} value={amount}>{rupees.format(amount)} per day</option>
          ))}
        </select>
      </label>

      <h4>Estimated costs</h4>
      <p>Flight: {flight ? `${flight.airline} · ${rupees.format(flightCost)}` : "No fare available for this route"}</p>
      <p>Stay: {hotel
        ? `${hotel.name} · ${rupees.format(hotel.price_per_night)} × ${nights} nights = ${rupees.format(stayCost)}`
        : "No room price available for this city"}</p>
      <p>Food and transport: {rupees.format(allowance)} × {days} days = {rupees.format(localCost)}</p>

      {complete ? (
        <>
          <p><strong>Estimated total: {rupees.format(total)}</strong></p>
          <p>{balance >= 0
            ? `${rupees.format(balance)} remaining from your ${rupees.format(budget)} budget.`
            : `${rupees.format(-balance)} over your ${rupees.format(budget)} budget.`}</p>
        </>
      ) : (
        <p><strong>Known costs: {rupees.format(total)}.</strong> The full estimate needs both a flight fare and a room price.</p>
      )}

      <TripRehearsal brief={brief} />
      <h4>Day-by-day itinerary</h4>
      <small>Weather by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Open-Meteo</a></small>
      {schedule.map((places, index) => (
        <div key={index}>
          <strong>Day {index + 1} · {dayLabel(brief.date, index)}</strong>
          <DailyWeather forecast={forecast} date={tripDateKey(brief.date, index)} />
          <p>{places.length
            ? places.map(place => place.name).join(" → ")
            : "Free time for a local walk or rest."}</p>
        </div>
      ))}
    </section>
  );
}


