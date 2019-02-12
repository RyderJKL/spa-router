import router from '../../router';
import template from './index.html';
import './style.css';

export default class {
  mount(container) {
    document.title = 'home';
    container.innerHTML = template;
    container.querySelector('.menu').addEventListener('click', function(e) {
      const target = e.target;
      const menuLink = target.dataset && target.dataset.link;
      if (!menuLink) return;
      // 调用 router.go 方法加载 /bar 页面
      router.go({
        path: `/${menuLink}`
      });
    });
  }
}
