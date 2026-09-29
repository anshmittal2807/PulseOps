import { useState } from 'react'
import { createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation, useNavigate } from 'react-router-dom'
import SideNavBar from '../components/layout/SideNavBar.jsx'
import TopNavBar from '../components/layout/TopNavBar.jsx'
import AllApis from '../pages/AllApis.jsx'
import AddApi from '../pages/AddApi.jsx'
import Dashboard from '../pages/Dashboard.jsx'
import Alerts from '../pages/Alerts.jsx'
import ApiDetails from '../pages/ApiDetails.jsx'
import ActivityLog from '../pages/ActivityLog.jsx'
import Reports from '../pages/Reports.jsx'
import DemoSettings from '../pages/DemoSettings.jsx'
import Login from '../pages/Login.jsx'
import Register from '../pages/Register.jsx'
import { useAuth } from '../context/AuthContext.jsx'

const pageHeaders = {
    '/dashboard': { title: 'Overview', crumb: 'Operations', addApi: true },
    '/apis': { title: 'API monitors', crumb: 'Operations', addApi: true },
    '/alerts': { title: 'Alerts', crumb: 'Operations' },
    '/reports': { title: 'Reports', crumb: 'Analytics' },
    '/activity-log': { title: 'Activity log', crumb: 'Workspace' },
    '/profile': { title: 'Profile' },
    '/settings': { title: 'Settings' },
}

function RequireAuth() {
    const { isLoggedIn } = useAuth();
    if (!isLoggedIn) return <Navigate to="/login" replace />;
    return <Outlet />;
}

function PublicOnly() {
    const { isLoggedIn } = useAuth();
    if (isLoggedIn) return <Navigate to="/dashboard" replace />;
    return <Outlet />;
}

function AppLayout() {
    const location = useLocation()
    const navigate = useNavigate()
    const [navOpen, setNavOpen] = useState(false)
    const header = pageHeaders[location.pathname]
        || (location.pathname === '/apis/add' ? { title: 'Add API' } : null)
        || (location.pathname.startsWith('/apis/') ? { title: 'API Details' } : null)
        || { title: 'PulseOps' }

    return (
        <div className="min-h-screen bg-background">
            <SideNavBar open={navOpen} onClose={() => setNavOpen(false)} />
            <div className="lg:ml-[252px] flex flex-col min-h-screen min-w-0 bg-background">
                <TopNavBar
                    title={header.title}
                    crumb={header.crumb}
                    onAddApi={header.addApi ? () => navigate('/apis/add') : null}
                    onMenu={() => setNavOpen(true)}
                />
                <Outlet />
            </div>
        </div>
    )
}

const router = createBrowserRouter([
    {
        element: <PublicOnly />,
        children: [
            { path: '/login', element: <Login /> },
            { path: '/register', element: <Register /> },
        ],
    },
    {
        element: <RequireAuth />,
        children: [
            {
                path: '/',
                element: <AppLayout />,
                children: [
                    { index: true, element: <Navigate to="/dashboard" replace /> },
                    { path: 'dashboard', element: <Dashboard /> },
                    { path: 'apis', element: <AllApis /> },
                    { path: 'apis/add', element: <AddApi /> },
                    { path: 'apis/:id', element: <ApiDetails /> },
                    { path: 'alerts', element: <Alerts /> },
                    { path: 'reports', element: <Reports /> },
                    { path: 'activity-log', element: <ActivityLog /> },
                    { path: 'profile', element: <DemoSettings /> },
                    { path: 'settings', element: <DemoSettings /> },
                ],
            },
        ],
    },
    { path: '*', element: <Navigate to="/dashboard" replace /> },
])


function Router() {
    return <RouterProvider router={router} />
}

export default Router
