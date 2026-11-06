import streamlit as st

from src.travel_data import (
    load_records,
    search_flights,
    search_hotels,
    search_places,
)

st.set_page_config(
    page_title="TravelMind AI",
    page_icon="✈️",
    layout="wide",
)

st.markdown("""
<style>
.stApp {
    background: linear-gradient(135deg, #07111f, #10253c);
}
.block-container {
    max-width: 1200px;
    padding-top: 2rem;
}
.hero {
    padding: 36px;
    border: 1px solid #30506b;
    border-radius: 24px;
    background: linear-gradient(120deg, #13394c, #182841);
    margin-bottom: 28px;
}
.hero h1 {
    color: #f4f8ff;
    font-size: 46px;
    margin-bottom: 12px;
}
.hero p {
    color: #b9ccdd;
    font-size: 18px;
}
.eyebrow {
    color: #62dfcb;
    letter-spacing: 3px;
    font-size: 12px;
    font-weight: 700;
}
</style>
""", unsafe_allow_html=True)

st.markdown("""
<div class="hero">
    <div class="eyebrow">EXPLORE · DISCOVER · PLAN</div>
    <h1>TravelMind AI ✈️</h1>
    <p>Your next adventure starts with a better plan.</p>
</div>
""", unsafe_allow_html=True)

st.caption(
    "Demo travel catalogue • Flights use historical dataset records. "
    "Prices and availability are illustrative. No bookings are made."
)

try:
    flight_data = load_records("flights.json")
    hotel_data = load_records("hotels.json")
    place_data = load_records("places.json")
except (OSError, ValueError) as error:
    st.error(f"Unable to load travel data: {error}")
    st.stop()

if not flight_data:
    st.warning("Add flight records to the dataset to start exploring.")
    st.stop()

with st.sidebar:
    st.title("🧭 Explore your trip")

    origins = sorted({flight["from"] for flight in flight_data})
    origin = st.selectbox("Departure city", origins)

    destinations = sorted({
        flight["to"]
        for flight in flight_data
        if flight["from"] == origin and flight["to"] != origin
    })

    if not destinations:
        st.warning("No destination routes are available for this city.")
        st.stop()

    destination = st.selectbox("Destination", destinations)
    sort_by = st.selectbox("Flight preference", ["cheapest", "fastest"])

    st.divider()
    st.subheader("Your stay")

    max_price = st.number_input(
        "Maximum room price per night (INR)",
        min_value=500,
        max_value=100000,
        value=10000,
        step=500,
    )
    min_stars = st.slider("Minimum hotel star category", 1, 5, 1)

    categories = sorted({
        place["type"]
        for place in place_data
        if place["city"].strip().casefold() == destination.strip().casefold()
    })
    interests = st.multiselect("Attraction categories", categories)
    st.caption("Leave categories empty to see all attractions.")

flights = search_flights(origin, destination, sort_by)
hotels = search_hotels(destination, max_price, min_stars)
places = search_places(destination, interests)

st.header(f"{origin} → {destination}")

col1, col2, col3 = st.columns(3)
col1.metric("Flight options", len(flights))
col2.metric("Matching hotels", len(hotels))
col3.metric("Attractions", len(places))

flight_tab, hotel_tab, place_tab = st.tabs([
    "✈️ Flights",
    "🏨 Hotels",
    "📍 Discover",
])

with flight_tab:
    st.subheader("Find your flight")
    st.caption(
        "Dates below are the original historical dataset dates, "
        "not flights available for a new trip."
    )

    if not flights:
        st.info("No flights match this route.")

    for flight in flights:
        with st.container(border=True):
            left, right = st.columns([3, 1])
            with left:
                st.subheader(flight["airline"])
                st.write(f'{flight["from"]} → {flight["to"]}')
                st.caption(f'Flight ID: {flight["flight_id"]}')
                st.write(f'Dataset departure: {flight["departure_time"]}')
                st.write(f'Dataset arrival: {flight["arrival_time"]}')
            with right:
                st.metric("Demo fare / person", f'₹{float(flight["price"]):,.0f}')

with hotel_tab:
    st.subheader("Choose your stay")
    st.caption("Sorted by nightly price. Stars indicate hotel category.")

    if not hotels:
        st.info("No hotels match. Increase your nightly budget or lower the star filter.")

    for hotel in hotels:
        with st.container(border=True):
            left, right = st.columns([3, 1])
            with left:
                st.subheader(hotel["name"])
                st.write(f'{hotel["city"]} · {hotel["stars"]}-star category')
                st.write("Amenities: " + ", ".join(hotel.get("amenities", [])))
            with right:
                st.metric(
                    "Demo price / room / night",
                    f'₹{float(hotel["price_per_night"]):,.0f}',
                )

with place_tab:
    st.subheader("Discover local attractions")
    st.caption("Sample attractions ranked by dataset rating.")

    if not places:
        st.info("No attractions match your selected categories.")

    for place in places:
        with st.container(border=True):
            st.subheader(place["name"])
            st.write(f'{place["city"]} · {place["type"].title()}')
            st.write(f'Dataset rating: {place.get("rating", "Not available")}')

st.divider()
st.caption("TravelMind AI · Travel explorer · Built with Python and Streamlit")
