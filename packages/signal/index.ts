/**
 * @openspace/signal
 * 
 * 轻量级、类型安全的事件发射器，支持通配符监听。
 */

export type EventType = string | symbol;

export type Handler<T = any> = (event: T) => void;
export type WildcardHandler<E = Record<string, any>> = (
  type: keyof E,
  event: E[keyof E]
) => void;

export type EventHandlerList<T = any> = Array<Handler<T> | WildcardHandler<any>>;
export type EventHandlerMap<E = Record<string, any>> = Map<
  keyof E | '*',
  EventHandlerList<E[keyof E] | E>
>;

/**
 * Signal 接口定义
 */
export interface Emitter<E extends Record<EventType, any>> {
  all: EventHandlerMap<E>;

  on<K extends keyof E>(type: K, handler: Handler<E[K]>): () => void;
  on(type: '*', handler: WildcardHandler<E>): () => void;

  once<K extends keyof E>(type: K, handler: Handler<E[K]>): () => void;
  once(type: '*', handler: WildcardHandler<E>): () => void;

  off<K extends keyof E>(type: K, handler?: Handler<E[K]>): void;
  off(type: '*', handler?: WildcardHandler<E>): void;

  emit<K extends keyof E>(type: K, event: E[K]): void;
  emit<K extends keyof E>(type: undefined extends E[K] ? K : never): void;

  clear(): void;
}

/**
 * Signal 类实现
 */
export class Signal<E extends Record<EventType, any> = Record<string, any>> implements Emitter<E> {
  public all = new Map<keyof E | '*', EventHandlerList>();

  /**
   * 监听事件
   * @param type 事件类型或 '*'
   * @param handler 处理函数
   * @returns 取消订阅函数
   */
  public on<K extends keyof E>(type: K | '*', handler: Handler<E[K]> | WildcardHandler<E>): () => void {
    const handlers = this.all.get(type);
    if (handlers) {
      handlers.push(handler as any);
    } else {
      this.all.set(type, [handler as any] as EventHandlerList);
    }

    return () => this.off(type, handler);
  }

  /**
   * 监听一次性事件
   * @param type 事件类型或 '*'
   * @param handler 处理函数
   * @returns 取消订阅函数
   */
  public once<K extends keyof E>(type: K | '*', handler: Handler<E[K]> | WildcardHandler<E>): () => void {
    const wrapper = (...args: any[]) => {
      this.off(type, wrapper);
      return (handler as Function).apply(this, args);
    };
    // 保存原始handler引用以便off能正确移除(如果在触发前手动调用off)
    // 但此处为了简化实现，且on返回了取消函数，通常不需要直接调用off(handler)移除once handler
    // 如果需要支持 off(type, originalHandler)，则需要更复杂的映射
    return this.on(type, wrapper as any);
  }

  /**
   * 取消监听
   * @param type 事件类型或 '*'
   * @param handler 处理函数
   */
  public off<K extends keyof E>(type: K | '*', handler?: Handler<E[K]> | WildcardHandler<E>): void {
    const handlers = this.all.get(type);
    if (!handlers) return;

    if (handler) {
      // 简单移除，不涉及 once wrapper 的引用查找，保持轻量
      const index = handlers.indexOf(handler as any) >>> 0;
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    } else {
      this.all.set(type, []);
    }

    if (handlers.length === 0) {
      this.all.delete(type);
    }
  }

  /**
   * 触发事件
   * @param type 事件类型
   * @param event 事件数据
   */
  public emit<K extends keyof E>(type: K, event?: E[K]): void {
    // 触发具体事件监听器
    let handlers = this.all.get(type);
    if (handlers) {
      handlers
        .slice()
        .map((handler) => {
          try {
            (handler as Handler<E[K]>)(event!);
          } catch (e) {
            console.error(`[Signal] Error in handler for event "${String(type)}":`, e);
          }
        });
    }

    // 触发通配符监听器 ('*')
    handlers = this.all.get('*');
    if (handlers) {
      handlers
        .slice()
        .map((handler) => {
          try {
            (handler as WildcardHandler<E>)(type, event!);
          } catch (e) {
            console.error(`[Signal] Error in wildcard handler for event "${String(type)}":`, e);
          }
        });
    }
  }

  /**
   * 清空所有监听器
   */
  public clear(): void {
    this.all.clear();
  }
}

export default Signal;
