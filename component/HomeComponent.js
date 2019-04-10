import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View, TextInput, Button, StyleSheet } from 'react-native';

export default class HomeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: null,
            password: null,
        }
    }

    static navigationOptions = {
        header: null
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.loginContainer}>
                    <Text style={styles.fieldText}>Registration</Text>
                    <TextInput 
                        style={styles.input} 
                        placeholder='Username' 
                        onChangeText={(username)=>this.setState({username})} 
                        value={this.state.username}/>
                    <TextInput 
                        style={[styles.input, {marginBottom: 15}]} 
                        placeholder='Password' 
                        onChangeText={(password)=>this.setState({password})} 
                        value={this.state.password}/>
                    <Button 
                        title='Sign in' 
                        onPress={()=>this.props.navigation.navigate('Map', {
                            username: this.state.username,
                            password: this.state.password,
                        })}
                    />
                </View>
            </View>
        )
    }
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'blue',
    height: '100%',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  loginContainer: {
    backgroundColor: 'white',
    height: '30%',
    width: '80%',
    alignItems: 'center',
    justifyContent: 'center'
  },
  fieldText: {
    fontSize: 20
  },
  input: {
    borderBottomColor: 'black',
    borderBottomWidth: 1,
    width: '50%',
    height: 45,
  }
});
