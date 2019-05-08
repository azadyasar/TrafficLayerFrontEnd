import React, { Component } from "react";
import PropTypes from "prop-types";
import { EventEmitter } from "events";

export default class Collector extends Component {
  constructor(props) {
    super(props);
    this.currentBtnGroupIndex = 0;
    this.state = {
      sourceCoord: this.props.sourceCoord,
      destCoord: this.props.destCoord
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

  onChange = event => {
    console.log(event);
    const coord = this.state[event.target.name];
    coord[event.target.getAttribute("data-loctype")] = parseFloat(
      event.target.value
    );
    console.log(coord[event.target.getAttribute("data-loctype")]);
    this.setState({ [event.target.name]: coord });
  };

  render() {
    console.debug("Collector rendering again");
    return (
      <form>
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
              className="form-control"
              placeholder="Source Latitude"
              aria-label="Source Latitude"
              name="sourceCoord"
              data-loctype="lat"
              aria-describedby="lat"
              id="source-latitude"
              step="0.01"
              onChange={this.props.onCoordInputChange}
              value={this.state.sourceCoord ? this.state.sourceCoord.lat : ""}
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
              className="form-control"
              placeholder="Source Longitude"
              aria-label="Source Longitude"
              aria-describedby="longitude-input"
              name="sourceCoord"
              data-loctype="lng"
              id="source-longitude"
              onChange={this.props.onCoordInputChange}
              value={this.state.sourceCoord ? this.state.sourceCoord.lng : ""}
              step="0.01"
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
              className="form-control"
              placeholder="Destination Latitude"
              aria-label="Destination Latitude"
              aria-describedby="latitude-input"
              name="destCoord"
              data-loctype="lat"
              id="dest-latitude"
              onChange={this.props.onCoordInputChange}
              value={this.state.destCoord ? this.state.destCoord.lat : ""}
              step="0.000000000000001"
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
              className="form-control"
              placeholder="Destination Longitude"
              aria-label="Destination Longitude"
              aria-describedby="longitude-input"
              step="0.000000000000001"
              name="destCoord"
              data-loctype="lng"
              onChange={this.props.onCoordInputChange}
              value={this.state.destCoord ? this.state.destCoord.lng : ""}
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
                  id="destinationbutton"
                  autoComplete="off"
                />{" "}
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
                <i class="fas fa-road" />
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
            <label className="form-check-label">Use custom resolution</label>
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
    );
  }
}

Collector.propTypes = {
  onBtnGroupClick: PropTypes.func.isRequired,
  onCoordInputChange: PropTypes.func.isRequired,
  sourceCoord: PropTypes.object,
  destCoord: PropTypes.object
};
