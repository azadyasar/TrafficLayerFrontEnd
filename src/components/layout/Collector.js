import React, { Component } from "react";
import PropTypes from "prop-types";
import classnames from "classnames";

export default class Collector extends Component {
  constructor() {
    super();
    this.currentBtnGroupIndex = 0;
    this.state = {
      isSourceLatValid: 0,
      isSourceLngValid: 0,
      isDestLatValid: 0,
      isDestLngValid: 0
    };

    this.sourceDestValidMap = {
      "source-latitude": "isSourceLatValid",
      "source-longitude": "isSourceLngValid",
      "dest-latitude": "isDestLatValid",
      "dest-longitude": "isDestLngValid"
    };
  }

  componentDidMount() {
    console.debug("Collector Component Mount");
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

  onLatLngChange = e => {
    const value = e.target.value;
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
                </span>
              </div>
              <input
                type="number"
                className={classnames("form-control", {
                  "is-invalid": this.state.isSourceLatValid
                })}
                placeholder="Source Latitude"
                aria-label="Source Latitude"
                aria-describedby="latitude-input"
                id="source-latitude"
                step="0.00001"
                onChange={this.onLatLngChange}
                value={this.props.sourceCoord ? this.props.sourceCoord.lat : ""}
              />
            </div>
            {/* Destination Latitude */}
            <div className="input-group mt-3">
              <div className="input-group-prepend">
                <span className="input-group-text">
                  <i className="fas fa-map-marker-alt" />
                </span>
              </div>
              <input
                type="number"
                className={classnames("form-control", {
                  "is-invalid": this.state.isSourceLngValid
                })}
                placeholder="Source Longitude"
                aria-label="Source Longitude"
                aria-describedby="longitude-input"
                id="source-longitude"
                onChange={this.onLatLngChange}
                value={this.props.sourceCoord ? this.props.sourceCoord.lng : ""}
                step="0.00001"
              />
            </div>
            {/* Destination Latitude */}
            <div className="input-group mt-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="longitude-input">
                  <i className="fas fa-directions" />
                </span>
              </div>
              <input
                type="number"
                className={classnames("form-control", {
                  "is-invalid": this.state.isDestLatValid
                })}
                placeholder="Destination Latitude"
                aria-label="Destination Latitude"
                aria-describedby="latitude-input"
                id="dest-latitude"
                onChange={this.onLatLngChange}
                value={this.props.destCoord ? this.props.destCoord.lat : ""}
                step="0.00001"
              />
            </div>
            {/* Destination Longitude */}
            <div className="input-group mt-3">
              <div className="input-group-prepend">
                <span className="input-group-text" id="longitude-input">
                  <i className="fas fa-directions" />
                </span>
              </div>
              <input
                type="number"
                className={classnames("form-control", {
                  "is-invalid": this.state.isDestLngValid
                })}
                placeholder="Destination Longitude"
                aria-label="Destination Longitude"
                aria-describedby="longitude-input"
                step="0.00001"
                onChange={this.onLatLngChange}
                value={this.props.destCoord ? this.props.destCoord.lng : ""}
                id="dest-longitude"
              />
            </div>

            {/* Button Group */}
            <div className="row justify-content-center mt-2">
              <div
                id="func-btn-group"
                className="btn-group btn-group-toggle p-2"
                data-toggle="buttons"
                // onClick={this.onTabButtonClick}
              >
                {/* 0 */}
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
                {/* 1 */}
                <label
                  className="btn btn-outline-secondary"
                  data-key="1"
                  onClick={this.onBtnGroupClick}
                >
                  <input
                    type="radio"
                    name="options"
                    id="destinationbutton"
                    autoComplete="off"
                  />{" "}
                  <i className="fas fa-directions" />
                </label>
                {/* 2 */}
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
  sourceCoord: PropTypes.object,
  destCoord: PropTypes.object
};
