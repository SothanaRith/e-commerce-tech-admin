
export default async function getDashboardMenu () {
  const userCookie = useCookie('userData')
  const cookieVal = userCookie?.value ?? null

  const user =
        typeof cookieVal === 'string'
          ? ((() => { try { return JSON.parse(cookieVal) } catch { return {} } })())
          : (cookieVal || {})

  const role = user?.role || ''

  return (role === 'superAdmin' || role === 'admin' || role === 'stock')
    ? [
      {
        title: 'Dashboards',
        icon: { icon: 'tabler-smart-home' },
        to: 'dashboards-ecommerce',
      },
    ]
    : []
}

