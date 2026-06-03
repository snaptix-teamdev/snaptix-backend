class Info {
  id: number;
  name: string;
}

export class FindGeoMsResponseDto {
  country: Info;
  region: Info;
  city: Info;
}
