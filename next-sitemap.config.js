// See more details - github.com/iamvishnusankar/next-sitemap
// next-sitemap.config.js

/** @type {import('next-sitemap').IConfig} */
https: module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL,
  changefreq: "daily",
  priority: 1,
  sitemapSize: 5000,
  generateRobotsTxt: true,
  exclude: ["/dashboard"],
  //   alternateRefs: [
  //     {
  //       href: 'https://es.example.com',
  //       hreflang: 'es',
  //     },
  //     {
  //       href: 'https://fr.example.com',
  //       hreflang: 'fr',
  //     },
  //   ],
  // Default transformation function
  transform: async (
    /** @type {{ changefreq: any; priority: any; autoLastmod: any; alternateRefs: any; }} */ config,
    /** @type {any} */ path
  ) => {
    return {
      loc: path, // => this will be exported as http(s)://<config.siteUrl>/<path>
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs ?? [],
    };
  },
  additionalPaths: async (
    /** @type {{ transform: (arg0: any, arg1: string) => any; }} */ config
  ) => {
    return [await config.transform(config, "/")];
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
      },
      //   {
      //     userAgent: "test-bot",
      //     allow: ["/path", "/path-2"],
      //   },
      //   {
      //     userAgent: "black-listed-bot",
      //     disallow: ["/sub-path-1", "/path-2"],
      //   },
    ],
    additionalSitemaps: [
      //   "https://example.com/my-custom-sitemap-1.xml",
      //   "https://example.com/my-custom-sitemap-2.xml",
      //   "https://example.com/my-custom-sitemap-3.xml",
    ],
  },
};
