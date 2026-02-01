import { Link } from 'react-router-dom';
import { Users, Wallet, CheckSquare, TrendingUp, Shield, Zap } from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-black">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-3xl font-mono font-bold">ATMOS</h1>
          <div className="space-x-4">
            <Link to="/login" className="btn btn-outline">
              Log In
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="container mx-auto px-4 py-20">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-5xl font-mono font-bold mb-6">
              Your Group's Operating System
            </h2>
            <p className="text-xl text-nostalgic-700 mb-8">
              Manage your trips, events, and projects like a digital institution.
              Tasks, wallet, bookings, and compliance tracking - all in one place.
            </p>
            <Link to="/signup" className="btn btn-primary text-lg px-8 py-3">
              Get Started Free
            </Link>
          </div>
        </section>

        <section className="bg-nostalgic-50 py-20 border-y-2 border-black">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-mono font-bold text-center mb-12">
              Everything You Need
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <FeatureCard
                icon={<Users size={32} />}
                title="Member Management"
                description="Role-based access, teams, and permission control for organized collaboration."
              />
              <FeatureCard
                icon={<CheckSquare size={32} />}
                title="Task Tracking"
                description="Assign, track, and verify tasks with deadlines and proof of completion."
              />
              <FeatureCard
                icon={<Wallet size={32} />}
                title="Group Wallet"
                description="Collect payments, pay vendors, and manage escrow with full transparency."
              />
              <FeatureCard
                icon={<TrendingUp size={32} />}
                title="Analytics & Reports"
                description="Financial reports, task completion stats, and member contribution tracking."
              />
              <FeatureCard
                icon={<Shield size={32} />}
                title="Compliance Tracking"
                description="Promise management with trust scores to ensure accountability."
              />
              <FeatureCard
                icon={<Zap size={32} />}
                title="Real-time Updates"
                description="Instant notifications via in-app, email, and SMS for all critical events."
              />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <h3 className="text-3xl font-mono font-bold text-center mb-12">
              Built for Every Type of Group
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <UseCaseCard
                title="Trip Planning"
                description="Plan group trips with member coordination, expense splitting, and vendor bookings."
              />
              <UseCaseCard
                title="Event Organization"
                description="Manage college fests, weddings, or corporate events with full control."
              />
              <UseCaseCard
                title="Project Collaboration"
                description="Track deliverables, assign tasks, and manage budgets for team projects."
              />
              <UseCaseCard
                title="Club Management"
                description="Run your club or community with membership, activities, and finances."
              />
            </div>
          </div>
        </section>

        <section className="bg-black text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h3 className="text-4xl font-mono font-bold mb-6">
              Ready to Get Started?
            </h3>
            <p className="text-xl mb-8 text-nostalgic-300">
              Join hundreds of groups already using ATMOS
            </p>
            <Link to="/signup" className="btn btn-secondary text-lg px-8 py-3">
              Create Your Group
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t-2 border-black py-8">
        <div className="container mx-auto px-4 text-center text-nostalgic-600">
          <p className="font-mono">&copy; 2024 ATMOS. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="card">
      <div className="mb-4">{icon}</div>
      <h4 className="text-xl font-mono font-bold mb-2">{title}</h4>
      <p className="text-nostalgic-700">{description}</p>
    </div>
  );
}

interface UseCaseCardProps {
  title: string;
  description: string;
}

function UseCaseCard({ title, description }: UseCaseCardProps) {
  return (
    <div className="card">
      <h4 className="text-xl font-mono font-bold mb-2">{title}</h4>
      <p className="text-nostalgic-700">{description}</p>
    </div>
  );
}
