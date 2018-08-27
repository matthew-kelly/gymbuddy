import React, {Component} from 'react';
// import { render } from 'react-dom';
import { Redirect } from 'react-router-dom';
import dateFns from "date-fns";
import Select from 'react-select'
import makeAnimated from 'react-select/lib/animated';
import { tagOptions } from './docs/data';
import { colourStyles } from './docs/data';
import chroma from 'chroma-js';
import TimeRange from 'react-time-range';
import moment from 'moment';
import 'moment-timezone';


class Calendar extends Component {
constructor(props) {
    super(props);
    this.state = {
    tags: '',
    currentMonth: new Date(),
    selectedDate: new Date(),
    };
  }

//Creates event object with all relevant information
  createEvent = (event) => {
    let description = document.getElementById("eventDescription").value;
    let tagArray = [];
    let date = moment(this.state.selectedDate).format('YYYYMMDD')
    let sTime = date + " " + moment(this.state.startTime).format('HHmm')
    let eTime = date + " " + moment(this.state.endTime).format('HHmm')
    let publicCheck = false;
    if(document.getElementById('publicCheckbox').checked){
      publicCheck = true;
    }
    // console.log(publicCheck)
    for(let tag of this.state.tags){
      tagArray.push(tag.value);
    }

    let eventObj = {
      tags: tagArray,
      // gym_id: ???,
      description: description,
      public: publicCheck,
      time_begin: sTime,
      time_end: eTime,
    }
    console.log(eventObj)
    this.setState({ tags: '' });
  }

//Called when user clicks on timedropdown menu, sets state to set time
  changeTime = (event) =>{
    let startTime = moment(event.startTime).format('YYYYMMDD HHmm')
    let endTime = moment(event.endTime).format('YYYYMMDD HHmm')
    this.setState({ startTime: startTime });
    this.setState({ endTime: endTime });
  }

//Hides popup and resets checkbox/event description
  onClear = (event) => {
    document.getElementById("popup").style = "display: none";
    document.getElementById("popupBackground").style = "display: none";
    document.getElementById("eventDescription").value = '';
    document.getElementById('publicCheckbox').checked = '';

  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

//Does nothing if click is inside the event popup/else clears
  handleClick = (event) => {
    if (this.node.contains(event.target)) {
      return;
    }
    this.onClear();
  }

//Adds tags selected by user to the state with each tag click
  addTag = (event) => {
    this.setState({tags: event});
  }

//Renders the popup with forms/buttons
  renderPopUp(){
    return(
      <div>
        <div style={{display:'none'}} id='popupBackground'>
        </div>
        <div ref={node => this.node = node} style={{display:'none'}} id='popup'>
          <h1 id="popuptitle">Create an Event</h1>
          <h3>Description</h3>
          <form>
          <textarea name='eventDescription' id='eventDescription' placeholder='Event description...'/>
          </form>
          <Select
            onChange={this.addTag}
            className='tagform'
            closeMenuOnSelect={false}
            components={makeAnimated()}
            isMulti
            options={tagOptions}
            styles={colourStyles}
          />
          <div id='timeRangeMenu'>
            <TimeRange
              sameIsValid={false}
              startMoment={this.state.startTime}
              endMoment={this.state.endTime}
              onChange={this.changeTime}
            />
            <div className='checkbox'>
              <input id='publicCheckbox'type='checkbox' name='public' value='public'/>Public Event
            </div>
          </div>
          <div id='eventButtonMenu'>
            <button id='confirmButton' className='eventButton' onClick={this.createEvent}>Confirm</button>
            <button id='cancelButton' className='eventButton' onClick={this.onClear}>Cancel</button>
          </div>
        </div>
      </div>
      )
  }

//Renders Calendar Header
  renderHeader() {
    const dateFormat = 'MMMM YYYY';
    return (
      <div className='header row flex-middle'>
        <div className='col col-start'>
          <div className='icon' onClick={this.prevMonth}>
            chevron_left
          </div>
        </div>
        <div className="col col-center">
          <span>{dateFns.format(this.state.currentMonth, dateFormat)}</span>
        </div>
        <div className="col col-end" onClick={this.nextMonth}>
          <div className="icon">chevron_right</div>
        </div>
      </div>
    );
  }

  renderDays() {
    const dateFormat = "dddd";
    const days = [];

    let startDate = dateFns.startOfWeek(this.state.currentMonth);

    for (let i = 0; i < 7; i++) {
      days.push(
        <div className="col col-center" key={i}>
          {dateFns.format(dateFns.addDays(startDate, i), dateFormat)}
        </div>
      );
    }

    return <div className="days row">{days}</div>;
  }

  renderCells() {
    const { currentMonth, selectedDate } = this.state;
    const monthStart = dateFns.startOfMonth(currentMonth);
    const monthEnd = dateFns.endOfMonth(monthStart);
    const startDate = dateFns.startOfWeek(monthStart);
    const endDate = dateFns.endOfWeek(monthEnd);

    const dateFormat = "D";
    const rows = [];

    let days = [];
    let day = startDate;
    let formattedDate = "";

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = dateFns.format(day, dateFormat);
        const cloneDay = day;
        days.push(
          <div
            className={`col cell ${
              !dateFns.isSameMonth(day, monthStart)
                ? "disabled"
                : dateFns.isSameDay(day, selectedDate) ? "selected" : ""
            }`}
            key={day}
            onClick={() => this.onDateClick(dateFns.parse(cloneDay))}
          >
            <span className="number">{formattedDate}</span>
            <span className="bg">{formattedDate}</span>
          </div>
        );
        day = dateFns.addDays(day, 1);
      }
      rows.push(
        <div className="row" key={day}>
          {days}
        </div>
      );
      days = [];
    }
    return <div className="body">{rows}</div>;
  }

//On clicking a day, gets the popup information to show, sets the state.
  onDateClick = day => {
    this.setState({
      selectedDate: day
    });
    document.getElementById("popup").style = "display: show";
    document.getElementById("popupBackground").style = "display: show";
  };

  nextMonth = () => {
    this.setState({
      currentMonth: dateFns.addMonths(this.state.currentMonth, 1)
    });
  };

  prevMonth = () => {
    this.setState({
      currentMonth: dateFns.subMonths(this.state.currentMonth, 1)
    });
  };

  render() {
    if (this.props.appState.isLoggedIn !== true) {
      return <Redirect to='/' />
    }

    return (
      <div>
        {this.renderPopUp()}
      <div className="calendar">
        {this.renderHeader()}
        {this.renderDays()}
        {this.renderCells()}
        </div>
      </div>
    );
  }
}

export default Calendar;
