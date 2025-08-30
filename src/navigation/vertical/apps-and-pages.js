export default async function getAppAndPagesMenu () {
  const userCookie = useCookie('userData') // Ref
  const cookieVal = userCookie?.value ?? null

  const user =
        typeof cookieVal === 'string'
          ? ((() => { try { return JSON.parse(cookieVal) } catch { return {} } })())
          : (cookieVal || {})

  const role = user?.role || ''

  return [
    ...(['superAdmin', 'admin', 'stock'].includes(role)
      ? [{
        title: 'Product',
        icon: { icon: 'tabler-shopping-bag' },
        children: [
          { title: 'List', to: 'apps-ecommerce-product-list', icon: { icon: 'tabler-list' } },
          { title: 'Category', to: 'apps-ecommerce-product-category-list', icon: { icon: 'tabler-tag' } },
          { title: 'List slide', to: 'apps-ecommerce-slide-list', icon: { icon: 'tabler-tag' } },
          { title: 'List Poster', to: 'apps-ecommerce-poster-list', icon: { icon: 'tabler-tag' } },
        ],
      }]
      : []),

    ...(['superAdmin', 'admin', 'deliver', 'cashier'].includes(role)
      ? [{
        title: 'Order',
        icon: { icon: 'tabler-shopping-cart' },
        children: [
          { title: 'List', to: 'apps-ecommerce-order-list', icon: { icon: 'tabler-list' } },
        ],
      }]
      : []),

    ...( ['superAdmin', 'admin', 'cashier'].includes(role)
      ? [{
        title: 'Chat',
        icon: { icon: 'tabler-message-circle-2' },
        to: 'apps-chat',
      }]
      : []),

    ...( ['superAdmin', 'admin'].includes(role)
      ? [{
        title: 'User',
        icon: { icon: 'tabler-user' },
        children: [
          { title: 'List', to: 'apps-user-list' },
        ],
      }]
      : []),

    ...( ['superAdmin', 'admin'].includes(role)
      ? [{
        title: 'Notification',
        icon: { icon: 'tabler-notification' },
        children: [
          { title: 'List Global Notification', to: 'apps-notification-list', icon: { icon: 'tabler-notification' } },
        ],
      }]
      : []),
  ]
}
