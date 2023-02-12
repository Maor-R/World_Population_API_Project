const BACKGROUND_COLOR_POPULATION = "silver";
const BACKGROUND_COLOR_NEIGHBORS = "white";
const DEFAULT_BORDER_COLOR_NEIGHBORS = "white";
const BORDER_COLOR_NEIGHBORS = "red";
const BUTTON_TYPE_COUNTRY = "submit";
const MSG_NO_DATA = "No data found for ";
const buttonsCountries = document.getElementById("buttonsCountries");
const spinner = document.getElementById("spinner");
const container = document.getElementById("container");
const chartContainer = document.querySelector(".chart-container");
const msgNoData = document.getElementById("msgNoData");
const btnNoData = document.getElementById("btnNoData");


const ARR_MAINLAND = ["africa", "americas", "asia", "europe", "oceania"];
const TEXT_NEIGHBORS = "neighbors";
const config = {
  type: "line",
  data: {
    labels: "",
    datasets: [
      {
        label: "population",
        data: "",
        fill: false,
        backgroundColor: BACKGROUND_COLOR_POPULATION,
        borderColor: "blue",
        tension: 0.1,
        borderWidth: 3,
      },
      {
        label: "",
        data: "",
        fill: false,
        backgroundColor: BACKGROUND_COLOR_NEIGHBORS,
        borderColor: "red",
        tension: 0.1,
        borderWidth: 3,
      },
    ],
  },
  options: {
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  },
};

let chart = new Chart(document.getElementById("chart"), config);

document.body.addEventListener("click", eventClick);

function eventClick(event) {
  const isMainland = ARR_MAINLAND.some(
    (mainland) => mainland === event.target.id
  );

  if (isMainland) {
    removeContainer();
    addSpinner();
    getCountriesData(event.target.id);
  }
  else if (
    buttonsCountries.contains(event.target) &&
    event.target.type === BUTTON_TYPE_COUNTRY
  ) {
    removeContainer();
    addSpinner();
    getCitiesData(event.target.innerText);
  }

  else if(event.target.id === "btnNoData"){
    removeNoDataMsg();
    showContainer();

  }
}
function updateChart(data, borders = undefined) {
  config.data.labels = Object.keys(data);
  config.data.datasets[0].data = Object.values(data);
  if (borders !== undefined) {
    config.data.datasets[1].data = Object.values(borders);
    config.data.datasets[1].label = TEXT_NEIGHBORS;
    config.data.datasets[1].borderColor = BORDER_COLOR_NEIGHBORS;
  } else {
    config.data.datasets[1].data = "";
    config.data.datasets[1].label = "";
    config.data.datasets[1].borderColor = DEFAULT_BORDER_COLOR_NEIGHBORS;
  }
  chart.update();
}

function addButtonsCountries(countries) {
  let newButton;

  buttonsCountries.innerHTML = "";
  for (country of Object.keys(countries)) {
    newButton = document.createElement("button");
    newButton.innerText = country;
    newButton.classList = "btn-country";
    buttonsCountries.appendChild(newButton);
  }
}

function sortCountries(countries) {
  countries = Object.keys(countries)
    .sort()
    .reduce((obj, key) => {
      obj[key] = countries[key];
      return obj;
    }, {});
  return countries;
}

function removeContainer() {
  container.style.display = "none";
}

function showContainer() {
  container.style.display = "block";
  chartContainer.style.display = "block";
}

function removeSpinner() {
  spinner.style.display = "none";
}
function addSpinner() {
  spinner.style.display = "block";
}

function showNoDataMsg(country) { 
  msgNoData.style.display = "block";
  msgNoData.innerText = MSG_NO_DATA + country;
  setTimeout(() => {
    showContainer();
    removeNoDataMsg();
  }, 3000);


}

function removeNoDataMsg() {
  msgNoData.style.display = "none";
}

function removeButtonsCountriesContainer() {
  buttonsCountries.style.display = "none";
}

function showButtonsCountriesContainer() {
  buttonsCountries.style.display = "block";
}

async function getCountriesData(mainland) {
  let countries = {};
  let borders = {};
  let countriesMoreInfo = {};

  try {
    const retFetch = await fetch(
      `https://restcountries.com/v3.1/region/${mainland}/`
    );

    const data = await retFetch.json();
    data.forEach((country) => {
      countries[country.name.common] = country.population;
      borders[country.name.common] =
        country.borders !== undefined ? country.borders.length : 0;
      countriesMoreInfo[country.name.common] = [
        country.cca3,
        country.currencies,
        country.flags.png,
        country.maps.googleMaps,
      ];
    });
    console.log(borders);
    countries = sortCountries(countries);

    updateChart(countries, borders);
    // updateChart(borders);

    addButtonsCountries(countries);
  } catch (e) {
    console.log("Error", e);
  } finally {
    removeSpinner();
    showContainer();
    showButtonsCountriesContainer();
  }
}

async function getCitiesData(country) {
  let cities = {};
  let citiesMoreInfo = {};
  try {
    const retFetch = await fetch(
      `
  https://countriesnow.space/api/v0.1/countries/population/cities/filter`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          order: "asc",
          orderBy: "name",
          // "country": country
        }),
      }
    );

    let data = await retFetch.json();

    for (city of data.data) {
      if (city.country.includes(country)) {
        cities[city.city] =
          city.populationCounts[0] !== undefined
            ? city.populationCounts[0].value
            : 0;
      }
    }

    Object.getOwnPropertyNames(cities).length !== 0? updateChart(cities) : showNoDataMsg(country);
  } catch (e) {
    console.log("Error", e);
  } finally { 
    if (msgNoData.style.display === "") {
      showContainer();
      removeButtonsCountriesContainer();
    }
  }
  removeSpinner();
}
