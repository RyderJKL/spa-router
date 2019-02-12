
// Router 类，用来控制页面根据当前 URL 切换
class Router {
  constructor({
    routes = [],
    mode = 'hash',
    root = '/'
  } = {}) {
    // routers 保存当前注册的路由
    this.routes = routes;
    // 'hash' || 'history' 模式
    this.mode = mode === 'history' && !!(history.pushState) ? 'history' : 'hash';
    // root 根路由，在我们使用 pushState 时需用到它
    this.root = root ? `/${this.clearSlashes(root)}/` : '/';
    this.launch();
  }

  launch() {
    // 点击浏览器后退 / 前进按钮时会触发 window.onpopstate 事件，我们在这时切换到相应页面
    // https://developer.mozilla.org/en-US/docs/Web/Events/popstate
    window.addEventListener('popstate', () => {
      this.loadView(this.getCurrentRoute());
    })

    // 打开页面时加载当前页面或者主页面
    this.go(this.getCurrentRoute());
  }

  // 获取当前 URL 路径
  getFragment() {
    let fragemnt = '';
    if (this.mode === 'history') {
      fragemnt = this.clearSlashes(decodeURI(location.pathname + location.search))
      fragemnt = fragemnt.replace(/\?(.*)?/, '');
      fragemnt = this.root !== '/' ? fragemnt.replace(this.root, '') : fragemnt;
    } else {
      const match = window.location.href.match(/#(.*)$/);
      fragemnt = match ? match[1] : '';
    }

    return fragemnt || '/';
    // return this.clearSlashes(fragemnt) || '/'
  }

  // 获取当前 route 信息
  getCurrentRoute() {
    const currentFragement = this.getFragment();

    const currentRoute = this.routes.find(route => {
      return route.path === currentFragement;
    });

    return currentRoute;
  }

  clearSlashes(path) {
    return path.toString().replace(/^\/|\/$/, '');
  }

  add(_route, _handler) {
    let route = _route;
    let handler = _handler;

    if (typeof route === 'function') {
      handler = route;
      route = '';
    }

    this.routes.push({ route, handler })

    return this;
  }

  remove(params) {
    for (let i = 0; i < this.routes.length; i++) {
      const item = this.items[i];
      if (item.handler === params || item.route.toString() === params.toString()) {
        this.routes.splice(i, 1);
        return this;
      }
    }

    return this;
  }

  flush() {
    this.routes = [];
    this.mode = null;
    this.root = '/';
    return this;
  }

  go(route) {
    if (this.mode === 'history') {
      history.pushState(null, null, `${this.root}${this.clearSlashes(route.path)}`);
    } else {
      window.location.href = `${window.location.href.replace(/#(.*)$/, '')}#${route.path}`;
    }

    return this;
  }

  // 动态加载 route 路径的页面
  async loadView(route) {
    if (!route) {
      console.error(`route isn't exist`);
    }

    // 动态加载页面
    const View = (await route['component']()).default;

    // 创建页面实例
    const view = new View();

    // 把页面加载到 document.body 中
    view.mount(document.body);
  }
}

export default Router;
