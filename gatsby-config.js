module.exports = {
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
  plugins: [
    `gatsby-plugin-react-helmet`,
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-styled-components',
    {
      resolve: `gatsby-plugin-layout`,
      options: {
        component: require.resolve(`./src/components/layout.js`),
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `gatsby-starter-default`,
        short_name: `starter`,
        start_url: `/`,
        background_color: `#663399`,
        theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/gatsby-icon.png`, // This path is relative to the root of the site.
      },
    },
    // this (optional) plugin enables Progressive Web App + Offline functionality
    // To learn more, visit: https://gatsby.dev/offline
    // `gatsby-plugin-offline`,
  ],
}
