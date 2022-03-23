class simpleEvent {
  constructor() {
    this.events = {};
    this.isNotRuning = true;
  }
  on(name, fn) {
    this.events[name] = fn;
  }
  emit(...args) {
    /**
     * 路由跳转有可能是个异步的
     * 这个需要加个锁，否则，上一次执行跳转没完成，再次执行跳转会引发错误
     */
    if(this.isNotRuning){
      this.isNotRuning = false;
      /**
       * emit 时候需要有这个事件绑定了
       * 待完成，为什么有的时候没有，得研究一下
       * 这个地方要仔细研究一下
       */
      if(this.events[args[0]]){
        this.events[args[0]](...args.slice(1))
      }
      setTimeout(() => {
        this.isNotRuning = true;
      }, 50)
    }
  }
  restart() {
    this.events = {};
  }
}

export default simpleEvent;


