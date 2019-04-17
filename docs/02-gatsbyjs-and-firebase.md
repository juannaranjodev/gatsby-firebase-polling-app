# Setting up Firebase

[Unicorn Agency](https://medium.com/@UnicornAgency)Apr 17, 2018

Welcome back! This is the second part of a three-part tutorial where we go through and build a PWA from scratch that utilizes a powerful architecture pattern called the **.** You can find the blog post covering part 1 **.** 

*I’d suggest reading through part 1 first as we’ll be jumping straight into from where we left off.*

> You can find the repository for part 1 , if you’d prefer to start fresh from where we left off. The completed code for part can be found .

Let’s get Firestore and authentication setup. As mentioned in the last post, firebase has a generous free tier, so do follow along as this step will be required to get the app working. Head over to [console.firebase.google.com](https://console.firebase.google.com/) then add and create a new project called “Polling-app”. In the sidebar, under *Develop* click **Database** and select **Cloud Firestore Beta**.

> At the time of writing this blog Cloud Firestore is still in Beta.

Select “*Start in* **test mode**”. Starting in test mode sets all read and write authorization rules for all users to true; authenticated or not. This is convenient for development, however, when it comes time to deploy your app. don’t forget to go back and update these rules. Hit “*Enable*”. Now go to **Authentication** in the sidebar and click **Set up sign-in method***.* Enable both **Google** and **Anonymous**and hit save for both. We’ve enabled *Anonymous* authentication because we want to keep track of a non-authenticated user’s poll option selections so that, amongst other reasons, upon revisiting a poll, their selection will be saved. Keep in mind this by no means is a fool-proof way of making sure there won’t be any duplicate votes.

### Adding Authentication

With authentication set up in the firebase console, let’s set up the accompanying UI and functionality.

#### More directory structure convention

Create two new directories inside **./src/** called **services** and **containers.** The *services* directory encapsulate modules that reach out to third party APIs. Inside these modules is code that pertains specifically to that service. In the case of firebase and our application: initialization code and a very thin abstraction layer on top of some of the firebase methods for convenience.

I use the c*ontainers* directory for React components that encapsulate side-effects, functionality, and state. Container components are usually where we’d be making use of our services. I follow this pattern so that inevitably when bugs do arise, I’ve got a solid basis for trouble shooting. If you recall from [part 1](https://medium.com/@UnicornAgency/jamstack-pwa-lets-build-a-polling-app-with-gatsby-js-firebase-and-styled-components-pt-1-78a03a633092), I mentioned the *components* directory should only include [stateless functional components](https://hackernoon.com/react-stateless-functional-components-nine-wins-you-might-have-overlooked-997b0d933dbc). By following this pattern, you can be confident with a high degree of certainty that any bugs, outside of incorrect syntax, will not originate from your stateless functional components.

> I sometimes treat components in the **./src/pages/** directory as container components so long as the functionality and state they encapsulate is specific to that page. However, it wouldn’t hurt to keep them as stateless functional components and abstract functionality and state into a container.

#### Initializing firebase

Create a **firebase.js** file in the *services* directory and install **firebase.**

```
npm install -D firebase
```

To get your initialization keys head back over to the firebase console and next to**Project Overview** click the settings icon then **Project Settings**. Under *Your apps* click **Add Firebase to your web app.** These keys will exist in your client-side code; this does not pose any security risks so long as you’ve set the aforementioned authorization rules. Copy the config object’s properties over to the config object defined in *./src/services/firebase.js.*

```jsx

// ./src/services/firebase.js
import firebase from "firebase"
import "firebase/firestore"

const config = {
// apiKey: ,
// authDomain: ,
// databaseURL: ,
// projectId: ,
// storageBucket: ,
// messagingSenderId: ,
}

class Firebase {
  constructor() {
    firebase.initializeApp(config);
    this.store = firebase.firestore;
    this.auth = firebase.auth;
  }

  get polls() {
    return this.store().collection('polls');
  }
}

export default new Firebase();
view rawfirebase.js hosted with ❤ by GitHub
```



#### The Auth Container

This component will contain all of our authentication state, methods, and a listener for the user’s authentication state changes. We’ll make use of render props to share state and functionality since HOCs are like so 2017. Create a new container called *Auth.js.*

```jsx
import React from 'react';
import PropTypes from 'prop-types';

const INITIAL_STATE = {
  uid: '',
  isAnonymous: null,
  // // some other properties from the user object that may be useful
  // email: '',
  // displayName: '',
  // photoURL: '',
};

class Auth extends React.Component {
  static propTypes = {
    children: PropTypes.func.isRequired,
  };

  static contextTypes = {
    firebase: PropTypes.object,
  };

  state = INITIAL_STATE;

  componentDidMount() {
    const { auth } = this.context.firebase;
    // onAuthStateChanged returns an unsubscribe method
    this.stopAuthListener = auth().onAuthStateChanged(user => {
      if (user) {
        // if user exists sign-in!
        this.signIn(user);
      } else {
        // otherwise sign-out!
        this.signOut();
      }
    });
  }

  componentWillUnmount() {
    this.stopAuthListener();
  }

  handleSignIn = provider => {
    const { auth } = this.context.firebase;

    switch (provider) {
      // the auth listener will handle the success cases
      case 'google':
        return auth()
          .signInWithPopup(new auth.GoogleAuthProvider())
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error(error);
            // TODO: notify the user of the error
            return error;
          });

      case 'anonymous':
        return auth()
          .signInAnonymously()
          .catch(error => {
            // eslint-disable-next-line no-console
            console.error(error);
            // TODO: notify the user of the error
            return error;
          });

      default:
        const reason = 'Invalid provider passed to signIn method';
        // eslint-disable-next-line no-console
        console.error(reason);
        return Promise.reject(reason);
    }
  };

  handleSignOut = () => {
    const { auth } = this.context.firebase;

    return auth().signOut();
  };

  signIn(user) {
    const { uid, isAnonymous } = user;

    this.setState({
      uid,
      isAnonymous,
    });
  }

  signOut() {
    this.setState(INITIAL_STATE);
  }

  render() {
    // If uid doesn't exist in state, the user is not signed in.
    // A uid will exist if the user is signed in anonymously.
    // We'll consider anonymous users as unauthed for this variable.
    const isAuthed = !!(this.state.uid && !this.state.isAnonymous);

    return this.props.children({
      ...this.state,
      signIn: this.handleSignIn,
      signOut: this.handleSignOut,
      isAuthed,
    });
  }
}

export default Auth;
```



Notice that we’ve defined **contextTypes** on the component. We’ll be passing a reference to our **firebase** singleton exported from our *services* directory via *context*. Let’s define that provider in the containers directory and call it *FirebaseProvider.js.*

```jsx
// ./src/containers/FirebaseProvider.js
import React from 'react';
import PropTypes from 'prop-types';

class FirebaseProvider extends React.Component {
  static propTypes = {
    children: PropTypes.element,
    firebase: PropTypes.object.isRequired,
  };

  static childContextTypes = {
    firebase: PropTypes.object,
  };

  getChildContext() {
    const { firebase } = this.props;

    return {
      firebase,
    };
  }

  render() {
    const { children } = this.props;

    return children;
  }
}

export default FirebaseProvider;
```



Keep in mind as of writing this, the React context API has changed. This isn’t a huge concern as we’re using Gatsby 1.x in this tutorial which is locked in to React 15.x (look into [gatsby-plugin-react-next](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-react-next) to use the latest and greatest features from React). By extracting the code specific to the context API into their own components we‘ve made our upgrade path to React 16.x a bit more painless since the code is isolated in a handful of components.

#### Gatsby Browser APIs

We want to wrap our app with the firebase provider high up in the component tree so that if any child component needs a reference to the firebase object, they can get at it by defining *contextTypes***.**

A good place to do this would be in one of the browser APIs gatsby.js exposes. Specifically [**replaceRouterComponent**](https://www.gatsbyjs.org/docs/browser-apis/#replaceRouterComponent)**:** an exported method defined in .*/gatsby-browser.js* that lets you override the default routing behavior. We wont be using it for anything related to routing; but instead as a place to wrap the application with our provider. If not already created by the gatsby cli, create a file called *gatsby-browser.js* at the root of your project.



> This API is deprecated in Gatsby 2.0...

```jsx
// ./gatsby-browser.js
/* eslint-disable react/prop-types, import/no-extraneous-dependencies */
import React from 'react';
import { Router } from 'react-router-dom';
import FirebaseProvider from './src/containers/FirebaseProvider';

import firebase from './src/services/firebase';

exports.replaceRouterComponent = ({ history }) => {
  const ConnectedRouterWrapper = ({ children }) => (
    <FirebaseProvider firebase={firebase}>
      <Router history={history}>{children}</Router>
    </FirebaseProvider>
  );

  return ConnectedRouterWrapper;
};
```

> Try this from the upgrade path for Gatsby 2.0
>
> ```jsx
> // ./gatsby-browser.js
> import React from 'react'
> // import { Provider } from 'react-redux'
> // import { Router } from 'react-router-dom'
> import FirebaseProvider from './src/containers/FirebaseProvider';
> 
> import firebase from './src/services/firebase';
> 
> // export const replaceRouterComponent = ({ history }) => {
> export const wrapRootElement = ({ element }) => {
> //  const ConnectedRouterWrapper = ({ children }) => (
>   const ConnectedRootElement = (
>     <FirebaseProvider firebase={firebase}>
>       {element}
>     </FirebaseProvider>
>   )
> 
> //  return ConnectedRouterWrapper
>   return ConnectedRootElement
> }
> ```
>
> 





#### Sign-in/Sign-out buttons

Let’s create a few UI components for our sign-in/sign-out buttons. Starting out with a Google icon component defined in *./src/components/icons/Google.js:*

```jsx
// ./src/components/icons/Google.js
import React from 'react';

const Google = props => {
  return (
    <svg width="21" height="21" xmlns="http://www.w3.org/2000/svg" {...props}>
      <g fill="none" fillRule="evenodd">
        <path
          d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
          fill="#4285F4"
        />
        <path
          d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
          fill="#34A853"
        />
        <path
          d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
          fill="#FBBC05"
        />
        <path
          d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
          fill="#EA4335"
        />
        <path d="M0 0h18v18H0z" />
      </g>
    </svg>
  );
};

export default Google;
```



And a SignIn component in *./src/components/SignIn/index.js*:

```jsx
// ./src/components/SignIn/index.js
import React, { cloneElement } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';

const Container = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 5px 10px;
  color: rgba(0, 0, 0, 0.54);
  border: none;
  font-family: Roboto, sans-serif;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  transition: color 200ms linear;
  &:hover {
    color: rgba(0, 0, 0, 0.8);
  }
`;

const Signin = ({ onClick, icon, text }) => {
  return (
    <Container onClick={onClick}>
      {icon && cloneElement(icon)}
      <span>{text}</span>
    </Container>
  );
};

Signin.propTypes = {
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.element,
  text: PropTypes.string.isRequired,
};

export default Signin;
```



We’ll use the *SignIn* component in *./src/components/Header/index.js.* Let’s update that file:

```jsx
// ./src/components/Header/index.js
import React from 'react'
import { Link } from 'gatsby'
import styled from 'styled-components'
import PropTypes from 'prop-types'

import { Container } from '../../styledComponents/layout'
import SignIn from '../SignIn/index'
import GoogleIcon from '../Icons/Google'

const HeaderContainer = styled.header`
  ${props => props.background};
  margin-bottom: 1.45rem;
`

// const HeaderWrapper = styled.div`
//   margin: 0 auto;
//   max-width: 960px;
//   padding: 1.45rem 1.0875rem;
// `

const Heading1 = styled.h1`
  margin: 0;
`

const StyledLink = styled(Link)`
  color: white;
  text-decoration: none;
`

const StyledGoogleIcon = styled(GoogleIcon)`
  margin-right: 5px;
`

const BACKGROUND = 'background-color: #20232a'

const Header = ({ background, siteTitle, isAuthed, signIn, signOut }) => (
  <HeaderContainer background={background}>
    <Container>
      <Heading1>
        <StyledLink to="/">{siteTitle}</StyledLink>
      </Heading1>
      <SignIn
        onClick={() => (isAuthed ? signOut() : signIn('google'))}
        icon={isAuthed ? null : <StyledGoogleIcon />}
        text={isAuthed ? 'Sign Out' : 'Sign in with Google'}
      />
    </Container>
  </HeaderContainer>
)

Header.defaultProps = {
  background: BACKGROUND,
  siteTitle: 'Polling App',
}

Header.propTypes = {
  background: PropTypes.string,
  signIn: PropTypes.func.isRequired,
  signOut: PropTypes.func.isRequired,
  siteTitle: PropTypes.string,
  isAuthed: PropTypes.bool,
}

export default Header

```



To get everything working, the *Header* component expects some props from the *Auth* container component. In *./src/layouts/index.js*, let’s use our *Auth* component so that we can pass its state and methods as props to the components that need it.

```jsx
// ./src/layouts/index.js
import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

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
              { name: 'description', content: 'Sample' },
              { name: 'keywords', content: 'sample, something' },
            ]}
          />
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



This is where things break (even without the issue of .gatsby-browser.js ) The error states that children is not a function...

> Try...
>
> ```jsx
> import React from 'react'
> import PropTypes from 'prop-types'
> import Helmet from 'react-helmet'
> import styled from 'styled-components'
> 
> import Auth from '../containers/Auth'
> import Header from './Header'
> import { Container as BaseContainerStyles } from '../styledComponents/layout'
> import { useSiteMetadata } from '../hooks/use-site-metadata'
> 
> import './layout.css'
> 
> const Container = styled(BaseContainerStyles)`
>   padding-top: 0;
> `
> 
> function TemplateWrapper({ children, ...props }) {
>   const { title } = useSiteMetadata()
>   return (
>     <Auth>
>       {auth => {
>         return (
>           <div>
>             <Helmet
>               title={title}
>               meta={[
>                 { name: 'description', content: 'Sample' },
>                 { name: 'keywords', content: 'sample, something' },
>               ]}
>             />
>             <Header
>               background="background-image: linear-gradient(116deg, #08AEEA 0%, #2AF598 100%)"
>               title={title}
>               {...auth}
>             />
>             <Container {...props} {...auth}>
>               {children}
>             </Container>
>           </div>
>         )
>       }}
>     </Auth>
>   )
> }
> 
> TemplateWrapper.propTypes = {
>   children: PropTypes.node,
> }
> 
> export default TemplateWrapper
> 
> ```
>
> 



As you can see we are [spreading](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) the *auth* object that contains our authentication state and methods to the *Header* component as well as to the *children* function. By passing those object properties to *children(),* they can be accessed by any component defined in our *pages* directory. This is how we’ll share code between the *layouts* and *pages* components with Gatsby.js.

Authentication is done! You should now be able to sign-in and out using a google account.

> Problems:
>
> **1) the layout is not wrapping the new page.**
>
> This is because in gatsby 2.0 layouts are components and you need to employ them on a page by page basis.
>
> That may present an issue...
>
> **2) login issue**
>
> when I log in the google login window flashes past and the login button says I am logged in… is this becuase I logged in before and something is stored in a cookie
>
> Test by clearing cache...
>
> OK the signin window comes up and I can login or create an account.
>
> so apparently the login is working...



### Creating a poll

With authentication out of the way let’s finish up the *new* poll page.

```jsx
// ./src/pages/new.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { arrayMove } from 'react-sortable-hoc';
import shortId from 'short-id';

import { Button } from '../styledComponents/theme';
import { Heading2 } from '../styledComponents/typography';
import NewPoll from '../components/NewPoll/index';

const CreateButton = Button.extend`
  background-image: linear-gradient(19deg, #21d4fd 0%, #b721ff 100%);
  margin-left: 20px;
`;

const ActionContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const TitleContainer = styled.div`
  display: inline-flex;
  width: 350px;
  flex-direction: column;
  margin-bottom: 30px;
`;

const TitleLabel = styled.label`
  font-weight: bold;
`;

const TitleInput = styled.input`
  color: black;
  font-size: 18px;
`;

class NewPollPage extends Component {
  static contextTypes = {
    firebase: PropTypes.object,
  };

  static propTypes = {
    history: PropTypes.object.isRequired,
    uid: PropTypes.string,
    signIn: PropTypes.func.isRequired,
  };

  state = {
    title: '',
    options: [],
    loading: false,
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

  handleTitleChange = e => {
    const { value } = e.target;

    this.setState({
      title: value,
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
      .filter(({ text }) => !!text.trim())
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

  handleCreate = () => {
    const pollId = shortId.generate();
    const { signIn, uid } = this.props;

    this.setState({
      loading: true,
    });

    if (!uid) {
      // due to our database rules, we can't write unless a uid exists
      signIn('anonymous').then(() => {
        this.createPoll(pollId);
      });
    } else {
      this.createPoll(pollId);
    }
  };

  createPoll(pollId) {
    const { firebase } = this.context;
    const { options, title } = this.state;
    const { history } = this.props;

    firebase.polls
      .doc(pollId)
      .set({
        title,
        id: pollId,
        options: options.map(({ text, id }) => ({ text, optionId: id })),
      })
      .then(() => {
        this.setState({
          options: [],
          loading: false,
          title: '',
        });

        history.push(`/poll/${pollId}`);
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      });
  }

  render() {
    const { options, loading, title } = this.state;
    const optionsWithText = options.filter(({ text }) => !!text.trim());
    const disableCreate = !title || optionsWithText.length < 2 || loading;

    return (
      <div>
        <Heading2>Create a new Poll</Heading2>
        <TitleContainer>
          <TitleLabel htmlFor="newPollTitle">Title</TitleLabel>
          <TitleInput
            id="newPollTitle"
            value={title}
            onChange={this.handleTitleChange}
          />
        </TitleContainer>
        <NewPoll
          options={options}
          onToggleEdit={this.handleToggleEdit}
          onTextChange={this.handleTextChange}
          onKeyDown={this.handleKeydown}
          onSortEnd={this.handleSortEnd}
          onDelete={this.handleDelete}
        />
        <ActionContainer>
          <Button
            disabled={disableCreate}
            onClick={!disableCreate && this.handleCreate}>
            {loading ? 'Creating...' : 'Create'}
          </Button>

          <CreateButton
            disabled={loading}
            onClick={!loading && this.handleAddItem}>
            Add
          </CreateButton>
        </ActionContainer>
      </div>
    );
  }
}

export default NewPollPage;
```

> I am getting a complaint about how onClick events are handled so I have changed the above 
>
> ```jsx
>        <Button
>          disabled={disableCreate}
>          // onClick={!disableCreate && this.handleCreate}
>          onClick={!disableCreate ? this.handleCreate : undefined}>
>          {loading ? 'Creating...' : 'Create'}
>        </Button>
> 
>        <CreateButton
>          disabled={loading}
>          // onClick={!loading && this.handleAddItem}
>          onClick={!loading ? this.handleAddItem : undefined}>
>          Add
>        </CreateButton>
> ```
>



Deal breaker

> There is an issue with the architecture of this app
>
> The props from Auth are not being passed to the children
>
> `signIn` and `signOut` are not accessible where they are needed in the buttons on the create a poll page



We’ve changed several things to this page:

- added an input for the title of the poll the user is creating.
- we’ve hooked up the *Create* button to the method *handleCreate.*
- added *loading* state so that we can prevent the user from creating the poll multiple times or adding items to the poll after they’ve already created the poll.

Since we’ve wrapped our application with the *FirebaseProvider,* like the *Auth*container, we can give the component the ability to access the firebase object by defining **contextTypes**. In the *handleCreate* method we access it by referencing **this.context.firebase.** When *handleCreate* is invoked, it sets the *loading* state to true, gets the reference to the *polls* collection via the getter we’ve defined in *services*/*firebase.js,* creates a document in the *polls* firestore collection with an id generated by *short-id,* sets the relevant properties on that document, then makes the http request to save that document in the database.

> When using firestore, no http requests are made until we invoke **.then()** on the returned [Promise](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) from the **.set()** method. The same is true for **.get()** invocations.

From inside the **.then()**, we know that the document has been saved. So we reset the component’s state*,* then finally, we use the reference to the **history** object that’s accessible from props to automatically navigate the user to their newly created poll.

> I’m neglecting to handle error cases for the sake of time. This is absolutely something you shouldn’t do in a production ready application.

To finish up this page, let’s update our *Button* component in *theme.js* file located in *the styledComponents* directory to make use of the *disabled* props we’re now passing it:



```jsx
// ./src/styledComponents/theme.js
import styled from 'styled-components';

export const Button = styled.button`
  padding: 5px 25px;
  background-image: linear-gradient(116deg, #08aeea 0%, #2af598 100%);
  color: white;
  font-weight: bold;
  text-transform: uppercase;
  border: none;
  font-family: sans-serif;
  filter: ${({ disabled }) => disabled ? 'grayscale(1)' : 'hue-rotate(0deg)'};
  transition: filter 300ms linear;
  cursor: ${({ disabled }) => disabled ? 'not-allowed' : 'pointer'};
  &:focus,
  &:hover {
    filter: ${({ disabled }) => !disabled && 'hue-rotate(45deg)'};
  }
`;
```







### The poll page

By default Gatsby.js does not support dynamic routes with *route parameters*: the type of route we’re trying to use with our poll page. e.g *mysite.com***/poll/:pollId**. In order to accomplish this we need to add a plugin: [gatsby-plugin-create-client-paths](https://www.gatsbyjs.org/packages/gatsby-plugin-create-client-paths/?=client). What this will do is have Gatsby skip out on generating the markup for a specified route, effectively making that route’s page component behave like a single page application. In our case, in the plugins config, we’ll set the route **/poll/\***, to be handled by the client. Install the plugin and update *./gatsby-config*:

```
yarn add gatsby-plugin-create-client-paths
```

and 

```Javascript
// ./gatsby-config.js
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
  ],
};
```



Create a new a stateless functional component in *components/Poll/index.js:*



```jsx
// ./src/components/Poll/index.js
import React from 'react';
import PropTypes from 'prop-types';
import styled, { css } from 'styled-components';

import { Heading2 } from '../../styledComponents/typography';
import { Button } from '../../styledComponents/theme';

const Container = styled.section`
  margin-top: 50px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const OptionText = styled.span`
  flex: 10;
`;

const OptionResult = styled.div`
  padding-left: 10px;
  margin-left: 10px;
  flex: 1;
  font-weight: bold;
  height: 100%;
  text-align: center;
`;

// We could have split this component into two: OptionButton for when the user
// has yet to vote and OptionSelection for when the user has voted to clean
// up this component. I did it this way to show the versatility of styled-
// components.
const Option = styled(
  ({
    hasVoted,
    // destructure these next two props so that react
    // doesn't complain about unsupported html tag attributes
    // https://reactjs.org/warnings/unknown-prop.html
    selected,
    optionIsSelected,
    ...props
  }) => (hasVoted ? <div {...props} /> : <button {...props} />),
)`
  display: flex;
  align-items: center;
  font-family: Roboto, sans-serif;
  margin: 20px 0;
  background-color: white;
  border: none;
  padding: 10px 20px;
  box-shadow: 0 10px 20px
    ${({ selected }) =>
      selected ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.2)'};
  transition: transform 150ms linear, box-shadow 150ms linear,
    color 150ms linear;
  cursor: ${({ hasVoted }) => (hasVoted ? 'default' : 'pointer')};
  color: ${({ selected, optionIsSelected }) =>
    selected
      ? 'rgba(0, 0, 0, 0.8)'
      : optionIsSelected ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.6)'};
  ${({ hasVoted }) =>
    hasVoted
      ? css`
          &:hover,
          &:focus {
            color: rgba(0, 0, 0, 0.8);
          }
        `
      : css`
          &:hover,
          &:focus {
            transform: ${({ selected }) =>
              selected ? 'translateY(0)' : 'translateY(-3px)'};
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
            color: rgba(0, 0, 0, 0.8);
          }
        `};
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
  display: flex;
  justify-content: flex-end;
  width: 100%;
  min-height: 36px;
`;

const Poll = ({
  loading,
  options,
  title,
  selection,
  hasVoted,
  onSelectOption,
  onVote,
}) => {
  let optionsArray = Object.values(options);
  const renderOptions = !loading && optionsArray.length > 0;
  const renderVoteButton = renderOptions && !hasVoted;
  const voteIsDisabled = loading || !selection;
  const totalVotes = optionsArray.reduce((aggr, curr) => aggr + curr.votes, 0);

  if (hasVoted) {
    optionsArray = optionsArray.sort((a, b) => b.votes - a.votes);
  }

  return (
    <Container>
      <Heading2>{loading || !title ? 'loading...' : title}</Heading2>
      <div>
        {renderOptions &&
          optionsArray.map(option => {
            const id = option.optionId;
            const selected = id === selection;
            const perc = (option.votes / totalVotes * 100).toFixed(2) || 0;

            return (
              <Option
                key={id}
                selected={selected}
                hasVoted={hasVoted}
                optionIsSelected={!!selection}
                onClick={() => !hasVoted && onSelectOption(id)}>
                <OptionText>{option.text}</OptionText>
                {hasVoted &&
                  !isNaN(perc) && <OptionResult>{perc}%</OptionResult>}
              </Option>
            );
          })}
      </div>
      <ButtonContainer>
        {renderVoteButton && (
          <Button disabled={voteIsDisabled} onClick={!voteIsDisabled && onVote}>
            Vote
          </Button>
        )}
      </ButtonContainer>
    </Container>
  );
};

Poll.propTypes = {
  loading: PropTypes.bool.isRequired,
  options: PropTypes.object.isRequired,
  title: PropTypes.string.isRequired,
  selection: PropTypes.string.isRequired,
  hasVoted: PropTypes.bool.isRequired,
  onSelectOption: PropTypes.func.isRequired,
  onVote: PropTypes.func.isRequired,
};

export default Poll;
```



Then a container component for it*:*



```jsx
// ./src/containers/Poll.js
import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Poll from '../components/Poll/index';

class PollContainer extends Component {
  static contextTypes = {
    firebase: PropTypes.object,
  };

  static propTypes = {
    match: PropTypes.object.isRequired,
    history: PropTypes.object.isRequired,
    uid: PropTypes.string,
    signIn: PropTypes.func.isRequired,
  };

  state = {
    title: '',
    // options is a map with the optionId as the keys and
    // option data including results as the values
    options: {},
    loading: false,
    selection: '',
    hasVoted: false,
  };

  // pull the pollId from the route param, then fetch the poll
  componentDidMount() {
    const { history, match, uid } = this.props;

    if (match.params.pollId.length === 6) {
      if (uid) {
        this.checkVote(uid);
      }

      this.setState({
        loading: true,
      });

      this.poll
        .get()
        .then(doc => {
          if (doc.exists) {
            const { title, options } = doc.data();

            this.setState({
              loading: false,
              title,
              options: options.reduce((aggr, curr) => {
                return {
                  ...aggr,
                  [curr.optionId]: {
                    ...curr,
                    votes: 0,
                  },
                };
              }, {}),
            });
          } else {
            history.push('/404');
          }
        })
        .catch(error => {
          // eslint-disable-next-line no-console
          console.error(error);
          // TODO: notify the user of the error
        });
    } else {
      history.push('/404');
    }
  }

  // since we don't know when the user will be authenticated if ever,
  // we need to add checks here and sign in anonymously if not
  componentWillReceiveProps(nextProps) {
    const { uid } = this.props;
    const { uid: nextUid } = nextProps;

    if ((!uid && !nextUid) || (uid && !nextUid)) {
      this.signInAnonymously();
    } else {
      // a uid exists, check if the user has already voted
      this.checkVote(nextUid);
    }
  }

  componentWillUnmount() {
    if (this.stopResultListener) {
      this.stopResultListener();
    }
  }

  get poll() {
    const { firebase } = this.context;
    const { match } = this.props;

    return firebase.polls.doc(match.params.pollId);
  }

  get results() {
    // get the results sub-collection on the poll document
    return this.poll.collection('results');
  }

  handleSelectOption = id => {
    this.setState({
      selection: id,
    });
  };

  handleVote = () => {
    const { uid } = this.props;
    const { selection } = this.state;
    const vote = uid => {
      this.setState({
        loading: true,
      });

      // store the users vote in a sub-collection
      this.results
        .doc(uid)
        .set({
          optionId: selection,
          uid,
        })
        .then(() => {
          this.setState({
            loading: false,
            hasVoted: true,
          });

          this.startResultListener();
        });
    };
    // in the case a user votes and they've not been logged in
    if (!uid) {
      this.signInAnonymously().then(({ uid }) => {
        vote(uid);
      });
    } else {
      vote(uid);
    }
  };

  signInAnonymously() {
    const { signIn } = this.props;

    return signIn('anonymous').catch(error => {
      // eslint-disable-next-line no-console
      console.error(error);
      // TODO: notify the user of the error
    });
  }

  checkVote(uid) {
    this.results
      .doc(uid)
      .get()
      .then(resultDoc => {
        if (resultDoc.exists) {
          const { optionId } = resultDoc.data();

          this.setState({
            selection: optionId,
            hasVoted: true,
          });

          // start listening to result changes since there
          // user has voted.
          this.startResultListener();
        }
      })
      .catch(error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      });
  }

  startResultListener() {
    // set an unsubscribe reference on the instance, so that
    // we can stop listening when the component unmounts
    this.stopResultListener = this.results.onSnapshot(
      snapshot => {
        snapshot.docChanges.forEach(change => {
          const { optionId } = change.doc.data();

          if (change.type === 'added') {
            this.setState(prevState => {
              return {
                ...prevState,
                options: {
                  ...prevState.options,
                  [optionId]: {
                    ...prevState.options[optionId],
                    votes: prevState.options[optionId].votes + 1,
                  },
                },
              };
            });
          }
          if (change.type === 'removed') {
            // currently there's no way of changing a user's vote after it
            // has been saved. We could accomplish this by deleting the
            // user's uid document on the results sub-collection. This
            // is where we'd remove the vote from the UI when that'd happen.
          }
        });
      },
      error => {
        // eslint-disable-next-line no-console
        console.error(error);
        // TODO: notify the user of the error
      },
    );
  }

  render() {
    return (
      <Poll
        {...this.state}
        onSelectOption={this.handleSelectOption}
        onVote={this.handleVote}
      />
    );
  }
}

export default PollContainer;
```



The *Poll* container component handles the following:

- checks to see if the route-parameter is valid. If not, it will redirect the user to */404.*
- logs the user in as anonymous if they’re not already authenticated.
- selecting and voting on an option.
- checking if the user has already voted after being authenticated.
- setting up and removing a listener on the results sub-collection of the poll so that the user can get real-time updates when other users vote.
- any state related to voting.

Finally, let’s hook up the *Poll* container to the app in *./src/pages/poll/index.js:*



```jsx
// ./src/pages/poll/index.js
import React from 'react';
import PropTypes from 'prop-types';
import { Route, Redirect } from 'react-router-dom';

import Poll from '../../containers/Poll';

const PollPage = ({ uid, signIn }) => {
  return (
    <Route
      render={({ location }) => {
        return (
          <div>
            <Route exact path="/poll/" render={() => <Redirect to="/" />} />
            <Route
              location={location}
              key={location.key}
              path="/poll/:pollId/"
              render={props => <Poll {...props} uid={uid} signIn={signIn} />}
            />
          </div>
        );
      }}
    />
  );
};

PollPage.propTypes = {
  uid: PropTypes.string,
  signIn: PropTypes.func.isRequired,
};

export default PollPage;
```



> This file needs to be re-configured to use reach/router.  However as long as the app is not functioning because the props are not being passed down from Auth to children you can't see if these re-directs are working….
>
> So until that first problem is fixed this is a dead end.





Here we’re using *react-router-dom* to handle the client-side routes for this specific page specified in *gatsby-config.js.* If a user lands on the */poll/* route which doesn’t exist, they’ll be redirected to the homepage. Otherwise, the *Poll* container components handles the rest.

#### A production build problem

There’s a bit of an issue with these client-only routes and Netlify. Netlify is just a CDN so by default it has no idea about the existence of these client-only routes. If we were to deploy the application*,* the first thing the user would see when navigating to a created poll is the *404 page,* then after the javascript is parsed and executed, the expected page would be seen. Fortunately, there’s a solution; we can specify a **_redirects** file so that Netlify redirects any */poll/:pollId* parameter routes to right page. This can be accomplished by just adding a *_redirects* file at the root of *the folder that’s being deployed.* In the case of Gatsby.js, that’s **./public/***.* The problem with that is that the public directory is generated every time we run the build script. To automatically get a *_redirects* file into the right directory, we can add another directory called **static** at the root of our project. Gatsby.js looks for this directory at build time and places all of its contents at the root of the *public* directory. The files inside the *static* folder are not processed by Webpack like the rest of the assets in the project located in *./src/.*

You can read more about the *static* directory [here](https://www.gatsbyjs.org/docs/adding-images-fonts-files/#using-the-code-classlanguage-textstaticcode-folder). Create a new directory called **static** at the root of your project and create a file called **_redirects** with the following content:

```
/poll/:param /poll 200
```

### Deploying the application with Netlify

It would be convenient to be able to deploy the application without continuous deployment (which we’ll set up in a moment) so that we could get a shareable link to test the app in its current state on other devices. Let’s use [Netlify’s CLI](https://github.com/netlify/netlify-cli) to accomplish this. Head over to [netlify.com](https://www.netlify.com/) and create a free account. Then install the CLI:

```
yarn add netlify-cli -g
```

Once installed, lets update our *package.json*. Add the following deploy script onto the **scripts** property:

```
"deploy": "npm run build && netlify deploy"
```

Run it. First, the *build* script is ran which will generate a *public* directory with our application code transformed for production and any contents in ./static/ moved into it, then *netlify deploy* is ran*.* The first time you run *netlify deploy,* you’ll be asked to authenticate. Once authenticated, you’ll be asked if you’d like to create a new site — hit Y for yes. Then you’ll be asked for the *path to deploy —* specify *public.*

We need to add all Netlify links as authorized domains in order to get OAuth working on those generated links. Head back over to the firebase console and back into the **authentication** pane. In the **sign-method** tab under *Authorized domains* hit **add domain** and enter *netlify.com.*

> If you’re deploying the site on another domain, be sure to add it here.

You should now be able to test the application using the generated links.

#### Continuous deployment

One of the best features of Netlify is how incredibly easy it is to set up continuous deployment. Since there are no tests in this application currently, we’ll use a rather naive approach and deploy our application to production any time we push to *master* without any checks. Stage and commit your changes with git if you haven’t already, then create a repository on [github.com](https://github.com/) and push your code to it. Head over to [app.netlify.com](https://app.netlify.com/) and hit **new site from git**. Under **Continuous Deployment**, select **Github**. Once authenticated, select the correct repository. Notice that the *build command* and *publish directory* fields are already populated with *gatsby build* and *public/* respectively. Netlify is clever enough to know that the repository is a Gatsby project and sets those fields to the correct values — yet another reason deploying with Netlify is a breeze. Hit **Deploy site.**

That’s it! Anytime you push to *master,* Netlify will automagically deploy and host the most recent build of your app.

#### Firestore security rules

Let’s add security rules since our application is now accessible by the public. Go to the firebase console, in the **database** pane under the **rules** tab paste in the following rules:

```
service cloud.firestore {
  match /databases/{database}/documents {
    match /polls/{document=**} {
      allow read: if true;
      allow create: if request.auth.uid != null;
      allow update: if false;
      allow delete: if false;
    }
  }
}
```

Here we’re applying rules to all documents in the *polls* collection and any sub-collections. We’re allowing anyone to *read* any data from these documents, only allowing authenticated users to *create* documents, and we’ve set the *update* and *delete* rules to false since our application currently doesn’t support these operations. You can read more about the firestore security rules [here](https://firebase.google.com/docs/firestore/security/overview?authuser=0).

### Generating a Lighthouse report

Lighthouse is a tool that runs several tests on a webpage to test how “progressive” your site is. That is it has several audits for performance, whether or not you’ve utilized key PWA technologies, accessibility, best practices, SEO, and more. After running Lighthouse on your site, a report with scores broken down by the aforementioned criteria will be generated with tips on how to improve those scores. Let’s see where our application currently stands. After running the test several times, I’ve picked out a good median result.



This concludes **part 2** of this tutorial. We’ve got a bit to improve on with respect to performance and some key PWA technologies like service workers and a manifest file. Stick around for the next part where we’ll make our application a bit more progressive and in turn performant by utilizing [service workers](https://developers.google.com/web/fundamentals/primers/service-workers/) and several other key technologies.

If you have any issues or would like to see the completed code please visit our repository [here](https://github.com/Unicorn/polling-app-example/tree/master).

Be sure to follow us for more blogs every Monday and Tuesday! We’ll have **Part 3** out for you in no time. See ya!

**John Korzhuk** *is a software developer and proud Unicorn. He specializes in full-stack javascript, React.js, and web development. Outside of work his interests include gaming, esports, and learning about anything that he finds interesting. You can find on twitter* [*@johnkorzhuk*](https://twitter.com/johnkorzhuk/)*.*

### Want to build magical experiences together? Contact us!

**E-mail:** [adam-leonard@unicornagency.com](mailto:adam-leonard@unicornagency.com)

**Twitter:** [@UnicornHQ](http://www.twitter.com/unicornHQ)

**Website:** [http://www.unicornagency.com](http://www.unicornagency.com/)