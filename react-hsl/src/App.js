import React from 'react';
import './App.css';

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function wait() {
  await sleep(5000);
}

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      start: [],
      startTimes: [],
      next: [],
      nextTimes: []
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
      for(var i = 0; i < itineraries.length; i++) {
        start.push(itineraries[i].legs[0].mode);
        startTimes.push(itineraries[i].legs[0].startTime);
        if(itineraries[i].legs.length > 1) {
          next.push(itineraries[i].legs[1].mode);
          nextTimes.push(itineraries[i].legs[1].startTime)
        }
        else {
          next.push('End');
          nextTimes.push('End');
        }
      }
      this.setState({start: start, startTimes: startTimes, next: next, nextTimes: nextTimes});

    });
  };

  createTable = () => {
    var table = [];
    for(var i = 0; i < this.state.start.length; i++) {
      var columns = [];
      columns.push(<td>{this.state.startTimes[i]}</td>);
      columns.push(<td>{this.state.start[i]}</td>);
      columns.push(<td>{this.state.nextTimes[i]}</td>);
      columns.push(<td>{this.state.next[i]}</td>);
      table.push(<tr>{columns}</tr>);
    }
    return table;
  }

  render () {
    wait();
    this.get_timetables();
    return (
      <div className="App">
        <h1>Timetables from Eficode office to Kumpula</h1>
        <table>
        {this.createTable()}
        </table>
      </div>
    );
  }
}

export default App;
