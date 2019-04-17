// ./src/pages/poll/index.js
import React from 'react'
import PropTypes from 'prop-types'
// import { Route, Redirect } from 'react-router-dom'
import { Router, Redirect } from '@reach/router'

import Poll from '../../containers/Poll'

const PollPage = ({ uid, signIn }) => {
  return (
    <Router
      render={({ location }) => {
        return (
          <div>
            <Router exact path="/poll/" render={() => <Redirect to="/" />} />
            <Router
              location={location}
              key={location.key}
              path="/poll/:pollId/"
              render={props => <Poll {...props} uid={uid} signIn={signIn} />}
            />
          </div>
        )
      }}
    />
  )
}

PollPage.propTypes = {
  uid: PropTypes.string,
  signIn: PropTypes.func.isRequired,
}

export default PollPage
