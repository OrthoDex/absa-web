import React from 'react';
import jQuery from 'jquery';
import FormComponent from './form-component';
import ProgressBar from './progress-bar';
import PlotComponent from './plot-component';
import { subscribeToResults } from '../result-listener';
import { STATUS_ERROR, STATUS_SUCCESS, STATUS_NEUTRAL, STATUS_DEFAULT } from '../status_constants';

export default class PageComponent extends React.Component {
  constructor() {
    super();

    this._fetchData = this._fetchData.bind(this);

    let socketId = null;
    //SocketIO Listener Callback
    socketId = subscribeToResults((output) => {
      console.log("Received data.");
      let message = "";
      let status = STATUS_DEFAULT;
      let data = [];
      let progress = this.state.progress;
      const results = JSON.parse(output);

      if(results["message"] != null) {
        status = STATUS_SUCCESS;
        message = {
          id: this.state.messages.length + 1,
          text: results["message"],
          status: status
        };
        progress += 15;
      } else if(results["error"] != null) {
        progress = 0;
        status = STATUS_ERROR;
        message = {
          id: this.state.messages.length + 1,
          text: results["error"],
          status: status
        };
        data = [];
      } else {
        console.log("Fetch complete.");
        data = results;
        status = STATUS_SUCCESS;
        progress = 100;
        message = {
          id: this.state.messages.length + 1,
          text: "Here are the results!",
          status: status
        };
      }

      this.setState({
        data,
        progress,
        messages: this.state.messages.concat([message]),
        status
      })
    });


    this.state = {
      messages: [],
      progress: 0,
      data: [],
      status: STATUS_DEFAULT,
      socketId
    }
  }

  render() {
    const messages = this._getMessages();

    return(
      <div className="container">
        <div className="container">
          <div className="row">
            <div className="container col-sm-6 col-sm-offset-3">
              <h2>Enter YouTube Video link</h2>
              <p>For best viewing, please view this site on a desktop.</p>
                  <FormComponent fetchData={this._fetchData}/>
                  <ProgressBar progress={this.state.progress}/>
                  { messages }
            </div>
          </div>
        </div>
        <div className="container col-sm-8 col-sm-offset-2">
          <div className="row">
            { this.state.data.length != 0 ? <PlotComponent data={this.state.data}/> : null}
          </div>
        </div>
      </div>
    );
  }

  _getMessages() {
    if(this.state.status != STATUS_DEFAULT) {
      return this.state.messages.map((message) => {
        return <p key={message.id}
                  className={`alert alert-${this._getStatus(message.status)}`}>
                  {message.text}
                  {message.status == STATUS_NEUTRAL ? <a href="https://github.com/celery/celery/issues/3773" target="_blank">Issue Reported Here</a> : null}
                  </p>
      });
    }
  }

  _getStatus(status) {
    if (status == STATUS_NEUTRAL) {
      return "warning"
    } else if (status == STATUS_SUCCESS) {
      return "success"
    } else {
      return "danger"
    }
  }

  _fetchData(videoId) {
    this.setState({
      messages: [],
      progress: 0,
      data: [],
      status: STATUS_DEFAULT
    });

    var formData = {
        'video_id' : videoId,
        'uid': this.state.socketId
    };
    console.log("Sending request to socket " + this.state.socketId);

    jQuery.ajax({
      method: 'POST',
      url: 'http://localhost:5000/analyze',
      data: formData,
      encode: true,
      success: (data) => {
        jQuery('input[type="submit"]').attr('disabled', false);
        console.log(data);
        const message =  {
          id: this.state.messages.length + 1,
          text: "If the process takes longer than 10-15 minutes, please try again after an hour or so. This is caused by an error in the Background Worker.",
          status: STATUS_NEUTRAL
        };
        this.setState({
          data: [],
          status: STATUS_NEUTRAL,
          messages: this.state.messages.concat([message])
        });
      },
      error: () => {
        jQuery('input[type="submit"]').attr('disabled', false);
        console.log("An Error ocurred");
        const message = {
          id: this.state.messages.length + 1,
          text: "A server error ocurred. I'll get it fixed soon. Please try again later.",
          status: STATUS_ERROR
        };
        this.setState({
          data: [],
          messages: message,
          status: STATUS_ERROR
        })
      }
    });
  }
}
