import React from 'react';

export default class FormComponent extends React.Component {
  constructor() {
    super();

    this.state = {
      validInput: 0,
      message: "",
      data: []
    };

    this._handleSubmit = this._handleSubmit.bind(this);
    this._submitStatus = this._submitStatus.bind(this);
    this._helpTextStatus = this._helpTextStatus.bind(this);

  }

  render() {
    return(
      <form id="submit_form" onSubmit={this._handleSubmit}>
        <div className={`form-group ${this._submitStatus()}`}>
          <input className="form-control" placeholder="Enter the valid public YouTube Video Id" type="text" ref={(input) => this._videoUrl = input} />
          <span id="helpBlock" className="help-block">
            <p className={`text-${this._helpTextStatus}`}>{this.state.message}</p>
          </span>
          <input className="btn btn-primary" type="submit" value="Submit" />
        </div>
      </form>
    );
  }

  _helpTextStatus() {
    if(this.state.validInput == 0)
      return "";
    else if(this.state.validInput == 1)
      return "success";
    else
      return "danger";
  }

  _submitStatus() {
    if(this.state.validInput == 0)
      return "";
    else if(this.state.validInput == 1)
      return "has-success";
    else
      return "has-error";
  }

  _handleSubmit(event) {
    event.preventDefault();

    const result = this._parseUrl(this._videoUrl.value);
    if (result == "invalid") {
      this.setState({
        validInput: 2,
        message: "Please enter a valid full YouTube video link."
      });
    } else {
      $('input[type="submit"]').attr('disabled', true);
      this.setState({
        validInput: 1,
        message: "Thank you! Please wait sometime till the analysis is done. This usually takes about 5 minutes."
      })
      this._fetchData();
    }
  }

  _parseUrl(videoUrl) {
    const result = videoUrl.match(/^https:\/\/www\.youtube\.com\/watch\?v=(.*?)((?:\&.*)|$)/);
    if (result == null) {
      return "invalid";
    } else {
      return result[1];
    }
  }

  _fetchData() {
    $.ajax({
      method: 'GET',
      url: 'data.json',
      success: (data) => {
        $('input[type="submit"]').attr('disabled', false);
        this.setState({
          data,
          validInput: 1
        });
      },
      error: (message) => {
        $('input[type="submit"]').attr('disabled', false);
        console.log(message);
        this.setState({
          validInput: 2,
          message: "A server error ocurred. I'll get it fixed soon. Please try again later."
        })
      }
    });
  }
}
