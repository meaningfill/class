import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';

const HomePage = lazy(() => import('../pages/home/page'));
const ClassDetailPage = lazy(() => import('../pages/classes/detail'));
const PortfolioPage = lazy(() => import('../pages/portfolio/page'));
const ProductDetailPage = lazy(() => import('../pages/product/detail'));
const BlogPage = lazy(() => import('../pages/blog/page'));
const BlogDetailPage = lazy(() => import('../pages/blog/detail'));
const AdminLogin = lazy(() => import('../pages/admin/login'));
const AdminDashboard = lazy(() => import('../pages/admin/dashboard'));
const AIBlogGenerator = lazy(() => import('../pages/admin/blog-ai'));
const AdminClasses = lazy(() => import('../pages/admin/classes'));
const AdminEnrollments = lazy(() => import('../pages/admin/enrollments'));
const AdminPortfolio = lazy(() => import('../pages/admin/portfolio'));
const AdminBlog = lazy(() => import('../pages/admin/blog'));
const AdminProducts = lazy(() => import('../pages/admin/products'));
const AdminProductsAI = lazy(() => import('../pages/admin/products-ai'));

const AIAssistant = lazy(() => import('../AIAssistant'));
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
    path: '*',
    element: <NotFound />,
  },
];

export default routes;
