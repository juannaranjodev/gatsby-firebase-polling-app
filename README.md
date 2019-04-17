# Gatsby Polling App

This is an attempt to update [**JAMstack PWA — Let’s Build a Polling App. with Gatsby.js, Firebase, and Styled-components Pt. 1-3**](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-1-78a03a633092) to work with Gatsby v2.0.

However with the breaking changes and the confusing logic implemented for auth and state I can't get it to work.

The build is complete through part 1 and 2 with as many fixes as I can work out. However the current breaking change seems to stem from the original app using `children()` as a function in `Auth` to pass down functions and state into the app components, while `children` is no longer a function in Gatsby.

Additional changes to `gatsby-broswer` API and the change to @reach/router have only muddied the water...

Authentication seems to work as advertised. Things break when you try to create a poll.

## Usage

You'll need to set up firebase for this app. Follow part 2 of the tutorial. Put your credentials @ `services/firebase.js`

The docs are in the docs folder.

Any ideas on how to re-work this app… let me know...
