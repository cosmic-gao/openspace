/**
 * 应用注册表
 *
 * 管理已注册微应用的存储与查询
 */
import type { App, RegisteredApp } from '../types';

/**
 * 注册表接口
 */
export interface Registry {
    /**
     * 注册微应用
     * @param app 微应用定义
     */
    register(app: App): void;

    /**
     * 注销微应用
     * @param name 应用名称
     */
    unregister(name: string): void;

    /**
     * 获取已注册应用
     * @param name 应用名称
     * @returns 已注册应用或 undefined
     */
    get(name: string): RegisteredApp | undefined;

    /**
     * 获取所有已注册应用
     * @returns 已注册应用列表
     */
    list(): RegisteredApp[];

    /**
     * 获取当前激活的应用
     * @param location 浏览器 location
     * @returns 激活的应用列表
     */
    match(location: Location): RegisteredApp[];
}
