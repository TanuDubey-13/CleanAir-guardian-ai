import React from 'react';
import { ShieldCheck, Info } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-6 font-sans space-y-8">
      
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-3xl text-slate-800 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary-500" />
          <span>Privacy Policy</span>
        </h1>
        <p className="text-slate-400 text-sm mt-1">Last updated: July 2026</p>
      </div>

      <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-dark-800 p-6 sm:p-8 rounded-2xl shadow-soft space-y-6 text-sm text-slate-650 dark:text-slate-300 leading-relaxed">
        
        <div className="flex items-start gap-3 bg-primary-50/40 dark:bg-primary-950/10 p-4 rounded-xl border border-primary-200/40">
          <Info className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
          <p className="text-xs text-primary-750 dark:text-primary-400">
            <strong>Minimal Data Collection Notice:</strong> CleanAir Guardian AI is built with privacy-first principles. We collect only the minimum required data to track environmental hotspots and keep user accounts secure.
          </p>
        </div>

        <section className="space-y-3">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">1. Data We Collect</h3>
          <p>
            When you register and use the CleanAir Guardian platform, we collect:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
            <li><strong>Account details:</strong> Display name and email address provided during email sign up or Google SSO authorization.</li>
            <li><strong>Incident reports:</strong> Photo uploads of pollution, manual description text, street addresses, and geographic coordinates (latitude and longitude).</li>
            <li><strong>Authentication logs:</strong> Session authorization tokens managed via Firebase Authentication.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">2. How Your Data is Used</h3>
          <p>
            The collected data is used exclusively to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs">
            <li>Populate the community interactive map and heatmap density charts.</li>
            <li>Enable municipal crew dispatchers to inspect, verify, and resolve pollution reports.</li>
            <li>Maintain administrative records and track performance statistics.</li>
            <li>We do NOT sell, lease, or share personal user data with third-party advertising companies.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-display font-bold text-base text-slate-800 dark:text-white">3. Security & Storage</h3>
          <p>
            Your account profiles and reports data are stored securely on Google Cloud Platform (Firebase Firestore and Firebase Storage) located in regional US datacenters. Communication is encrypted using TLS, and access permissions are strictly enforced via Firestore Security Rules.
          </p>
        </section>

        <section className="space-y-3 border-t border-slate-150 dark:border-dark-800 pt-6 text-xs text-slate-400">
          <p>
            For questions regarding data removal or account details, please reach out to: privacy@cleanair-guardian.ai
          </p>
        </section>
      </div>
    </div>
  );
};

export default Privacy;
