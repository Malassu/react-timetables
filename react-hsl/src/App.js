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
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', {
      method: 'POST',
      headers: {
        "Content-Type": "application/graphql"
      },
      body: `{ plan(
          from: {lat: 60.169281, lon: 24.925942}
          to: {lat: 60.205081, lon: 24.961217}
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
    var time = today.getHours() + ":" + today.getMinutes();
    return (
        <div className="App">
          <h1>Timetables from Eficode office to Kumpula</h1>
          <h2>Current time: {time}</h2>
          <table align="center">
            <caption></caption>
            <thead>
              <tr>
                <th>Leave work</th>
                <th>Method</th>
                <th>Destination</th>
                <th>Transportation time</th>
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
