import { ROUTES, SITE } from "@/config/site";
import { useConfig } from "nextra-theme-docs";
import Image from 'next/image';
import { useTheme } from 'next-themes';

/**
 * @type {import('nextra-theme-docs').DocsThemeConfig}
 */
export default {
  useNextSeoProps() {
    return {
      titleTemplate: `%s – ${SITE.name} Docs`,
    };
  },
  banner: {
    key: "launch offer",
    text: (
      <a href={ROUTES.pricing.path} target="_blank">
        🎁 Save $10 off for the limited time →
      </a>
    ),
  },
  primaryHue: {
    dark: 204,
    light: 212,
  },
  logo: () => {
    return (
      <p style={{ fontWeight: 700, textAlign: 'center', width: '100%' }}>Tutorials</p>
    );
  },
  head: function useHead() {
    const config = useConfig<{ description?: string; image?: string }>();
    const description = config.frontMatter.description || SITE.description;
    const image = config.frontMatter.image || `${SITE.url}/og.png`;
    return (
      <>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#000000" />
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="description" content={description} />
        <meta name="og:description" content={description} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@vercel" />
        <meta name="twitter:image" content={image} />
        <meta name="og:title" content={config.title} />
        <meta name="og:image" content={image} />
        <meta name="apple-mobile-web-app-title" content={config.title} />
      </>
    );
  },
  feedback: {
    content: "Question? Give us feedback →",
    labels: "feedback",
    useLink() {
      return `${SITE.url}/docs/support`;
    },
  },
  editLink: {
    component: null,
  },
  footer: {
    text: () => {
      const { resolvedTheme } = useTheme();
      const logoSrc = resolvedTheme === 'dark' ? '/logo_dark.svg' : '/logo_light.svg';
      
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            gap: '1rem'
          }}
        >
          <Image
            src={logoSrc}
            alt="Logo"
            width={200}
            height={200}
          />
          <span style={{ fontWeight: 600, fontSize: "12px", textAlign: 'center' }}>
            Copyright © {new Date().getFullYear()}{" "}
            <a href={SITE.url} rel="noopener noreferrer">
              {SITE.name}
            </a>
          </span>
        </div>
      );
    },
  },
  project: {
    link: process.env.NEXT_PUBLIC_APP_URL || 'https://lead-nimbus.vercel.app',
    icon: () => {
      return (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-home"
        >
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      );
    },
  },
  // ... other theme options
};