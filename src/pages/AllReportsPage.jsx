import { CommunityFeed } from "../components/feed/CommunityFeed";

export const AllReportsPage = () => {
  return (
    <section className="py-10 md:py-16">
      <div className="section-shell mb-8">
        <p className="text-sm uppercase tracking-[0.35em] text-primary">All Reports</p>
        <h1 className="heading-lg mt-3">Browse all public reports in one place</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
          Explore the reports getting attention across different areas, follow urgent cases, and support the ones that genuinely need community backing.
        </p>
      </div>
      <CommunityFeed title="All public reports" subtitle="Search, filter, and support reports across the full community feed." />
    </section>
  );
};
