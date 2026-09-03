const state = {
  unit: "F",
  weather: null,
  place: null
};

// =========================
// WEATHER CODE HELPERS
// =========================

function weatherInfo(code) {
  const map = {
    0: ["☀️", "Clear sky"],
    1: ["🌤️", "Mainly clear"],
    2: ["⛅", "Partly cloudy"],
    3: ["☁️", "Overcast"],
    45: ["🌫️", "Fog"],
    48: ["🌫️", "Rime fog"],
    51: ["🌦️", "Light drizzle"],
    53: ["🌦️", "Drizzle"],
    55: ["🌧️", "Heavy drizzle"],
    56: ["🌧️", "Freezing drizzle"],
    57: ["🌧️", "Heavy freezing drizzle"],
    61: ["🌧️", "Light rain"],
    63: ["🌧️", "Rain"],
    65: ["🌧️", "Heavy rain"],
    66: ["🌧️", "Freezing rain"],
    67: ["🌧️", "Heavy freezing rain"],
    71: ["🌨️", "Light snow"],
    73: ["🌨️", "Snow"],
    75: ["❄️", "Heavy snow"],
    77: ["🌨️", "Snow grains"],
    80: ["🌦️", "Light showers"],
    81: ["🌧️", "Rain showers"],
    82: ["⛈️", "Heavy rain showers"],
    85: ["🌨️", "Snow showers"],
    86: ["❄️", "Heavy snow showers"],
    95: ["⛈️", "Thunderstorm"],
    96: ["⛈️", "Thunderstorm with hail"],
    99: ["⛈️", "Severe thunderstorm"]
  };

  return map[code] || ["🌡️", "Unknown"];
}

// =========================
// WEATHER BACKGROUND
// =========================

function setWeatherBackground(code) {
  const body = document.body;

  body.classList.remove(
    "weather-clear",
    "weather-partly-cloudy",
    "weather-cloudy",
    "weather-rain",
    "weather-snow",
    "weather-storm",
    "weather-fog"
  );

  if (code === 0 || code === 1) {
    body.classList.add("weather-clear");
  } else if (code === 2) {
    body.classList.add("weather-partly-cloudy");
  } else if (code === 3) {
    body.classList.add("weather-cloudy");
  } else if (code === 45 || code === 48) {
    body.classList.add("weather-fog");
  } else if (code >= 51 && code <= 67) {
    body.classList.add("weather-rain");
  } else if (code >= 71 && code <= 77) {
    body.classList.add("weather-snow");
  } else if (code >= 80 && code <= 82) {
    body.classList.add("weather-rain");
  } else if (code >= 85 && code <= 86) {
    body.classList.add("weather-snow");
  } else if (code >= 95 && code <= 99) {
    body.classList.add("weather-storm");
  } else {
    body.classList.add("weather-clear");
  }
}

// =========================
// TEMPERATURE
// =========================

function convertTemperature(celsius) {
  if (state.unit === "F") {
    return Math.round((celsius * 9) / 5 + 32);
  }

  return Math.round(celsius);
}

function temperatureUnit() {
  return state.unit === "F" ? "°F" : "°C";
}

function convertWind(kmh) {
  if (state.unit === "F") {
    return Math.round(kmh * 0.621371) + " mph";
  }

  return Math.round(kmh) + " km/h";
}

// =========================
// ALERTS
// =========================

function hideAlert() {
  const alertBox = document.getElementById("alertBox");

  if (alertBox) {
    alertBox.hidden = true;
  }
}

function getAlertIcon(event) {
  const name = (event || "").toLowerCase();

  if (name.includes("tornado")) {
    return "🌪️";
  }

  if (name.includes("thunderstorm")) {
    return "⛈️";
  }

  if (name.includes("flood")) {
    return "🌊";
  }

  if (
    name.includes("winter") ||
    name.includes("snow") ||
    name.includes("ice") ||
    name.includes("blizzard")
  ) {
    return "❄️";
  }

  if (name.includes("heat")) {
    return "🔥";
  }

  if (name.includes("wind")) {
    return "💨";
  }

  if (name.includes("fog")) {
    return "🌫️";
  }

  return "⚠️";
}

function renderAlert(feature) {
  const alertBox = document.getElementById("alertBox");
  const alertIcon = document.getElementById("alertIcon");
  const alertTitle = document.getElementById("alertTitle");
  const alertDescription =
    document.getElementById("alertDescription");
  const alertArea = document.getElementById("alertArea");
  const alertExpires = document.getElementById("alertExpires");

  if (!feature || !alertBox) {
    hideAlert();
    return;
  }

  const properties = feature.properties || {};

  alertTitle.textContent =
    properties.event || "Weather Alert";

  alertDescription.textContent =
    properties.description ||
    "A weather alert is active for this area.";

  alertArea.textContent =
    properties.areaDesc || "Your area";

  if (properties.expires) {
    alertExpires.textContent =
      new Date(properties.expires).toLocaleString();
  } else {
    alertExpires.textContent = "Unknown";
  }

  alertIcon.textContent =
    getAlertIcon(properties.event);

  alertBox.hidden = false;
}

async function loadAlerts(lat, lon) {
  try {
    const url =
      "https://skyora.yeeter.workers.dev/api/alerts" +
      "?lat=" +
      encodeURIComponent(lat) +
      "&lon=" +
      encodeURIComponent(lon);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Alert service unavailable");
    }

    const data = await response.json();

    if (
      !data.features ||
      data.features.length === 0
    ) {
      hideAlert();
      return;
    }

    renderAlert(data.features[0]);
  } catch (error) {
    console.error("Skyora alerts error:", error);
    hideAlert();
  }
}

// =========================
// CURRENT WEATHER
// =========================

function renderCurrent(weather, place) {
  const current = weather.current;

  const info = weatherInfo(current.weather_code);

  const icon = info[0];
  const condition = info[1];

  setWeatherBackground(current.weather_code);

  document.getElementById("cityName").textContent =
    place.name;

  document.getElementById("dateText").textContent =
    new Date().toLocaleDateString(undefined, {
      weekday: "long",
      month: "long",
      day: "numeric"
    });

  document.getElementById("weatherIcon").textContent =
    icon;

  document.getElementById("temperature").textContent =
    convertTemperature(current.temperature_2m);

  document.getElementById("condition").textContent =
    condition;

  document.getElementById("feelsLike").textContent =
    convertTemperature(current.apparent_temperature) +
    temperatureUnit();

  document.getElementById("humidity").textContent =
    Math.round(current.relative_humidity_2m) + "%";

  document.getElementById("wind").textContent =
    convertWind(current.wind_speed_10m);

  const rainChance =
    weather.hourly &&
    weather.hourly.precipitation_probability
      ? weather.hourly.precipitation_probability[0]
      : null;

  document.getElementById("rainChance").textContent =
    rainChance !== null &&
    rainChance !== undefined
      ? Math.round(rainChance) + "%"
      : "--%";
}

// =========================
// HOURLY FORECAST
// =========================

function renderHourly(weather) {
  const container =
    document.getElementById("hourlyList");

  container.innerHTML = "";

  const times = weather.hourly.time;
  const temperatures =
    weather.hourly.temperature_2m;
  const codes =
    weather.hourly.weather_code;

  const now = new Date();

  let shown = 0;

  for (
    let i = 0;
    i < times.length && shown < 12;
    i++
  ) {
    const time = new Date(times[i]);

    if (time < now) {
      continue;
    }

    const info = weatherInfo(codes[i]);
    const icon = info[0];

    const card =
      document.createElement("div");

    card.className = "hourly-card";

    const timeElement =
      document.createElement("div");

    timeElement.className = "hourly-time";

    timeElement.textContent =
      time.toLocaleTimeString([], {
        hour: "numeric"
      });

    const iconElement =
      document.createElement("div");

    iconElement.className = "hourly-icon";
    iconElement.textContent = icon;

    const tempElement =
      document.createElement("div");

    tempElement.className = "hourly-temp";

    tempElement.textContent =
      convertTemperature(
        temperatures[i]
      ) + temperatureUnit();

    card.appendChild(timeElement);
    card.appendChild(iconElement);
    card.appendChild(tempElement);

    container.appendChild(card);

    shown++;
  }
}

// =========================
// 7-DAY FORECAST
// =========================

function renderForecast(weather) {
  const container =
    document.getElementById("forecastList");

  container.innerHTML = "";

  const daily = weather.daily;

  for (let i = 0; i < 7; i++) {
    const date =
      new Date(daily.time[i]);

    const info =
      weatherInfo(daily.weather_code[i]);

    const icon = info[0];
    const condition = info[1];

    const high =
      convertTemperature(
        daily.temperature_2m_max[i]
      );

    const low =
      convertTemperature(
        daily.temperature_2m_min[i]
      );

    const card =
      document.createElement("div");

    card.className = "forecast-day";

    const dateElement =
      document.createElement("div");

    dateElement.className =
      "forecast-date";

    dateElement.textContent =
      i === 0
        ? "Today"
        : date.toLocaleDateString(
            undefined,
            {
              weekday: "short"
            }
          );

    const conditionElement =
      document.createElement("div");

    conditionElement.className =
      "forecast-condition";

    const iconElement =
      document.createElement("span");

    iconElement.textContent = icon;

    const conditionText =
      document.createElement("span");

    conditionText.textContent =
      condition;

    conditionElement.appendChild(
      iconElement
    );

    conditionElement.appendChild(
      conditionText
    );

    const tempsElement =
      document.createElement("div");

    tempsElement.className =
      "forecast-temps";

    tempsElement.textContent =
      high + temperatureUnit();

    const lowElement =
      document.createElement("span");

    lowElement.className =
      "forecast-low";

    lowElement.textContent =
      " / " + low + temperatureUnit();

    tempsElement.appendChild(lowElement);

    card.appendChild(dateElement);
    card.appendChild(conditionElement);
    card.appendChild(tempsElement);

    container.appendChild(card);
  }
}

// =========================
// GET WEATHER
// =========================

async function loadWeather(
  lat,
  lon,
  place
) {
  const status =
    document.getElementById("status");

  try {
    status.textContent =
      "Loading weather...";

    const params =
      new URLSearchParams({
        latitude: lat,
        longitude: lon,

        current:
          "temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m",

        hourly:
          "temperature_2m,precipitation_probability,weather_code",

        daily:
          "weather_code,temperature_2m_max,temperature_2m_min",

        temperature_unit: "celsius",
        wind_speed_unit: "kmh",
        timezone: "auto",
        forecast_days: "7"
      });

    const url =
      "https://api.open-meteo.com/v1/forecast?" +
      params.toString();

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Weather service unavailable"
      );
    }

    const weather =
      await response.json();

    state.weather = weather;
    state.place = place;

    renderCurrent(
      weather,
      place
    );

    renderHourly(
      weather
    );

    renderForecast(
      weather
    );

    await loadAlerts(
      lat,
      lon
    );

    status.textContent = "";
  } catch (error) {
    console.error(
      "Skyora weather error:",
      error
    );

    status.textContent =
      "Unable to load weather right now.";
  }
}

// =========================
// CITY SEARCH
// =========================

async function searchCity(city) {
  const status =
    document.getElementById("status");

  try {
    status.textContent =
      "Finding location...";

    const params =
      new URLSearchParams({
        name: city,
        count: "1",
        language: "en",
        format: "json"
      });

    const url =
      "https://geocoding-api.open-meteo.com/v1/search?" +
      params.toString();

    const response =
      await fetch(url);

    if (!response.ok) {
      throw new Error(
        "Location search failed"
      );
    }

    const data =
      await response.json();

    if (
      !data.results ||
      data.results.length === 0
    ) {
      status.textContent =
        "Location not found.";

      return;
    }

    const place =
      data.results[0];

    await loadWeather(
      place.latitude,
      place.longitude,
      place
    );
  } catch (error) {
    console.error(
      "Skyora search error:",
      error
    );

    status.textContent =
      "Unable to find that location.";
  }
}

// =========================
// SEARCH FORM
// =========================

document
  .getElementById("searchForm")
  .addEventListener(
    "submit",
    async function (event) {
      event.preventDefault();

      const input =
        document.getElementById(
          "cityInput"
        );

      const city =
        input.value.trim();

      if (!city) {
        return;
      }

      await searchCity(city);
    }
  );

// =========================
// UNIT TOGGLE
// =========================

document
  .getElementById("unitToggle")
  .addEventListener(
    "click",
    function () {
      state.unit =
        state.unit === "F"
          ? "C"
          : "F";

      document.getElementById(
        "unitToggle"
      ).textContent =
        state.unit === "F"
          ? "°F"
          : "°C";

      if (
        state.weather &&
        state.place
      ) {
        renderCurrent(
          state.weather,
          state.place
        );

        renderHourly(
          state.weather
        );

        renderForecast(
          state.weather
        );
      }
    }
  );

// =========================
// DISMISS ALERT
// =========================

document
  .getElementById("dismissAlert")
  .addEventListener(
    "click",
    hideAlert
  );

// =========================
// THEME TOGGLE
// =========================

const themeToggle =
  document.getElementById(
    "themeToggle"
  );

const savedTheme =
  localStorage.getItem(
    "skyora-theme"
  );

if (
  savedTheme === "dark"
) {
  document.body.classList.add(
    "dark"
  );
}

themeToggle.addEventListener(
  "click",
  function () {
    document.body.classList.add(
      "theme-changing"
    );

    setTimeout(function () {
      document.body.classList.toggle(
        "dark"
      );

      const isDark =
        document.body.classList.contains(
          "dark"
        );

      localStorage.setItem(
        "skyora-theme",
        isDark
          ? "dark"
          : "light"
      );
    }, 180);

    setTimeout(function () {
      document.body.classList.remove(
        "theme-changing"
      );
    }, 500);
  }
);

// =========================
// DEFAULT LOCATION
// =========================

searchCity("Cupertino");
