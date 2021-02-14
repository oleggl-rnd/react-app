import React from "react";
//import GeometryTypes from "ol/geom/GeometryType";

const typesarr = ["None", "Point", "LineString", "Polygon", "Circle"]; //Object.keys(GeometryTypes);

const GeometryCombo = (props) => (
  <form className="form-inline">
    <label>Geometry type &nbsp;</label>
    <select id="type" onChange={(e) => props.onTypeSelected(e)}>
      {typesarr.map((mtype) => (
        <option key={mtype} value={mtype}>
          {mtype}
        </option>
      ))}
    </select>
  </form>
);

export default GeometryCombo;
