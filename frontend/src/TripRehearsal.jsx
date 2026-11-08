import { useState } from "react";

const arrival = 13 * 60;          // Scheduled arrival: 1:00 PM
const transfer = 90;              // Airport to hotel and check-in
const beachTravel = 30;           // Travel to beach
const sunset = 18 * 60;           // Fixed demo sunset slot: 6:00 PM
const fullShopping = 60;
const minShopping = 30;

function clock(minutes) {
  const hour = Math.floor(minutes / 60);
  const minute = String(minutes % 60).padStart(2, "0");
  return `${hour % 12 || 12}:${minute} ${hour >= 12 ? "PM" : "AM"}`;
}

function rehearse(delay, priority = "sunset") {
  const ready = arrival + delay + transfer;
  const latestBeachDeparture = sunset - beachTravel;
  const available = latestBeachDeparture - ready;

  const protectShopping = priority === "shopping";
  const shopping = protectShopping
    ? fullShopping
    : available >= minShopping ? Math.min(fullShopping, available) : 0;

  const earliestAfterShopping = ready + shopping + beachTravel;
  const keepsSunset = earliestAfterShopping <= sunset;
  const beachDeparture = Math.max(ready + shopping, latestBeachDeparture);

  let decision;
  if (!keepsSunset && protectShopping) {
    decision = `Keep the full ${fullShopping}-minute shopping visit. After shopping and the beach transfer, the earliest arrival is ${clock(earliestAfterShopping)}. Move the family sunset to Day 2.`;
  } else if (!keepsSunset) {
    decision = `Even going straight to the beach gets you there at ${clock(earliestAfterShopping)}. Move the family sunset to Day 2.`;
  } else if (shopping === 0) {
    decision = "Skip shopping on Day 1 to keep the family sunset. Less than 30 minutes is available for shopping.";
  } else if (shopping < fullShopping) {
    decision = `Shorten shopping to ${shopping} minutes and keep the family sunset on Day 1.`;
  } else {
    decision = "The full shopping visit and the family sunset both fit on Day 1.";
  }

  return {
    landing: clock(arrival + delay),
    hotel: clock(ready),
    shopping: shopping ? `${shopping} minutes` : "Skip on Day 1",
    beach: keepsSunset ? `Leave at ${clock(beachDeparture)}` : "Move visit to Day 2",
    sunset: keepsSunset ? "Day 1 · 6:00 PM" : "Day 2 · 6:00 PM",
    decision,
  };
}

export default function TripRehearsal({ brief }) {
  const [delay, setDelay] = useState(0);
  const [priority, setPriority] = useState("sunset");

  const isDemoRoute =
    brief.origin.trim().toLowerCase() === "mumbai" &&
    brief.destination.trim().toLowerCase() === "goa";

  if (!isDemoRoute) return null;

  const original = rehearse(0);
  const revised = rehearse(delay, priority);
  const rows = [
    ["Flight arrival", "landing"],
    ["Ready after check-in", "hotel"],
    ["Shopping visit", "shopping"],
    ["Beach transfer", "beach"],
    ["Family sunset", "sunset"],
  ];

  return (
    <section className="brief rehearsal" aria-label="Trip Rehearsal">
      <h3>Trip Rehearsal</h3>
      <p>What happens to your first evening in Goa if your flight arrives late?</p>
      <label>
        Which experience should we protect?
        <select name="tripPriority" value={priority}
          onChange={event => setPriority(event.target.value)}>
          <option value="sunset">Protect the family sunset</option>
          <option value="shopping">Protect the full shopping visit</option>
        </select>
      </label>

      <label>
        Flight arrival delay: <strong>{delay} minutes</strong>
        <input type="range" min="0" max="240" step="15"
          value={delay}
          onChange={event => setDelay(Number(event.target.value))}
          aria-valuetext={`${delay} minutes late`} />
      </label>

      <div className="rehearsal-table">
        <table>
          <caption>Original and revised schedule</caption>
          <thead>
            <tr><th>Activity</th><th>Original</th><th>With delay</th></tr>
          </thead>
          <tbody>
            {rows.map(([label, key]) => (
              <tr key={key}>
                <th scope="row">{label}</th>
                <td>{original[key]}</td>
                <td className={original[key] !== revised[key] ? "changed" : ""}>
                  {revised[key]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p aria-live="polite"><strong>{revised.decision}</strong></p>
      <small>Demo assumptions: 1:00 PM arrival, 90 minutes for transfer and
        check-in, 30 minutes to the beach, and a fixed 6:00 PM sunset slot.
        Shopping takes 30–60 minutes. Day 2 is available for this rehearsal.</small>
    </section>
  );
}
