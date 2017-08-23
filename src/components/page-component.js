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
    socketId = subscribeToResults((data) => {
      console.log("Received data size: " + data.length);
      let message = "";
      let status = 2;
      let progress = this.state.progress;
      let results = JSON.parse(data);

      if(results["message"] != null) {
        message = this.state.message + "\n" + results["message"];
        status = 1;
        progress += 15;
      } else if(results["error"] != null) {
        message = results["error"];
        progress = 0;
        status = -1;
        results = [];
      } else {
        status = 1;
        progress = 0;
      }

      this.setState({
        data: results,
        progress,
        message,
        status
      })
    });


    this.state = {
      progress: 0,
      message: "",
      data: [],
      status: 2,
      socketId
    }
  }

  render() {
    return(
      <div className="container">
        <div className="container">
          <div className="row">
            <div className="container col-sm-6 col-sm-offset-3">
              <h2>Enter YouTube Video link</h2>
              <p>For best viewing, please view this site on a desktop.</p>
                  <FormComponent fetchData={this._fetchData}/>
                  { this.state.status != 2 ? <p className={`alert alert-${this._getStatus()}`}>{this.state.message} {this.state.status == 0 ? <a href="https://github.com/celery/celery/issues/3773" target="_blank">Issue Reported Here</a> : null}</p> : null }
                  <ProgressBar progress={this.state.progress}/>
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

  _getStatus() {
    if (this.state.status == 0) {
      return "warning"
    } else if (this.state.status == 1) {
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
        this.setState({
          data: [],
          message: "If the process takes longer than 10-15 minutes, please try again after an hour or so. This is caused by an error in the Background Worker.",
          status: 0
        });
      },
      error: () => {
        jQuery('input[type="submit"]').attr('disabled', false);
        console.log("An Error ocurred");
        this.setState({
          data: [],
          message: "A server error ocurred. I'll get it fixed soon. Please try again later.",
          status: -1
        })
      }
    });
  }
}
