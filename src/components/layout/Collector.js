import React, { Component } from "react";

export default class Collector extends Component {
  render() {
    return (
      <form>
        <div className="form-group ">
          {/* Latitude */}
          <div className="input-group mt-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="latitude-input">
                <i className="fas fa-map-marker-alt" />
              </span>
            </div>
            <input
              type="number"
              class="form-control"
              placeholder="Latitude"
              aria-label="Latitude"
              aria-describedby="latitude-input"
              step="0.00001"
            />
          </div>
          {/* Longitude */}
          <div className="input-group mt-3">
            <div className="input-group-prepend">
              <span className="input-group-text" id="longitude-input">
                <i className="fas fa-directions" />
              </span>
            </div>
            <input
              type="number"
              className="form-control"
              placeholder="Longitude"
              aria-label="Longitude"
              aria-describedby="longitude-input"
              step="0.00001"
            />
          </div>

          {/* Button Group */}
          <div className="row justify-content-center mt-2">
            <div
              id="tab-btn-group"
              className="btn-group btn-group-toggle p-2"
              data-toggle="buttons"
              // onClick={this.onTabButtonClick}
            >
              {/* 0 */}
              <label
                className="btn btn-outline-secondary active"
                data-key="0"
                onClick={this.onTabButtonClick}
              >
                <input
                  type="radio"
                  name="options"
                  id="option1"
                  autoComplete="off"
                />{" "}
                <i className="fas fa-map-marker-alt" />
              </label>
              {/* 1 */}
              <label
                className="btn btn-outline-secondary"
                onClick={this.onTabButtonClick}
                data-key="1"
              >
                <input
                  type="radio"
                  name="options"
                  id="option2"
                  autoComplete="off"
                />{" "}
                <i className="fas fa-directions" />
              </label>
              {/* 2 */}
              <label
                className="btn btn-outline-secondary"
                onClick={this.onTabButtonClick}
                data-key="2"
              >
                <input
                  type="radio"
                  name="options"
                  id="option2"
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
