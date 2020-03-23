window.addEventListener('DOMContentLoaded',initializeApp);

const baseEndPoint = 'https://coronavirus-tracker-api.herokuapp.com/v2/locations';
const coronaData = {
latest: {},
locations: []
}

const geoJSONCoronaData = [];

mapboxgl.accessToken = 'pk.eyJ1IjoicHJhdGVlazk1MSIsImEiOiJjazg0OHNpNnYxNnNoM2htczRncmgydXlsIn0._fOmIUUD2iZtHvzv0uWGKA'

function renderMap() {
  const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-99.9, 41.5],
    zoom: 1
  });

  // Data is of the form

  // coordinates: { latitude: "15", longitude: "101" }
  // country: "Thailand"
  // country_code: "TH"
  // id: 0
  // last_updated: "2020-03-23T09:32:03.487723Z"
  // latest: { confirmed: 599, deaths: 1, recovered: 44 }


  // Add zoom and rotation controls to the map.
  map.addControl(new mapboxgl.NavigationControl());

  coronaData.locations.forEach(location => {
    geoJSONCoronaData.push({
      "type": "Feature",
      "properties": {
        "description": `
      <table>
        <thead>
          <tr>${location.country}</tr>
        </thead>
        <tbody>
          <tr>
             <td>Confirmed Cases:</td>
             <td>${location.latest.confirmed}</td>
          </tr>
          <tr>
             <td>Deaths:</td>
             <td>${location.latest.deaths}</td>
          </tr>
          <tr>
             <td>Recovered:</td>
             <td>${location.latest.recovered}</td>
          </tr>
          <tr>
             <td>Latitude:</td>
             <td>${location.coordinates.latitude}</td>
          </tr>
          <tr>
             <td>Longitude:</td>
             <td>${location.coordinates.longitude}</td>
          </tr>
        </tbody>
      </table>
      `,
        "icon": "rocket"
      },
      "geometry": {
        "type": "Point",
        "coordinates": [`${location.coordinates.longitude}`,
        `${location.coordinates.latitude}`]
      }
    });
    // const marker = new mapboxgl.Marker()
    //   .setLngLat([
    //     `${location.coordinates.longitude}`,
    //     `${location.coordinates.latitude}`
    //   ]).addTo(map);
    });
    /// Listening for the load event on the map
    map.on('load', function () {
      // Add a layer showing the places.
      map.addLayer({
        "id": "places",
        "type": "symbol",
        "source": {
          "type": "geojson",
          "data": {
            "type": "FeatureCollection",
            "features": geoJSONCoronaData
          }
        },
        "layout": {
          "icon-image": "{icon}-15",
          'icon-size': 1,
          "icon-allow-overlap": true
        }
      });

      // When a click event occurs on a feature in the places layer, open a popup at the
      // location of the feature, with description HTML from its properties.
      map.on('click', 'places', function (event) {
        const coordinates = event.features[0].geometry.coordinates.slice();
        console.log(coordinates);
        const description = event.features[0].properties.description;

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
          coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
        }

        new mapboxgl.Popup().setLngLat(coordinates)
          .setHTML(description)
          .addTo(map);
      });

      // Change the cursor to a pointer when the mouse is over the places layer.
      map.on('mouseenter', 'places', function () {
        map.getCanvas().style.cursor = 'pointer';
      });
      // Change it back to a pointer when it leaves.
      map.on('mouseleave', 'places', function () {
        map.getCanvas().style.cursor = '';
      });
    });
    // console.log(geoJSONCoronaData);
}

async function initializeApp() {
  console.log('inside the init method');
  setReferences();
  doEventBindings();
  await performAsyncCall();
  console.log(coronaData.latest, coronaData.locations);
  renderMap();
}


async function performAsyncCall() {
  if (Object.keys(coronaData.latest).length === 0
    && coronaData.locations.length === 0) {
    const response = await fetch(`${baseEndPoint}`);
    const data = await response.json();
    const { latest, locations } = data;
    coronaData.latest = { ...coronaData.latest, ...latest };
    coronaData.locations.push(...locations);
  }
}

function setReferences() {
  // Set any references here
}

function doEventBindings() {
  // Do the event bindings here
}
