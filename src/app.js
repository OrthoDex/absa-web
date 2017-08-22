import React from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';

import PageComponent from './components/page-component';

jQuery(function(){
  ReactDOM.render(
    <PageComponent />,
    document.getElementById('page')
  );
})
