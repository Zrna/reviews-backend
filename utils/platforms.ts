const platformUrls: Record<string, string> = {
  netflix: 'https://www.netflix.com/',
  appletv: 'https://tv.apple.com/',
  amazonprime: 'https://www.primevideo.com/',
  hulu: 'https://www.hulu.com/',
  disneyplus: 'https://www.disneyplus.com/',
  hboMax: 'https://www.hbomax.com/',
  peacock: 'https://www.peacocktv.com/',
  paramountplus: 'https://www.paramountplus.com/',
  youtubetv: 'https://tv.youtube.com/',
  crunchyroll: 'https://www.crunchyroll.com/',
  tubi: 'https://www.tubi.tv/',
  fubotv: 'https://www.fubo.tv/',
  slingtv: 'https://www.sling.com/',
  showtime: 'https://www.showtime.com/',
  starz: 'https://www.starz.com/',
  youtube: 'https://www.youtube.com/',
  spotify: 'https://www.spotify.com/',
};

export const getPlatformOrMediaUrl = (value: string | null | undefined): string | null => {
  if (!value) {
    return null;
  } else if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('www.')) {
    return value;
  } else {
    const name = value.toLowerCase().replace(/\s/g, '');

    if (platformUrls[name]) {
      return platformUrls[name];
    } else {
      return `https://www.${name}.com/`;
    }
  }
};
