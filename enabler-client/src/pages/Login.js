import React, { Component } from 'react'
import withStyles from '@material-ui/core/styles/withStyles';
import PropTypes from 'prop-types';
import AppIcon from '../images/icon.png';
import axios from 'axios';
import {Link} from 'react-router-dom';


//Mui Stuff
import Grid from '@material-ui/core/Grid';
import Typography  from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import  CircularProgress  from '@material-ui/core/CircularProgress';

import Button from '@material-ui/core/Button';
const styles = {
  form:{
      textAlign: 'center'
  },
  image:{
      margin:'20px auto 20px auto'
  },
  pageTitle:{
    margin:'10px auto 10px auto'
},
textField:{
    margin: '10px auto 10px auto'
},
button:{
    marginTop:20,
    position: 'relative'

},
customError:{
    color:'red', 
    fontSize:'0.8rem',
    marginTop:10

},
progress:{
    position:'absolute'
}

};


export class Login extends Component {
   constructor(){
       super();
       this.state = {
           email:'',
           password:'',
           loading:false,
           errors:{}

       }
   }
   handleSubmit = (event) =>{
   event.preventDefault();
   this.setState({
       loading:true
   });
  const userData = {
       email:this.state.email,
       password:this.state.password
   }; 
   
   axios.post('https://us-central1-enabledchat.cloudfunctions.net/api/login',{ userData},{
   headers: {
    'Content-Type': null
  }
}

)
   .then( res =>{
      
       this.setState({
          
           loading:false
       });
       this.props.history.push('/');
   })
   .catch(err =>{
       this.setState({
        //  errors:err.response.data,
           loading:false
       })
   }) 

}
   handleChange = (event)=>{
    this.setState({
        [event.target.name]:[event.target.value]
    })

   }

    render() {
        const {classes} = this.props;
        const {errors, loading}= this.state;

        return (
            <Grid container className={classes.form}>
             <Grid item sm/>
             <Grid item sm >
             <img src={AppIcon} alt="monkey image" className={classes.image}/>
              <Typography variant="h3" className={classes.pageTitle}>
                  Login
              </Typography>
              <form noValidate onSubmit={this.handleSubmit}>
                 <TextField id ="email" 
                 name="email" 
                 type="email" 
                 label="Email" 
                 className={classes.textField}
                 helperText={errors.email}
                 error={errors.email ? true : false}
                 value={this.state.email}
                 onChange={this.handleChange} 
                 fullWidth/>
                 <TextField id ="password" 
                 name="password" 
                 type="password" 
                 label="Password" 
                 className={classes.textField}
                 helperText={errors.password}
                 error={errors.password ? true : false}
                 value={this.state.password}
                 onChange={this.handleChange} fullWidth/>
                 {errors.general && (
                     <Typography variant="body2" className={classes.customError}>
                         {errors.general}
                     </Typography>
                 )}
            <Button type="submit" variant="contained" color="primary" className={classes.button}>
                Login
                {loading && (
                    <CircularProgress className={classes.progress} />
                )}
                </Button>
            <br/>
            <small>don't have an account ? <Link to="/signup">here</Link></small>
              </form>
             </Grid>
             <Grid item sm />
            </Grid>
        )
    }
}

Login.propTypes ={
    classes:PropTypes.object.isRequired
}
export default withStyles(styles)(Login);
