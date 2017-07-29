//Tomahawk.registerClass( EventDispatcher, "EventDispatcher" );
import Event, { Triggers } from "./event";

class EventDispatcher {
  constructor() {
    this.parent = null;
    this._listeners = [];
  }

  addEventListener(type, scope, callback, useCapture = true) {
    this._listeners.push({ type, scope, callback, useCapture });
    console.log(this._listeners)
  }

  hasEventListener(type){
    if(this._listeners === null) {
      return false;
    }
    const eventFound = this.getEventListener(type);
    return !!eventFound;
  }

  dispatchEvent(event) {
    if(event.target === null) {
      event.target = this;
    }
    event.currentTarget = this;
    const eventFound = this.getEventListener(event.type);
    if(eventFound && (event.target === this || eventFound.useCapture !== false)) {
      eventFound.callback.apply(eventFound.scope, [event]);
    }
    if(event.bubbles === true && this.parent !== null && !!this.parent.dispatchEvent) {
      this.parent.dispatchEvent(event);
    }
  }

  getEventListener(type) {
    return this._listeners.find(listener => listener.type === type);
  }

  removeEventListener(type, scope, callback, useCapture) {
    let listener = this.getEventListener(type);
    while( listener != null ) {
        var obj = {};
        var i = this._listeners.length;
        var arr = [];
        const newListeners = this._listeners.filter(listenerCurrent => {
          return  listenerCurrent.type !== listener.type || listenerCurrent.scope !== scope || listenerCurrent.callback !== callback || listenerCurrent.useCapture !== useCapture;
        });
        this._listeners = newListeners;
        let listener = this.getEventListener(type);
    }
  }

  addChild(child) {
    if(child.parent) {
      child.parent.removeChild(child);
    }
    child.parent = this;
    this.children.push(child);
    child.dispatchEvent(new Event(Triggers.ADDED, true, true));
  }

  addChildAt(child, index) {
    const tab1 = this.children.slice(0, index);
    const tab2 = this.children.slice(index);
    this.children = tab1.concat([child]).concat(tab2);
    child.parent = this;
    child.dispatchEvent(new Event(Triggers.ADDED, true, true));
  }

  removeChildAt(index) {
    const child = this.children[index];
    if(child) {
      child.parent = null;
    }
    this.children.splice(index,1);
    child.dispatchEvent(new Event(Triggers.REMOVED, true, true));
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if(index > -1) {
      this.children.splice(index,1);
    }
    child.parent = null;
    child.dispatchEvent(new Event(Triggers.REMOVED, true, true));
  }
};
export default EventDispatcher;
