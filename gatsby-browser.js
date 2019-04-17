/**
 * Implement Gatsby's Browser APIs in this file.
 *
 * See: https://www.gatsbyjs.org/docs/browser-apis/
 */

// You can delete this file if you're not using it

// ./gatsby-browser.js
import React from 'react'
// import { Provider } from 'react-redux'
// import { Router } from 'react-router-dom'
import FirebaseProvider from './src/containers/FirebaseProvider'

import firebase from './src/services/firebase'

// export const replaceRouterComponent = ({ history }) => {
export const wrapRootElement = ({ element }) => {
  //  const ConnectedRouterWrapper = ({ children }) => (
  const ConnectedRootElement = (
    <FirebaseProvider firebase={firebase}>{element}</FirebaseProvider>
  )

  //  return ConnectedRouterWrapper
  return ConnectedRootElement
}
