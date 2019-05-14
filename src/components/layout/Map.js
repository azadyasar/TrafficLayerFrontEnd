import React, { Component } from "react";
import { Link } from "react-router-dom";
import mapboxgl from "mapbox-gl";
import Collector from "./Collector";
import axios from "axios";
import { toast } from "react-toastify";
const turf = require("@turf/turf");

const istCoord = {
  latitude: 40.967905,
  longitude: 29.103301
};

export default class Map extends Component {
  constructor() {
    super();
    this.state = {
      viewport: {
        latitude: istCoord.latitude,
        longitude: istCoord.longitude,
        zoom: 8,
        bearing: 0,
        pitch: 0
      },
      popups: [],
      currentTab: 0,
      savedLocations: turf.featureCollection([]),
      sourceCoord: null,
      destCoord: null,
      routeLine: null,
      checkpoints: []
    };

    this.clickedPoints = turf.featureCollection([]);
    this.clickedPointIndex = -1;

    // Used to keep track of pressed radio button group within collector e.g., source/dest/checkpoint/save
    this.currentBtnGroupIndex = "0";
    this.sourceMarker = null;
    this.destMarker = null;
    this.checkPointMarkers = [];
    this.routeCoordsGEO = null;

    this.renderFunctions = [
      this.renderLocations,
      this.renderCollector,
      this.renderThirdTab
    ];

    this.mapStyles = [
      "streets-v10",
      "light-v10",
      "dark-v10",
      "outdoors-v11",
      "satellite-v9"
    ];

    axios.defaults.baseURL = "http://avl-trafficflow-v1.herokuapp.com:80";
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
      center: [istCoord.longitude, istCoord.latitude],
      width: window.innerWidth,
      height: window.innerHeight,
      zoom: 8
    });
    this.mapCanvas = this.map.getCanvasContainer();

    this.map.on("style.load", e => {
      console.debug("Style.load event");
      this.map.addSource("clicked-points", {
        type: "geojson",
        data: this.state.savedLocations
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

      this.map.addSource("route-source", {
        type: "geojson",
        data: this.routeCoordsGEO
      });

      this.map.addLayer({
        id: "route",
        type: "line",
        source: "route-source",
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#179dbe",
          "line-width": 4
        }
      });
    });

    this.map.on("load", e => {
      this.map.addSource("places", {
        type: "geojson",
        data: defaultLocations
      });

      /* this.map.addSource("clicked-points", {
        type: "geojson",
        data: this.state.savedLocations
      });

      this.map.addLayer({
        id: "clicked-points",
        type: "circle", //"symbol" for icons
        source: "clicked-points",
        paint: {
          "circle-radius": 7,
          "circle-color": "#295c86"
        }
         layout: {
          "icon-image": "car-15",
          "icon-allow-overlap": false
        } 
      }); */

      this.map.on("mouseenter", "clicked-points", e => {
        console.debug("MouseEnter event");
        this.mapCanvas.style.cursor = "move";
      });
      /* 
      this.map.on("mouseleave", "clicked-points", () => {
        console.debug("Mouseleave event");
        this.map.setPaintProperty("clicked-points", "circle-color", "#295c86");
        this.mapCanvas.style.cursor = "";
      }); */

      this.map.on("mousedown", "clicked-points", e => {
        console.debug("MouseDown event");
        // this.mapCanvas.style.cursor = "drag";
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

      /* defaultLocations.features.forEach((marker, index) => {
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
      }); */
    });

    this.map.on("contextmenu", e => {
      console.debug("ContextMenu event");
      e.preventDefault();
      this.mapCanvas.style.cursor = "grab";
      this.newDropoff(this.map.unproject(e.point));
      this.updateDropoffs();
    });

    this.map.on("click", e => {
      /** Tabs:
       * 0- History
       * 1- Collector
       * 2- Radio
       */
      console.log(
        "=>General Click Event Tab[" +
          `${this.state.currentTab}], Btn[${this.currentBtnGroupIndex}]`
      );
      switch (this.state.currentTab) {
        case "2":
          /**Indexes
           * 0- Source Location
           * 1- Destination Location
           * 2- Checkpoint Location
           * 3- Save Location
           */
          switch (this.currentBtnGroupIndex) {
            // SOURCE LOCATION
            case "0":
              console.debug("General Click Event Tab[2] Btn[0]");
              const sourceMarkerEl = document.createElement("i");
              sourceMarkerEl.className = "fas fa-map-marker-alt fa-lg";
              if (this.sourceMarker) this.sourceMarker.remove();
              this.sourceMarker = new mapboxgl.Marker(sourceMarkerEl, {
                draggable: true
              })
                .setLngLat(e.lngLat)
                .addTo(this.map);
              // Q Use dragend?
              this.sourceMarker.on("drag", () => {
                console.debug(
                  "Dragging Source Marker",
                  this.sourceMarker.getLngLat()
                );
                this.setState({
                  sourceCoord: this.sourceMarker.getLngLat()
                });
              });
              this.setState({ sourceCoord: e.lngLat });
              break;

            // DESTINATION LOCATION
            case "1":
              console.debug("General Click Event Tab[2] Btn[1]");
              const destMarkerEl = document.createElement("i");
              destMarkerEl.className = "fas fa-directions fa-lg";
              if (this.destMarker) this.destMarker.remove();
              this.destMarker = new mapboxgl.Marker(destMarkerEl, {
                draggable: true
              })
                .setLngLat(e.lngLat)
                .addTo(this.map);
              // Q Use dragend?
              this.destMarker.on("drag", () => {
                console.debug(
                  "Dragend Source Marker",
                  this.destMarker.getLngLat()
                );
                this.setState({
                  destCoord: this.destMarker.getLngLat()
                });
              });
              this.setState({ destCoord: e.lngLat });
              break;

            // CHECKPOINTS
            case "2":
              console.debug("General Click Event Tab[2] Btn[2]");
              const checkpointMarkerEl = document.createElement("i");
              checkpointMarkerEl.className = "fas fa-road fa-lg";
              checkpointMarkerEl.setAttribute(
                "data-key",
                this.checkPointMarkers.length
              );
              const checkpointMarker = new mapboxgl.Marker(checkpointMarkerEl, {
                draggable: true
              })
                .setLngLat(e.lngLat)
                .addTo(this.map);

              checkpointMarker.on("drag", e => {
                console.log(e);
              });
              this.checkPointMarkers.push(checkpointMarker);
              break;
            default:
              break;
          }
          break;

        default:
          break;
      }
    });

    this.map.on("click", "clicked-points", e => {
      console.debug("Click event of clicked-points");
      const clickedPoint = this.map.queryRenderedFeatures(e.point, {
        layers: ["clicked-points"]
      })[0];
      if (!clickedPoint) return;
      const clickedPointIndex = clickedPoint.properties.id;

      this.flyToStore(this.state.savedLocations.features[clickedPointIndex]);
      this.createPopUp(
        this.state.savedLocations.features[clickedPointIndex],
        clickedPointIndex
      );
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
    // this.mapCanvas.style.cursor = "grabbing";
    const coords = e.lngLat;
    const savedLocationsClone = this.state.savedLocations;
    if (this.clickedPointIndex !== -1) {
      savedLocationsClone.features[
        this.clickedPointIndex
      ].geometry.coordinates = [coords.lng, coords.lat];
      this.map.getSource("clicked-points").setData(this.state.savedLocations);
      this.setState({ savedLocations: savedLocationsClone });
    }
  };

  onUp = e => {
    console.debug("MouseUp event");
    // this.mapCanvas.style.cursor = "";
    this.clickedPointIndex = -1;
    this.map.off("mousemove", this.onMove);
  };

  flyToStore(currentFeature) {
    this.map.flyTo({
      center: currentFeature.geometry.coordinates,
      zoom: 13
    });
  }

  createPopUp(currentFeature, index = 0) {
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
          `${index}. Item` +
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
      id: this.state.savedLocations.features.length
    });
    let newSavedLocations = Object.assign({}, this.state.savedLocations);
    newSavedLocations.features.push(pt);
    this.setState({
      savedLocations: newSavedLocations
    });
  }

  updateDropoffs() {
    const clickedPointsSource = this.map.getSource("clicked-points");
    if (clickedPointsSource)
      clickedPointsSource.setData(this.state.savedLocations);
  }

  componentWillUnmount() {
    this.map.remove();
  }

  onLocationClick = event => {
    // DISABLED FOR NOW
    return;
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
    const clickedLocation = this.state.savedLocations.features[
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
    const currentTab = event.target.getAttribute("data-key");
    console.debug("onTabButtonClick Tab: " + currentTab, event);
    this.setState({ currentTab });
  };

  onBtnGroupClick = index => {
    this.currentBtnGroupIndex = index;
  };

  onStyleChange = event => {
    console.debug("onStyleChange");
    event.preventDefault();
    this.map.setStyle(
      "mapbox://styles/mapbox/" +
        this.mapStyles[event.target.getAttribute("data-key")]
    );
    const currentActiveEl = document
      .getElementById("style-dropdown-menu")
      .getElementsByClassName("active")[0];
    currentActiveEl.classList.remove("active");
    event.target.classList.add("active");
  };

  onLatLngInputChange = event => {};

  onCoordInputChange = (info, isInputCoordInvalid) => {
    console.debug("onCoordInputChange (Map)");
    this.setState({ [info.coordName]: info.coord });
    if (isInputCoordInvalid) return;
    console.debug("Setting markers position to: ", info.coord);
    if (info.coordName.startsWith("source"))
      this.sourceMarker.setLngLat(this.state.sourceCoord);
    else if (info.coordName.startsWith("dest"))
      this.destMarker.setLngLat(this.state.destCoord);
  };

  onCollectorStartBtn = event => {
    const sourceCoord = this.state.sourceCoord;
    const destCoord = this.state.destCoord;
    axios
      .get("/api/v1/avl/route", {
        params: {
          source: sourceCoord.lat + "," + sourceCoord.lng,
          dest: destCoord.lat + "," + destCoord.lng
        }
      })
      .then(response => {
        console.debug("Axios got response for /route request");
        console.debug(response);
        const routeCoords = [];
        response.data.points.forEach(point => {
          routeCoords.push([point.long, point.lat]);
        });
        this.routeCoordsGEO = turf.lineString(routeCoords);
        this.map.getSource("route-source").setData(this.routeCoordsGEO);
      })
      .catch(error => {
        console.debug("Error occured during axios get request", error);
        toast.error("An error occured during route calculation");
      });
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
    const renderedLocationList = this.state.savedLocations.features.map(
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
    return (
      <Collector
        onBtnGroupClick={this.onBtnGroupClick}
        sourceCoord={this.state.sourceCoord}
        destCoord={this.state.destCoord}
        onStyleChange={this.onStyleChange}
        onCoordInputChange={this.onCoordInputChange}
        onCollectorStartBtn={this.onCollectorStartBtn}
      />
    );
  };

  render() {
    console.debug("Map rendering again.");
    return (
      <div className="container-fluid no-pm">
        <div className="map-tool-container">
          <Link to="/">
            <img src={require("../../img/avl.png")} alt="" />
          </Link>
        </div>
        <div id="toast">
          <div id="img">
            <i className="fas fa-tachometer-alt fa-lg" />
          </div>
          <div id="desc">Started collecting traffic data</div>
        </div>
        <div className="row no-pm">
          {/* SIDEBAR TABS */}
          <div className="col-3 no-pm sidebar">
            <div className="row justify-content-center no-pm w-100">
              <div
                id="tab-btn-group"
                className="btn-group btn-group-toggle mb-4 w-100"
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

const customLine = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      properties: {},
      geometry: {
        type: "LineString",
        coordinates: [
          [29.281311035156254, 40.9614931559928],
          [29.2401123046875, 40.97601013534183],
          [29.211959838867188, 40.98119399678795],
          [29.182090759277344, 40.99104221112936],
          [29.154281616210938, 40.99415186798861],
          [29.117546081542972, 40.99674313666156],
          [29.09694671630859, 40.98119399678795],
          [29.103469848632812, 40.965122700251705],
          [29.12578582763672, 40.947491615510124],
          [29.15119171142578, 40.92648373707824],
          [29.188613891601562, 40.91377202429224],
          [29.210243225097653, 40.90598813645525],
          [29.213333129882812, 40.91792305645495],
          [29.224319458007812, 40.920517319192335],
          [29.228782653808594, 40.89560819396543]
        ]
      }
    }
  ]
};
