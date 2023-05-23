  var dates = require('dates')
  
  module.exports = {
    timeToMili: timeToMili,
    dateTimeExpressionToDate: dateTimeExpressionToDate,
    insidePointRadius: insidePointRadius
  }

  function dateTimeExpressionToDate (dateTimeExpression) {
    if (!dateTimeExpression) {
      return null
    }
    if (dateTimeExpression.dateInterval) {
      return {
        start: dateTimeExpression.dateInterval.start,
        end: dateTimeExpression.dateInterval.end
      }
    }
    if (dateTimeExpression.dateTimeInterval) {
      return {
        start: dateTimeExpression.dateTimeInterval.start.date,
        end: dateTimeExpression.dateTimeInterval.end.date
      }
    }
    if (dateTimeExpression.date) {
      //using same date for both start and end. This is not a valid case,should throw checkedError
      return {
        start: dateTimeExpression.date,
        end: dateTimeExpression.date
      }
    }
    return null
  }

  function timeToMili(time) {
    //TODO consider zone offset
    var timeStr
    if (time instanceof Object && "hour" in time) {
      var hour = ("amPM" in time && String(time.amPM) == 'Pm') && Number(time.hour) < 12 ? Number(time.hour) + 12 : Number(time.hour)
      var minute = ("minute" in time && time.minute ? time.minute : "00")
      //sanity check
      timeStr = hour + ":" + (String(minute).length < 2 ? "0" + minute : minute)
      return  dates.ZonedDateTime.parseTime(timeStr, "H:mm").getMillisFromEpoch()
    }
    return null //TODO error handling
  }

  function distance(point1, point2, unit) {
    var R = unit == "Miles" ? 3958 : 6371;  //radius of earth
    var dLat = toRad(point2.latitude-point1.latitude);
    var dLon = toRad(point2.longitude-point1.longitude);
    var lat1 = toRad(point1.latitude);
    var lat2 = toRad(point2.latitude);

    var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    var d = R * c;
    return d;
  }

  function insidePointRadius(point, pointRadius) {
    return distance(point, pointRadius.centroid, pointRadius.radius.unit) < pointRadius.radius.magnitude
  }

  // Converts numeric degrees to radians
  function toRad(value)
  {
      return value * Math.PI / 180;
  }
