import React from 'react'
import { Link } from 'gatsby'

// import Layout from '../components/layout'
import Image from '../components/image'
import SEO from '../components/seo'
import { useSiteMetadata } from '../hooks/use-site-metadata'

import { Button } from '../styledComponents/theme'
import { Heading2 } from '../styledComponents/typography'

function IndexPage() {
  const { title } = useSiteMetadata()
  return (
    <div>
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
    </div>
  )
}

export default IndexPage
