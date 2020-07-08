import React from "react";

export const CheckBox = props => {
  return (
    <li style={{ listStyle: "none" }}>
      <div className="form-check">
        <input
          id={props.id}
          type="checkbox"
          checked={props.isChecked}
          onChange={props.onCheckboxChange}
          value={props.value}
          disabled={props.disabled}
        />
        <label className="form-check-label pl-2" htmlFor={props.id}>
          {props.value}
        </label>
      </div>
    </li>
  );
};
