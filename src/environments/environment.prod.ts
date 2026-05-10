import packageInfo from '../../package.json';

export const environment = {
  appVersion: packageInfo.version,
  production: true,

  siteUrl: 'http://127.0.0.1:8000',
  apiUrl:'http://127.0.0.1:8000/api',
  siteUrlMedia: 'http://127.0.0.1:8000',
};
