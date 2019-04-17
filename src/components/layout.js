import React from 'react'
import PropTypes from 'prop-types'
import Helmet from 'react-helmet'
import styled from 'styled-components'

import Auth from '../containers/Auth'
import Header from './Header'
import { Container as BaseContainerStyles } from '../styledComponents/layout'
import { useSiteMetadata } from '../hooks/use-site-metadata'

import './layout.css'

// const util = require('util')

const Container = styled(BaseContainerStyles)`
  padding-top: 0;
`

function TemplateWrapper({ children, ...props }) {
  const { title } = useSiteMetadata()
  // console.log(util.inspect(children, { showHidden: false, depth: null }))
  // console.log(JSON.stringify(children))

  return (
    <Auth>
      {auth => {
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
              title={title}
              {...auth}
            />
            {/* <Container>{children({ ...props, ...auth })}</Container> */}
            <Container {...props} {...auth}>
              {children}
            </Container>
          </div>
        )
      }}
    </Auth>
  )
}

TemplateWrapper.propTypes = {
  children: PropTypes.node,
}

export default TemplateWrapper
