import React from 'react';

export default class ProgressBar extends React.Component {
  constructor() {
    super();

    this._isActive = this._isActive.bind(this);
  }

  render() {
    if (this.props.progress > 0) {
      const percentage = this.props.progress + '%';
      return(
        <div className="progress">
          <div className={`progress-bar progress-bar-striped ${this._isActive()}`} role="progressbar" style={{width : percentage}} aria-valuenow={this.props.progress} aria-valuemin="0" aria-valuemax="100" />
        </div>
      );
    }
    else {
      return(
        <div />
      );
    }
  }

  _isActive() {
    if (this.props.progress == 100) {
      return null;
    } else {
      return "active";
    }
  }
}
