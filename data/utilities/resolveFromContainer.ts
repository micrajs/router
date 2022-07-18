/* eslint-disable @typescript-eslint/no-explicit-any */
export function get(obj: Record<string, any>, path: string): any | undefined {
  return (path as string)
    .split(/[.[\]]/)
    .filter(Boolean)
    .reduce((value, key) => value?.[key], obj);
}

export function resolveFromContainer<T>(use: Micra.Use, path: string) {
  const [namespace, ...rest] = path.split('.');
  const service = use(namespace as never);
  const result = rest.length ? get(service, rest.join('.') as never) : service;

  return result as T;
}
