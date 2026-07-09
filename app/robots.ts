import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard',
          '/identity',
          '/messages',
          '/onboarding',
          '/settings',
          '/auth',
        ],
      },
    ],
    sitemap: 'https://www.bhutandevelopersconnect.xyz/sitemap.xml',
  };
}
