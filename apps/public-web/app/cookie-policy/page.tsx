export const metadata = {
  title: "Cookie Policy | Edition TV",
  description: "Learn how Edition TV uses cookies and similar technologies to improve your experience, measure performance, and deliver relevant content.",
};

export default function CookiePolicyPage() {
  return (
    <div className="container mx-auto max-w-[800px] px-4 md:px-6 py-12 font-sans">
      <div className="border-b border-border pb-8 mb-10">
        <span className="section-label block mb-2">Legal & Privacy</span>
        <h1 className="headline-xl text-4xl sm:text-5xl font-extrabold text-foreground mb-4 leading-tight">
          Cookie Policy
        </h1>
        <p className="text-base text-muted-foreground">
          Last updated: August 2026
        </p>
      </div>

      <div className="prose prose-neutral dark:prose-invert max-w-none text-foreground/90">
        <p className="text-lg leading-relaxed mb-8">
          This Cookie Policy explains how Edition TV (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;) uses cookies and similar tracking technologies when you visit our website or use our applications. It explains what these technologies are and why we use them, as well as your rights to control our use of them.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">What are cookies?</h2>
        <p className="leading-relaxed mb-6">
          Cookies are small data files that are placed on your computer or mobile device when you visit a website. Cookies are widely used by website owners in order to make their websites work, or to work more efficiently, as well as to provide reporting information.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">How we use cookies</h2>
        <p className="leading-relaxed mb-4">
          We use first-party and third-party cookies for several reasons. Some cookies are required for technical reasons in order for our website to operate, and we refer to these as &quot;essential&quot; or &quot;strictly necessary&quot; cookies.
        </p>
        
        <div className="space-y-6 mt-8">
          <div className="bg-card border border-border p-5 rounded-sm">
            <h3 className="text-lg font-bold text-foreground m-0 mb-2">Essential Cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed m-0">
              These cookies are strictly necessary to provide you with services available through our website and to use some of its features, such as access to secure areas (e.g., logging into your account, reading paywalled content). Because these are strictly necessary to deliver the website, you cannot refuse them without impacting how our site functions.
            </p>
          </div>
          
          <div className="bg-card border border-border p-5 rounded-sm">
            <h3 className="text-lg font-bold text-foreground m-0 mb-2">Performance & Analytics Cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed m-0">
              These cookies collect information that is used in aggregate form to help us understand how our website is being used. This helps us improve our journalism by understanding which articles are read most frequently, how long users spend on the site, and if they encounter errors.
            </p>
          </div>

          <div className="bg-card border border-border p-5 rounded-sm">
            <h3 className="text-lg font-bold text-foreground m-0 mb-2">Functionality Cookies</h3>
            <p className="text-sm text-muted-foreground leading-relaxed m-0">
              These are used to recognize you when you return to our website. This enables us to personalize our content for you and remember your preferences (for example, your choice of language, region, or dark mode settings).
            </p>
          </div>
        </div>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">How can I control cookies?</h2>
        <p className="leading-relaxed mb-4">
          You have the right to decide whether to accept or reject non-essential cookies. You can exercise your cookie preferences by clicking on the &quot;Manage Cookies&quot; link in the footer of our website, which brings up our consent manager.
        </p>
        <p className="leading-relaxed mb-6">
          In addition, most web browsers allow some control of most cookies through the browser settings. To find out more about cookies, including how to see what cookies have been set, visit <a href="https://www.aboutcookies.org" className="text-primary hover:underline">aboutcookies.org</a>.
        </p>

        <h2 className="text-2xl font-bold mt-10 mb-4 text-foreground">Updates to this policy</h2>
        <p className="leading-relaxed mb-6">
          We may update this Cookie Policy from time to time in order to reflect, for example, changes to the cookies we use or for other operational, legal, or regulatory reasons. Please therefore re-visit this Cookie Policy regularly to stay informed about our use of cookies and related technologies.
        </p>
      </div>
    </div>
  );
}
