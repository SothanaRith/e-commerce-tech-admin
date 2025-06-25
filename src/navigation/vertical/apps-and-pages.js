import { icon } from "@/views/demos/components/badge/demoCodeBadge"

export default [
  {
    title: 'Product',
   
    icon: { icon: 'tabler-shopping-bag' },
    children: [
      { title: 'List', to: 'apps-ecommerce-product-list', icon: { icon: 'tabler-list' } },
      { title: 'Category', to: 'apps-ecommerce-product-category-list', icon: { icon: 'tabler-tag' } },
      { title: 'List slide', to: 'apps-ecommerce-slide-list', icon: { icon: 'tabler-tag' } },
    ],
  },
  {
    title: 'Order', icon: { icon: 'tabler-shopping-cart' },
    children: [
      { title: 'List', to: 'apps-ecommerce-order-list', icon: { icon: 'tabler-list' } },
    ],
  },
  {
    title: 'User',
    icon: { icon: 'tabler-user' },
    children: [
      { title: 'List', to: 'apps-user-list' },
    ],
  },
]
