import React from 'react';
import './App.css';
import { TIMETABLE_QUERY } from './queries'
import getTimestamp from './Utils/getTimestamp'

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
      transIDs: [],
      timestamp: ''
    };
  }

  componentDidMount() {
    this.updateTimetables();
  }

  updateTimetables = () => {
    this.getTimetables();
    this.setState({ timestamp: getTimestamp() })
  }

  getTimetables = () => {
    fetch('https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql', { //fetch data via HSL API
      method: 'POST',
      headers: {
        "Content-Type": "application/graphql"
      },
      body: TIMETABLE_QUERY
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
      this.setState({ start: start, startTimes: startTimes, destinations: destinations, next: next, nextTimes: nextTimes, transIDs: transIDs });

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
    return (
        <div className="App">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/uikit@3.3.0/dist/css/uikit.min.css" />
          <h1>Kuohukuja public transport timetable</h1>
          <h2>Current time: {this.state.timestamp}</h2>
          <button onclick={this.updateTimetables}>Update</button>
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
