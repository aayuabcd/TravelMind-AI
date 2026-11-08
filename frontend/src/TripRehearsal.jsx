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

function rehearse(delay) {
  const ready = arrival + delay + transfer;
  const latestBeachDeparture = sunset - beachTravel;
  const available = latestBeachDeparture - ready;

  const shopping = available >= minShopping
    ? Math.min(fullShopping, available)
    : 0;

  // Leave close to the sunset slot if early, or immediately if already late.
  const beachDeparture = Math.max(ready + shopping, latestBeachDeparture);
  const earliestBeachArrival = ready + beachTravel;
  const keepsSunset = earliestBeachArrival <= sunset;

  let decision;
  if (!keepsSunset) {
    decision = `Even going straight to the beach gets you there at ${clock(earliestBeachArrival)}, ${-available} minutes after the sunset slot. Move the sunset to Day 2.`;
  } else if (shopping === 0) {
    decision = "Skip shopping on Day 1 to keep the family sunset. The available time is shorter than the 30-minute minimum shopping visit.";
  } else if (shopping < fullShopping) {
    decision = `Shorten shopping to ${shopping} minutes. You can still reach the beach for the family sunset.`;
  } else {
    decision = "Keep the full shopping visit and the family sunset. Both still fit on Day 1.";
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

  const isDemoRoute =
    brief.origin.trim().toLowerCase() === "mumbai" &&
    brief.destination.trim().toLowerCase() === "goa";

  if (!isDemoRoute) return null;

  const original = rehearse(0);
  const revised = rehearse(delay);
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
      <p><strong>Keep if possible:</strong> the family sunset.
        {" "}<strong>Flexible:</strong> shopping.</p>

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
