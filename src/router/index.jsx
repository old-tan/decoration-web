import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom"
import { lazy } from "react"
import { Spin } from "antd"

const Index = lazy(() => import("@/views/index"))
// const NotFound = lazy(() => import("@/views/notfound"))

const modules = import.meta.glob("@/views/*/*.jsx")
console.log("modules---", modules)
const components = Object.keys(modules).reduce((prev, cur) => {
  prev[cur.replace("@/views", "")] = modules[cur]
  return prev
}, {})

console.log("components---", components)

const router = createBrowserRouter([
  {
    path: "/",
    Component: Index,
    children: [
      // {
      //   path: "/",
      //   element: <Navigate to="/home" />,
      // },
      // {
      //   path: "/home",
      //   label: "一级菜单-1",
      //   Component: lazy(() => import("@/views/Home")),
      // },
    ],
  },
  // {
  //   path: "*",
  //   Component: NotFound,
  // },
])

export default function RootRoute() {
  return (
    // <RouterContext.Provider value={{ menus }}>
    <RouterProvider router={router} />
    // </RouterContext.Provider>
  )
}
