import router from '../../router';
import template from './index.html';
import './style.css';

export default class {
  mount(container) {
    // const content = container.querySelector('.content')
    document.title = 'foo';
    container.innerHTML = template;
    container.querySelector('.foo__gohome').addEventListener('click', () => {
      // 调用 router.go 方法加载 /bar 页面
      router.go({
        path: '/'
      });
    });
  }
}
