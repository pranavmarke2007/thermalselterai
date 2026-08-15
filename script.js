// ===================== CONFIG =====================

const OVERPASS_MIRRORS = [
    "https://overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
    "https://overpass.openstreetmap.ru/api/interpreter"
];

const NOMINATIM_BASE = "https://nominatim.openstreetmap.org";

// current search center — starts as a Pune default, gets overwritten by geolocation/manual search
let currentLocation = { lat: 18.5204, lon: 73.8567, label: "Pune (default)" };

// which taste chips the user has selected
let selectedTastes = new Set();

// ===================== DOM SHORTCUTS =====================

const statusEl = document.getElementById("status");
const resultsEl = document.getElementById("results");

function setStatus(msg) {
    statusEl.textContent = msg;
}

// ===================== TASTE CHIP SELECTION =====================

document.querySelectorAll(".taste-chip").forEach(chip => {
    chip.addEventListener("click", () => {
        const taste = chip.dataset.taste;
        if (selectedTastes.has(taste)) {
            selectedTastes.delete(taste);
            chip.classList.remove("selected");
        } else {
            selectedTastes.add(taste);
            chip.classList.add("selected");
        }
    });
});

// ===================== LOCATION: AUTO-DETECT =====================

function useMyLocation() {
    if (!navigator.geolocation) {
        setStatus("❌ Your browser doesn't support geolocation. Try manual search instead.");
        return;
    }

    setStatus("📡 Requesting your location permission...");

    navigator.geolocation.getCurrentPosition(
        position => {
            currentLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude,
                label: "Your current location"
            };
            setStatus(`✅ Location detected! Ready to search.`);
        },
        error => {
            setStatus(`❌ Couldn't get location (${error.message}). Try manual search instead.`);
        }
    );
}

// ===================== LOCATION: MANUAL SEARCH (forward geocoding) =====================

async function useManualLocation() {
    const query = document.getElementById("manualLocation").value.trim();
    if (!query) {
        setStatus("⚠️ Type a place name first.");
        return;
    }

    setStatus(`🔍 Looking up "${query}"...`);

    try {
        const url = `${NOMINATIM_BASE}/search?q=${encodeURIComponent(query)}&format=json&limit=1`;
        const response = await fetch(url, {
            headers: { "Accept-Language": "en" }
        });

        if (!response.ok) throw new Error(`Status ${response.status}`);

        const data = await response.json();
        if (!data.length) {
            setStatus(`❌ Couldn't find "${query}". Try a more specific name.`);
            return;
        }

        currentLocation = {
            lat: parseFloat(data[0].lat),
            lon: parseFloat(data[0].lon),
            label: data[0].display_name
        };
        setStatus(`✅ Location set to: ${currentLocation.label}`);
    } catch (err) {
        console.error(err);
        setStatus(`❌ Location search failed: ${err.message}`);
    }
}

// ===================== REVERSE GEOCODING (lat/lon -> address text) =====================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function reverseGeocode(lat, lon) {
    try {
        const url = `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json`;
        const response = await fetch(url, {
            headers: { "Accept-Language": "en" }
        });
        if (!response.ok) throw new Error(`Status ${response.status}`);
        const data = await response.json();
        return data.display_name || `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    } catch (err) {
        console.warn("Reverse geocode failed for", lat, lon, err.message);
        return `${lat.toFixed(4)}, ${lon.toFixed(4)}`;
    }
}

// ===================== OVERPASS FETCH (with mirror fallback) =====================

async function fetchFromOverpass(query) {
    for (let i = 0; i < OVERPASS_MIRRORS.length; i++) {
        const url = OVERPASS_MIRRORS[i];
        try {
            setStatus(`⏳ Trying server ${i + 1}/${OVERPASS_MIRRORS.length}...`);

            const response = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "data=" + encodeURIComponent(query)
            });

            if (!response.ok) throw new Error(`Status ${response.status}`);

            return await response.json();
        } catch (err) {
            console.warn(`⚠️ Mirror failed (${url}):`, err.message);
        }
    }
    throw new Error("All Overpass mirrors failed. Try again in a moment.");
}

// ===================== TASTE MATCH SCORING =====================

function scoreRestaurant(tags) {
    if (selectedTastes.size === 0) return 0;

    const cuisineField = (tags.cuisine || "").toLowerCase();
    const nameField = (tags.name || "").toLowerCase();
    const isVeg = tags["diet:vegetarian"] === "yes";

    let score = 0;
    selectedTastes.forEach(taste => {
        if (taste === "vegetarian" && isVeg) score++;
        else if (cuisineField.includes(taste.replace("_", "-")) ||
                 cuisineField.includes(taste.replace("_", " ")) ||
                 cuisineField.includes(taste)) {
            score++;
        } else if (nameField.includes(taste.replace("_", " "))) {
            score += 0.5;
        }
    });
    return score;
}

// ===================== MAIN SEARCH FLOW =====================

async function getRestaurants() {
    const { lat, lon, label } = currentLocation;

    const query = `
    [out:json][timeout:25];
    (
      node["amenity"="restaurant"](around:3000,${lat},${lon});
      way["amenity"="restaurant"](around:3000,${lat},${lon});
      relation["amenity"="restaurant"](around:3000,${lat},${lon});
    );
    out center 20;
    `;

    resultsEl.innerHTML = "";
    setStatus(`⏳ Searching near ${label}...`);

    try {
        const data = await fetchFromOverpass(query);

        if (!data.elements.length) {
            setStatus("😕 No restaurants found nearby. Try a different location.");
            return;
        }

        const scored = data.elements.map(place => ({
            ...place,
            _score: scoreRestaurant(place.tags || {})
        }));
        scored.sort((a, b) => b._score - a._score);

        setStatus(`✅ Found ${scored.length} restaurants — fetching addresses...`);
        await renderRestaurants(scored);
        setStatus(`✅ Done! Showing ${scored.length} restaurants near ${label}.`);

    } catch (err) {
        setStatus(`❌ ${err.message}`);
        console.error(err);
    }
}

// ===================== RENDERING (with reverse-geocoded addresses) =====================

async function renderRestaurants(elements) {
    resultsEl.innerHTML = "";

    for (const place of elements) {
        const name = place.tags?.name || "Unnamed restaurant";
        const cuisine = place.tags?.cuisine || "Not specified";
        const lat = place.lat || place.center?.lat;
        const lon = place.lon || place.center?.lon;

        const div = document.createElement("div");
        div.className = "restaurant";
        div.innerHTML = `
            <b>${name}</b>
            ${place._score > 0 ? `<span class="match-score">${place._score}★ match</span>` : ""}
            <br>
            Cuisine: ${cuisine}<br>
            📍 Loading address...
        `;
        resultsEl.appendChild(div);

        if (lat && lon) {
            const address = await reverseGeocode(lat, lon);
            div.innerHTML = `
                <b>${name}</b>
                ${place._score > 0 ? `<span class="match-score">${place._score}★ match</span>` : ""}
                <br>
                Cuisine: ${cuisine}<br>
                📍 ${address}
            `;
            await delay(1000);
        }
    }
}
