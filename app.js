window.addEventListener('DOMContentLoaded',initializeApp);

const baseEndPoint = 'https://coronavirus-tracker-api.herokuapp.com/v2/locations';
const coronaData = {
latest: {},
locations: []
}

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

  map.on('load', function () {
    map.addSource('places', {
      "type": "geojson",
      "data": {
        "type": "FeatureCollection",
        "crs": {
          "type": "name",
          "properties": {
            "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
          }
        },
        "features": coronaData.locations.map(location => {
          return {
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
              "coordinates": [
                `${location.coordinates.longitude}`,
                `${location.coordinates.latitude}`
              ]
            }
          }
        })
      },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 50
    });
    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'places',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color': [
          'step',
          ['get', 'point_count'],
          '#51bbd6',
          100,
          '#f1f075',
          750,
          '#f28cb1'
        ],
        'circle-radius': [
          'step',
          ['get', 'point_count'],
          20,
          100,
          30,
          750,
          40
        ]
      }
    });

    map.addLayer({
      id: 'cluster-count',
      type: 'symbol',
      source: 'places',
      filter: ['has', 'point_count'],
      layout: {
        'text-field': '{point_count_abbreviated}',
        'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
        'text-size': 12
      }
    });
    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'places',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color': '#11b4da',
        'circle-radius': 4,
        'circle-stroke-width': 1,
        'circle-stroke-color': '#fff'
      }
    });
    // inspect a cluster on the click
    map.on('click', 'clusters', function (event) {
      const features = map.queryRenderedFeatures(event.point, {
        layers: ['clusters']
      });
      const clusterId = features[0].properties.cluster_id;
      map.getSource('places').getClusterExpansionZoom(
        clusterId,
        function (error, zoom) {
          if (error) return;
          map.easeTo({
            center: features[0].geometry.coordinates,
            zoom: zoom
          });
        }
      );
    });
    map.on('click', 'unclustered-point', function (event) {
      const coordinates = event.features[0].geometry.coordinates.slice();
      // console.log(coordinates);
      const { description, icon } = event.features[0].properties;
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
    //   // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'clusters', function () {
      map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'clusters', function () {
      map.getCanvas().style.cursor = '';
    });
    })
    // console.log(geoJSONCoronaData);
}

async function initializeApp() {
  console.log('inside the init method');
  setReferences();
  doEventBindings();
  await performAsyncCall();
  // console.log(coronaData.latest, coronaData.locations);
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
