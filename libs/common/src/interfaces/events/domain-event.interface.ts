export interface DomainEvent<T = unknown> {
  specversion: '1.0';
  id: string;
  type: string;
  source: string;
  time: string;
  datacontenttype: 'application/json';
  data: T;
}
