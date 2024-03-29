JAMstack PWA — Let’s Build a Polling App. with Gatsby.js, Firebase, and Styled-components Pt. 3

[Unicorn Agency](https://medium.com/@UnicornAgency)May 8, 2018

Welcome back! This is the third and final part of a tutorial where we go through and build a PWA from scratch that utilizes a powerful architecture pattern called the [**JAMStack**](https://jamstack.org/)**.** You can find the blogpost covering part 1 [**here**](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-1-78a03a633092) and part 2 [**here**](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-2-9044534ea6bc)**.** I’d suggest reading through them first as we’ll be jumping straight into from where we left off.

> A note on part 2: I made a mistake in **./src/pages/new.js**. Since we’ve set the firebase database rules to only allow authenticated users to write to the database, we have to be sure a **uid** exists before creating a new poll. Here’s a link to the [updated gist file](https://gist.github.com/johnkorzhuk/ac64949432f9255f33e5971cc5f5aea3). Be sure your code [signs the user in anonymously](https://gist.github.com/johnkorzhuk/ac64949432f9255f33e5971cc5f5aea3#file-newpoll-js-L162-L178) before creating the poll.

#### Manifest.json

The [manifest](https://developer.mozilla.org/en-US/Add-ons/WebExtensions/manifest.json) file is the standardized place to declare metadata about your site. It’s required in order to utilize features like prompting users to save the app. to their home screen and custom splash screens when launching the web app. Features like this have the goal of making the user experience indistinguishable from a native application experience.

Firstly, let’s generate some icons for our site’s favicon at different sizes using a handy online tool at [realfavicongenerator.net](https://realfavicongenerator.net/). Save the image found [here](https://imgur.com/a/47828) to your computer and upload it to [realfavicongenerator.net](https://realfavicongenerator.net/). Once it’s uploaded, hit **Generate your Favicons and HTML code.** Download the provided zip file of all the icon sizes for the different devices. Then create a new directory in the *static*directory called *favicons* and place the contents of the zip file in there. Delete the *site.webmanifest* and the *browserconfig.xml* files. The webmanifest file will be generated by another gatsby plugin called [gatsby-plugin-manifest](https://www.gatsbyjs.org/packages/gatsby-plugin-manifest/) which we’ll add in a moment.

For the browsers that don’t support manifest files, let’s add the site’s metadata in the head of the html as well. To accomplish this, we can edit the props passed to the [React-Helmet](https://github.com/nfl/react-helmet) component in our *./src/layouts/index.js* file.

```jsx
// ./src/layouts/index.js
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import { withPrefix } from 'gatsby-link';

import Auth from '../containers/Auth';
import Header from '../components/Header';
import { Container as BaseContainerStyles } from '../styledComponents/layout';

import './index.css';

const Container = BaseContainerStyles.extend`
  padding-top: 0;
`;

const TemplateWrapper = ({ children, data, ...props }) => (
  <Auth>
    {auth => {
      return (
        <div>
          <Helmet
            title={data.site.siteMetadata.title}
            meta={[
              {
                name: 'description',
                content: 'Create polls for stuff and things',
              },
              { name: 'keywords', content: 'polling, rating' },
              { name: 'msapplication-TileColor', content: '#08AEEA' },
              { name: 'theme-color', content: '#2AF598' },
            ]}>
            <link
              rel="apple-touch-icon"
              sizes="180x180"
              href={withPrefix('/favicons/apple-touch-icon.png')}
            />
            <link
              rel="icon"
              type="image/png"
              sizes="32x32"
              href={withPrefix('/favicons/favicon-32x32.png')}
            />
            <link
              rel="icon"
              type="image/png"
              sizes="16x16"
              href={withPrefix('/favicons/favicon-16x16.png')}
            />
          </Helmet>
          <Header
            background="background-image: linear-gradient(116deg, #08AEEA 0%, #2AF598 100%)"
            title={data.site.siteMetadata.title}
            {...auth}
          />
          <Container>
            {children({
              ...props,
              ...auth,
            })}
          </Container>
        </div>
      );
    }}
  </Auth>
);

TemplateWrapper.propTypes = {
  children: PropTypes.func,
  data: PropTypes.object,
};

export const query = graphql`
  query AboutQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`;

export default TemplateWrapper;
```



Notice that we’ve used **withPrefix** method from *gatsby-link*. This is required whenever we reference something in the *static* directory from our source code. You can read more about withPrefix and the static directory [here](https://www.gatsbyjs.org/docs/adding-images-fonts-files/#adding-assets-outside-of-the-module-system).

#### Services workers

To enable an offline experience for our application we’ll need to make use of [service workers](https://developers.google.com/web/fundamentals/primers/service-workers/). A service worker is a script that runs on a separate thread than that of your website that can be utilized for several technologies that previously weren’t possible on the web. It remains active even when the user doesn’t have the site open and enables us web developers to implement tools and techniques like [push notification](https://developers.google.com/web/updates/2015/03/push-notifications-on-the-open-web), [background sync](https://developers.google.com/web/updates/2015/12/background-sync), offline support, intercepting fetch requests, and more. In our application, we’ll use a service worker to cache our html and javascript files so that when a user visits our site with a connection, the site’s assets get saved to the user’s local browser cache. Upon subsequent visits, that cache will be used as opposed to relying on the network for those assets. There are several [caching strategies](https://serviceworke.rs/caching-strategies.html), but in this tutorial we’ll use the [cache and update](https://serviceworke.rs/strategy-cache-and-update.html) strategy that comes default with the plugin.

Let’s install the [gatsby-plugin-manifest](https://www.gatsbyjs.org/packages/gatsby-plugin-manifest/) and [gatsby-plugin-offline](https://www.gatsbyjs.org/packages/gatsby-plugin-offline/) plugins and update our *gatsby-config.js* file to make use of them:

```
npm install gatsby-plugin-manifest gatsby-plugin-offline
```

edit

```jsx
module.exports = {
  siteMetadata: {
    title: 'Polling App',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-styled-components',
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: [`/poll/*`] },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: 'Polling App',
        short_name: 'Polling App',
        start_url: '/',
        background_color: '#08AEEA',
        theme_color: '#2AF598',
        display: 'minimal-ui',
        icons: [
          {
            src: `/favicons/android-chrome-192x192.png`,
            sizes: `192x192`,
            type: `image/png`,
          },
          {
            src: `/favicons/android-chrome-512x512.png`,
            sizes: `512x512`,
            type: `image/png`,
          },
        ],
      },
    },
    'gatsby-plugin-offline',
  ],
};
```





After deploying the updated code and running another Lighthouse test, let’s juxtaposition the new results with the results from part 2 of the series:





> The new report can be found [here](https://googlechrome.github.io/lighthouse/viewer/?gist=fd26e0988a29f0f2975b9d8126e6c2ec). Your results may vary. The primary reason behind our performance score not being higher is because of the firebase sdk. It is quite large in size.

The site’s performance score increased from 70 to 83, the PWA score increased from 36 to 91, and best practices increased from 81 to a perfect 100. All that just by adding two plugins. In my opinion, that’s pretty impressive considering the minimal amount of work put in on our part.

The only failed PWA audit has to do with the fact the site doesn’t redirect **http**traffic to **https** as service workers don’t work without https*.* Unfortunately, Netlify currently doesn’t offer an option to enable this when the site is hosted on a Netlify subdomain. However, you could enable https redirect by adding a [custom domain](https://www.netlify.com/docs/custom-domains/), which, like many of the other awesome features offered, is free (you still got to buy the domain, of course).

Another sweet benefit of PWAs is the ability to save to a user’s home screen. Since we’ve added a web app manifest file and our site can be access via https, when users interact with the application long enough, they’ll be prompted to save it to their home screen. Again, the goal with these sorts of features is to close the gap between web apps. and native apps.



> [Add to home screen](https://developer.mozilla.org/en-US/Apps/Progressive/Add_to_home_screen) doesn’t have cross-browser support. Windows and iOS devices don’t support this spec as of yet.

### Wrapping up

That’s all folks! We’ve built a progressive web application that utilizes the JAMStack pattern of building websites. We’ve covered a lot and I’m quite pleased with the results considering what we’ve accomplished. To summarize a few key points:

- the performance of our site is fantastic thanks to Netlify’s global CDN and Gatsby’s utilization of the [PRPL pattern](https://developers.google.com/web/fundamentals/performance/prpl-pattern/).
- you can expect the great results when it comes to SEO thanks to Gatsby.js and its sick plugin ecosystem.
- the site is still accessible even when users are offline or have shotty connections.
- despite the whole application being static, it has a backend and authentication working.

There’s so much more we haven’t covered when it comes to Gatsby.js. I encourage you all look into it a bit more and contribute to the awesome Gatsby.js ecosystem.

With that said, this concludes the series. [Tell me what you thought.](https://polling-app.netlify.com/poll/12249a) I hope you all enjoyed following along as much as I enjoyed writing these!

> If you have any issues or would like to see the completed code please visit our repository [here](https://github.com/Unicorn/polling-app-example/tree/master).

Be sure to follow us for more blogs every Monday and Tuesday!

**John Korzhuk** *is a software developer and proud Unicorn. He specializes in full-stack javascript, React.js, and web development. Outside of work his interests include gaming, esports, and learning about anything that he finds interesting. You can find on twitter* [*@johnkorzhuk*](https://twitter.com/johnkorzhuk/)*.*

### Want to build magical experiences together? Contact us!

**E-mail:** [social@unicorngency.com](http://social@unicornagency.com/)

**Twitter:** [@UnicornHQ](http://www.twitter.com/unicornHQ)

**Website:** [http://www.unicornagency.com](http://www.unicornagency.com/)