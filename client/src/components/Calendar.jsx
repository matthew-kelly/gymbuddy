import React, {Component} from 'react';
import { Redirect } from 'react-router-dom';
import dateFns from "date-fns";
import Select from 'react-select'
import makeAnimated from 'react-select/lib/animated';
import { tagOptions } from '../docs/data';
import { colourStyles } from '../docs/data';
// import chroma from 'chroma-js';
import TimeRange from 'react-time-range';
import moment from 'moment';
import 'moment-timezone';
import axios from 'axios';
import EventBubble from './EventBubble';
import EventDataModal from './EventDataModal';
import FriendList from './FriendList';

const API = 'http://localhost:5000/api'



class Calendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tags: '',
      currentMonth: new Date(),
      selectedDate: new Date(),
      events: '',
      showEventModal: false,
      currentEvent: '',
      currentEventTags: ''
    };
    this.getAllEvents = this.getAllEvents.bind(this);
  }

  async getAllEvents(gym_id) {
    const res = axios.get(`${API}/gyms/${gym_id}/events`);
    return await res;
  }

  async getFriends(id) {
    const res = await axios.get(`${API}/users/${id}/friends`);
    return await res.data;
  }

  async addEventTag(eventId, tag) {
    const res = await axios({
      method: 'post',
      url: `${API}/events/${eventId}/tags`,
      data: {
        tag: tag
      }
    })
    if (res.data.length > 0) {
      return await res.data;
    } else {
      return false;
    }
  }

  async postEvent(eventObj) {
    const res = await axios({
      method: 'post',
      url: `${API}/events`,
      data: {
        user_id: eventObj.user_id,
        gym_id: eventObj.gym_id,
        description: eventObj.description,
        public: eventObj.public,
        time_begin: eventObj.time_begin,
        time_end: eventObj.time_end
      }
    })
    if (res.data.length > 0) {
      return await res.data;
    } else {
      return false;
    }
  }

  showEventDataModal = (event) => {
    this.setState({
      showEventModal: true,
      currentEventTags: JSON.parse(event.target.getAttribute('data-eventtags')),
      currentEvent: JSON.parse(event.target.getAttribute('data-thisevent')),
     });
  };

  hideEventDataModal = () => {
    this.setState({ showEventModal: false });
  };

  // Called when user clicks on timedropdown menu, sets state to set time
  changeTime = (event) =>{
    let startTime = moment(event.startTime).format('YYYYMMDD HHmm')
    let endTime = moment(event.endTime).format('YYYYMMDD HHmm')
    this.setState({ startTime: startTime });
    this.setState({ endTime: endTime });
  }

  // Hides popup and resets checkbox/event description
  onClear = (event) => {
    document.getElementById("popup").style = "display: none";
    document.getElementById("popupBackground").style = "display: none";
    document.getElementById("eventDescription").value = '';
    document.getElementById('publicCheckbox').checked = '';
    this.setState({tags:''});
  }

  // Does nothing if click is inside the event popup/else clears
  handleClick = (event) => {
    if (this.node.contains(event.target)) {
      return;
    }
    this.onClear();
  }

  // Adds tags selected by user to the state with each tag click
  addTag = (event) => {
    this.setState({tags: event});
  }

  // Creates event object with all relevant information
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
    for(let tag of this.state.tags){
      tagArray.push(tag.value);
    }

    if (description.length > 0 && tagArray.length > 0 && date.length > 0 && sTime < eTime) {
      let eventObj = {
        user_id: this.props.appState.current_user.id,
        gym_id: this.props.appState.current_user.gym_id,
        description: description,
        public: publicCheck,
        time_begin: sTime,
        time_end: eTime,
      }
      this.postEvent(eventObj)
        .then(res => {
          const eventId = res[0];

          tagArray.map((tag) => {
            this.addEventTag(eventId, tag)
            .catch(err => console.error(err));
          });
        })
        .catch(err => console.error(err));

      this.onClear();
      window.location.reload(true);
    } else {
      window.alert("Event is not valid");
    }
  }

  componentDidMount() {
    document.addEventListener('mousedown', this.handleClick, false);

    this.getFriends(this.props.appState.current_user.id)
    .then(res => this.setState({ friends: res }))
    .catch(err => console.log(err));

    this.getAllEvents(this.props.appState.current_user.gym_id)
    .then(res => this.setState({ events: res.data }))
    .catch(err => console.error(err));
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleClick, false);
  }

  // Renders the popup with forms/buttons
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

// Renders Calendar Header
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
        <div className="dropdown">
          <button className="dropbtn">Filter by: </button>
          <div className="dropdown-content">
            <ul id="dropdownList">
              <FriendList appState={this.props.appState}/>
            </ul>
          </div>
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

        const dayEventsArray = [];

        for (let j = 0; j < this.state.events.length; j++) {
          let eventStartDate = moment(this.state.events[j].time_begin).format('YYYYMMDD');
          let calendarDate = moment(day).format('YYYYMMDD');
          if (eventStartDate === calendarDate && (this.state.events[j].public === true || this.state.events[j].user_id === this.props.appState.current_user.id)) {
            dayEventsArray.push(<EventBubble showEventDataModal={this.showEventDataModal} thisEvent={this.state.events[j]} key={this.state.events[j].id} />)
          }
        }

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
          >
            <span className="number">{formattedDate}</span>
            <span className="bg">{formattedDate}</span>
            <div className="add-event-button" onClick={() => this.onDateClick(dateFns.parse(cloneDay))}>+</div>
            <ul className="day-event-container">
              {dayEventsArray}
            </ul>
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

// On clicking a day, gets the popup information to show, sets the state.
  onDateClick = (day) => {
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
        <EventDataModal currentEvent={this.state.currentEvent} tags={this.state.currentEventTags} showEventModal={this.state.showEventModal} handleClose={this.hideEventDataModal} />
      </div>
    );
  }
}

export default Calendar;