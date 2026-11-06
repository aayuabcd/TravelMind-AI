import { useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sparkles } from "@react-three/drei";
import { Compass, ArrowUpRight, Mountain, Map, Sun, Pause, Play } from "lucide-react";
import "./App.css";

function Island({ position, scale = 1, motion }) {
  return (
    <group position={position} scale={scale}>
      <Float speed={motion ? 1 : 0} rotationIntensity={0.06} floatIntensity={0.4}>
        <mesh position={[0, -1, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[2.2, 3, 7]} />
          <meshStandardMaterial color="#3d514a" flatShading />
        </mesh>
        <mesh position={[0, 0.55, 0]}>
          <cylinderGeometry args={[2.15, 1.9, 0.28, 7]} />
          <meshStandardMaterial color="#7b8963" flatShading />
        </mesh>
        {[-0.95, 0, 0.95].map((x, index) => (
          <group key={x} position={[x, 0.7, index === 1 ? -0.4 : 0.2]}>
            <mesh position={[0, 1, 0]}>
              <cylinderGeometry args={[0.16, 0.23, 2, 8]} />
              <meshStandardMaterial color="#d7c59b" />
            </mesh>
            <mesh position={[0, 2.3, 0]}>
              <coneGeometry args={[0.42, 0.8, 6]} />
              <meshStandardMaterial color="#415956" />
            </mesh>
            <mesh position={[0, 1.85, 0]}>
              <torusGeometry args={[0.25, 0.035, 8, 24]} />
              <meshStandardMaterial
                color="#e6c47f"
                emissive="#b58231"
                emissiveIntensity={0.4}
              />
            </mesh>
          </group>
        ))}
      </Float>
    </group>
  );
}

function CameraJourney({ motion }) {
  useFrame(({ camera, pointer }, delta) => {
    if (!motion) return;
    const progress = Math.min(window.scrollY / window.innerHeight, 1.5);
    const ease = 1 - Math.exp(-delta * 2);
    camera.position.x += (pointer.x * 0.45 - camera.position.x) * ease;
    camera.position.y += (1.2 + progress * 1.1 - camera.position.y) * ease;
    camera.position.z += (13 - progress * 2 - camera.position.z) * ease;
    camera.lookAt(0, 0.8, 0);
  });
  return null;
}

function World({ motion }) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 13], fov: 48 }}
      dpr={[1, 1.5]}
      frameloop={motion ? "always" : "demand"}
      fallback={<div className="scene-fallback">Your adventure begins here.</div>}
    >
      <fog attach="fog" args={["#b6a77f", 17, 38]} />
      <ambientLight intensity={1.8} color="#d8e4dc" />
      <directionalLight position={[5, 8, 4]} intensity={3} color="#ffd89a" />
      <mesh position={[5, 4, -17]}>
        <sphereGeometry args={[3, 32, 32]} />
        <meshBasicMaterial color="#ffe8ad" />
      </mesh>
      <Island position={[4.3, -0.6, 0]} scale={1.45} motion={motion} />
      <Island position={[-5, 1.2, -5]} scale={0.8} motion={motion} />
      <Island position={[0.2, 2.5, -11]} scale={0.65} motion={motion} />
      <Island position={[8, 3.5, -13]} scale={0.8} motion={motion} />
      <Sparkles
        count={65}
        scale={[22, 12, 14]}
        size={2}
        speed={motion ? 0.2 : 0}
        color="#ffe0a0"
      />
      <CameraJourney motion={motion} />
    </Canvas>
  );
}

const chapters = [
  {
    number: "01",
    icon: Mountain,
    title: "Follow your curiosity",
    text: "Choose the places and experiences that make a journey yours.",
  },
  {
    number: "02",
    icon: Map,
    title: "Give your journey shape",
    text: "Bring your destination, dates, and travel budget together.",
  },
  {
    number: "03",
    icon: Sun,
    title: "Leave room for wonder",
    text: "Balance discovery with time to pause and explore.",
  },
];

export default function App() {
  const [motion, setMotion] = useState(
    () => !window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  const [brief, setBrief] = useState(null);

  useEffect(() => {
    document.title = "TravelMind AI | Beyond the Ordinary";
  }, []);

  function previewTrip(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));

    if (
      values.origin.trim().toLowerCase() ===
      values.destination.trim().toLowerCase()
    ) {
      form.elements.destination.setCustomValidity(
        "Choose a destination different from your departure city."
      );
      form.elements.destination.reportValidity();
      return;
    }

    setBrief(values);
  }

  return (
    <div className={motion ? "site" : "site motion-off"}>
      <div className="world" aria-hidden="true">
        <World motion={motion} />
      </div>
      <div className="world-shade" />

      <header className="navigation">
        <a className="brand" href="#home" aria-label="TravelMind home">
          <Compass size={28} />
          <span>
            TRAVELMIND
            <small>THE ART OF EXPLORATION</small>
          </span>
        </a>
        <nav aria-label="Main navigation">
          <a href="#discover">Discover</a>
          <a href="#planner" className="nav-action">
            Plan a journey <ArrowUpRight size={15} />
          </a>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="eyebrow">
            <span /> YOUR NEXT CHAPTER AWAITS
          </div>
          <h1>
            Somewhere,<br />
            something<br />
            <em>incredible.</em>
          </h1>
          <p>
            Beyond the familiar. Beyond the everyday.<br />
            Begin a journey shaped around you.
          </p>
          <a className="button gold" href="#planner">
            Plan your expedition <ArrowUpRight size={19} />
          </a>
          <div className="hero-foot">
            <a href="#discover">↓ &nbsp; SCROLL TO EXPLORE</a>
            <span>A WORLD OF POSSIBILITIES</span>
          </div>
        </section>

        <section id="discover" className="discover section">
          <div className="eyebrow">THE EXPLORER'S WAY</div>
          <h2>
            Less ordinary.<br />
            <em>More possibility.</em>
          </h2>
          <div className="chapter-grid">
            {chapters.map(({ number, icon: Icon, title, text }) => (
              <article className="chapter" key={number}>
                <div className="chapter-top">
                  <Icon size={26} /><span>{number}</span>
                </div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="planner" className="section planner">
          <div className="planner-intro">
            <div className="eyebrow">YOUR EXPEDITION BRIEF</div>
            <h2>
              Where will<br />
              your story<br />
              <em>take you?</em>
            </h2>
            <p>
              Start with a place. Add a little curiosity.<br />
              Tell us what your ideal escape looks like.
            </p>
            <span className="status">● &nbsp; TRIP BRIEF PREVIEW</span>
          </div>

          <div className="planner-panel">
            <div className="panel-heading">
              <Compass size={22} /><span>BUILD YOUR JOURNEY</span>
            </div>

            <form onSubmit={previewTrip}>
              <div className="form-grid">
                <label>
                  Departure city
                  <input name="origin" placeholder="e.g. Pune" required maxLength={80} />
                </label>
                <label>
                  Destination
                  <input
                    name="destination"
                    placeholder="e.g. Goa"
                    required
                    maxLength={80}
                    onChange={(event) => event.target.setCustomValidity("")}
                  />
                </label>
                <label>
                  Start date
                  <input type="date" name="date" required />
                </label>
                <label>
                  Trip length
                  <select name="days">
                    {[3, 4, 5, 6, 7].map((day) => (
                      <option key={day} value={day}>{day} days</option>
                    ))}
                  </select>
                </label>
                <label>
                  Total budget (INR)
                  <input
                    type="number"
                    name="budget"
                    min="1000"
                    step="500"
                    defaultValue="25000"
                    required
                  />
                </label>
                <label>
                  Travel mood
                  <select name="mood">
                    <option>Adventure & nature</option>
                    <option>Culture & heritage</option>
                    <option>Beaches & relaxation</option>
                    <option>A little of everything</option>
                  </select>
                </label>
              </div>

              <button className="button gold" type="submit">
                Preview my trip brief <ArrowUpRight size={18} />
              </button>
              <p className="form-note">
                Preview only. Flight searches, live weather, and AI itinerary
                generation are not connected yet.
              </p>
            </form>

            <div aria-live="polite">
              {brief && (
                <div className="brief">
                  <div className="eyebrow">YOUR JOURNEY AT A GLANCE</div>
                  <h3>{brief.origin} → {brief.destination}</h3>
                  <p>{brief.days} days · Starting {brief.date}</p>
                  <p>
                    Budget: ₹{Number(brief.budget).toLocaleString("en-IN")}
                    {" · "}{brief.mood}
                  </p>
                  <small>
                    Trip details captured for this preview.
                    No booking or itinerary has been created.
                  </small>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>TRAVELMIND AI</span>
        <span>For the endlessly curious.</span>
      </footer>

      <button
        className="motion-toggle"
        onClick={() => setMotion(!motion)}
        aria-label={motion ? "Pause scene animation" : "Resume scene animation"}
      >
        {motion ? <Pause size={14} /> : <Play size={14} />}
        {motion ? "Pause motion" : "Enable motion"}
      </button>
    </div>
  );
}
