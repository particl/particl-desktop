import { RespGeneralImageItem, IMAGE_VERSION, RespIdentityMarketItem, DefaultOpenMarketDetails, MarketType } from './market.models';
import { Market } from '../services/data/data.models';


enum TextContent {
  OPEN_MARKET_NAME = 'Open Market'
}


const defaultOpenMarkets: DefaultOpenMarketDetails[] = [
  {
    address: 'PZijh4WzjCWLbSgBkMUtLHZBaU6dSSmkqN',
    key: '4dgpQuxsDVxytK22ay8Ky7xTSDGJzPu2tnr14tyBoU7CmZC6dqM',
    name: TextContent.OPEN_MARKET_NAME,
    isTest: false,
    marketType: MarketType.MARKETPLACE,
  },

  {
    address: 'pmktyVZshdMAQ6DPbbRXEFNGuzMbTMkqAA',
    key: '2Zc2pc9jSx2qF5tpu25DCZEr1Dwj8JBoVL5WP4H1drJsX9sP4ek',
    name: TextContent.OPEN_MARKET_NAME,
    isTest: true,
    marketType: MarketType.MARKETPLACE,
  }

];


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


export function openMarketAddresses(): readonly DefaultOpenMarketDetails[] {
  return Object.freeze(defaultOpenMarkets);
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

  const defaultMarketIndex = defaultOpenMarkets.findIndex(omp => omp.address === resp.receiveAddress);
  if ( defaultMarketIndex > -1) {
    resp.name = openMarketAddresses()[defaultMarketIndex].name;
  } else {
    resp.name = getValueOrDefault(src.name, 'string', resp.name);
  }

  resp.identityId = +src.identityId > 0 ? +src.identityId : resp.identityId;

  if (+src.imageId > 0) {
   resp.image = buildImagePath(marketUrl, +src.imageId, 'ORIGINAL');
  }

  if (resp.image.length === 0) {
    resp.image = defaultImage;
  }

  return resp;
}
