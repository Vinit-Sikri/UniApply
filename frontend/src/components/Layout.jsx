import { useState } from 'react'
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const studentNavItems = [
  { path: '/', label: 'Dashboard', icon: 'home' },
  { path: '/applications', label: 'My Applications', icon: 'file-alt' },
  { path: '/documents', label: 'My Documents', icon: 'upload' },
  { path: '/payments', label: 'Payments', icon: 'credit-card' },
  { path: '/support', label: 'Support', icon: 'comments' },
]

const adminNavItems = [
  { path: '/admin', label: 'Dashboard', icon: 'home' },
  { path: '/admin/applications', label: 'Applications', icon: 'file-alt' },
  { path: '/admin/students', label: 'Students', icon: 'users' },
  { path: '/admin/payments', label: 'Payments', icon: 'credit-card' },
  { path: '/admin/refunds', label: 'Refunds', icon: 'undo' },
  { path: '/admin/tickets', label: 'Support Tickets', icon: 'comments' },
  { path: '/admin/faqs', label: 'FAQs', icon: 'question-circle' },
  { path: '/admin/document-config', label: 'Document Config', icon: 'file-check' },
]

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const location = useLocation()
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin'
  const navItems = isAdmin ? adminNavItems : studentNavItems

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-slate-900 text-white transition-all duration-300 fixed h-full z-30`}
      >
        <div className="p-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
              <i className="fas fa-graduation-cap text-xl"></i>
            </div>
            {sidebarOpen && (
              <div>
                <div className="text-xl font-bold">UniApply</div>
                <div className="text-xs text-slate-400">
                  {isAdmin ? 'Admin Panel' : 'Student Portal'}
                </div>
              </div>
            )}
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <i className={`fas fa-${item.icon} w-5`}></i>
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="absolute bottom-4 left-4 right-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-300 hover:bg-slate-800 transition-colors"
          >
            <i className="fas fa-sign-out-alt w-5"></i>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-20">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <i className="fas fa-bars text-gray-600"></i>
              </button>
              <div className="relative">
                <i className="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <i className="fas fa-bell text-xl"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <i className="fas fa-user text-blue-600"></i>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

