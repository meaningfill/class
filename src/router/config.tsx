import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/public/home/page'));
const ClassDetailPage = lazy(() => import('../pages/public/classes/detail'));
const PortfolioPage = lazy(() => import('../pages/public/portfolio/page'));
const ProductDetailPage = lazy(() => import('../pages/public/product/detail'));
const BlogPage = lazy(() => import('../pages/public/blog/page'));
const BlogDetailPage = lazy(() => import('../pages/public/blog/detail'));
const AdminLogin = lazy(() => import('../pages/admin/login'));
const AdminDashboard = lazy(() => import('../pages/admin/dashboard'));
const AIBlogGenerator = lazy(() => import('../pages/admin/blog-ai'));
const AdminClasses = lazy(() => import('../pages/admin/classes'));
const AdminEnrollments = lazy(() => import('../pages/admin/enrollments'));
const AdminPortfolio = lazy(() => import('../pages/admin/portfolio'));
const AdminBlog = lazy(() => import('../pages/admin/blog'));
const AdminProducts = lazy(() => import('../pages/admin/products'));
const AdminProductsAI = lazy(() => import('../pages/admin/products-ai'));
const AdminContactSettings = lazy(() => import('../pages/admin/contact'));
const AdminPublishQueue = lazy(() => import('../pages/admin/publish-queue'));
const AdminNewsletter = lazy(() => import('../pages/admin/newsletter'));
const AdminPayments = lazy(() => import('../pages/admin/payments'));

const AIAssistant = lazy(() => import('../components/features/AIAssistant'));
const NotFound = lazy(() => import('../pages/NotFound'));

const routes: RouteObject[] = [
  {
    path: '/',
    element: <HomePage />,
  },
  {
    path: '/classes',
    element: <ClassDetailPage />,
  },
  {
    path: '/portfolio',
    element: <PortfolioPage />,
  },
  {
    path: '/product/:id',
    element: <ProductDetailPage />,
  },
  {
    path: '/blog',
    element: <BlogPage />,
  },
  {
    path: '/blog/:id',
    element: <BlogDetailPage />,
  },
  {
    path: '/ai-consultant',
    element: <AIAssistant />,
  },
  {
    path: '/admin/login',
    element: <AdminLogin />,
  },
  {
    path: '/admin/dashboard',
    element: <AdminDashboard />,
  },
  {
    path: '/admin/blog-ai',
    element: <AIBlogGenerator />,
  },
  {
    path: '/admin/classes',
    element: <AdminClasses />,
  },
  {
    path: '/admin/enrollments',
    element: <AdminEnrollments />,
  },
  {
    path: '/admin/portfolio',
    element: <AdminPortfolio />,
  },
  {
    path: '/admin/blog',
    element: <AdminBlog />,
  },
  {
    path: '/admin/products',
    element: <AdminProducts />,
  },
  {
    path: '/admin/products-ai',
    element: <AdminProductsAI />,
  },
  {
    path: '/admin/contact',
    element: <AdminContactSettings />,
  },
  {
    path: '/admin/publish-queue',
    element: <AdminPublishQueue />,
  },
  {
    path: '/admin/newsletter',
    element: <AdminNewsletter />,
  },
  {
    path: '/admin/payments',
    element: <AdminPayments />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
