import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, StyleSheet, Text, View, Animated, PanResponder, ActivityIndicator } from 'react-native';
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
            search: '',
            isLoaded: false,
            busStops: null
        }
        this.getCurrentLocation = this.getCurrentLocation.bind(this)
    }

    static navigationOptions = {
        header: null
    }

    componentWillMount() {
        this.animatedValue = new Animated.ValueXY();
        this._value = {x: 0, y: 0}
        this.animatedValue.addListener((value) => this._value = value);
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => true,
            onMoveShouldSetPanResponder: (evt, gestureState) => true,
            onPanResponderGrant: (e, gestureState) => {
                this.animatedValue.setOffset({
                    x: this._value.x,
                    y: this._value.y,
                })
                this.animatedValue.setValue({ x: 0, y: 0})
            },
            onPanResponderMove: Animated.event([
                null, { dx: 0, dy: this.animatedValue.y}
            ]),
        })
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

    render() {

        const animatedStyle = {
            transform: this.animatedValue.getTranslateTransform()
        }

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
                <SearchBar 
                    round={true}
                    containerStyle={styles.searchContainer}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.searchText}
                    placeholder='Where to?'
                    onChangeText={(search)=>this.setState({search})}
                    value={this.state.search}
                />
                <Animated.View style={[styles.infoBar, animatedStyle]} {...this.panResponder.panHandlers}>
                    <Text style={styles.infoText}>I am a bus route</Text>
                </Animated.View>
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
    top: '5%',
    alignSelf: 'center',
    width: '90%',
    backgroundColor: 'transparent',
    borderBottomWidth: 0,
    borderTopWidth: 0,
  },
  inputContainer: {
    backgroundColor: '#fff'
  },
  searchText: {
    color: '#000'
  },
  infoBar: {
    position: 'absolute',
    top: '90%',
    left: '5%',
    width: '90%',
    height: '70%',
    alignItems: 'flex-start',
    backgroundColor: '#fff',
    padding: '5%',
    borderRadius: 30,
  },
  infoText: {
    fontSize: 16
  }
});