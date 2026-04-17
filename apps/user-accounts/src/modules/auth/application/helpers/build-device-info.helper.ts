import { UAParser } from 'ua-parser-js';

export function buildDeviceInfo(userAgent: string): string {
  const ua = UAParser(userAgent);

  const deviceInfo = ua.device.type
    ? `Device: ${ua.device.type} ${ua.device.vendor} ${ua.device.model};`
    : '';
  const osInfo = `OS: ${ua.os.name} ${ua.os.version};`;
  const browserInfo = `Browser: ${ua.browser.name} ${ua.browser.version}`;

  return `${deviceInfo} ${osInfo} ${browserInfo}`;
}
