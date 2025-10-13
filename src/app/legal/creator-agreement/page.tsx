import Link from 'next/link'

export default function CreatorAgreementPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Creator Agreement</h1>
        <p className="text-sm text-gray-600 mb-8">Last updated: October 13, 2025</p>

        <div className="prose prose-gray max-w-none">
          <div className="bg-green-50 border-l-4 border-green-500 p-6 mb-8">
            <h3 className="text-lg font-semibold text-green-900 mb-2">🎨 Built for Creators</h3>
            <p className="text-green-800">
              This agreement is designed to protect <strong>your rights</strong> as a creator. You own your work, 
              you control your content, and you can leave anytime with your full catalog. Chapturs exists to 
              empower creators, not exploit them.
            </p>
          </div>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Who This Agreement Is For</h2>
            <p className="text-gray-700 mb-4">
              This Creator Agreement applies to anyone who publishes original content on Chapturs, including:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Authors writing stories, novels, or series</li>
              <li>Translators adapting works to other languages</li>
              <li>Editors and collaborators improving content</li>
              <li>Anyone uploading creative works</li>
            </ul>
            <p className="text-gray-700 mb-4">
              By uploading content, you agree to these terms in addition to our{' '}
              <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Ownership and Rights</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 You Own Your Content</h3>
            <p className="text-gray-700 mb-4 font-semibold text-lg">
              You retain 100% ownership of all intellectual property rights to your content.
            </p>
            <p className="text-gray-700 mb-4">
              This means:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>You can publish the same work elsewhere (no exclusivity required)</li>
              <li>You can edit, update, or delete your content anytime</li>
              <li>You can negotiate traditional publishing deals without our permission</li>
              <li>You can adapt your work into other media (film, games, audiobooks, etc.)</li>
              <li>You can transfer rights to others (your estate, co-authors, publishers)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 License to Chapturs</h3>
            <p className="text-gray-700 mb-4">
              You grant Chapturs a <strong>non-exclusive, worldwide, royalty-free, revocable license</strong> to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Host and display your content to readers</li>
              <li>Create backups and technical copies</li>
              <li>Generate thumbnails, excerpts, and previews for discovery</li>
              <li>Show your work in search results and recommendations</li>
              <li>Allow readers to bookmark, comment, and share</li>
              <li>Display your content on all platforms (web, mobile, future apps)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Important:</strong> This license is <em>revocable</em>. When you delete content, we stop displaying 
              it (backups kept for 30 days for recovery, then permanently deleted).
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">2.3 What We Don't Do</h3>
            <p className="text-gray-700 mb-4">
              Chapturs will <strong>never</strong>:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Claim ownership of your content</li>
              <li>Require exclusivity (publish wherever you want!)</li>
              <li>Use your content to train AI models</li>
              <li>Sell your content to third parties without permission</li>
              <li>Modify your work without consent (except formatting for display)</li>
              <li>Prevent you from leaving with your content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Content Standards and Guidelines</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Original Work Required</h3>
            <p className="text-gray-700 mb-4">
              You promise that your content is:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Your original work, or</li>
              <li>You have proper permission/license to publish it</li>
              <li>Doesn't infringe on anyone's copyright, trademark, or other rights</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Fan Fiction & Adaptations:</strong> Allowed if transformative and non-commercial (per fair use). 
              Tag appropriately and respect original creators' wishes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Quality Expectations</h3>
            <p className="text-gray-700 mb-4">
              We don't police quality (everyone starts somewhere!), but content should:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Be readable (basic grammar, formatting, coherent)</li>
              <li>Not be auto-generated AI slop (AI-assisted is fine, pure AI spam isn't)</li>
              <li>Have actual story/creative content (not gibberish or keyword stuffing)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We use AI quality assessment to flag potential issues, but humans make final decisions. 
              We'll notify you before removing content.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Prohibited Content</h3>
            <p className="text-gray-700 mb-4">
              See our <Link href="/legal/terms#community-guidelines" className="text-blue-600 hover:underline">Community Guidelines</Link> for prohibited content. 
              In summary: no illegal content, no hate speech, no harassment, no spam.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">3.4 Mature Content</h3>
            <p className="text-gray-700 mb-4">
              Mature content (violence, sex, strong language) is allowed if:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Properly tagged with appropriate content warnings</li>
              <li>Age-gated (18+ or 16+, as appropriate)</li>
              <li>Doesn't violate laws (no illegal pornography, etc.)</li>
              <li>Cover/thumbnail is SFW (no explicit imagery visible to all)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Translations and Collaborations</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Translation Rights</h3>
            <p className="text-gray-700 mb-4">
              Chapturs has a community translation system. When you publish:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Default:</strong> Community can propose translations (you approve/reject)</li>
              <li><strong>Opt-Out:</strong> Disable translations in work settings</li>
              <li><strong>Approval:</strong> You review and approve all translations before publication</li>
              <li><strong>Credit:</strong> Translators are credited; you retain ownership</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Translator Rights</h3>
            <p className="text-gray-700 mb-4">
              If you translate someone's work:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>You create a "derivative work" under the original's license</li>
              <li>Original author can revoke approval and unpublish your translation</li>
              <li>You're credited for translation work</li>
              <li>If monetized, revenue is shared (default: 70% original, 30% translator)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Collaborative Works</h3>
            <p className="text-gray-700 mb-4">
              For co-authored works, all creators must agree to:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Publishing, editing, or removing the work</li>
              <li>Monetization terms (revenue split)</li>
              <li>Adding or removing collaborators</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We recommend written agreements outside Chapturs for complex collaborations.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Monetization and Revenue</h2>
            
            <p className="text-gray-700 mb-4 italic">
              (Monetization features coming soon. This section will apply when launched.)
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Revenue Sharing</h3>
            <p className="text-gray-700 mb-4">
              When we launch paid features, revenue will be split:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Tips/Donations:</strong> 95% creator, 5% platform (covers payment processing fees)</li>
              <li><strong>Individual Supporter Subscriptions:</strong> 95% creator, 5% platform (direct monthly support from your fans)</li>
              <li><strong>Platform Premium Pool:</strong> 70% distributed to creators, 30% platform (see below for distribution method)</li>
              <li><strong>Ad Revenue (Free Tier):</strong> 70% creator, 30% platform (customizable - see Advanced Ad Features)</li>
            </ul>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Platform Premium (Like YouTube Premium)</h3>
            <p className="text-gray-700 mb-4">
              We're planning a <strong>"Chapturs Premium"</strong> subscription that benefits the entire creator ecosystem:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Readers Pay:</strong> One monthly subscription (~$5-10/month) for ad-free reading across all of Chapturs</li>
              <li><strong>Revenue Distribution:</strong> 70% of Premium revenue goes to creators, 30% to platform operations</li>
              <li><strong>Fair Split Based on Reading:</strong> Your share is proportional to how much Premium subscribers read your content</li>
              <li><strong>Example:</strong> If 90% of a Premium subscriber's reading time is spent on your stories, you get 90% of their creator share</li>
            </ul>
            <p className="text-gray-700 mb-4">
              This model rewards creators who produce engaging content that keeps readers coming back. Unlike individual 
              subscriptions, readers support the entire community with one payment, and the money flows to creators they 
              actually read.
            </p>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.3 Advanced Ad Customization Features</h3>
            <p className="text-gray-700 mb-4">
              You have control over your ad strategy and can optimize for visibility vs. revenue:
            </p>
            
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Featured Placement Program</h4>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Reduced Revenue Share:</strong> Opt to take a lower ad split (e.g., 60/40 or 50/50) in exchange for premium placement</li>
              <li><strong>Featured Tag Section:</strong> Your work appears in special "Featured" sections with higher visibility</li>
              <li><strong>Discovery Boost:</strong> Great for new creators building an audience</li>
              <li><strong>Flexible:</strong> Turn on/off anytime, change split percentages based on current goals</li>
            </ul>
            
            <h4 className="text-lg font-semibold text-gray-700 mb-2">Ad Density Controls</h4>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Fewer Ads, Lower Revenue:</strong> Reduce ad frequency for better reader experience (e.g., 60/40 split with 50% fewer ads)</li>
              <li><strong>More Ads, Higher Revenue:</strong> Increase ad density to earn more (e.g., 80/20 split with 150% ad frequency)</li>
              <li><strong>Reader-First Option:</strong> Minimal ads with lower revenue share - prioritize reader experience over income</li>
              <li><strong>Maximize Earnings Option:</strong> Higher ad frequency with better revenue share - maximize income</li>
            </ul>
            
            <p className="text-gray-700 mb-4">
              <strong>Why offer this?</strong> We believe creators should control their own trade-offs. New creators might 
              prioritize discovery, while established creators might optimize for revenue. Your work, your choice.
            </p>
            
            <p className="text-gray-700 mb-4">
              <strong>All content remains free to read.</strong> We don't believe in paywalling chapters. Your supporters 
              can tip or subscribe to show appreciation, and you can optionally publish supporter-exclusive bonus content 
              (bonus chapters, behind-the-scenes, early access), but your main story is always accessible to everyone.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Payment Terms</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Threshold:</strong> $50 minimum for payout (accumulates month to month)</li>
              <li><strong>Schedule:</strong> Monthly payouts, 30 days after month end</li>
              <li><strong>Methods:</strong> PayPal, bank transfer, Stripe (your choice)</li>
              <li><strong>Fees:</strong> You pay transaction fees (typically 2-3%)</li>
              <li><strong>Taxes:</strong> You're responsible for tax reporting (we provide 1099s for US creators)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.4 No Paywalled Content</h3>
            <p className="text-gray-700 mb-4">
              <strong>All main content is free to read, always.</strong> We don't support paywalled chapters because:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>It creates barriers for readers discovering your work</li>
              <li>It can be abused (low-quality content behind paywalls)</li>
              <li>It goes against our grassroots, accessible platform values</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Instead, readers can support you through tips, individual subscriptions, and platform-wide Premium subscriptions. 
              You can optionally publish <strong>supporter-exclusive bonus content</strong> for direct subscribers (bonus chapters, 
              character art, behind-the-scenes content, early access to new chapters), but your main story remains free.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.5 Pricing Control</h3>
            <p className="text-gray-700 mb-4">
              You set your own prices (within platform limits):
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Individual Supporter Subscriptions:</strong> $1-$25/month (for fans who want to support you directly)</li>
              <li><strong>Tips:</strong> Readers choose amount ($1 minimum, no maximum)</li>
              <li><strong>Ad Revenue Split:</strong> Choose your split based on your ad density preferences (50/50 to 80/20)</li>
              <li><strong>Featured Placement Split:</strong> Opt into lower splits (as low as 50/50) for premium discovery placement</li>
            </ul>
            <p className="text-gray-700 mb-4">
              Individual subscriptions unlock a "Supporter" badge on comments and access to any bonus content you choose to publish. 
              Think of it like Patreon, but integrated into the platform.
            </p>
            <p className="text-gray-700 mb-4">
              Platform Premium subscribers don't need individual subscriptions—they support all creators proportionally through their reading.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">5.6 Writing Contests and Pooled Revenue</h3>
            <p className="text-gray-700 mb-4">
              Chapturs will host writing contests where creators can compete for prizes. Contest mechanics:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Ad Revenue Pooling:</strong> Contest entries pool their ad revenue to fund prizes</li>
              <li><strong>Platform Contests:</strong> Chapturs may host official contests with additional prize funding</li>
              <li><strong>Community Contests:</strong> Creators can organize their own contests with custom rules</li>
              <li><strong>Prize Distribution:</strong> Typically winner + runner-ups share the pooled revenue</li>
              <li><strong>Opt-In Only:</strong> Entering a contest is voluntary; normal revenue splits apply to non-contest works</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Example:</strong> A contest pools ad revenue from 50 entries over 30 days. The pool is split: 
              50% to winner, 30% to 2nd place, 20% to 3rd place. Platform contests may add bonus prizes on top of the pool.
            </p>
            <p className="text-gray-700 mb-4">
              Contest terms (duration, prize split, eligibility) are disclosed when you enter. You can withdraw from 
              contests before they end (your revenue reverts to normal splits).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Moderation and Removal</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Our Moderation Approach</h3>
            <p className="text-gray-700 mb-4">
              We moderate reactively (report-based) and proactively (AI-flagged):
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>AI quality checks flag potential spam/violations</li>
              <li>User reports are reviewed by moderators</li>
              <li>Moderators are trained to be fair, not heavy-handed</li>
              <li>You'll be notified before content is removed (except illegal content)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Appeals Process</h3>
            <p className="text-gray-700 mb-4">
              If content is removed or account suspended:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>You'll receive an email explaining why</li>
              <li>You can appeal to <a href="mailto:appeals@chapturs.com" className="text-blue-600 hover:underline">appeals@chapturs.com</a></li>
              <li>We'll review appeals within 5 business days</li>
              <li>Decisions are made by senior moderators</li>
            </ul>
            <p className="text-gray-700 mb-4">
              We believe in second chances. Unless you're a spammer or engaged in illegal activity, 
              we'll work with you to fix issues.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">6.3 Account Termination</h3>
            <p className="text-gray-700 mb-4">
              We can terminate accounts for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Repeated violations of Community Guidelines</li>
              <li>Illegal activity</li>
              <li>Spam or abuse</li>
              <li>Copyright infringement (after DMCA process)</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Before termination:</strong> We'll usually warn, suspend, or give you a chance to fix issues. 
              Instant bans are only for severe violations (illegal content, harassment, etc.).
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Leaving Chapturs</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Content Export</h3>
            <p className="text-gray-700 mb-4">
              You can export all your content anytime:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Bulk Export:</strong> Download all works as files (Markdown, HTML, EPUB)</li>
              <li><strong>Metadata Included:</strong> Comments, stats, reader feedback</li>
              <li><strong>No Lock-In:</strong> Standard formats work with other platforms</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Account Deletion</h3>
            <p className="text-gray-700 mb-4">
              When you delete your account:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Content is unpublished immediately</li>
              <li>Backups kept for 30 days (in case you change your mind)</li>
              <li>After 30 days, content is permanently deleted</li>
              <li>Comments you made on others' works remain (anonymized as "Deleted User")</li>
            </ul>
            <p className="text-gray-700 mb-4">
              <strong>Changed your mind?</strong> Email <a href="mailto:support@chapturs.com" className="text-blue-600 hover:underline">support@chapturs.com</a> within 30 days to restore your account.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">7.3 Outstanding Payments</h3>
            <p className="text-gray-700 mb-4">
              If you have unpaid earnings:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Under $50: Forfeited (sorry, payment processing costs too much)</li>
              <li>Over $50: Paid out within 60 days of account deletion</li>
              <li>Keep payment info updated to receive final payout</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Platform Changes</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Feature Updates</h3>
            <p className="text-gray-700 mb-4">
              We'll continually improve Chapturs. We may:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Add new features (monetization, analytics, tools)</li>
              <li>Change UI/UX (we'll announce major redesigns)</li>
              <li>Deprecate old features (with 60 days notice)</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Agreement Changes</h3>
            <p className="text-gray-700 mb-4">
              Changes to this Creator Agreement:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Minor:</strong> Bug fixes, clarifications (effective immediately)</li>
              <li><strong>Major:</strong> Rights changes, monetization terms (60 days notice)</li>
              <li><strong>Notification:</strong> Email + site announcement</li>
            </ul>
            <p className="text-gray-700 mb-4">
              If you don't agree with changes, you can delete your account and export content before they take effect.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">8.3 Our Commitments Won't Change</h3>
            <p className="text-gray-700 mb-4 font-semibold">
              Even if we update this agreement, we promise to always:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>✅ Let you own your content</li>
              <li>✅ Allow non-exclusive publishing</li>
              <li>✅ Never train AI on your work</li>
              <li>✅ Give you fair revenue splits</li>
              <li>✅ Let you leave with your content anytime</li>
            </ul>
            <p className="text-gray-700 mb-4">
              These are core principles, not negotiable.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Support and Resources</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Creator Support</h3>
            <p className="text-gray-700 mb-4">
              We provide:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li><strong>Help Center:</strong> Guides, tutorials, FAQs</li>
              <li><strong>Email Support:</strong> <a href="mailto:creators@chapturs.com" className="text-blue-600 hover:underline">creators@chapturs.com</a></li>
              <li><strong>Community Forum:</strong> Ask other creators (coming soon)</li>
              <li><strong>Creator Newsletter:</strong> Tips, updates, success stories</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Analytics and Tools</h3>
            <p className="text-gray-700 mb-4">
              Free for all creators:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4 space-y-2">
              <li>Real-time view counts</li>
              <li>Reader demographics (anonymized)</li>
              <li>Engagement metrics (bookmarks, comments, likes)</li>
              <li>Revenue tracking (when monetized)</li>
              <li>Advanced editor with glossary system</li>
              <li>Translation management</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Legal Stuff</h2>
            
            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.1 Relationship</h3>
            <p className="text-gray-700 mb-4">
              You're an independent creator, not an employee or contractor. This is a platform agreement, 
              not an employment contract.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.2 Liability</h3>
            <p className="text-gray-700 mb-4">
              See our <Link href="/legal/terms#liability" className="text-blue-600 hover:underline">Terms of Service</Link> for liability disclaimers. 
              You're responsible for your content; we're not liable for copyright issues or disputes.
            </p>

            <h3 className="text-xl font-semibold text-gray-800 mb-3">10.3 Governing Law</h3>
            <p className="text-gray-700 mb-4">
              This agreement follows the same governing law as our Terms of Service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact</h2>
            <p className="text-gray-700 mb-4">
              Questions about this Creator Agreement?
            </p>
            <ul className="list-none text-gray-700 mb-4 space-y-2">
              <li><strong>Creator Support:</strong> <a href="mailto:creators@chapturs.com" className="text-blue-600 hover:underline">creators@chapturs.com</a></li>
              <li><strong>Legal Questions:</strong> <a href="mailto:legal@chapturs.com" className="text-blue-600 hover:underline">legal@chapturs.com</a></li>
              <li><strong>Copyright Issues:</strong> <a href="mailto:dmca@chapturs.com" className="text-blue-600 hover:underline">dmca@chapturs.com</a></li>
            </ul>
          </section>

          <div className="mt-12 pt-8 border-t border-gray-200 bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🤝 Our Promise to Creators</h3>
            <p className="text-gray-700 mb-4">
              Chapturs exists because we believe creators deserve better. Better tools, better revenue splits, 
              better ownership. We're building a grassroots platform where everyone—creators, readers, translators—helps 
              make it bigger together.
            </p>
            <p className="text-gray-700">
              Your success is our success. We'll never lock you in, sell your data, or claim ownership of your art. 
              You create, we facilitate. That's the deal.
            </p>
            <p className="text-gray-700 mt-4 font-semibold">
              — The Chapturs Team
            </p>
          </div>

          <div className="mt-8">
            <p className="text-sm text-gray-600">
              <Link href="/legal/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
              {' · '}
              <Link href="/legal/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              {' · '}
              <Link href="/" className="text-blue-600 hover:underline">Back to Home</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
