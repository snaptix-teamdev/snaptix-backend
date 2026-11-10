class ResolveGeoNamesMs {
  id: number;
  name: string;
}

export class ResolveGeoNamesMsResponseDto {
  country: ResolveGeoNamesMs | null;
  region: ResolveGeoNamesMs | null;
  city: ResolveGeoNamesMs | null;
}
