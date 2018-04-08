import React, { Component } from 'react';
import puff from '../puff.svg';
import ErrorModal from './ErrorModal';
import Suggestions from './Suggestions';
import {updateRatings} from '../logic';



class SearchBox extends Component{
  constructor(props){
    super(props);
    this.state={value: this.props.series? this.props.series:"" , disabled:false, loading: false, error:false};
    this.handleChange=this.handleChange.bind(this);
    this.handleSubmit=this.handleSubmit.bind(this);
    this.toggleError=this.toggleError.bind(this);
    this.handleSuggestionClick=this.handleSuggestionClick.bind(this);
  }

  render(){
    var button=<button className="btn btn-outline-success my-2 my-sm-0" type="submit">Search</button>;
    var loadingIcon= <img src={puff} width={50}/>;
    var suggestions=<Suggestions handleClick={this.handleSuggestionClick}/>;
    return (
    <div>
    <form className="form-inline" onSubmit={this.handleSubmit}>
      <input id={this.props.wide? "wideInput": "navInput"}
      className="form-control mr-sm-2"
      type="search"
      placeholder="Search for a TV show"
      value={this.state.value}
      aria-label="Search" onChange={this.handleChange} disabled={this.state.disabled}
      />
      {this.state.loading? loadingIcon: button}
    </form>
    {this.props.wide? suggestions: ""}
    <ErrorModal open={this.state.error} toggle={this.toggleError} errorMsg={this.state.errorMsg}/>
    </div>
    );
  }

  handleChange(event){
    this.setState({value:event.target.value});

  }

  handleSubmit(event){
    event.preventDefault();
    this.setState({disabled:true});
    updateRatings(this.state.value, this);
  }
  componentWillReceiveProps(nextProps){
    if(this.props!=nextProps)
      this.setState({value: nextProps.series});
  }

  componentDidMount(){
    if(this.props.pathname != "" && this.props.pathname!=undefined){
      this.setState({value: this.props.pathname});
      updateRatings(this.props.pathname, this);
    }
    
  }

  toggleError() {
    this.setState({
      error: !this.state.error
    });
  }

  handleSuggestionClick(value){
    this.setState({value: value, disabled:true});
    updateRatings(value, this);
  } 

}

export default SearchBox;