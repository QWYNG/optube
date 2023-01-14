const YoutubeResultUrl = 'https://www.youtube.com/results';

type YoutubeSearchParams = {
  gameTitle: string;
  text: string;
  onlyLatestPatch: boolean;
  latestPatchDate: string;
}

export function bulidYoutubeUrlWithSearchQuery({ gameTitle, text, onlyLatestPatch, latestPatchDate }: YoutubeSearchParams) {
  let param = new URLSearchParams()
  let paramValue = gameTitle.concat(' ', text)
  if (onlyLatestPatch) {
    paramValue = paramValue.concat(` after:${latestPatchDate}`)
  }

  param.append('search_query', paramValue)

  return YoutubeResultUrl + '?' + param.toString()
}
