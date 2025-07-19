import { icon } from "@/views/demos/components/badge/demoCodeBadge"

export default [
  {
    title: 'Product',
   
    icon: { icon: 'tabler-shopping-bag' },
    children: [
      { title: 'List', to: 'apps-ecommerce-product-list', icon: { icon: 'tabler-list' } },
      { title: 'Category', to: 'apps-ecommerce-product-category-list', icon: { icon: 'tabler-tag' } },
      { title: 'List slide', to: 'apps-ecommerce-slide-list', icon: { icon: 'tabler-tag' } },
      { title: 'List Poster', to: 'apps-ecommerce-poster-list', icon: { icon: 'tabler-tag' } },
    ],
  },
  {
    title: 'Order', icon: { icon: 'tabler-shopping-cart' },
    children: [
      { title: 'List', to: 'apps-ecommerce-order-list', icon: { icon: 'tabler-list' } },
    ],
  },
  {
    title: 'Chat',
    icon: { icon: 'tabler-message-circle-2' },
    to: 'apps-chat',
  },
  {
    title: 'User',
    icon: { icon: 'tabler-user' },
    children: [
      { title: 'List', to: 'apps-user-list' },
    ],
  },
  {
    title: 'Notification',
    icon: { icon: 'tabler-notification' },
    children: [
      { title: 'List Global Notification', to: 'apps-notification-list', icon: { icon: 'tabler-notification' } },
    ],
  },
]
