import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

const router = createBrowserRouter([
    {
        path: '/',
        children : [
            {
             path: 'dashboard',
             element: <h1>Dashboard</h1> 
            },

            {
                index :true,
                element: <h1>Home</h1>
            }
        ]
    }

])

function Router() {
    return <RouterProvider router={router} />
}

export default Router 
