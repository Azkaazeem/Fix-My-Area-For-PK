import { CommunityFeed } from "../components/feed/CommunityFeed";
import { AnimatedFooter } from "../components/home/AnimatedFooter";
import { HeroSection } from "../components/home/HeroSection";
import { ImpactShowcase } from "../components/home/ImpactShowcase";
import { StorySection } from "../components/home/StorySection";

export const HomePage = () => {
  return (
    <>
      <HeroSection />
      <StorySection />
      <ImpactShowcase />
      <CommunityFeed
        compact
        limit={3}
        showViewAll
        eyebrow="Public Feed"
        title="A quick look at the reports getting attention right now"
        subtitle="Home shows only three high-priority reports. Open the full feed to explore every public report in detail."
      />
      <AnimatedFooter />
    </>
  );
};
