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

      { title: 'Details', to: { name: 'apps-ecommerce-order-details-id', params: { id: '9042' }, icon: { icon: 'tabler-info-circle' } } },
    ],
  },
  {
    title: 'Manage Review',
    to: 'apps-ecommerce-manage-review',
    icon: { icon: 'tabler-star' },
  },
  {
    title: 'Referrals',
    to: 'apps-ecommerce-referrals',
    icon: { icon: 'tabler-user-plus' },
  },
  {
    title: 'Settings',
    to: 'apps-ecommerce-settings',
    icon: { icon: 'tabler-settings' },
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
  {
    title: 'Roles & Permissions',
    icon: { icon: 'tabler-lock' },
    children: [
      { title: 'Roles', to: 'apps-roles' },
      { title: 'Permissions', to: 'apps-permissions' },
    ],
  },
]
