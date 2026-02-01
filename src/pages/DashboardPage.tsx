import { Link } from 'react-router-dom';
import { Users, CheckSquare, Wallet as WalletIcon, Plus, Bell, Settings, LogOut } from 'lucide-react';

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b-2 border-black sticky top-0 bg-white z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-mono font-bold">ATMOS</h1>
          
          <div className="flex items-center gap-4">
            <button className="relative p-2 hover:bg-nostalgic-100 border-2 border-transparent hover:border-black">
              <Bell size={24} />
              <span className="absolute top-0 right-0 bg-black text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                3
              </span>
            </button>
            
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-nostalgic-100 border-2 border-transparent hover:border-black">
                <div className="w-8 h-8 bg-black text-white flex items-center justify-center font-mono font-bold">
                  JD
                </div>
              </button>
              
              <div className="absolute right-0 mt-2 w-48 bg-white border-2 border-black shadow-retro hidden group-hover:block">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-4 py-2 hover:bg-nostalgic-100 border-b border-nostalgic-300"
                >
                  <Settings size={16} />
                  Settings
                </Link>
                <button className="flex items-center gap-2 px-4 py-2 hover:bg-nostalgic-100 w-full text-left">
                  <LogOut size={16} />
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-mono font-bold mb-2">Welcome back, John!</h2>
          <p className="text-nostalgic-600">
            Saturday, February 1, 2026
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <StatCard
            icon={<Users size={32} />}
            label="My Groups"
            value="5"
          />
          <StatCard
            icon={<CheckSquare size={32} />}
            label="Pending Tasks"
            value="12"
          />
          <StatCard
            icon={<WalletIcon size={32} />}
            label="Total Balance"
            value="₹45,000"
          />
        </div>

        <div className="card mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-mono font-bold">🔔 Alerts & Urgent Items</h3>
          </div>
          <div className="space-y-2">
            <AlertItem
              text='Task "Book venue" overdue by 2 days'
              type="error"
            />
            <AlertItem
              text="Payment of ₹2,000 due in 1 day"
              type="warning"
            />
            <AlertItem
              text='Low balance warning in "Goa Trip 2024"'
              type="warning"
            />
          </div>
        </div>

        <div className="card mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-mono font-bold">My Groups</h3>
            <button className="btn btn-primary flex items-center gap-2">
              <Plus size={20} />
              Create Group
            </button>
          </div>
          
          <div className="space-y-4">
            <GroupCard
              name="Goa Trip 2024"
              role="Owner"
              members={25}
              balance={25000}
              pendingTasks={8}
              overdueTasks={2}
            />
            <GroupCard
              name="College Fest"
              role="Member"
              members={50}
              balance={10000}
              pendingTasks={3}
              overdueTasks={0}
            />
            <GroupCard
              name="Weekend Getaway"
              role="Organizer"
              members={8}
              balance={5000}
              pendingTasks={2}
              overdueTasks={0}
            />
          </div>
        </div>

        <div className="card">
          <h3 className="text-xl font-mono font-bold mb-6">Quick Actions</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <button className="btn btn-secondary text-left p-4">
              <Plus className="mb-2" size={24} />
              <div className="font-bold">Create New Group</div>
              <div className="text-sm text-nostalgic-600">Start a new project or event</div>
            </button>
            <button className="btn btn-secondary text-left p-4">
              <Users className="mb-2" size={24} />
              <div className="font-bold">Join Group</div>
              <div className="text-sm text-nostalgic-600">Use an invite code</div>
            </button>
            <button className="btn btn-secondary text-left p-4">
              <WalletIcon className="mb-2" size={24} />
              <div className="font-bold">View Vendors</div>
              <div className="text-sm text-nostalgic-600">Browse service providers</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
}

function StatCard({ icon, label, value }: StatCardProps) {
  return (
    <div className="card">
      <div className="flex items-center gap-4">
        <div className="text-nostalgic-700">{icon}</div>
        <div>
          <div className="text-3xl font-mono font-bold">{value}</div>
          <div className="text-nostalgic-600">{label}</div>
        </div>
      </div>
    </div>
  );
}

interface AlertItemProps {
  text: string;
  type: 'error' | 'warning' | 'info';
}

function AlertItem({ text, type }: AlertItemProps) {
  const borderColor = type === 'error' ? 'border-red-600' : type === 'warning' ? 'border-yellow-600' : 'border-blue-600';
  
  return (
    <div className={`p-3 border-l-4 ${borderColor} bg-nostalgic-50`}>
      • {text}
    </div>
  );
}

interface GroupCardProps {
  name: string;
  role: string;
  members: number;
  balance: number;
  pendingTasks: number;
  overdueTasks: number;
}

function GroupCard({ name, role, members, balance, pendingTasks, overdueTasks }: GroupCardProps) {
  return (
    <div className="card card-hover cursor-pointer">
      <div className="flex items-start justify-between mb-2">
        <h4 className="text-xl font-mono font-bold">{name}</h4>
        <span className="badge badge-primary">{role}</span>
      </div>
      
      <div className="text-nostalgic-600 space-y-1">
        <div>{members} members • ₹{balance.toLocaleString()} in wallet</div>
        <div>
          {pendingTasks} pending tasks
          {overdueTasks > 0 && (
            <span className="text-red-600 font-bold"> • {overdueTasks} overdue</span>
          )}
        </div>
      </div>
    </div>
  );
}
