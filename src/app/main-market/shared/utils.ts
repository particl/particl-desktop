
export function getValueOrDefault<T>(value: T, type: 'string' | 'number' | 'boolean', defaultValue: T): T {
  return typeof value === type ? value : defaultValue;
}


export function isBasicObjectType(value: any): boolean {
  return (typeof value === 'object') && !!value;
}


export function formatImagePath(path: string, port: number): string {
  const pathparts = path.split(':');

  if (pathparts.length !== 3) {
    return path;
  }

  let final = pathparts[2];
  const remainder = pathparts[2].split('/');
  if ((typeof +remainder[0] === 'number') && +remainder[0]) {
    final = remainder.slice(1).join('/');
  }
  return `${[pathparts[0], pathparts[1], String(port)].join(':')}/${final}`;
}
