# GatsbyJS and Firebase

## Starting Points

Each of these repos is an attempt to get Firebase Authentication working with Gatsby

### 1) jamstack pwa lets build a polling app with gatsby js firebase and styled components

This is a promising blog post.  There is some great lessons in using styled components to make a slick interface.  However, it is based on Gatsby v1.  In Gatsby v2 the router, layout, and many other things change and this build fails.

I tried to fix the problems as they arose but the architecure of the authentication is very idiosyncratic.

See the the folder **new-polling-app**

See docs folder for my build notes with changes for upgrading to Gatsby 2

These are the original blog posts

[Part One - jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-1-78a03a633092)

[Part Two - jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-2-9044534ea6bc)

[Part Three - jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-3-89fa499534fd)

Repo for blog post

[github](https://github.com/gatsbyjs/gatsby-starter-default)

# JAMstack PWA — Let’s Build a Polling App. with Gatsby.js, Firebase, and Styled-components Pt. 1

[Unicorn Agency ](https://medium.com/@UnicornAgency) 

Feb 20, 2018



In this three-part tutorial, We will show you how to get up and running with a progressive web application (PWA) that makes use of a powerful web architecture pattern called the **JAMstack**. We’ll start out initializing the project with linting and code formatting, building out the UI of our application, and finally, we’ll deploy it to the web.

> You can find the repository for Part 1 [here](https://github.com/Unicorn/polling-app-example/tree/part-1). If you have any issues or questions submit an issue and we’ll get back to you as soon as possible.





### **What is JAMstack?**

As defined on [jamstack.org](https://jamstack.org/):

> `**JAMstack**`: noun \’jam-stak’\

> Modern web development architecture based on client-side JavaScript, reusable APIs, and prebuilt Markup.

Paraphrased: JAMstack is a way of architecting your web applications with three key principals:

1. The client-side javascript handles all data fetching.

2. The APIs the client(s) depend on, such as any databases, authentication services, asset CDNs, etc., are abstracted into CORS enabled microservices to be accessible from the client-side.

3. Markup is prerendered at **build-time**, though not required, usually done with a static site generator.

### **Cool story. But why?**

#### **Performance**

With the markup being rendered at build-time, there is no server runtime to generate the markup. The HTML files are already there ready to be sent over to the client. Granted the performance gains here aren’t groundbreaking as most web server implementations utilize page caching, but any gains to time to first byte is a plus.

#### **Cost**

Again, since there’s no server runtime and all that’s being served are some static assets, the assets can be stored on and served from a CDN. Meaning costs to deploy your site are low and with some services like Netlify (which we’ll cover later) can even be free.

#### **SEO**

Generally speaking, you want web crawlers to have an as easy of a job as possible indexing your website. Amongst other reasons, this is why implementing server-side rendering or pre-rendering on your single-page-application is a plus. This way, web crawlers don’t have to wait for javascript to be parsed and ran before the markup can be indexed, the markup will already exist inside the HTML file. This is not to say SPAs are not crawled by search engines, however, there are edge cases that make it difficult.

#### **Developer experience**

With the backend services abstracted away into their own APIs, the front-end engineer has free reign over what tools, libraries, frameworks, and languages to utilize on the front-end. There are no restriction on what preprocessed languages or build tools can be used as the case with some web frameworks. Personally, I think the tools the Node.js community have developed are second to none when it comes to DX. Tools like Webpack have enabled things like [Hot Module Replacement.](https://webpack.js.org/concepts/hot-module-replacement) I know and love the development workflow Node.js projects have to offer and often find myself longing for those tools when working on projects with what I consider inferior development tooling.



### About the app we’re building

We’ll be building a simple polling progressive web application. Authenticated users will be able to create a poll with some options that they, in turn, can share with a generated link. Users visiting that link can then choose one of the options and have their selection reflected in the results at real time.

#### **The Front-end Stack**

- [**Gatsby.js**](https://www.gatsbyjs.org/): Gatsby makes use of React.js’ server-side rendering capabilities to generate markup at build time. Though not covered in depth in this tutorial, it also enables developers to fetch data from any data source and declaratively pull that data into their components using GraphQL so that the components can be data-hydrated at build time. To get a better idea of all of Gatsby.js’ capabilities, check out [this link](https://www.gatsbyjs.org/features/).
- [**Firebase firestore**](https://firebase.google.com/products/firestore/): A noSQL cloud database that exposes event listeners for real-time updates whenever data changes via an intuitive and easy to use web SDK.
- [**Firebase auth**](https://firebase.google.com/products/auth/): Also is included in the Firebase web SDK. Firebase auth can be used to authenticate users via OAuth 2. The SDK handles all of the nitty gritty implementation details of OAuth2 authentication for you.
- [**Netlify**](https://www.netlify.com/): Netlify is a global CDN that makes continuous deployments as simple as a few clicks. Deploying with Netlify is as easy as it comes.
- [**Styled-components**](https://www.styled-components.com/): A react-specific css-in-js solution. This is just one of many css-in-js solutions out there. Another library worth mentioning is [Glamorous](https://github.com/paypal/glamorous). I just prefer styled-components.
- [**Prettier**](https://prettier.io/): An opinionated code formatter.
- [**ESLint**](https://eslint.org/): Javascript linting.



> All tools used in this tutorial are free or have an incredibly generous free tier, so feel free to follow along.



------



### **Project Setup**

Let’s get started! Install **gatsby-cli** globally, then run **gatsby new polling-app** and initialize **git** inside the new directory.

> Gatsby.js requires node v4.0.0 plus, before continuing, check your version of Node by running **node -v** in your terminal of choice. I’d recommend installing, at least, the latest version of Node LTS found [**here**](https://nodejs.org/en/).

```
npm install --global gatsby-cli && gatsby new polling-app && cd polling-app && git init
```

> I won’t be covering any git workflows in this tutorial, however, at the end of part 2 of this tutorial we’ll set up Netlify with git for continuous deployments.

After all of those dependancies get installed, we’ll set up ESLint. I generally like to install [**Airbnb’s ESLint config**](https://www.npmjs.com/package/eslint-config-airbnb), then just override the rules I don’t like. Install Airbnb’s config and peer dependencies. If you’re on Linux/OSX, just copy and paste this script into your terminal that’s in the project directory:

```
(
  export PKG=eslint-config-airbnb;
  npm info "$PKG@latest" peerDependencies --json | command sed 's/[\{\},]//g ; s/: /@/g' | xargs npm install --save-dev "$PKG@latest"
)
```

> If you’re on windows, head over to Airbnb’s ESLint config repository linked above and there will be directions on how to get those dependancies installed.

Install other ESLint peer-dependancies as well as prettier:

```
yarn add -D babel-eslint eslint-config-react eslint-config-prettier eslint-plugin-prettier prettier
```

> **-D** specifies that these are development dependencies.

Add a **.eslintrc** file to the root of your project and paste in these rules. Anything you don’t like, you can just override under **rules**:

```javascript
{
  "extends": ["airbnb", "prettier", "prettier/react"],
  "rules": {
    "react/jsx-filename-extension": [
      "error",
      { "extensions": [".js", ".jsx"] }
    ],
    "react/react-in-jsx-scope": 0,
    "react/require-default-props": 0,
    "react/forbid-prop-types": 1,
    "react/no-did-mount-set-state": 0,
    "react/prefer-stateless-function": 1,
    "react/jsx-uses-vars": [2],
    "jsx-a11y/anchor-is-valid": 0,
    "no-underscore-dangle": 0,
    "arrow-body-style": 0,
    "no-shadow": 0,
    "consistent-return": 0,
    "no-nested-ternary": 0,
    "no-console": 1,
    "no-case-declarations": 0,
    "import/prefer-default-export": 0
  },
  "settings": {
    "import/core-modules": ["react", "prop-types", "react-router-dom"]
  },
  "globals": {
    "graphql": true
  },
  "plugins": ["prettier"],
  "parser": "babel-eslint",
  "parserOptions": {
    "ecmaVersion": 2017,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "env": {
    "es6": true,
    "browser": true,
    "node": true
  }
}
```







Do the same for **.prettierrc** file:



```javascript
{
  "printWidth": 80,
  "singleQuote": true,
  "trailingComma": "all",
  "write": "src/**/*.js",
  "jsxBracketSameLine": true
}
```



Go to your **package.json** and replace the **format** script and add a **lint** script under the “**scripts**” property.

```
"format": "prettier --write \"src/**/*.{js,jsx}\"",
"lint": "eslint **/*.{js,jsx} --quiet",
```

> the **— quiet** flag specifies that only errors are to be reported, not warnings. This is optional.

By default, prettier will check for a **.prettierrc** file in the root of the project and use those rules. Give that *format* script a spin!

```
npm run format
```
you should see something like this (auto-formatting)

![img](https://cdn-images-1.medium.com/max/1600/1*v--OovoORi-EG1kek_GNJA.gif)

prettier formatting

> **[Optional]:** For a better development experience, I’d suggest installing the plugins for [**ESLint**](https://eslint.org/docs/user-guide/integrations) and [**Prettier**](https://prettier.io/docs/en/editors.html)[ ](http://dsd/)for your IDE/Code editor.



------



### **Tidbit on Gatsby.js**

#### Directory structure

Let’s cover the directory structure generated by gatsby-cli.

- **./src/pages/:** is a required directory. *./src/pages/index.js* corresponds to the root path of the website. So the component defined in *index.js* is rendered on *www.mysite.com/*. The only other file that has a predefined name is **404.js**. This page is rendered anytime a user navigates to a page that does not exist. All other files in this directory have their filenames corresponding to the site’s path. *./src/pages/***page-2***.js* can be found in [*localhost:8000/***page-2***/*](http://localhost:8000/page-2/). Nested paths can be created by adding a sub-directory inside *./src/pages/*. For example *./src/pages/polls/***new***.js* would be generated as this route *www.mysite.com/polls/***new**. In my opinion, this API is intuitive and works great for most cases.
- **./src/layouts/:** Files here are optional, but they do have a specific purpose as defined by Gatsby. To keep things simple, we’re only concerned with *./src/layouts/index.js* in this tutorial. This file is wrapped around **all** page components inside *./src/pages*. This would be the place to insert your Header and Footer components assuming **all** of your pages use that header and footer.
- **./src/components/:** This is where you place your custom components and how you structure this directory is up to you. Technically, your components don’t even have to be in this directory, but this is the usual convention. I use this directory for my stateless functional components.

#### **Plugins**

Gatsby has quite a bit of official and community plugins that make integrating many common tools or libraries a breeze. You can find plugins you’re looking for and read up about their plugin system [here](https://www.gatsbyjs.org/docs/plugins/#plugins). One of which is [*gatsby-plugin-styled-components*](https://www.gatsbyjs.org/packages/gatsby-plugin-styled-components/). Let’s look into how to add a plugin to a Gatsby project.

Install *gatsby-plugin-styled-components* as well as *styled-components*:

```
yarn add gatsby-plugin-styled-components styled-components
```

Once installed, open up *gatsby-config.js* in the root of your project. As you can see we already have a plugin being used. *gatsby-plugin-react-helmet* is added by gatsby-cli’s default starter. Add *gatsby-plugin-styled-components* as another item in the **plugins** array. While we’re at it, update *siteMetadata.title* to our site’s title; something creative and original — like “Polling App”.

> Whenever adding plugins you may have to restart your development server.

```
./gatsby-config.js
module.exports = {
  siteMetadata: {
    title: 'Polling App',
  },
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-styled-components'
  ],
};
```

> For these two particular plugins, the order does not matter. However, be aware there are some plugins that need to be placed before or after other plugins. Just whenever adding a plugin, be sure to read the documentation, otherwise, you might get some unexpected behavior.



------



### **Getting our hands dirty**

Let’s actually write some code! Start the development server by running **gatsby develop**. Then head over to <http://localhost:8000/>. We’re going to build out the landing page for our site. Go ahead and delete **./src/pages/page-2.js** assuming your version of gatsby-cli generated that file, we won’t be needing it. Also, delete the *<Link>* component and comment out its *import* (we’ll use it later) to shut ESLint up in **./pages/index.js** as the page it links to no longer exists.

We’re keeping **./src/layouts/index.css***.* I think it has some sensible CSS resets.

#### Styled-components

Next, let’s modify the *Header.js* component a bit. Change the Header title from Gatsby to our site title *Polling App*. Now let’s move the inline styles to be instead handled by *styled-components*. Your Header file should now look like this:

```jsx
// ./src/components/Header/index.js
import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const HeaderContainer = styled.header`
  ${props => props.background};
  margin-bottom: 1.45rem;
`

const HeaderWrapper = styled.div`
  margin: 0 auto;
  max-width: 960px;
  padding: 1.45rem 1.0875rem;
`

const Heading1 = styled.h1`
  margin: 0;
`

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
`

const BACKGROUND = 'background-color: #20232a'

const Header = ({ background, siteTitle }) => (
  <HeaderContainer background={background}>
    <HeaderWrapper>
      <Heading1>
        <StyledLink to="/">{siteTitle}</StyledLink>
      </Heading1>
    </HeaderWrapper>
  </HeaderContainer>
)

Header.defaultProps = {
  background: BACKGROUND,
  siteTitle: 'Polling App',
}

Header.propTypes = {
  background: PropTypes.string,
  siteTitle: PropTypes.string,
}

export default Header

```





A couple things to note here:

1. The weird opening and closing back-ticks (**``**) after **styled**. These are just [**template literals**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals)**;** yes, the same ones used for string interpolation, just being used in a bit of a lesser known way. It enables front-end developers to use actual CSS property names as opposed to their camelCase counterparts required by javascript.

2. Because of this uncommon use of template literals, most IDEs and code editors do not have built-in syntax highlighting for the CSS defined inside the template literal strings. [Here’s a link](https://www.styled-components.com/docs/tooling#syntax-highlighting) where can check if your favorite editor has a syntax highlighting plugin for styled-components.

3. The **styled(Link)** component: this is a higher order function that passes a generated hashed *className* prop to the wrapped component for the styles defined within the template literals. This can work with any 3rd party component so long as the wrapped component passes *props.className* to a child DOM element.

4. The **background** prop being passed to the *HeaderContainer* styled-component. This is what makes styled-components powerful. It allows you to pass in dynamic data to your components’ styles giving you flexibility with your styling that you otherwise wouldn’t have with regular CSS files.

Another thing to note is the styled-component we defined as *HeaderWrapper* has almost the exact same styles as the element wrapping *props.children()*inside *./src/layouts/index.js*. This is an opportunity to keep our code dry. 

Create a directory called *styledComponents* inside the *./src/* directory. A convention I follow with styled-components is anytime I have a styled-component that is reusable, I extract it into its own file inside *./src/styledComponents/*.

Since this styled-component is being used for layout, let’s put it in a file called *layout.js* . I think an appropriate name for this specific styled-component is *Container*. Cut the *HeaderWrapper* declaration and paste it into *./src/styledComponents/layout.js*, rename it to **Container**, and export it:

```
// ./src/styledComponents/layout.js
import styled from 'styled-components';
export const Container = styled.div`
  margin: 0 auto;
  max-width: 960px;
  padding: 1.45rem 1.0875rem;
`;
```

> Don’t wrap styled-components defined here in a function as you might with a stateless functional component in *./src/components/*. You’ll see why in a bit.

In *./src/components/Header/index.js* import the newly created *Container* styled-component and replace the *HeaderWrapper* styled-component with it.

```
// ./src/components/Header/index.js
import { Container } from '../../styledComponents/layout';
...
const Header = ({ background }) => (
  <HeaderContainer background={background}>
    <Container>
      <Heading1>
        <StyledLink to="/">Polling App</StyledLink>
      </Heading1>
    </Container>
  </HeaderContainer>
);
...
```

Now, head over to *./src/layouts/index.js* and import that *Container* styled-component we just defined from the *stylesComponents/layout.js* file. Notice that the *<div>* with the inline styles has **almost** the same styles as our *Container* component. 

The difference being it has a *paddingTop: 0* rule set. Our *Container* component, however, defines *padding-top* with *1.45rem*. We’ll override that *padding-top* with a handy helper method defined on all styled-components **.extend**.

 *.extend*… well extends the CSS defined on a component allowing you to define a base set of styles on a component, then, whenever necessary, extend those rules.

> This is why we don’t wrap component in the *./src/styledComponents* directory with a function. Doing so would cause all the helper methods to no longer be accessible on the component we’re importing.

While we’re at it, let’s spruce up that boring *Header* background-color! 

*(Shameless plug time)* — Head over to [www.grabient.com](http://www.grabient.com/) and grab yourself a gradient, be sure to untick *prefixes* as styled-components already handles all vendor prefixes for you. Pass the gradient of your choice that should be copied into your clipboard as a **background** prop that we defined inside our *Header* component earlier.



```jsx
// ./src/layouts/index.js
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import Header from '../components/Header';
import { Container as BaseContainerStyles } from '../styledComponents/layout';

import './index.css';

const Container = BaseContainerStyles.extend`
  padding-top: 0;
`;

const TemplateWrapper = ({ children }) => (
  <div>
    <Helmet
      title="Polling App"
      meta={[
        { name: 'description', content: 'Sample' },
        { name: 'keywords', content: 'sample, something' },
      ]}
    />
    <Header background="background-image: linear-gradient(116deg, #08AEEA 0%, #2AF598 100%)" />
    <Container>{children()}</Container>
  </div>
);

TemplateWrapper.propTypes = {
  children: PropTypes.func,
};

export default TemplateWrapper;
```



#### Pulling data into components using GraphQL

Notice the **title** prop we’re passing to *<Helmet>, r*ecall that its value is the same value as **siteMetadata.title** defined in *./gatsby-config.js.* Let’s reuse that value as our site’s title so that if in the future we change the title of our PWA, we only have to do so in one place. To accomplish this, we’ll make use of the **graphql** function gatsby globally exposes so that developers can pull data declaratively into our components at build-time. We won’t be covering GraphQL today, however, if you’re interested in learning more, [here’s an awesome resource](http://graphql.org/learn/).

Let’s update the *./src/layouts/index.js* file once again:

```jsx
// ./src/layouts/index.js
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

import Header from '../components/Header';
import { Container as BaseContainerStyles } from '../styledComponents/layout';

import './index.css';

const Container = BaseContainerStyles.extend`
  padding-top: 0;
`;

const TemplateWrapper = ({ children, data }) => (
  <div>
    <Helmet
      title={data.site.siteMetadata.title}
      meta={[
        { name: 'description', content: 'Sample' },
        { name: 'keywords', content: 'sample, something' },
      ]}
    />
    <Header
      background="background-image: linear-gradient(116deg, #08AEEA 0%, #2AF598 100%)"
      title={data.site.siteMetadata.title}
    />
    <Container>{children()}</Container>
  </div>
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





> note that the **graphql** function also makes use of template literal invocations to define queries and mutations.

Test it out! Watch that Gatsby.js magic update the site title as well as the *Header*when you save the *./gatsby-config.js* with an updated title. Things like this are the reason why I love developing with Gatsby and other projects that utilize Webpack.



## Fork - Use the new graphql hook

Instead of pulling site metadata as above you should instead use the new `useStaticQuery` react hook.

Read about it [here](https://www.gatsbyjs.org/docs/use-static-query/)

First lets update the site metadata in `gatsby-config.js`

```javascript
  siteMetadata: {
    title: `Polling App`,
    slogan: 'Taking the pulse of the world!',
    description: `Gatsby Firebase Polling App Deom`,
    author: `@gatsbyjs`,
    siteUrl: 'https://www.google.com',
    image: 'some src',
    video: 'some src',
    twitter: 'some twitter handle',
    logo: 'some src',
  },
```

Next create a component using `useStaticuery`

@ hooks/use-site-metadata.js

```jsx
import { useStaticQuery, graphql } from 'gatsby'

export const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SiteMetaData {
        site {
          siteMetadata {
            title
            slogan
            description
            author
            siteUrl
            image
            video
            twitter
            logo
          }
        }
      }
    `,
  )
  return site.siteMetadata
}

```

Now use the data

@ index.js

```jsx
import React from 'react'
// import { Link } from 'gatsby'

import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'
import { useSiteMetadata } from '../hooks/use-site-metadata'

function IndexPage() {
  const { title } = useSiteMetadata()
  return (
    <Layout>
      <SEO title={title} keywords={[`gatsby`, `application`, `react`]} />
      <h1>{title}</h1>
      <p>Welcome to your new Gatsby site.</p>
      <p>Now go build something great.</p>
      <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
        <Image />
      </div>
    </Layout>
  )
}

export default IndexPage

```



and @ components/layout.js

```jsx
import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import styled from 'styled-components'

import Header from './Header'
import { Container as BaseContainerStyles } from '../styledComponents/layout'
import { useSiteMetadata } from '../hooks/use-site-metadata'

import './layout.css'

const Container = styled(BaseContainerStyles)`
  padding-top: 0;
`

function TemplateWrapper({ children }) {
  const { title } = useSiteMetadata()
  return (
    <div>
      <Helmet
        title={title}
        meta={[
          { name: 'description', content: 'Sample' },
          { name: 'keywords', content: 'sample, something' },
        ]}
      />
      <Header
        background="background-image: linear-gradient(116deg, #08AEEA 0%, #2AF598 100%)"
        siteTitle={title}
      />
      {/* <Container>{children()}</Container> */}
      <Container>{children}</Container>
    </div>
  )
}

TemplateWrapper.propTypes = {
  children: PropTypes.func,
}

export default TemplateWrapper

```



#### The Index Page

Now let’s create the landing page for our polling app. We’ll add some content that’ll really sell our polling application, after all, it’s going to be way better than anything out there already. We’ll also need a button for creating a poll.

> From now on I’m not going to focus as much on *styled-components* or styling at all for that matter, I feel like I’ve shown you enough to give you an idea of what *styled-components* is capable of. To find out more head over to the styled-components website found [here](https://www.styled-components.com/).

Add a *Button* component to a new file in *./src/styledComponents/* called *theme.js*:

```jsx
// ./src/styledComponents/theme.js
import styled from 'styled-components'

export const Button = styled.button`
  padding: 5px 25px;
  background-image: linear-gradient(116deg, #08aeea 0%, #2af598 100%);
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  border: none;
  font-family: sans-serif;
  filter: hue-rotate(0deg);
  transition: filter 300ms linear;
  cursor: pointer;
  &:focus,
  &:hover {
    filter: hue-rotate(45deg);
  }
`

```









I also suspect we’ll reuse the *Heading2* component located inside the index page. Let’s create a file *typography.js* inside *./src/styledComponents/*:

```jsx
// ./src/styledComponents/typography.js
import styled from 'styled-components';

export const Heading2 = styled.h2`
  text-transform: capitalize;
`;
```



Now update the *index.js page* in *./src/pages/:*

```jsx
import React from 'react'
import { Link } from 'gatsby'

import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'
import { useSiteMetadata } from '../hooks/use-site-metadata'

import { Button } from '../styledComponents/theme'
import { Heading2 } from '../styledComponents/typography'

function IndexPage() {
  const { title } = useSiteMetadata()
  return (
    <Layout>
      <SEO title={title} keywords={[`gatsby`, `application`, `react`]} />
      <h1>{title}</h1>
      <Heading2>A next-generation polling application</Heading2>
      <p>
        Built from the ground up - Ut pariatur velit eu fugiat ut. Veniam
        commodo non esse proident ut anim irure voluptate commodo aliqua tempor
        Lorem excepteur cupidatat. Nulla commodo ex laboris eu sit nisi
        exercitation dolore labore qui elit non Lorem minim. Voluptate pariatur
        anim esse irure ipsum ut pariatur. Mollit occaecat velit occaecat sint
        pariatur tempor. Consectetur culpa tempor dolore amet officia dolore
        nulla nisi sunt ea.
      </p>
      <Link to="/new">
        <Button>New Poll</Button>
      </Link>
      <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
        <Image />
      </div>
    </Layout>
  )
}

export default IndexPage

```



#### **The NewPoll Page**

Let’s go ahead and install a few dependencies we’ll need.

```
yarn add react-sortable-hoc short-id
```

> You may have to restart your gatsby server after installing these dependancies.

We’ll use *short-id* to generate ids for each new option added and eventually the id for each poll. *react-sortable-hoc* will be used so that the creator of a poll can change the order of his poll options if he so chooses.

Create a new *index.js* file inside *./src/components/NewPoll/:*

```jsx
// ./src/components/NewPoll/index.js
import React from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

const OptionsContainer = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 30px;
`;

const OptionItemContainer = styled.li`
  border-bottom: 1px solid #ddd;
  padding: 10px 60px 10px 20px;
  margin: 0 0 10px;
  background-color: #f5f5f5;
  list-style: none;
  position: relative;
  min-height: 36px;
`;

const OptionInputItem = styled.input`
  border: none;
  background-color: inherit;
  width: 100%;
`;

const ActionItem = styled.div`
  position: absolute;
  right: ${props => (props.right ? `${props.right}px` : '10px')};
  top: 50%;
  transform: translateY(-50%);
  cursor: ${props => (props.editing ? 'pointer' : 'move')};
`;

const DragHandle = SortableHandle(() => <ActionItem>:::</ActionItem>);

const SortableItem = SortableElement(
  ({ text, id, onToggleEdit, onKeyDown, onTextChange, onDelete, editing }) => (
    <OptionItemContainer
      key={id}
      onDoubleClick={() => !editing && onToggleEdit(id)}
      onBlur={() => onToggleEdit(id)}>
      {editing ? (
        <OptionInputItem
          autoFocus
          value={text}
          onChange={e => onTextChange(e, id)}
          onKeyDown={onKeyDown}
        />
      ) : (
        text
      )}
      <ActionItem
        editing
        onClick={() => onDelete(id)}
        right={40}
        title="Delete">
        x
      </ActionItem>
      <DragHandle />
    </OptionItemContainer>
  ),
);

const SortableList = SortableContainer(({ options, ...props }) => {
  return (
    <OptionsContainer>
      {options.filter(Boolean).map((option, index) => {
        return (
          <SortableItem {...option} {...props} index={index} key={option.id} />
        );
      })}
    </OptionsContainer>
  );
});

const NewPoll = props => (
  <SortableList {...props} lockAxis="y" useDragHandle lockToContainerEdges />
);

NewPoll.propTypes = {
  options: PropTypes.arrayOf(PropTypes.object).isRequired,
  onToggleEdit: PropTypes.func.isRequired,
  onTextChange: PropTypes.func.isRequired,
  onKeyDown: PropTypes.func.isRequired,
  onSortEnd: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
};

export default NewPoll;
```



To get things working, add a *new.js* page in *./src/pages/* that acts as the container to this component.

```jsx
// ./src/pages/new.js
import React, { Component } from 'react';
import styled from 'styled-components';
import Link from 'gatsby-link';
import { arrayMove } from 'react-sortable-hoc';
import shortId from 'short-id';

import { Button } from '../styledComponents/theme';
import { Heading2 } from '../styledComponents/typography';
import NewPoll from '../components/NewPoll/index';

const CreateButton = styled(Button)`
  background-image: linear-gradient(19deg, #21d4fd 0%, #b721ff 100%);
  margin-left: 20px;
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

class NewPollPage extends Component {
  state = {
    options: [
      {
        text: 'option1',
        id: '123avcs232',
        editing: false,
      },
      {
        text: 'option2',
        id: '123av35df2',
        editing: false,
      },
      {
        text: 'option3',
        id: '12323dsdsv35df2',
        editing: false,
      },
      {
        text: 'option4',
        id: 'ac24312v35df2',
        editing: false,
      },
    ],
  };
  // to keep track of what item is being edited
  editing = null;

  handleKeydown = e => {
    if (e.which === 27) this.handleToggleEdit(this.editing);
    if (e.which === 13) this.handleAddItem();
  };

  handleToggleEdit = id => {
    this.setState(prevState => {
      const options = prevState.options
        .filter(({ text }) => text)
        .map(option => {
          if (option.id === id) {
            if (!option.editing) {
              this.editing = id;
            } else {
              this.editing = null;
            }

            return {
              ...option,
              editing: !option.editing,
            };
          }

          return {
            ...option,
            editing: false,
          };
        });

      return {
        ...prevState,
        options,
      };
    });
  };

  handleTextChange = (e, id) => {
    const options = this.state.options.map(option => {
      if (option.id === id) {
        return {
          ...option,
          text: e.target.value,
        };
      }

      return option;
    });

    this.setState({
      ...this.state,
      options,
    });
  };

  handleSortEnd = ({ oldIndex, newIndex }) => {
    this.setState({
      ...this.state,
      options: arrayMove(this.state.options, oldIndex, newIndex),
    });
  };

  handleAddItem = () => {
    // if the user spams add w/o writing any text the items w/o any text get removed
    const options = this.state.options
      // filter out any falsy values from the list
      .filter(Boolean)
      .filter(({ text }) => text)
      .map(option => ({
        ...option,
        editing: false,
      }));
    const id = shortId.generate();
    this.editing = id;

    this.setState({
      ...this.state,
      options: [
        ...options,
        {
          id,
          text: '',
          editing: true,
        },
      ],
    });
  };

  handleDelete = id => {
    const options = this.state.options.filter(option => option.id !== id);

    this.setState({
      ...this.state,
      options,
    });
  };

  render() {
    const { options } = this.state;

    return (
      <div>
        <Heading2>Create a new Poll</Heading2>
        <NewPoll
          options={options}
          onToggleEdit={this.handleToggleEdit}
          onTextChange={this.handleTextChange}
          onKeyDown={this.handleKeydown}
          onSortEnd={this.handleSortEnd}
          onDelete={this.handleDelete}
        />
        <ActionContainer>
          <Link to="/new">
            <Button>Create</Button>
          </Link>
          <CreateButton onClick={this.handleAddItem}>Add</CreateButton>
        </ActionContainer>
      </div>
    );
  }
}

export default NewPollPage;
```



Head over to <http://localhost:8000/new> by clicking the New Poll button and checkout the *new* poll page functionality. In reality, all we’ve got here is a basic to-do app with some client-side CRUD operations. But we’ve made some really good progress towards the final product!

- the user can **create** a new option by clicking the **add** button or hitting the **enter** key when inputting text.
- they can **update** an existing option by double clicking an option and editing the text or change its position by clicking, holding, and dragging the drag handle.
- they can **delete** an option by clicking the **x.**

**If you liked it Clap it up!**

That concludes **Part 1** of this tutorial. In the next part, we’ll build out the poll page, set up Firebase authentication and Firestore, deploy our app with Netlify, and finally run some [lighthouse](https://developers.google.com/web/tools/lighthouse/) tests to see how we score on a 0 to 100 scale to determine if what we’ve created and be considered a progressive web application. That all sounds like quite a bit, but I think you’ll all be pleasantly surprised by just how easy these tasks are thanks to the tools we’re making use of.

Be sure to follow us for more blogs every Monday and Tuesday! We’ll have **Part 2 ** out for you in no time. See ya!

**John Korzhuk** *is a software developer and proud Unicorn. He specializes in full-stack javascript, React.js, and web development. Outside of work his interests include gaming, esports, and learning about anything that he finds interesting. You can find on twitter* [*@johnkorzhuk*](https://twitter.com/johnkorzhuk/)*.*

### Want to build magical experiences together? Contact us!

**E-mail:** adam-leonard@unicornagency.com

**Twitter:** [@UnicornHQ](http://www.twitter.com/unicornHQ)

**Website:** [http://www.unicornagency.com](http://www.unicornagency.com/)