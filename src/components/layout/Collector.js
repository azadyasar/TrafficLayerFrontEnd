import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

export default class Collector extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.currentBtnGroupIndex = 0;
    this.isSourceLatInvalid = null;
    this.isSourceLngInvalid = null;
    this.isDestLatInvalid = null;
    this.isDestLngInvalid = null;

    this.sourceDestValidMap = {
      "source-latitude": "isSourceLatInvalid",
      "source-longitude": "isSourceLngInvalid",
      "dest-latitude": "isDestLatInvalid",
      "dest-longitude": "isDestLngInvalid"
    };
  }

  componentDidMount() {
    console.debug("Collector Component Mount");
  }

  componentWillUnmount() {
    // Reset button group index to 0
    console.debug("Collector will unmount");
    this.props.onBtnGroupClick("0");
  }

  componentWillReceiveProps(newProps) {
    this.setState({
      sourceCoord: newProps.sourceCoord,
      destCoord: newProps.destCoord
    });
  }

  onBtnGroupClick = e => {
    let currentBtnGroupIndex = e.target.getAttribute("data-key");
    if (currentBtnGroupIndex === null) {
      const btnGroup = document.getElementById("func-btn-group");
      const activeEl = btnGroup.getElementsByClassName("active")[0];
      if (activeEl) {
        currentBtnGroupIndex = activeEl.getAttribute("data-key");
        console.debug("Found currentBtnGroupIndex: " + currentBtnGroupIndex);
      }
    }
    console.debug("onBtGroupClick", e.target, currentBtnGroupIndex);
    this.currentBtnGroupIndex = currentBtnGroupIndex;
    this.props.onBtnGroupClick(currentBtnGroupIndex);
  };

  onStyleClick = e => {
    console.log("onStyleClick");
    console.log(e);
  };

  onCoordInputChange = e => {
    console.debug("onCoordInputChange fired", e);
    const coord = this.props[e.target.name];
    if (!coord) return;

    const value = parseFloat(e.target.value);

    if (e.target.getAttribute("aria-describedby") === "lat") {
      if (value < -89.9 || value > 89.9 || Number.isNaN(value)) {
        console.debug(
          "Setting ",
          e.target.id,
          this.sourceDestValidMap[e.target.id]
        );
        this[this.sourceDestValidMap[e.target.id]] = 1;
      } else this[this.sourceDestValidMap[e.target.id]] = null;
      coord.lat = parseFloat(e.target.value);
    } else if (e.target.getAttribute("aria-describedby") === "lng") {
      if (value < -179.9 || value > 179.9 || Number.isNaN(value)) {
        console.debug(
          "Setting ",
          e.target.id,
          this.sourceDestValidMap[e.target.id]
        );
        this[this.sourceDestValidMap[e.target.id]] = 1;
      } else this[this.sourceDestValidMap[e.target.id]] = null;
      coord.lng = parseFloat(e.target.value);
    } else
      console.debug(
        "Unknown aria-describedby property: ",
        e.target.getAttribute("aria-describedby")
      );

    console.debug(
      "State of invalids before calling the parent onCoordInputChange: ",
      this
    );
    this.props.onCoordInputChange(
      { coordName: e.target.name, coord: coord },
      this.isSourceLatInvalid ||
        this.isSourceLngInvalid ||
        this.isDestLatInvalid ||
        this.isDestLngInvalid
    );
  };

  onStartSubmit = e => {
    console.debug("Collector Start Submit Event");
    e.preventDefault();
    window.alert("Started collecting!");
  };

  render() {
    console.debug("Collector rendering again");
    return (
      <React.Fragment>
        <form onSubmit={e => this.onStartSubmit}>
          <div className="form-group ">
            {/* Source Latitude */}
            <div className="input-group mt-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fas fa-map-marker-alt" />
                  <h6 className="ml-2 mt-2"> Lat</h6>
                </span>
              </div>
              <input
                type="number"
                className={classnames("form-control", {
                  "is-invalid": this.isSourceLatInvalid
                })}
                placeholder="Source Latitude"
                aria-label="Source Latitude"
                aria-describedby="lat"
                id="source-latitude"
                name="sourceCoord"
                step="0.01"
                onChange={this.onCoordInputChange}
                value={this.props.sourceCoord ? this.props.sourceCoord.lat : ""}
              />
              {this.isSourceLatInvalid && (
                <div className="invalid-feedback coord-invalid-feedback">
                  Latitude must be in range [-90, 90]
                </div>
              )}
            </div>
            {/* Source Longitude */}
            <div className="input-group mt-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fas fa-map-marker-alt" />
                  <h6 className="ml-2 mt-2"> Lng</h6>
                </span>
              </div>
              <input
                type="number"
                className={classnames("form-control", {
                  "is-invalid": this.isSourceLngInvalid
                })}
                placeholder="Source Longitude"
                aria-label="Source Longitude"
                aria-describedby="lng"
                id="source-longitude"
                name="sourceCoord"
                onChange={this.onCoordInputChange}
                value={this.props.sourceCoord ? this.props.sourceCoord.lng : ""}
                step="0.01"
              />
              {this.isSourceLngInvalid && (
                <div className="invalid-feedback coord-invalid-feedback">
                  Longitude must be in range [-180, 180]
                </div>
              )}
            </div>
            {/* Destination Latitude */}
            <div className="input-group mt-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="longitude">
                  <i className="fas fa-directions" />
                  <h6 className="ml-1 mt-2"> Lat</h6>
                </span>
              </div>
              <input
                type="number"
                className={classnames("form-control", {
                  "is-invalid": this.isDestLatInvalid
                })}
                placeholder="Destination Latitude"
                aria-label="Destination Latitude"
                aria-describedby="lat"
                id="dest-latitude"
                name="destCoord"
                onChange={this.onCoordInputChange}
                value={this.props.destCoord ? this.props.destCoord.lat : ""}
                step="0.01"
              />
              {this.isDestLatInvalid && (
                <div className="invalid-feedback coord-invalid-feedback">
                  Latitude must be in range [-90, 90]
                </div>
              )}
            </div>
            {/* Destination Longitude */}
            <div className="input-group mt-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="longitude">
                  <i className="fas fa-directions" />
                  <h6 className="ml-1 mt-2"> Lng</h6>
                </span>
              </div>
              <input
                type="number"
                className={classnames("form-control", {
                  "is-invalid": this.isDestLngInvalid
                })}
                placeholder="Destination Longitude"
                aria-label="Destination Longitude"
                aria-describedby="lng"
                step="0.01"
                onChange={this.onCoordInputChange}
                value={this.props.destCoord ? this.props.destCoord.lng : ""}
                id="dest-longitude"
                name="destCoord"
              />
              {this.isDestLngInvalid && (
                <div className="invalid-feedback coord-invalid-feedback">
                  Longitude must be in range [-180, 180]
                </div>
              )}
            </div>

            {/* Button Group */}
            <div className="row justify-content-center mt-2">
              <div
                id="func-btn-group"
                className="btn-group btn-group-toggle p-2"
                data-toggle="buttons"
                // onClick={this.onTabButtonClick}
              >
                {/* 0 Source Coordinate */}
                <label
                  className="btn btn-outline-secondary active"
                  data-key="0"
                  onClick={this.onBtnGroupClick}
                >
                  <input
                    type="radio"
                    name="options"
                    id="sourcebutton"
                    autoComplete="off"
                  />{" "}
                  <i className="fas fa-map-marker-alt" />
                </label>
                {/* 1 Destination Coordinate */}
                <label
                  className="btn btn-outline-secondary"
                  data-key="1"
                  onClick={this.onBtnGroupClick}
                >
                  <input
                    type="radio"
                    name="options"
                    id="destbutton"
                    autoComplete="off"
                  />
                  <i className="fas fa-directions" />
                </label>
                {/* 2 Checkpoints */}
                <label
                  className="btn btn-outline-secondary"
                  data-key="2"
                  onClick={this.onBtnGroupClick}
                >
                  <input
                    type="radio"
                    name="options"
                    id="savebutton"
                    autoComplete="off"
                  />{" "}
                  <i className="fas fa-road" />
                </label>
                {/* 3 Save Locations */}
                <label
                  className="btn btn-outline-secondary"
                  data-key="3"
                  onClick={this.onBtnGroupClick}
                >
                  <input
                    type="radio"
                    name="options"
                    id="savebutton"
                    autoComplete="off"
                  />{" "}
                  <i className="fas fa-save" />
                </label>
              </div>
            </div>

            <div className="form-check form-check-sm  mt-3 mr-2 ml-2">
              <input
                type="checkbox"
                className="form-check-input"
                id="checkbox1"
              />
              <label className="form-check-label mb-2">
                Use custom resolution
              </label>
            </div>
            <div className="col text-center">
              <button
                type="submit"
                className="btn btn-primary text-center m-1 mt-2"
              >
                Start
              </button>
            </div>
          </div>
        </form>
        <div className="row justify-content-center mt-2">
          <div className="btn-group dropup justify-content-center">
            <button
              type="button"
              className="btn btn-info dropdown-toggle"
              data-toggle="dropdown"
              aria-haspopup="true"
              aria-expanded="false"
            >
              Style
            </button>
            <div id="style-dropdown-menu" className="dropdown-menu">
              <button
                className="dropdown-item active"
                onClick={this.props.onStyleChange}
                data-key="0"
              >
                Streets
              </button>
              <button
                className="dropdown-item"
                data-key="1"
                onClick={this.props.onStyleChange}
              >
                Light
              </button>
              <button
                className="dropdown-item"
                data-key="2"
                onClick={this.props.onStyleChange}
              >
                Dark
              </button>
              <button
                className="dropdown-item"
                data-key="3"
                onClick={this.props.onStyleChange}
              >
                Outdoors
              </button>
              <button
                className="dropdown-item"
                data-key="4"
                onClick={this.props.onStyleChange}
              >
                Satellite
              </button>
            </div>
          </div>
        </div>
      </React.Fragment>
    );
  }
}

Collector.propTypes = {
  onBtnGroupClick: PropTypes.func.isRequired,
  onStyleChange: PropTypes.func.isRequired,
  onCoordInputChange: PropTypes.func.isRequired,
  sourceCoord: PropTypes.object,
  destCoord: PropTypes.object
};
