import React from 'react';
import jQuery from 'jquery';
import FormComponent from './form-component';
import ProgressBar from './progress-bar';

export default class PageComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      progress: 0,
      message: "",
      data: [],
      status: 2
    }

    this._fetchData = this._fetchData.bind(this);
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
                  { this.state.status != 2 ? <p className={`alert alert-${this._getStatus()}`}>{this.state.message} {this.state.status == 0 ? <a href="https://github.com/celery/celery/issues/3773">Issue Reported Here</a> : null}</p> : null }
                  <ProgressBar progress={this.state.progress}/>
            </div>
          </div>
        </div>
        <div className="container col-sm-8 col-sm-offset-2">
          <div className="row">
            <div className="container-fluid">
              <div id="graphs">
              </div>
            </div>
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

  _fetchData() {
    jQuery.ajax({
      method: 'GET',
      url: 'data.json',
      success: (data) => {
        jQuery('input[type="submit"]').attr('disabled', false);
        console.log(data);
        this.setState({
          data,
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
