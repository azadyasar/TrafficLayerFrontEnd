import React, { Component } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import Collector from "./Collector";
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

    this.clickedPoints = turf.featureCollection([]);
    this.clickedPointIndex = -1;
    this.hoveredMarkerId = null;

    this.renderFunctions = [
      this.renderLocations,
      this.renderCollector,
      this.renderThirdTab
    ];
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
      style: "mapbox://styles/mapbox/streets-v10",
      center: [29.103301, 40.967905],
      width: window.innerWidth,
      height: window.innerHeight,
      zoom: 8
    });
    this.mapCanvas = this.map.getCanvasContainer();

    this.map.on("load", e => {
      this.map.addSource("places", {
        type: "geojson",
        data: defaultLocations
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

      this.map.on("mouseenter", "clicked-points", e => {
        console.debug("MouseEnter event");
        this.hoveredMarkerId = e.features[0].properties.id;
        this.map.setFeatureState(
          { source: "clicked-points", id: this.hoveredMarkerId },
          { hover: true }
        );
        // this.map.setPaintProperty("clicked-points", "circle-color", "#5e7f9b");
        this.mapCanvas.style.cursor = "move";
      });

      this.map.on("mouseleave", "clicked-points", () => {
        console.debug("Mouseleave event");
        this.map.setPaintProperty("clicked-points", "circle-color", "#295c86");
        this.mapCanvas.style.cursor = "";
      });

      this.map.on("mousedown", "clicked-points", e => {
        console.debug("MouseDown event");
        e.preventDefault();
        switch (e.originalEvent.which) {
          case 1:
            const clickedPoint = this.map.queryRenderedFeatures(e.point, {
              layers: ["clicked-points"]
            })[0];
            this.clickedPointIndex = clickedPoint.properties.id;
            this.map.on("mousemove", this.onMove);
            this.map.once("mouseup", this.onUp);
            break;
          default:
            break;
        }
      });

      defaultLocations.features.forEach((marker, index) => {
        const el = document.createElement("i");
        el.className = "fas fa-directions";
        el.setAttribute("id", index);

        el.addEventListener("click", event => {
          this.flyToStore(marker);
          this.createPopUp(marker);

          event.stopPropagation();

          const currentTab = document.getElementById("tab-btn-group");
          const currentTabLabel = currentTab.getElementsByClassName(
            "active"
          )[0];
          if (currentTabLabel.getAttribute("data-key") !== 0) {
            currentTabLabel.classList.remove("active");
            currentTab.getElementsByClassName("btn")[0].classList.add("active");
            this.setState({ currentTab: 0 });
          }

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
        new mapboxgl.Marker(el, { offset: [0, -23], draggable: true })
          .setLngLat(marker.geometry.coordinates)
          .addTo(this.map)
          .on("dragend", e => {
            const markerIndex = e.target._element.attributes.id.value;
            defaultLocations.features[markerIndex].geometry.coordinates =
              e.target._lngLat;
          });
      });
    });

    this.map.on("contextmenu", e => {
      console.debug("ContextMenu event");
      e.preventDefault();
      this.mapCanvas.style.cursor = "grab";
      this.newDropoff(this.map.unproject(e.point));
      this.updateDropoffs();
    });

    this.map.on("click", "clicked-points", e => {
      console.debug("Click event");
      const clickedPoint = this.map.queryRenderedFeatures(e.point, {
        layers: ["clicked-points"]
      })[0];
      if (!clickedPoint) return;
      const clickedPointIndex = clickedPoint.properties.id;

      this.flyToStore(this.clickedPoints.features[clickedPointIndex]);
      this.createPopUp(this.clickedPoints.features[clickedPointIndex]);
      const currentTab = document.getElementById("tab-btn-group");
      const currentTabLabel = currentTab.getElementsByClassName("active")[0];
      if (currentTabLabel.getAttribute("data-key") !== 1) {
        currentTabLabel.classList.remove("active");
        currentTab.getElementsByClassName("btn")[1].classList.add("active");
        this.setState({ currentTab: 1 });
      }

      const listings = document.getElementById("clicked-listings");
      const activeItem = listings.getElementsByClassName("active");
      if (activeItem[0]) activeItem[0].classList.remove("active");

      const listingHTMLElement = document.getElementById(
        "loc-listing-" + clickedPointIndex
      );
      if (listingHTMLElement) {
        listingHTMLElement.classList.add("active");
        listingHTMLElement.parentNode.scrollTop = listingHTMLElement.offsetTop;
      }
    });
  }

  onMove = e => {
    console.debug("MouseMove event");
    const coords = e.lngLat;
    if (this.clickedPointIndex !== -1) {
      this.clickedPoints.features[
        this.clickedPointIndex
      ].geometry.coordinates = [coords.lng, coords.lat];
      this.map.getSource("clicked-points").setData(this.clickedPoints);
      this.setState({ clickedPoints: this.clickedPoints });
    }
  };

  onUp = e => {
    console.debug("MouseUp event");
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
        "<h4><i class='fas fa-directions' />Sweetgreen</h4>" +
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
      id: this.clickedPoints.features.length
    });
    this.clickedPoints.features.push(pt);
  }

  updateDropoffs() {
    const clickedPointsSource = this.map.getSource("clicked-points");
    if (clickedPointsSource) clickedPointsSource.setData(this.clickedPoints);
    this.setState({ clickedPoints: this.clickedPoints });
  }

  componentWillUnmount() {
    this.map.remove();
  }

  onLocationClick = event => {
    const clickedLocation =
      defaultLocations.features[event.target.getAttribute("dataposition")];
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
    const renderedStores = defaultLocations.features.map((store, idx) => {
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
          <div>{prop.city}</div>
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
              {prop.id}
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

  renderThirdTab = () => {
    return <Collector />;
  };

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

var defaultLocations = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: { address: "Sultanbeyli", city: "Istanbul" },
      geometry: {
        type: "Point",
        coordinates: [29.135742187499996, 40.934783944175145]
      }
    },
    {
      type: "Feature",
      properties: { address: "Maltepe", city: "Istanbul" },
      geometry: {
        type: "Point",
        coordinates: [29.12200927734375, 41.05191296637413]
      }
    },
    {
      type: "Feature",
      properties: { address: "Umraniye", city: "Istanbul" },
      geometry: {
        type: "Point",
        coordinates: [28.8116455078125, 41.11246878918088]
      }
    },
    {
      type: "Feature",
      properties: { address: "Başakşehir", city: "Istanbul" },
      geometry: {
        type: "Point",
        coordinates: [28.45458984375, 41.062786068733026]
      }
    },
    {
      type: "Feature",
      properties: { address: "Küçükçekmece", city: "Istanbul" },
      geometry: {
        type: "Point",
        coordinates: [28.937301635742184, 41.01202954845378]
      }
    },
    {
      type: "Feature",
      properties: { address: "Fatih", city: "Istanbul" },
      geometry: {
        type: "Point",
        coordinates: [29.02862548828125, 41.09151347260093]
      }
    },
    {
      type: "Feature",
      properties: { address: "Beşiktaş", city: "Istanbul" },
      geometry: {
        type: "Point",
        coordinates: [29.000473022460934, 41.05890302421599]
      }
    }
  ]
};
