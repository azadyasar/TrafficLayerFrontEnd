import React, { Component } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
const turf = require("@turf/turf");

export default class Map extends Component {
  constructor() {
    super();
    this.state = {
      viewport: {
        latitude: 40.967905,
        longitude: 29.103301,
        zoom: 8,
        bearing: 0,
        pitch: 0
      },
      popups: [],
      currentTab: 0,
      clickedPoints: turf.featureCollection([])
    };

    this.renderFunctions = [
      this.renderLocations,
      this.renderCollector,
      this.renderThirdTab
    ];

    this.clickedPoints = turf.featureCollection([]);
  }

  _onViewPortChange = viewport =>
    this.setState({
      viewport: { ...this.state.viewport, ...viewport }
    });

  componentDidMount() {
    mapboxgl.accessToken =
      "pk.eyJ1IjoiYXphZHlhc2FyIiwiYSI6ImNqc3ZlMmd0ejA1azY0OW8wbDZ2MjV3Y2kifQ.5dVMURrY0Tik0QHpwe0upw";
    this.map = new mapboxgl.Map({
      container: "map",
      // style: "mapbox://styles/mapbox/streets-v9",
      style: "mapbox://styles/mapbox/streets-v10",
      // style: "mapbox://styles/mapbox/dark-v9",
      // style: "mapbox://styles/azadyasar/cjv2fa7m80c6t1flrhkzsotrl", chicago-parks style
      center: [29.103301, 40.967905],
      width: window.innerWidth,
      height: window.innerHeight,
      zoom: 8
    });

    this.mapCanvas = this.map.getCanvasContainer();

    /* const tabBtnGrp = document.getElementById("tab-btn-group");
    const activeTabs = tabBtnGrp.getElementsByClassName("active");
    if (activeTabs.length > 0) activeTabs[0].classList.remove("active");
    const button = document.getElementById("option2").parentElement;
    button.classList.add("active"); */

    this.map.on("load", e => {
      // Add the data to your map as a layer
      /* this.map.addLayer({
        id: "locations",
        type: "symbol",
        // Add a GeoJSON source containing place coordinates and information.
        source: {
          type: "geojson",
          data: stores
        },
        layout: {
          "icon-image": "restaurant-15",
          "icon-allow-overlap": false
        }
      }); */
      this.map.addSource("places", {
        type: "geojson",
        data: stores
      });

      this.map.addSource("clicked-points", {
        type: "geojson",
        data: this.clickedPoints
      });

      this.map.addLayer({
        id: "clicked-points",
        type: "circle", //"symbol" for icons
        source: "clicked-points",
        paint: {
          "circle-radius": 10,
          "circle-color": "#295c86"
        }
        /* layout: {
          "icon-image": "car-15",
          "icon-allow-overlap": false
        } */
      });

      this.map.on("mouseenter", "clicked-points", () => {
        this.mapCanvas.style.cursor = "move";
      });

      this.map.on("mouseleave", "clicked-points", () => {
        this.mapCanvas.style.cursor = "";
      });

      this.map.on("mousedown", "clicked-points", e => {
        e.preventDefault();
        this.mapCanvas.style.cursor = "grab";
        const clickedPoint = this.map.queryRenderedFeatures(e.point, {
          layers: ["clicked-points"]
        })[0];
        this.clickedPointIndex = clickedPoint.properties.pos;
        const pointRef = this.clickedPoints.features[
          clickedPoint.properties.pos
        ];
        this.map.on("mousemove", this.onMove);
        this.map.once("mouseup", this.onUp);
      });

      stores.features.forEach((marker, index) => {
        const el = document.createElement("div");
        el.className = "marker-rest";
        el.addEventListener("click", event => {
          this.flyToStore(marker);
          this.createPopUp(marker);

          event.stopPropagation();
          const listings = document.getElementById("listings");
          const activeItem = listings.getElementsByClassName("active");
          if (activeItem[0]) activeItem[0].classList.remove("active");

          const listingHTMLElement = document.getElementById(
            "listing-" + index
          );
          if (listingHTMLElement) {
            listingHTMLElement.classList.add("active");
            listingHTMLElement.parentNode.scrollTop =
              listingHTMLElement.offsetTop;
          }
        });
        new mapboxgl.Marker(el, { offset: [0, -23] })
          .setLngLat(marker.geometry.coordinates)
          .addTo(this.map);
      });
    });

    /**
     * Used when the markers are rendered on the map as a layer rather than pure HTML elements
     */
    /* this.map.on("click", e => {
      console.log(
        `Map click event: point: ${e.point} target: ${e.target} type: ${
          e.type
        } `
      );

      // Query all the rendered points in the view
      const features = this.map.queryRenderedFeatures(e.point, {
        layers: ["locations"]
      });
      if (features.length) {
        const clickedPoint = features[0];
        // 1. Fly to the point
        this.flyToStore(clickedPoint);
        // 2. Close all other popups and display popup for clicked store
        this.createPopUp(clickedPoint);
        // 3. Highlight listing in sidebar (and remove highlight for all other listings)
        const listings = document.getElementById("listings");
        const activeItem = listings.getElementsByClassName("active");
        if (activeItem[0]) activeItem[0].classList.remove("active");
        // Find the index of the store.features that corresponds to the clickedPoint that fired the event listener
        const selectedFeature = clickedPoint.properties.address;
        let selectedFeatureIndex = -1;
        let i = 0;
        while (i < stores.features.length && selectedFeatureIndex < 0)
          if (stores.features[i++].properties.address === selectedFeature)
            selectedFeatureIndex = i - 1;
        const listingHTMLElement = document.getElementById(
          "listing-" + selectedFeatureIndex
        );
        if (listingHTMLElement) {
          listingHTMLElement.classList.add("active");
          listingHTMLElement.parentNode.scrollTop =
            listingHTMLElement.offsetTop;
        }
      }
    }); */

    this.map.on("click", e => {
      this.newDropoff(this.map.unproject(e.point));
      this.updateDropoffs(this.clickedPoints);
    });
  }

  onMove = e => {
    const coords = e.lngLat;

    this.mapCanvas.style.cursor = "grabbing";
    if (this.clickedPointIndex !== -1) {
      this.clickedPoints.features[
        this.clickedPointIndex
      ].geometry.coordinates = [coords.lng, coords.lat];
      this.map.getSource("clicked-points").setData(this.clickedPoints);
      this.setState({ clickedPoints: this.clickedPoints });
    }
  };

  onUp = e => {
    this.mapCanvas.style.cursor = "";
    this.clickedPointIndex = -1;
    this.map.off("mousemove", this.onMove);
  };

  flyToStore(currentFeature) {
    this.map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 13
    });
  }

  createPopUp(currentFeature) {
    // Remove already created pop-up
    if (this.state.popups[0]) {
      this.state.popups[0].remove();
    }

    // Custom close button: "<button type='button' class='btn btn-default btn-sm mapboxgl-popup-close-button' aria-label='Close popup'>" +"<span class='glyphicon glyphicon-remove'></span> Remove </button>" +
    const popup = new mapboxgl.Popup({ closeOnClick: true })
      .setLngLat(currentFeature.geometry.coordinates)
      .setHTML(
        "<h4>Sweetgreen</h4>" +
          "<p>" +
          currentFeature.properties.address +
          "</p>"
      )
      .addTo(this.map);
    this.setState({ popups: [popup] });
  }

  newDropoff(coords) {
    // Store the clicked point as a new GeoJSON feature with
    // two properties: `orderTime` and `key`
    const pt = turf.point([coords.lng, coords.lat], {
      orderTime: Date.now(),
      key: Math.random(),
      pos: this.clickedPoints.features.length
    });
    this.clickedPoints.features.push(pt);
  }

  updateDropoffs(geojson) {
    const clickedPointsSource = this.map.getSource("clicked-points");
    if (clickedPointsSource) clickedPointsSource.setData(geojson);
    this.setState({ clickedPoints: this.clickedPoints });
  }

  componentWillUnmount() {
    this.map.remove();
  }

  onLocationClick = event => {
    const clickedLocation =
      stores.features[event.target.getAttribute("dataposition")];
    // 1. Fly to the point associated with the clicked link.
    this.flyToStore(clickedLocation);
    // 2. Close all other popups and display popup for clicked store.
    this.createPopUp(clickedLocation);
    // 3. Highlight listing in sidebar (and remove highlight for all other listings)

    const listings = document.getElementById("listings");
    if (listings) {
      const activeItem = listings.getElementsByClassName("active");
      if (activeItem[0]) activeItem[0].classList.remove("active");
      if (activeItem[0]) {
        console.log(`Current activeItem: ${activeItem[0]}`);
        activeItem[0].classList.remove("active");
      }
      event.target.parentNode.classList.add("active");
    }
  };

  onInsertedLocClick = event => {
    const clickedLocation = this.state.clickedPoints.features[
      event.target.getAttribute("dataposition")
    ];
    // 1. Fly to the point associated with the clicked link.
    this.flyToStore(clickedLocation);
    // 2. Close all other popups and display popup for clicked store.
    this.createPopUp(clickedLocation);
    // 3. Highlight listing in sidebar (and remove highlight for all other listings)

    const listings = document.getElementById("clicked-listings");
    if (listings) {
      const activeItem = listings.getElementsByClassName("active");
      if (activeItem[0]) activeItem[0].classList.remove("active");
      if (activeItem[0]) {
        console.log(`Current activeItem: ${activeItem[0]}`);
        activeItem[0].classList.remove("active");
      }
      event.target.parentNode.classList.add("active");
    }
  };

  onTabButtonClick = event => {
    console.debug("onTabButtonClick");
    this.setState({ currentTab: event.target.getAttribute("data-key") });
  };

  buildLocationList() {
    const renderedStores = stores.features.map((store, idx) => {
      const prop = store.properties;
      return (
        <div className="item" key={`listing-${idx}`} id={`listing-${idx}`}>
          <a
            href="#"
            className="title"
            dataposition={idx}
            onClick={this.onLocationClick}
          >
            {prop.address}
          </a>
          <div>
            {prop.city}
            {prop.phone && ` - ${prop.phoneFormatted}`}
          </div>
        </div>
      );
    });
    return renderedStores;
  }

  buildClickedLocationList() {
    const renderedLocationList = this.clickedPoints.features.map(
      (point, index) => {
        const prop = point.properties;
        return (
          <div
            className="item"
            key={`loc-listing-${index}`}
            id={`loc-listing-${index}`}
          >
            <a
              href="#"
              className="title"
              dataposition={index}
              onClick={this.onInsertedLocClick}
            >
              {prop.pos}
            </a>
            <div>
              {point.geometry.coordinates[0].toFixed(4)} -{" "}
              {point.geometry.coordinates[1].toFixed(4)}
            </div>
          </div>
        );
      }
    );
    return renderedLocationList;
  }

  renderLocations = () => {
    return (
      <React.Fragment>
        <div className="row heading">
          <div className="col-4 no-pm">
            <Link to="/">
              <img src={require("../../img/avl.png")} alt="" />
            </Link>
          </div>
          <div className="col-8 text-center no-pm align-self-center">
            <h3 className="align-text-bottom">Locations</h3>
          </div>
        </div>
        <div className="col-12 no-pm">
          <div id="listings" className="listings">
            {this.buildLocationList()}
          </div>
        </div>
      </React.Fragment>
    );
  };

  renderCollector = () => {
    return (
      <React.Fragment>
        <div className="row heading">
          <div className="col-4 no-pm">
            <Link to="/">
              <img src={require("../../img/avl.png")} alt="" />
            </Link>
          </div>
          <div className="col-8 text-center no-pm align-self-center">
            <h3 className="align-text-bottom">Locations</h3>
          </div>
        </div>
        <div className="col-12 no-pm">
          <div id="clicked-listings" className="listings">
            {this.buildClickedLocationList()}
          </div>
        </div>
      </React.Fragment>
    );
  };

  renderThirdTab = () => {};

  render() {
    return (
      <div className="container-fluid no-pm">
        <div className="map-tool-container">
          <Link to="/">
            <img src={require("../../img/avl.png")} alt="" />
          </Link>
        </div>
        <div className="row no-pm">
          {/* SIDEBAR TABS */}
          <div className="col-3 no-pm sidebar">
            <div className="row justify-content-center no-pm">
              <div
                id="tab-btn-group"
                className="btn-group btn-group-toggle p-2"
                data-toggle="buttons"
                // onClick={this.onTabButtonClick}
              >
                <label
                  className="btn btn-outline-primary active"
                  data-key="0"
                  onClick={this.onTabButtonClick}
                >
                  <input
                    type="radio"
                    name="options"
                    id="option1"
                    autoComplete="off"
                  />{" "}
                  History
                </label>
                <label
                  className="btn btn-outline-primary"
                  onClick={this.onTabButtonClick}
                  data-key="1"
                >
                  <input
                    type="radio"
                    name="options"
                    id="option2"
                    autoComplete="off"
                  />{" "}
                  Collector
                </label>
                <label
                  className="btn btn-outline-primary"
                  onClick={this.onTabButtonClick}
                  data-key="2"
                >
                  <input
                    type="radio"
                    name="options"
                    id="option3"
                    autoComplete="off"
                  />{" "}
                  Radio
                </label>
              </div>
            </div>

            {/* SIDEBAR - I */}
            {this.renderFunctions[this.state.currentTab]()}
          </div>

          {/* MAP */}
          <div className="col-9 no-pm">
            <div
              id="map"
              ref={el => (this.mapContainer = el)}
              className="map"
            />
          </div>
        </div>
      </div>
    );
  }
}

var stores = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.034084142948, 38.909671288923]
      },
      properties: {
        phoneFormatted: "(202) 234-7336",
        phone: "2022347336",
        address: "1471 P St NW",
        city: "Washington DC",
        country: "United States",
        crossStreet: "at 15th St NW",
        postalCode: "20005",
        state: "D.C."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.049766, 38.900772]
      },
      properties: {
        phoneFormatted: "(202) 507-8357",
        phone: "2025078357",
        address: "2221 I St NW",
        city: "Washington DC",
        country: "United States",
        crossStreet: "at 22nd St NW",
        postalCode: "20037",
        state: "D.C."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.043929, 38.910525]
      },
      properties: {
        phoneFormatted: "(202) 387-9338",
        phone: "2023879338",
        address: "1512 Connecticut Ave NW",
        city: "Washington DC",
        country: "United States",
        crossStreet: "at Dupont Circle",
        postalCode: "20036",
        state: "D.C."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.0672, 38.90516896]
      },
      properties: {
        phoneFormatted: "(202) 337-9338",
        phone: "2023379338",
        address: "3333 M St NW",
        city: "Washington DC",
        country: "United States",
        crossStreet: "at 34th St NW",
        postalCode: "20007",
        state: "D.C."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.002583742142, 38.887041080933]
      },
      properties: {
        phoneFormatted: "(202) 547-9338",
        phone: "2025479338",
        address: "221 Pennsylvania Ave SE",
        city: "Washington DC",
        country: "United States",
        crossStreet: "btwn 2nd & 3rd Sts. SE",
        postalCode: "20003",
        state: "D.C."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-76.933492720127, 38.99225245786]
      },
      properties: {
        address: "8204 Baltimore Ave",
        city: "College Park",
        country: "United States",
        postalCode: "20740",
        state: "MD"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.097083330154, 38.980979]
      },
      properties: {
        phoneFormatted: "(301) 654-7336",
        phone: "3016547336",
        address: "4831 Bethesda Ave",
        cc: "US",
        city: "Bethesda",
        country: "United States",
        postalCode: "20814",
        state: "MD"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.359425054188, 38.958058116661]
      },
      properties: {
        phoneFormatted: "(571) 203-0082",
        phone: "5712030082",
        address: "11935 Democracy Dr",
        city: "Reston",
        country: "United States",
        crossStreet: "btw Explorer & Library",
        postalCode: "20190",
        state: "VA"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.10853099823, 38.880100922392]
      },
      properties: {
        phoneFormatted: "(703) 522-2016",
        phone: "7035222016",
        address: "4075 Wilson Blvd",
        city: "Arlington",
        country: "United States",
        crossStreet: "at N Randolph St.",
        postalCode: "22203",
        state: "VA"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-75.28784, 40.008008]
      },
      properties: {
        phoneFormatted: "(610) 642-9400",
        phone: "6106429400",
        address: "68 Coulter Ave",
        city: "Ardmore",
        country: "United States",
        postalCode: "19003",
        state: "PA"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-75.20121216774, 39.954030175164]
      },
      properties: {
        phoneFormatted: "(215) 386-1365",
        phone: "2153861365",
        address: "3925 Walnut St",
        city: "Philadelphia",
        country: "United States",
        postalCode: "19104",
        state: "PA"
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.043959498405, 38.903883387232]
      },
      properties: {
        phoneFormatted: "(202) 331-3355",
        phone: "2023313355",
        address: "1901 L St. NW",
        city: "Washington DC",
        country: "United States",
        crossStreet: "at 19th St",
        postalCode: "20036",
        state: "D.C."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.043959498405, 38.903883387232]
      },
      properties: {
        phoneFormatted: "(202) 331-3355",
        phone: "2023313355",
        address: "1901 L St. NW",
        city: "Washington DC",
        country: "United States",
        crossStreet: "at 19th St",
        postalCode: "20036",
        state: "D.C."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.043959498405, 38.903883387232]
      },
      properties: {
        phoneFormatted: "(202) 331-3355",
        phone: "2023313355",
        address: "1901 L St. NW",
        city: "Washington DC",
        country: "United States",
        crossStreet: "at 19th St",
        postalCode: "20036",
        state: "D.C."
      }
    },
    {
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [-77.043959498405, 38.903883387232]
      },
      properties: {
        phoneFormatted: "(202) 331-3355",
        phone: "2023313355",
        address: "1901 L St. NW",
        city: "Washington DC",
        country: "United States",
        crossStreet: "at 19th St",
        postalCode: "20036",
        state: "D.C."
      }
    }
  ]
};
