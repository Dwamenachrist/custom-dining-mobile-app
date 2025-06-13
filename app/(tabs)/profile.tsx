import { View, Text, TouchableOpacity, TextInput ,Image, ScrollView} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import React ,{ useState,useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Entypo from '@expo/vector-icons/Entypo';
import { router } from 'expo-router';



export default function Profile() {

    const [text , setText] = useState('')
    const [profileName , setProfileName] = useState('');
    const [goal , setGoal] = useState('')

    useEffect (()=>{
      const fetchName = async () => {
        try {
          const name = await AsyncStorage.getItem('profileName');
          if (name) {
            setProfileName(name);
          }
          const goal =await AsyncStorage.getItem('goal');
          if (goal) {
            setGoal(goal);
          }
        } catch (error){
          console.log(error)
        }
      };
      fetchName();
    }, []);

  return (
    <SafeAreaView style={{flex:1,backgroundColor:'white'}}>
      <TouchableOpacity onPress={()=>{router.navigate('/home')}}>
        <MaterialIcons name="arrow-back" size={24} color="black" />
      </TouchableOpacity>
      <View style={{marginBottom:30}}>
        <Text style={{fontFamily:'SemiBold',textAlign:'center',fontWeight:'700',fontSize:18,color:"#333333"}}>Profile</Text>
      </View>
    <ScrollView style={{padding:"4%"}}>
          
     <View style={{}}>
        <TouchableOpacity style={{width:150,height:150,backgroundColor:"#008000",alignSelf:'center',borderRadius:100}}></TouchableOpacity>
      </View>
      <View style={{marginTop:5,marginBottom:10}}>
        <Text style={{fontFamily:'PoppinsBold',fontWeight:'600',fontSize:24,textAlign:'center'}}>{profileName}</Text>
      </View>
      <View>
        <View style={{flexDirection:'row',justifyContent:'center',marginBottom:30,marginRight:15}}>
          <View>
            <TouchableOpacity style={{backgroundColor:'red',height:77.5,width:77.5,borderRadius:16,marginLeft:17,justifyContent:'center',}} onPress={()=>{router.navigate('../(profile)/profile2')}}>
              <Image source={require('../../assets/profile copy.png')} style={{width:24,height:24,marginLeft:44,right:20}}/>
            </TouchableOpacity>
            <Text style={{marginLeft:20,marginTop:10}}>Edit profile</Text>
          </View>
          <View>
             <View style={{backgroundColor:'red',height:77.5,width:77.5,borderRadius:16,marginLeft:17,justifyContent:'center'}}>
               <Image source={require('../../assets/payment.png')} style={{width:24,height:24,marginLeft:44,right:20}}/>
            </View> 
            <Text style={{marginLeft:20,marginTop:10}}>Payment</Text>
          </View>
          <View>
            <View style={{backgroundColor:'red',height:77.5,width:77.5,borderRadius:16,marginLeft:17,justifyContent:'center'}}>
             <Image source={require('../../assets/address.png')} style={{width:24,height:24,marginLeft:44,right:20}}/>
            </View>
            <Text style={{marginLeft:20,marginTop:10}}>Addresses</Text>
          </View>
          <View >
            <View style={{backgroundColor:'red',height:77.5,width:77.5,borderRadius:16,marginLeft:17,justifyContent:'center'}}>
              <Image source={require('../../assets/Vector.png')} style={{width:24,height:24,marginLeft:44,right:20}}/>
            </View>
            <Text style={{marginLeft:20,marginTop:10}}>Refferals</Text>
          </View>
          
        </View>
        <View style={{backgroundColor:'red',width:358,height:60,borderRadius:8}}>
          <Text  style={{fontWeight:700,paddingLeft:20,fontSize:12}}>Health Goal</Text>
            <Text style={{fontSize:16,fontWeight:'700',fontFamily:'SemiRegular',color:"#333333",paddingLeft:20,marginTop:10}}>{goal}</Text>
        </View>
        <View style={{backgroundColor:'red',width:358,height:60,borderRadius:8,marginTop:15}}>
          <Text style={{fontWeight:700,paddingLeft:20,fontSize:12}}>Dietry Preferance</Text>
          <TextInput  style={{backgroundColor:'red',height:55,borderRadius:8}} onChangeText={setText}/>
        </View>
        <View style={{justifyContent:'space-between',flexDirection:'row',marginTop:30}}>
         <Text style={{fontFamily:'PoppinsBold',fontWeight:'700',fontSize:18}}>Dining Summary</Text>
         <Entypo name="chevron-small-down" size={24} color="black" />
        </View>
      </View>
    </ScrollView>
      
    </SafeAreaView>
 );
} 