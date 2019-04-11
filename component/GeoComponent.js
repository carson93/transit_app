import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Button, StyleSheet, Text, View, Animated, Alert, PanResponder, ActivityIndicator, Image } from 'react-native';
import { SearchBar } from 'react-native-elements'
import Permissions from 'react-native-permissions'
import MapView from 'react-native-maps'
import { decode } from '../service/myService.js';

export default class GeoComponent extends Component {

    constructor() {
        super();
        this.state = {
            locationPermission: 'unknown',
            position: 'unknown',
            region: {},
            search: '',
            isLoaded: false,
            busStops: null,
            busInfo: [],
            polyline: null,
            destination: null,
            destCoords: null
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

    parseBusInfo(busStopNo,busStopName,busInfo) {
        let buses = []
        for (let i = 0; i < busInfo.length; i++) {
            let busObj = {
                routeNo: parseInt(busInfo[i].RouteNo,10),
                leaveTime: busInfo[i].Schedules[0].ExpectedLeaveTime,
                destination: busInfo[i].Schedules[0].Destination,
                countdown: busInfo[i].Schedules[0].ExpectedCountdown,
                stopNo: busStopNo,
                stopName: busStopName
            }
            buses.push(busObj)
        }
        return buses
    }

    filterSkytrain(allStops){
        let busStops = []
        for (let i = 0; i < allStops.length; i++){
            if (allStops[i].OnStreet != 'SKYTRAIN') {
                busStops.push(allStops[i])
            }
        }
        return busStops
    }

    async getDestCoord(address){
        let googleApi = "https://maps.googleapis.com/maps/api/geocode/json?address="
        let accessKey = `&key=AIzaSyA2uBawhhpsC-QhPxkCcPeEeEKV5nKLSns`
        let encodedAddr = encodeURIComponent(address)
        let encodedUrl = googleApi + encodedAddr + accessKey
        await fetch(encodedUrl)
        .then((response) => response.json())
        .then((response) => {if (response.status != 'OK') {
                              Alert.alert(
                                  'Invalid location',
                                  'The location entered cannot be found',
                                  [
                                    {text: 'OK'}
                                  ]
                                );
                                return false
                            } else {
                                this.setState({
                                    destCoords:{
                                        latitude: response.results[0].geometry.location.lat,
                                        longitude: response.results[0].geometry.location.lng
                                    },
                                    destination: response.results[0].formatted_address
                                })
                                return true
                            }})
        .catch((error) => {console.log(error)})
    }

    async getRoute(destination) {
        let encodedDest = encodeURIComponent(destination)
        let apiUrl = `https://maps.googleapis.com/maps/api/directions/json?` +
                     `origin=${this.state.region.latitude},${this.state.region.longitude}`+
                     `&destination=${encodedDest}`+
                     `&mode=transit&units=metric&transit_mode=bus&key=AIzaSyA2uBawhhpsC-QhPxkCcPeEeEKV5nKLSns`
        await fetch(apiUrl)
        .then((response) => response.json())
        .then((response) => {
            console.log(response.routes[0].overview_polyline.points);
            let polyline = decode(response.routes[0].overview_polyline.points)
            this.setState({polyline});
        })
        .catch((error) => console.log(error))
    }

    async getEstimates() {
        let max = this.state.busStops.length > 3 ? 3 : this.state.busStops.length
        let buses = []
        for (let i = 0; i < max; i++) {
            let apiUrl = `https://api.translink.ca/rttiapi/v1/stops/${this.state.busStops[i].StopNo}/estimates?apikey=ZFUEBho1ZLmYupfhbjeN&count=1&timeframe=30`
            await fetch(apiUrl, {
              headers:{
                'content-type': 'application/JSON'
              }
            })
            .then((response) => response.json())
            .then((response) => this.parseBusInfo(
                this.state.busStops[i].StopNo,
                this.state.busStops[i].Name,
                response
            ))
            .then((result) => {buses = buses.concat(result)})   
            .catch((error)=> console.log(error))
        }
        this.setState({busInfo:buses})
    }

    async getStops() {
        let apiUrl = `https://api.translink.ca/rttiapi/v1/stops?apikey=ZFUEBho1ZLmYupfhbjeN&`+
            `lat=${Math.round(this.state.region.latitude * 1000000) / 1000000}&`+
            `long=${Math.round(this.state.region.longitude * 1000000) / 1000000}&`+
            `radius=200`
        await fetch(apiUrl, {
          headers:{
            'content-type': 'application/JSON'
          }
        })
        .then((response) => response.json())
        .then((response) => this.setState({busStops:this.filterSkytrain(response)}))
        .catch((error)=> console.log(error))
    }

    getCurrentLocation() {
        navigator.geolocation.getCurrentPosition(async (position) => {
            this.setState({
                region: {
                    latitude: position.coords.latitude,
                    latitudeDelta: 0.006,
                    longitude: position.coords.longitude,
                    longitudeDelta: 0.006,
                }
            })
            await this.getStops();
            await this.getEstimates();
            console.log(this.state.busInfo)
            this.setState({isLoaded:true})
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
                <MapView
                initialRegion={this.state.region}
                region={this.state.region}
                style={styles.map}
                >
                <MapView.Marker
                      coordinate={{
                        latitude: this.state.region.latitude,
                        longitude: this.state.region.longitude
                      }}
                      title="Your location" />
                {this.state.busStops.map(marker => (
                    <MapView.Marker
                      key={marker.StopNo}
                      coordinate={{
                        latitude: marker.Latitude,
                        longitude: marker.Longitude  
                      }}
                      title={`StopNo ${marker.StopNo}`}
                      description={`${marker.Name}`}
                      image={require('../assets/bus_marker.png')} />
                ))}
                {this.state.polyline != null && 
                    <MapView.Polyline coordinates={this.state.polyline} 
                    strokeWidth={5} 
                    strokeColor='blue'/>}
                {this.state.polyline != null &&
                    <MapView.Marker
                      coordinate={{
                        latitude: this.state.destCoords.latitude,
                        longitude: this.state.destCoords.longitude
                      }}
                      title={this.state.destination}
                      pinColor='blue' />}
                </MapView>
                <SearchBar 
                    round={true}
                    containerStyle={styles.searchContainer}
                    inputContainerStyle={styles.inputContainer}
                    inputStyle={styles.searchText}
                    placeholder='Where to?'
                    onChangeText={(search)=>this.setState({search})}
                    value={this.state.search}
                    onSubmitEditing={async ()=>{
                        let dest = this.state.search.trim();
                        if (this.getDestCoord(dest)) {
                            this.getRoute(dest)
                        }
                    }}
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