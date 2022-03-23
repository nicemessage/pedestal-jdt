class Events {
  constructor() {
    this.events = {};
  }
  on(name, fn) {
    if (this.events[name]) {
      this.events[name].push(fn);
    } else {
      this.events[name] = [fn];
    }
  }
  emit(...args) {
    /**
     * 通过 slice 的浅拷贝，可以避免在 once 的监听器改变函数顺序
     * 1，events 是 另一个数组 它的长度不会发生变化
     * 2, once 操作中，wrap 函数的 this.off 操作的不是 events 而是 this.events
     * */
    if(!this.events[args[0]]) return;

    const events = this.events[args[0]].slice();
    if (events) {
      for (let i = 0; i < events.length; i += 1) {
        events[i](...args.slice(1));
      }
    }
  }
  off(name, fn) {
    if (this.events[name]) {
      const index = this.events[name].indexOf(fn);
      if (index > -1) {
        this.events[name].splice(index, 1);
      }
    }
  }
  restart() {
    this.events = {};
  }
  once(name, fn) {
    /**
     * 关键知识点
     * 0, 通过包装函数实现了一个比较复杂的问题，类似于 “装饰器” 模式？？？
     * 1，要用箭头函数，否则函数内的 this 是函数本身
     * 2，扩展运算符表示把 arguments 扩展为多个以 , 相隔个字符串；
     * */
    const wrap = (...args) => {
      fn(...args);
      this.off(name, wrap);
    };
    this.on(name, wrap);
  }
}

export default Events;
