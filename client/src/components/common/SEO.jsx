import { useEffect } from "react";
import { APP_ORIGIN, MARKETING_URL } from "@/lib/urls";

/**
 * Every route in this app is a signed-in dashboard or auth screen — the public
 * landing lives on the marketing domain. So `noindex` defaults to true here:
 * these pages have no search value and must not compete with daemondoc.online.
 */
const SEO = ({
  title = "DaemonDoc - AI-Powered README Generator for GitHub | Automate Your Documentation",
  description = "Stop wasting hours on documentation. DaemonDoc automatically generates and updates your GitHub README files using AI. Connect your repos and keep documentation fresh as your code evolves.",
  keywords = "README generator, AI documentation, GitHub automation, automatic README, documentation tool",
  ogImage = `${MARKETING_URL}/main_og.png`,
  ogUrl = `${APP_ORIGIN}/`,
  twitterHandle = "@daemondoc",
  canonical = `${APP_ORIGIN}/`,
  noindex = true,
}) => {
  useEffect(() => {
    document.title = title;

    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? "property" : "name";
      let element = document.querySelector(`meta[${attribute}="${name}"]`);

      if (element) {
        element.setAttribute("content", content);
      } else {
        element = document.createElement("meta");
        element.setAttribute(attribute, name);
        element.setAttribute("content", content);
        document.head.appendChild(element);
      }
    };

    updateMetaTag("description", description);
    updateMetaTag("keywords", keywords);
    updateMetaTag("robots", noindex ? "noindex, follow" : "index, follow");

    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:image", ogImage, true);
    updateMetaTag("og:url", ogUrl, true);

    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", ogImage);
    updateMetaTag("twitter:creator", twitterHandle);

    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute("href", canonical);
    } else {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("href", canonical);
      document.head.appendChild(canonicalLink);
    }
  }, [
    title,
    description,
    keywords,
    ogImage,
    ogUrl,
    twitterHandle,
    canonical,
    noindex,
  ]);

  return null;
};

export default SEO;
