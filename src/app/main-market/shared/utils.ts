import { RespGeneralImageItem, IMAGE_VERSION } from './market.models';

export function getValueOrDefault<T>(value: T, type: 'string' | 'number' | 'boolean', defaultValue: T): T {
  return typeof value === type ? value : defaultValue;
}


export function isBasicObjectType(value: any): boolean {
  return (typeof value === 'object') && !!value;
}


export function parseImagePath(image: RespGeneralImageItem, version: IMAGE_VERSION, marketPort: number ): string {
  if (!isBasicObjectType(image) || !Array.isArray(image.ImageDatas)) {
    return '';
  }

  // validate image actually exists... only supports 'FILE' type at the moment (or at least thats all we seem to be working with currently)
  const foundImg = image.ImageDatas.find(d => isBasicObjectType(d) && (d.imageVersion === version) && (d.protocol === 'FILE'));
  if (!foundImg) {
    return '';
  }

  // @TODO zaSmilingIdiot 2020-09-10 -> protocol and host are hardcoded, but should be provided along with the port, perhaps as a full url
  return `http://localhost:${marketPort}/api/images/${+image.id}/${version}`;
}
