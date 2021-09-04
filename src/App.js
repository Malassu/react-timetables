import React from 'react';
import './App.css';

function lowerCase(string) {
  return string.charAt(0) + string.slice(1).toLowerCase();
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      start: [],
      startTimes: [],
      destinations: [],
      next: [],
      nextTimes: [],
      transIDs: []
    };
  }
  
  get_timetables = () => {
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', { //fetch data via HSL API
      method: 'POST',
      headers: {
        "Content-Type": "application/graphql"
      },
      body: `{ plan(
          from: {lat: 60.2716403915943, lon: 24.84663514090327}
          to: {lat: 60.169301684811906, lon: 24.93325791874904}
          numItineraries: 6
          transportModes: [{mode: BUS}, {mode: RAIL}, {mode:TRAM}, {mode: SUBWAY}, {mode:WALK}]
        ) {
          itineraries{
            walkDistance,
            duration,
            legs {
              mode
              startTime
              endTime
              from {
                name
                stop {
                  code
                  name
                }
              },
              to {
                name
              },
              trip {
                tripHeadsign
                routeShortName
              },
              distance
            }
          }
        }
      }`
    })
    .then(res => res.json())
    .then(json => {

      var itineraries = json.data.plan.itineraries;
      var start = [];
      var startTimes = [];
      var next = [];
      var nextTimes = [];
      var destinations = [];
      var transIDs = [];
      
      for(var i = 0; i < itineraries.length; i++) {
        start.push(lowerCase(itineraries[i].legs[0].mode));
        var date = new Date(itineraries[i].legs[0].startTime);
        var hours = date.getHours();
        var minutes = "0" + date.getMinutes();
        startTimes.push(hours + ':' + minutes.substr(-2));
        destinations.push(itineraries[i].legs[0].to.name);

        if(itineraries[i].legs.length > 1) {
          next.push(lowerCase(itineraries[i].legs[1].mode));
          date = new Date(itineraries[i].legs[1].startTime);
          hours = date.getHours();
          minutes = "0" + date.getMinutes();
          nextTimes.push(hours + ':' + minutes.substr(-2));
          transIDs.push(itineraries[i].legs[1].trip.routeShortName + ', ' + itineraries[i].legs[1].trip.tripHeadsign);
        }

        else {
          next.push('End');
          nextTimes.push('End');
          transIDs.push('End');
        }
      }
      this.setState({start: start, startTimes: startTimes, destinations: destinations, next: next, nextTimes: nextTimes, transIDs: transIDs});

    });
  };

  createTable = () => {

    var table = [];

    for(var i = 0; i < this.state.start.length; i++) {
      var columns = [];
      columns.push(<td>{this.state.startTimes[i]}</td>);
      columns.push(<td>{this.state.start[i]}</td>);
      columns.push(<td>{this.state.destinations[i]}</td>);
      columns.push(<td>{this.state.nextTimes[i]}</td>);
      columns.push(<td>{this.state.next[i]}</td>);
      columns.push(<td>{this.state.transIDs[i]}</td>);
      table.push(<tr>{columns}</tr>);
    }

    return table;

  }

  render () {

    this.get_timetables();
    var today = new Date();
    var mins = today.getMinutes();
    var digit = "";

    if(mins < 10) {
      digit = "0"
    }

    var time = today.getHours() + ":" + digit + mins;

    return (
        <div className="App">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.3.0/dist/css/uikit.min.css" />
          <h1>Kuohukuja public transport timetable</h1>
          <h2>Current time: {time}</h2>
          <table className="uk-table-striped" align="center">
            <caption></caption>
            <thead>
              <tr>
                <th>Leave home</th>
                <th>Method</th>
                <th>Transportation from</th>
                <th>Departure time</th>
                <th>Transportation method</th>
                <th>Transportation ID</th>
              </tr>
            </thead>
            <tbody>
              {this.createTable()}
            </tbody>
          </table>
        </div>
    );
  }
}

export default App;
