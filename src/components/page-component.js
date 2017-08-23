import React from 'react';
import jQuery from 'jquery';
import FormComponent from './form-component';
import ProgressBar from './progress-bar';
import PlotComponent from './plot-component';
import { subscribeToResults } from '../result-listener';

export default class PageComponent extends React.Component {
  constructor() {
    super();

    this._fetchData = this._fetchData.bind(this);

    let socketId = null;
    //SocketIO Listener Callback
    socketId = subscribeToResults((output) => {
      console.log("Received data.");
      let message = "";
      let status = 2;
      let data = [];
      let progress = this.state.progress;
      const results = JSON.parse(output);

      if(results["message"] != null) {
        status = 1;
        message = {
          id: this.state.messages.length + 1,
          text: results["message"],
          status: status
        };
        progress += 15;
      } else if(results["error"] != null) {
        progress = 0;
        status = -1;
        message = {
          id: 1,
          text: results["error"],
          status: status
        };
        data = [];
      } else {
        console.log("Fetch complete.");
        data = results;
        status = 1;
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
      status: 2,
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
    if(this.state.status != 2) {
      return this.state.messages.map((message) => {
        return <p key={message.id}
                  className={`alert alert-${this._getStatus(message.status)}`}>
                  {message.text}
                  {message.status == 0 ? <a href="https://github.com/celery/celery/issues/3773" target="_blank">Issue Reported Here</a> : null}
                  </p>
      });
    }
  }

  _getStatus(status) {
    if (status == 0) {
      return "warning"
    } else if (status == 1) {
      return "success"
    } else {
      return "danger"
    }
  }

  _fetchData(videoId) {
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
          status: 0
        };
        this.setState({
          data: [],
          status: 0,
          messages: this.state.messages.concat([message])
        });
      },
      error: () => {
        jQuery('input[type="submit"]').attr('disabled', false);
        console.log("An Error ocurred");
        const message = {
          id: this.state.messages.length + 1,
          text: "A server error ocurred. I'll get it fixed soon. Please try again later.",
          status: -1
        };
        this.setState({
          data: [],
          messages: message,
          status: -1
        })
      }
    });
  }
}
