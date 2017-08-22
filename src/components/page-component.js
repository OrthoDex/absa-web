import React from 'react';
import FormComponent from './form-component';
import ProgressBar from './progress-bar';

export default class PageComponent extends React.Component {
  constructor() {
    super();
  }

  render() {
    return(
      <div className="container">
        <div className="container">
          <div className="row">
            <div className="container col-sm-6 col-sm-offset-3">
              <h2>Enter YouTube Video link</h2>
              <p>For best viewing, please view this site on a desktop.</p>
                  <FormComponent />
                  <ProgressBar />
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
}
