import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableHighlight, Button, StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { SearchBar } from 'react-native-elements'
import Permissions from 'react-native-permissions'
import MapView from 'react-native-maps'

export default class GeoComponent extends Component {

    constructor() {
        super();
        this.state = {
            locationPermission: 'unknown',
            position: 'unknown',
            region: {},
            isLoaded: false,
            busStops: null
        }
        this.onRegionChange = this.onRegionChange.bind(this)
        this.getCurrentLocation = this.getCurrentLocation.bind(this)
        this.goLocation = this.goLocation.bind(this)
    }

    static navigationOptions = {
        headerTransparent: true
    }

    componentDidMount() {
        this.getCurrentLocation()
    }

    getTravelTime() {

    }

    async getStops() {
        console.log('hello');
        let apiUrl = `https://api.translink.ca/rttiapi/v1/stops?apikey=ZFUEBho1ZLmYupfhbjeN&`+
            `lat=${Math.round(this.state.region.latitude * 1000000) / 1000000}&`+
            `long=${Math.round(this.state.region.longitude * 1000000) / 1000000}`
        console.log(apiUrl);
        await fetch(apiUrl, {
          headers:{
            'content-type': 'application/JSON'
          }
        })
        .then((response) => response.json())
        .then((response) => this.setState({busStops:response}))
        .catch((error)=> console.log(error))
    }

    getCurrentLocation() {
        navigator.geolocation.getCurrentPosition((position) => {
            console.log(position.coords);
            console.log('my position: ' + position.coords.latitude + ', ' + position.coords.longitude);
            this.setState({
                region: {
                    latitude: position.coords.latitude,
                    latitudeDelta: 0.015,
                    longitude: position.coords.longitude,
                    longitudeDelta: 0.015,
                },
                isLoaded: true
            })
            this.getStops();
        }, (error) => {console.log(error)})
    }

    goLocation() {
        this.setState({
            region: {
                latitude: 50.6,
                latitudeDelta: 0.27,
                longitude: 16.7,
                longitudeDelta: 0.26
            },
        })
    }

    onRegionChange(region) {
        console.log(region);
        this.setState({
            region
        })
    }

    render() {
        return (
            <View style={styles.map}>
            {this.state.isLoaded ? 
            <View style={styles.map}>
                {this.state.busStops != null && <MapView
                initialRegion={this.state.region}
                region={this.state.region}
                style={styles.map}
                > 
                {this.state.busStops.map(marker => (
                    <MapView.Marker
                      coordinate={{
                        latitude: marker.Latitude,
                        longitude: marker.Longitude
                      }}
                      title={`StopNo ${marker.StopNo}`}
                      description={`${marker.Name}`}
                    />
                ))}
                </MapView>}
                <View style={styles.searchContainer}>
                    <SearchBar 
                        round={true}
                        lightTheme={true}
                        containerStyle={styles.search}/>
                </View>
            </View>
            : <ActivityIndicator size='large' />}
            </View>
        )
    }
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
  },
  searchContainer: {
    position: 'absolute',
    top: '10%',
    justifyContent: 'center'
  },
  search: {
    width: 350
  },
  container2: {
    position: 'absolute',
    bottom: '10%',
    right: '10%',
  }
});