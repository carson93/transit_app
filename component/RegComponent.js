import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { addUser } from '../service/myService.js';

export default class RegComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: null,
            password: null,
            users: null
        }
    }

    componentWillMount(){
        this.setState({users:this.props.navigation.getParam('users')})   
    }

    checkUnique(username) {
        for (let i = 0; i < this.state.users.length; i++) {
            if (username == this.state.users[i].username) {
                return false
            }
        }
        return true
    }

    respond(username, password){
        if (!this.checkUnique(username)) {
            Alert.alert(
              'Invalid username',
              'Your username has been taken',
              [
                {text: 'OK'}
              ]
            )
        } else {
            addUser(username, password);
            this.props.navigation.replace('Map', {
                username: username,
                password: password,
            });
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.users == null && <ActivityIndicator />}
                {this.state.users != null && <View style={styles.loginContainer}>
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
                        title='Sign up' 
                        onPress={()=>this.respond(this.state.username, this.state.password)}
                    />
                </View>}
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