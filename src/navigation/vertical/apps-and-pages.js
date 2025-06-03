import { icon } from "@/views/demos/components/badge/demoCodeBadge";

export default [
  {
    title: 'Product',
   
    icon: { icon: 'tabler-shopping-bag' },
    children: [
      { title: 'List', to: 'apps-ecommerce-product-list',icon: { icon: 'tabler-list' } },
      { title: 'Add', to: 'apps-ecommerce-product-add',icon: { icon: 'tabler-plus' } },
      { title: 'Category', to: 'apps-ecommerce-product-category-list',icon: { icon: 'tabler-tag' } },
    ],
  },
  {
    title: 'Order',
     icon: { icon: 'tabler-shopping-cart' },
    children: [
      { title: 'List', to: 'apps-ecommerce-order-list' , icon: { icon: 'tabler-list' } },

      { title: 'Details', to: { name: 'apps-ecommerce-order-details-id', params: { id: '9042' } , icon: { icon: 'tabler-info-circle' } } },
    ],
  },
  {
    title: 'Customer',
    icon: { icon: 'tabler-users' },
    children: [
      { title: 'List', to: 'apps-ecommerce-customer-list' ,icon: { icon: 'tabler-list' } },
      { title: 'Details', to: { name: 'apps-ecommerce-customer-details-id', params: { id: 478426 } , icon: { icon: 'tabler-info-circle' } } },
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
    title: 'Chat',
    icon: { icon: 'tabler-message-circle-2' },
    to: 'apps-chat',
  },
  {
    title: 'Calendar',
    icon: { icon: 'tabler-calendar' },
    to: 'apps-calendar',
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
  {
    title: 'Pages',
    icon: { icon: 'tabler-file' },
    children: [
      { title: 'User Profile', to: { name: 'pages-user-profile-tab', params: { tab: 'profile' } } },
      { title: 'Account Settings', to: { name: 'pages-account-settings-tab', params: { tab: 'account' } } },
      { title: 'Pricing', to: 'pages-pricing' },
      { title: 'FAQ', to: 'pages-faq' },
      {
        title: 'Miscellaneous',
        children: [
          { title: 'Coming Soon', to: 'pages-misc-coming-soon', target: '_blank' },
          { title: 'Under Maintenance', to: 'pages-misc-under-maintenance', target: '_blank' },
          { title: 'Page Not Found - 404', to: { path: '/pages/misc/not-found' }, target: '_blank' },
          { title: 'Not Authorized - 401', to: { path: '/pages/misc/not-authorized' }, target: '_blank' },
        ],
      },
    ],
  },
];
