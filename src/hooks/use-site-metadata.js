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
