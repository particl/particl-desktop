import { RespGeneralImageItem, IMAGE_VERSION, RespIdentityMarketItem } from './market.models';
import { Market } from '../services/data/data.models';
import * as marketConfig from '../../../../modules/market/config.js';


enum TextContent {
  OPEN_MARKET_NAME = 'Open Market'
}


const DefaulOpenMarketAddresses: string[] = [];

if (isBasicObjectType(marketConfig.addressesOpenMarketplace)) {
  DefaulOpenMarketAddresses.push(...Object.keys(marketConfig.addressesOpenMarketplace));
}


export function getValueOrDefault<T>(value: T, type: 'string' | 'number' | 'boolean', defaultValue: T): T {
  return typeof value === type ? value : defaultValue;
}


export function isBasicObjectType(value: any): boolean {
  return (typeof value === 'object') && !!value;
}


function buildImagePath(baseUrl: string, imageId: number, version: IMAGE_VERSION): string {
  return `${baseUrl}${baseUrl[baseUrl.length - 1] !== '/' ? '/' : ''}api/images/${+imageId}/${version}`;
}


export function parseImagePath(image: RespGeneralImageItem, version: IMAGE_VERSION, url: string ): string {
  if (!isBasicObjectType(image) || !Array.isArray(image.ImageDatas)) {
    return '';
  }

  // validate image requested actually exists...
  // NB! commented out at present since the actual image datas might not be present on the image item (and therefore cannot be validated)
  const foundImg = image.ImageDatas.find(d => isBasicObjectType(d) && (d.imageVersion === version)); // && (d.protocol === 'FILE'));
  if (!foundImg) {
    return '';
  }

  return buildImagePath(url, +image.id, version);
}


export function parseMarketResponseItem(src: RespIdentityMarketItem, marketUrl: string, defaultImage: string): Market {
  const resp: Market = {
    id: 0,
    name: '',
    type: null,
    receiveAddress: '',
    publishAddress: '',
    identityId: 0,
    image: '',
  };

  if (!isBasicObjectType(src)) {
    return resp;
  }

  resp.id = +src.id > 0 ? +src.id : resp.id;
  resp.type = getValueOrDefault(src.type, 'string', resp.type);
  resp.receiveAddress = getValueOrDefault(src.receiveAddress, 'string', resp.receiveAddress);
  resp.publishAddress = getValueOrDefault(src.publishAddress, 'string', resp.publishAddress);
  resp.name = DefaulOpenMarketAddresses.includes(resp.receiveAddress) ?
    TextContent.OPEN_MARKET_NAME :
    getValueOrDefault(src.name, 'string', resp.name);
  resp.identityId = +src.identityId > 0 ? +src.identityId : resp.identityId;

  if (+src.imageId > 0) {
   resp.image = buildImagePath(marketUrl, +src.imageId, 'ORIGINAL');
  }

  if (resp.image.length === 0) {
    resp.image = defaultImage;
  }

  return resp;
}
