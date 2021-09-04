export const TIMETABLE_QUERY = `{ plan(
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
