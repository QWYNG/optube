const positionRateScriptURL = "https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-champion-statistics/global/default/rcp-fe-lol-champion-statistics.js"
const versionURL = 'https://ddragon.leagueoflegends.com/api/versions.json'

function championsURL(version: string) {
  return `http://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`
}
function jpChampionsURL(version: string) {
  return `http://ddragon.leagueoflegends.com/cdn/${version}/data/ja_JP/champion.json`
}
function krChampionsURL(version: string) {
  return `http://ddragon.leagueoflegends.com/cdn/${version}/data/ko_KR/champion.json`
}

export async function getlatestPatchVersion(): Promise<string> {
  const response = await fetch(versionURL).then((r) => r.text())
  const json = JSON.parse(response)

  return json[0]
}

const roles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'SUPPORT'] as const
type Role = typeof roles[number]

export type Champion = {
  id: string
  key: string
  name: string
  roles: Role[]
  iconUrl: string
  krName: string
  jpName: string
}

const patchSchedule = new Map<string, string>(Object.entries({
  '13.1': '2023-1-11',
  '13.2': '2023-1-25',
  '13.3': '2023-2-08',
  '13.4': '2023-2-23',
  '13.5': '2023-3-08',
  '13.6': '2023-3-22',
  '13.7': '2023-4-5',
  '13.8': '2023-4-19',
  '13.9': '2023-5-3',
  '13.10': '2023-5-17',
  '13.11': '2023-6-1',
  '13.12': '2023-6-14',
  '13.13': '2023-6-28',
  '13.14': '2023-7-19',
  '13.15': '2023-8-2',
  '13.16': '2023-8-16',
  '13.17': '2023-8-30',
  '13.18': '2023-9-13',
  '13.19': '2023-9-27',
  '13.20': '2023-10-11',
  '13.21': '2023-10-25',
  '13.22': '2023-11-8',
  '13.23': '2023-11-21',
  '13.24': '2023-12-6'
}))

export async function getLatestPatchDateString(): Promise<String> {
  const latestVersion = await getlatestPatchVersion()
  const majorVersion = latestVersion.match(`(.+?\.){2}`)?.slice(0, -1).toString() ?? '13.1'
  return patchSchedule.get(majorVersion) ?? '2023-1-1'
}

export async function getAllChampionWithPosionRate(): Promise<Champion[]> {
  const latestVersion = await getlatestPatchVersion()
  const script = await fetch(positionRateScriptURL).then((r) => r.text())
  const championsJson = await fetch(championsURL(latestVersion)).then((r) => r.json()).then(json => Object.values(json.data)) as Champion[]
  const jpChampionsJson = await fetch(jpChampionsURL(latestVersion)).then((r) => r.json()).then(json => Object.values(json.data)) as Champion[]
  const krChampionsJson = await fetch(krChampionsURL(latestVersion)).then((r) => r.json()).then(json => Object.values(json.data)) as Champion[]


  const championMap = new Map<number, Champion>()

  roles.forEach(role => {
    const pickRateMap = new Map<number, number>()
    const matches = script.match(RegExp(`${role}:(.*?})`))
    if (matches != null) {
      const match = matches[0]
      match.replace(" ", "").split(",").forEach((pair) => {
        const p = pair.split(":")
        pickRateMap.set(Number(p[0]), Number(p[1]))
      })

      championsJson.forEach(championJson => {
        const key = Number(championJson.key)
        const rate = pickRateMap.get(key)
        const champion = championMap.get(key)

        if (rate != null) {
          if (champion != null) {
            championMap.set(key, {
              id: champion.id,
              key: champion.key,
              name: champion.name,
              roles: champion.roles.concat(role),
              iconUrl: champion.iconUrl,
              jpName: champion.jpName,
              krName: champion.krName
            })
          } else {
            championMap.set(key, {
              id: championJson.id,
              key: championJson.key,
              name: championJson.name,
              roles: [role],
              iconUrl: `http://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion/${championJson.id}.png`,
              jpName: jpChampionsJson.find(e => e.key == championJson.key)?.name ?? championJson.name,
              krName: krChampionsJson.find(e => e.key == championJson.key)?.name ?? championJson.name
            }
            )
          }
        }
      })
    }
  })
  return Array.from(championMap.values()).sort((a, b) => {
    if (a.name < b.name) {
      return -1
    }
    if (a.name > b.name) {
      return 1
    }

    return 0
  })
}
