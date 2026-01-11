import { useEffect } from 'react';

const SEO = ({ 
  title = "ReadIt - AI-Powered README Generator for GitHub | Automate Your Documentation",
  description = "Stop wasting hours on documentation. ReadIt automatically generates and updates your GitHub README files using AI. Connect your repos and keep documentation fresh as your code evolves.",
  keywords = "README generator, AI documentation, GitHub automation, automatic README, documentation tool",
  ogImage = "https://readit.dev/og-image.png",
  ogUrl = "https://readit.dev/",
  twitterHandle = "@readit",
  canonical = "https://readit.dev/"
}) => {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (element) {
        element.setAttribute('content', content);
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.setAttribute('content', content);
        document.head.appendChild(element);
      }
    };

    // Update meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:url', ogUrl, true);
    
    // Twitter Card tags
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    updateMetaTag('twitter:creator', twitterHandle);

    // Update canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonical);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonical);
      document.head.appendChild(canonicalLink);
    }
  }, [title, description, keywords, ogImage, ogUrl, twitterHandle, canonical]);

  return null;
};

export default SEO;

