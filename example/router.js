import Router from '../src';

const routes = [
  // 需要使用 syntax-dynamic-import 来解析此语法 import() 语法
  // 同时 .babelrc 也需添加 babel presets stage-2支持
  {
    name: 'home',
    path: '/',
    component: () => import('./views/home')
  },
  {
    name: 'home',
    path: '/home',
    component: () => import('./views/home')
  },
  {
    name: 'foo',
    path: '/foo',
    component: () => import('./views/foo')
  }
];

export default new Router({
  routes,
  mode: 'hash'
});
