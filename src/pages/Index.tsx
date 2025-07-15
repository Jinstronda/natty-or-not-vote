
import { useState, useEffect } from "react";
import Layout from "@/components/Layout";
import SearchBar from "@/components/SearchBar";
import InfluencerGrid from "@/components/InfluencerGrid";
import SuggestInfluencer from "@/components/SuggestInfluencer";
import { DynamicMeta } from "@/components/SEO/DynamicMeta";
import { StructuredData } from "@/components/SEO/StructuredData";
import { useSEO } from "@/hooks/useSEO";
import { useWebVitals } from "@/utils/webVitals";
import { LazyImage } from "@/components/LazyImage";

const Index = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isGridLoading, setIsGridLoading] = useState(false);

  // Initialize Web Vitals monitoring for homepage performance
  const { report: webVitalsReport } = useWebVitals({
    lcp: 1800, // Target LCP under 1.8 seconds for homepage
    cls: 0.02, // Very strict CLS budget for homepage
    fcp: 1200, // Target FCP under 1.2 seconds
  });

  // SEO optimization for homepage
  const mainKeywords = [
    'natty or not',
    'natural vs enhanced',
    'fitness influencer natty',
    'bodybuilding natural test',
    'is influencer natural',
    'natty or juicy',
    'steroid detection',
    'natural bodybuilding',
    'fitness authenticity',
    'enhanced vs natural',
    'bodybuilding community',
    'natural training',
    'fitness influencer analysis',
    'natty police',
    'natural physique',
  ];

  // Initialize SEO for homepage
  useSEO({
    title: 'Natty or Not? - Community Verdict on Fitness Influencers | Natural vs Enhanced',
    description: 'Find out if your favorite fitness influencer is natural or enhanced. Community-driven platform to determine if influencers are natty or juicy. Vote, review, and discover the truth.',
    keywords: mainKeywords,
    canonicalUrl: 'https://nattyorjuicy.com/',
    // SEO config doesn't support openGraph and twitter properties
  });

  return (
    <>
      {/* SEO Meta Tags */}
      <DynamicMeta
        title="Natty or Not? - Community Verdict on Fitness Influencers | Natural vs Enhanced"
        description="Find out if your favorite fitness influencer is natural or enhanced. Community-driven platform to determine if influencers are natty or juicy. Vote, review, and discover the truth."
        keywords={mainKeywords}
        canonical="https://nattyorjuicy.com/"
        openGraph={{
          title: 'Natty or Not? - Community Verdict on Fitness Influencers',
          description: 'Community-driven platform to determine if fitness influencers are natural or enhanced. Vote, review, and discover the truth.',
          image: 'https://nattyorjuicy.com/og-image.jpg',
          url: 'https://nattyorjuicy.com/',
          type: 'website',
        }}
        twitter={{
          card: 'summary_large_image',
          title: 'Natty or Not? - Community Verdict on Fitness Influencers',
          description: 'Community-driven platform to determine if fitness influencers are natural or enhanced.',
          image: 'https://nattyorjuicy.com/og-image.jpg',
        }}
      />

      {/* Website/Organization Structured Data */}
      <StructuredData
        type="WebSite"
        data={{
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Natty or Juicy',
          alternateName: 'Natty or Not',
          url: 'https://nattyorjuicy.com',
          description: 'Community-driven platform to determine if fitness influencers are natural or enhanced',
          potentialAction: {
            '@type': 'SearchAction',
            target: 'https://nattyorjuicy.com/?search={search_term_string}',
            'query-input': 'required name=search_term_string',
          },
          sameAs: [
            'https://twitter.com/nattyorjuicy',
            'https://instagram.com/nattyorjuicy',
          ],
        }}
      />

      {/* Organization Structured Data */}
      <StructuredData
        type="Organization"
        data={{
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Natty or Juicy',
          url: 'https://nattyorjuicy.com',
          logo: 'https://nattyorjuicy.com/logo.png',
          description: 'Community platform for analyzing fitness influencer authenticity',
          knowsAbout: [
            'Fitness',
            'Bodybuilding', 
            'Natural Training',
            'Performance Enhancement',
            'Fitness Influencers',
            'Athletic Performance',
          ],
          audience: {
            '@type': 'Audience',
            audienceType: 'Fitness Enthusiasts',
          },
        }}
      />

      {/* FAQ Structured Data */}
      <StructuredData
        type="FAQPage"
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          mainEntity: [
            {
              '@type': 'Question',
              name: 'What does "natty" mean in fitness?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Natty is short for "natural" and refers to someone who builds their physique without using performance-enhancing drugs, steroids, or other banned substances.',
              },
            },
            {
              '@type': 'Question',
              name: 'What does "juicy" mean in bodybuilding?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Juicy is slang for someone who uses performance-enhancing drugs, steroids, or other substances to enhance their physique and performance.',
              },
            },
            {
              '@type': 'Question',
              name: 'How does the community voting work?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Users can vote whether they believe an influencer is natural (natty) or enhanced (juicy) based on their physique, performance, and other factors. The community verdict is shown as percentages.',
              },
            },
            {
              '@type': 'Question',
              name: 'Can I suggest new influencers to add?',
              acceptedAnswer: {
                '@type': 'Answer',
                text: 'Yes! You can suggest new fitness influencers to be added to the platform. Your suggestions help make the database more comprehensive.',
              },
            },
          ],
        }}
      />

      <Layout>
        {/* SEO-optimized content structure */}
        <div className="container mx-auto px-6 py-12 max-w-7xl">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-8 bg-gradient-to-r from-natty to-juicy bg-clip-text text-transparent leading-tight">
              Natty or Not?
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto mb-12 leading-relaxed">
              The community verdict on whether your favorite fitness influencer is natural or enhanced.
            </p>
            
            {/* SEO-friendly content */}
            <div className="max-w-3xl mx-auto mb-8">
              <h2 className="sr-only">
                Community-Driven Fitness Influencer Analysis Platform
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Discover the truth about fitness influencers. Our community analyzes physiques, 
                performance, and authenticity to determine if influencers are naturally achieved (natty) 
                or enhanced with performance-enhancing substances (juicy).
              </p>
            </div>
          </div>

          <div className="mb-16 max-w-2xl mx-auto">
            <SearchBar 
              searchTerm={searchTerm} 
              onSearchChange={setSearchTerm}
              isGridLoading={isGridLoading}
            />
          </div>
          
          {/* Main content section with SEO-friendly heading */}
          <section>
            <h2 className="sr-only">Fitness Influencer Directory</h2>
            <InfluencerGrid 
              searchTerm={searchTerm}
              onLoadingChange={setIsGridLoading}
            />
          </section>
          
          <div className="mt-32 mb-16">
            <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl p-12 text-center border border-border/50">
              <div className="max-w-2xl mx-auto">
                <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  Don't see your favorite influencer?
                </h2>
                <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed">
                  Help us grow the community by suggesting new fitness influencers to add to the platform! 
                  Your suggestions help make the database more comprehensive and accurate.
                </p>
                <div className="flex justify-center">
                  <SuggestInfluencer />
                </div>
              </div>
            </div>
          </div>

          {/* SEO Content Section */}
          <section className="mt-24 mb-16">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-heading font-bold mb-8 text-center">
                About Natural vs Enhanced Fitness Analysis
              </h2>
              <div className="grid md:grid-cols-2 gap-8 text-muted-foreground">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    What is Natural (Natty)?
                  </h3>
                  <p className="leading-relaxed">
                    Natural bodybuilders and fitness enthusiasts achieve their physiques through 
                    training, nutrition, and recovery without using performance-enhancing drugs, 
                    steroids, or banned substances. They rely on dedication, consistency, and 
                    genetic potential.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-foreground">
                    What is Enhanced (Juicy)?
                  </h3>
                  <p className="leading-relaxed">
                    Enhanced individuals use performance-enhancing drugs, anabolic steroids, 
                    or other substances to accelerate muscle growth, improve recovery, and 
                    achieve physiques that may be difficult to attain naturally.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </Layout>
    </>
  );
};

export default Index;
