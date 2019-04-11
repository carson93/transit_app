import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { TouchableOpacity, StyleSheet, Text, View, Animated, PanResponder, ActivityIndicator, Dimensions } from 'react-native';
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
            busStops: null,
            busStopSelected: true,
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
            onMoveShouldSetPanResponder: (evt, gestureState) => {
                return !(gestureState.dx < 30 && gestureState.dy < 30)                  
            },
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

        let textTabBus = this.state.busStopSelected ? {opacity: 1} : {opacity: 0.5}
        let lineTabBus = this.state.busStopSelected ? {backgroundColor: '#fff'} : {backgroundColor: '#0D91E2'}
        let textTabFav = this.state.busStopSelected ? {opacity: 0.5} : {opacity: 1}
        let lineTabFav = this.state.busStopSelected ? {backgroundColor: '#0D91E2'} : {backgroundColor: '#fff'}

        let infoTop = SCREEN_HEIGHT-170

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
                    searchIcon={{size: 24}}
                    placeholder='Where to?'
                    onChangeText={(search)=>this.setState({search})}
                    value={this.state.search}
                />
                <Animated.View style={[styles.infoBar, animatedStyle, {top: infoTop}]} {...this.panResponder.panHandlers}>
                    <View style={styles.infoTabs}>
                        <View style={styles.line}></View>
                        <View style={styles.tabContainer}>
                            <TouchableOpacity style={styles.tab} onPress={()=>this.setState({busStopSelected: true})}>
                                <Text style={[styles.tabText, textTabBus]}>Bus Stop</Text>
                                <View style={[styles.tabLine, lineTabBus]}></View>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.tab} onPress={()=>this.setState({busStopSelected: false})}>
                                <Text style={[styles.tabText, textTabFav]}>Favorites</Text>
                                <View style={[styles.tabLine, lineTabFav]}></View>
                            </TouchableOpacity>
                        </View>
                    </View>
                    {this.state.busStopSelected ? 
                    <View style={styles.infoDisplay}>
                        <View style={styles.leftContainer}>
                            <Text style={styles.busNum}>145</Text>
                        </View>
                        <View style={styles.destContainer}>
                            <Text style={styles.busDest}>to BCIT</Text>
                            <Text style={{fontSize: 16, color: '#777'}}>WB RUPERT ST FS E 43 AVE</Text>
                        </View>
                        <View style={styles.nextContainer}>
                            <Text style={styles.busNext}>Leaves in</Text>
                            <Text style={[styles.busNext, {color: '#777'}]}>10 min</Text>
                        </View>
                    </View> : 
                    <View style={styles.infoDisplay}>
                        <View style={[styles.leftContainer, {alignItems: 'center'}]}>
                            <TouchableOpacity style={styles.favButton}>
                                <Text style={styles.favText}>-</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.destContainer}>
                            <Text style={styles.busDest}>from BCIT</Text>
                            <Text style={styles.busDest}>to BCIT</Text>
                        </View>
                        <View style={styles.nextContainer}>
                            <Text style={styles.busNext}>Travel time</Text>
                            <Text style={[styles.busNext, {color: '#777'}]}>10 min</Text>
                        </View>
                    </View>}
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
    backgroundColor: '#fff',
    height: 45,
    shadowColor: "#000",
    shadowOffset: {
        width: 0,
        height: 9,
    },
    shadowOpacity: 0.48,
    shadowRadius: 11.95,
  },
  searchText: {
    color: '#000',
    fontSize: 24,
  },
  infoBar: {
    position: 'absolute',
    width: '100%',
    flexDirection: 'column',
    borderRadius: 10,
  },
  infoTabs: {
    backgroundColor: '#0D91E2',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 80,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  line: {
    backgroundColor: '#fff',
    height: 5,
    width: 50,
    borderRadius: 2,
    marginTop: 7,
  },
  tabContainer: {
    flexDirection: 'row',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  tabText: {
    color: '#fff',
    fontSize: 18
  },
  tabLine: {
    backgroundColor: '#fff',
    height: 3,
    width: 100,
    borderRadius: 2,
    marginTop: 7,
  },
  infoDisplay: {
    backgroundColor: '#fff',
    height: 90,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favButton: {
    height: 50,
    width: 50,
    borderRadius: 25,
    backgroundColor: '#0D91E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  favText: {
    color: '#fff',
    fontSize: 36,
  },
  leftContainer: {
    width: '20%',
    height: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingRight: 10
  },
  destContainer: {
    width: '55%',
    height: 50,
    justifyContent: 'center',
  },
  nextContainer: {
    width: '25%',
    height: 50,
    justifyContent: 'center',
  },
  busNum: {
    fontSize: 38,
    height: 50
  },
  busDest: {
    fontSize: 16,
  },
  busNext: {
    fontSize: 16,
  },
});

const {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT,
} = Dimensions.get('window');