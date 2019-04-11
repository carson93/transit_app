import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Text, View, TextInput, Button, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { db } from '../db.js';

let itemsRef = db.ref('/users');

export default class HomeComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            username: null,
            password: null,
            users: null
        }
    }  

    static navigationOptions = {
        header: null
    }

    componentWillMount(){
        itemsRef.on('value',async (snapshot)=>{
          let data = snapshot.val();
          let users = Object.values(data);
          this.setState({users})
        })
    }

    checkUser(username, password) {
        for (let i = 0; i < this.state.users.length; i++) {
            if (username == this.state.users[i].username && password == this.state.users[i].password) {
                return true
            }
        }
        return false
    }

    respond(username, password){
        if (this.checkUser(username, password)) {
            this.props.navigation.navigate('Map', {
                username: username,
                password: password,
            })
        } else {
            Alert.alert(
              'Invalid credentials',
              'Your username or password is not correct',
              [
                {text: 'OK'}
              ]
            );
        }
    }

    render() {
        return (
            <View style={styles.container}>
                {this.state.users == null && <ActivityIndicator size='large' />}
                {this.state.users != null && <View style={styles.loginContainer}>
                    <Text style={styles.fieldText}>Sign in</Text>
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
                        onPress={()=>this.respond(this.state.username, this.state.password)}
                    />
                    <Button 
                        title='Register' 
                        onPress={()=>this.props.navigation.navigate('Reg',{users:this.state.users})}
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
