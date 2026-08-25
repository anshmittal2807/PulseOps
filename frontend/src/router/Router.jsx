import React from 'react'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import SideNavBar from '../components/layout/SideNavBar.jsx'
import TopNavBar from '../components/layout/TopNavBar.jsx'
import AllApis from '../pages/AllApis.jsx'
import AddApi from '../pages/AddApi.jsx'

function AppLayout() {
    return (
        <div className="min-h-screen">
            <SideNavBar />
            <div className="ml-[240px] flex flex-col min-h-screen">
                <TopNavBar />
                <Outlet />
            </div>
        </div>
    )
}

const router = createBrowserRouter([
    {
        path: '/',
        element: <AppLayout />,
        children: [
            {
                path: 'dashboard',
                element: <h1 className="p-6 text-2xl font-semibold">Dashboard</h1>,
            },
            {
                path: 'apis',
                element: <AllApis />,
            },
            {
                path: 'apis/add',
                element: <AddApi />,
            },
        ],
    },
])


function Router() {
    return <RouterProvider router={router} />
}

export default Router 
