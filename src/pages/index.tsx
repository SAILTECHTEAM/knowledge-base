import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

import * as zhCN from './_index.zh-CN';
import * as zhHK from './_index.zh-HK';

type SectionCardProps = {
  title: string;
  description: string;
  link: string;
};

const DefaultSectionList: SectionCardProps[] = [
  {
    title: 'Deep Learning',
    description: 'Computer Vision (YOLO series, CNN), object tracking (TrackNet), and fundamental concepts.',
    link: '/deep-learning/fundamental/',
  },
  {
    title: 'Python Tutorial',
    description: 'Modern Python engineering practices and toolsets.',
    link: '/python-tutorial/',
  },
  {
    title: 'Git Tutorial',
    description: 'Standardized Git workflows for professional teams.',
    link: '/git-tutorial/',
  },
  {
    title: 'Infrastructure',
    description: 'Cloud-native architecture and development environments.',
    link: '/infra/architecture-overview',
  },
];

function SectionCard({title, description, link}: SectionCardProps) {
  return (
    <div className={clsx('col col--6', styles.cardCol)}>
      <Link to={link} className={styles.card}>
        <Heading as="h3">
          {title}
        </Heading>
        <p>{description}</p>
      </Link>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig, i18n} = useDocusaurusContext();

  let currentSectionList: SectionCardProps[] = DefaultSectionList;
  let currentTitle = siteConfig.title;
  let currentTagline = siteConfig.tagline;

  if (i18n.currentLocale === 'zh-CN') {
    currentSectionList = zhCN.SectionList;
    currentTitle = zhCN.siteConfig.title;
    currentTagline = zhCN.siteConfig.tagline;
  } else if (i18n.currentLocale === 'zh-HK') {
    currentSectionList = zhHK.SectionList;
    currentTitle = zhHK.siteConfig.title;
    currentTagline = zhHK.siteConfig.tagline;
  }

  return (
    <Layout title="Knowledge Base" description="Internal knowledge base for SAILTECHTEAM">
      <div className="disable_numbered_headings">
        <header className={clsx('hero hero--primary', styles.heroBanner)}>
          <div className="container">
            <h1 className="hero__title">{currentTitle}</h1>
            <p className="hero__subtitle">{currentTagline}</p>
          </div>
        </header>
        <main>
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {currentSectionList.map((props, idx) => (
                  <SectionCard key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        </main>
      </div>
    </Layout>
  );
}
