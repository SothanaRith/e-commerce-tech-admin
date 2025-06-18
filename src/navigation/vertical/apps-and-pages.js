import { icon } from "@/views/demos/components/badge/demoCodeBadge"

export default [
  {
    title: 'Product',
   
    icon: { icon: 'tabler-shopping-bag' },
    children: [
      { title: 'List', to: 'apps-ecommerce-product-list', icon: { icon: 'tabler-list' } },
      { title: 'Add', to: 'apps-ecommerce-product-add', icon: { icon: 'tabler-plus' } },
      { title: 'Category', to: 'apps-ecommerce-product-category-list', icon: { icon: 'tabler-tag' } },
    ],
  },
  {
    title: 'Order', icon: { icon: 'tabler-shopping-cart' },
    children: [
      { title: 'List', to: 'apps-ecommerce-order-list', icon: { icon: 'tabler-list' } },
    ],
  },
  {
    title: 'Invoice',
    icon: { icon: 'tabler-file-invoice' },
    children: [
      { title: 'List', to: 'apps-invoice-list' },
      { title: 'Preview', to: { name: 'apps-invoice-preview-id', params: { id: '5036' } } },
      { title: 'Edit', to: { name: 'apps-invoice-edit-id', params: { id: '5036' } } },
      { title: 'Add', to: 'apps-invoice-add' },
    ],
  },
  {
    title: 'User',
    icon: { icon: 'tabler-user' },
    children: [
      { title: 'List', to: 'apps-user-list' },
      { title: 'View', to: { name: 'apps-user-view-id', params: { id: 21 } } },
    ],
  },
]
