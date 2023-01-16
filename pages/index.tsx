import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import {
  Radio, Switch, Button, Space, Col, Row, Tabs, TabsProps
} from 'antd';
import { SearchOutlined } from '@ant-design/icons';

type Locale = 'ENG' | 'JP' | 'KR'

import { GetStaticProps } from 'next';
import { Champion, getAllChampionWithPosionRate, getLatestPatchDateString } from '../lib/lol';
import { Dispatch, SetStateAction, useState } from 'react';
import { bulidYoutubeUrlWithSearchQuery } from '../lib/youtube';

function championIcon(champion: Champion, selectedChampion: Champion, selectChampion: Dispatch<SetStateAction<Champion>>) {
  return (
    <Col key={champion.id} onClick={e => selectChampion(champion)}>
      <img
        key={champion.id}
        src={champion.iconUrl}
        alt={`${champion.id} icon`}
        width={64}
        height={66}
        className={(selectedChampion.id == champion.id) ? styles.selected : styles.not_selected}
      />
    </Col>
  )
}

function tabItems(
  topChampions: Champion[],
  jgChampions: Champion[],
  midChampions: Champion[],
  botChampions: Champion[],
  supportChampions: Champion[],
  selectedChampion: Champion,
  selectChampion: Dispatch<SetStateAction<Champion>>
)
  : TabsProps['items'] {
  return [
    {
      key: 'TOP',
      label: `Top`,
      children: <Row justify={'center'} gutter={30}>
        <div className={styles.flex}>
          {topChampions.map(champion => championIcon(champion, selectedChampion, selectChampion))}
        </div>
      </Row>
      ,
    },
    {
      key: 'JUNGLE',
      label: `Jungle`,
      children: <Row justify={'center'} gutter={30}>
        <div className={styles.flex}>
          {jgChampions.map(champion => championIcon(champion, selectedChampion, selectChampion))}
        </div>
      </Row>

    },
    {
      key: 'MIDDLE',
      label: `Mid`,
      children: <Row justify={'center'} gutter={30}>
        <div className={styles.flex}>
          {midChampions.map(champion => championIcon(champion, selectedChampion, selectChampion))}
        </div>
      </Row>

    },
    {
      key: 'BOT',
      label: `Bot`,
      children: <Row justify={'center'} gutter={30}>
        <div className={styles.flex}>
          {botChampions.map(champion => championIcon(champion, selectedChampion, selectChampion))}
        </div>
      </Row>
    },
    {
      key: 'SUPPORT',
      label: `Support`,
      children: <Row justify={'center'} gutter={30}>
        <div className={styles.flex}>
          {supportChampions.map(champion => championIcon(champion, selectedChampion, selectChampion))}
        </div>
      </Row>
    }
  ]
}

function searchYoutubeButton(champion: Champion, onlyLatestPatch: boolean, latestPatchDate: string, locale: Locale) {
  let queryName: string

  switch (locale) {
    case 'ENG':
      queryName = champion.name
      break
    case 'JP':
      queryName = champion.jpName
      break
    case 'KR':
      queryName = champion.krName
      break
  }

  return (
    <Button
      type="primary"
      size='large'
      icon={<SearchOutlined />}
      href={bulidYoutubeUrlWithSearchQuery({ gameTitle: 'lol', text: queryName, onlyLatestPatch: onlyLatestPatch, latestPatchDate: latestPatchDate })}
      target="blank">
      Search on YouTube
    </Button>
  )
}


export default function Home({ topChampions, jgChampions, midChampions, botChampions, supportChampions, latestPatchDate }
  : {
    topChampions: Champion[],
    jgChampions: Champion[],
    midChampions: Champion[],
    botChampions: Champion[],
    supportChampions: Champion[],
    latestPatchDate: string
  }) {
  const [locale, setLocal] = useState<Locale>('JP')
  const [onlyLatestPatch, setonlyLatestPatch] = useState(false)
  const [selectedChampion, selectChampion] = useState<Champion>(topChampions[0])
  return (
    <>
      <Head>
        <title>OP.Tube</title>
        <meta name="description" content="Select your champion and Discover OP video" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main className={styles.main}>
        <h1>OP.Tube</h1>
        <h2>Select your Champion and Discover OP video on YouTube</h2>
        <div className={styles.grid}>
          <Row justify={'center'} gutter={30}>
            <div className={styles.flex}>
              <Tabs items={tabItems(topChampions, jgChampions, midChampions, botChampions, supportChampions, selectedChampion, selectChampion)}
                centered={true}
                size={'large'}
              ></Tabs>
            </div>
          </Row>
          <Space direction='vertical' align='center' size={'middle'}>
            Language for search
            <Radio.Group value={locale} onChange={e => setLocal(e.target.value)}>
              <Radio.Button key="ja" value={'JP'}>
                日本語
              </Radio.Button>
              <Radio.Button key="kr" value={'KR'}>
                한국어
              </Radio.Button>
              <Radio.Button key="en" value={'ENG'}>
                English
              </Radio.Button>
            </Radio.Group>
            <Space>
              Only Video after the latest patch date
              <Switch defaultChecked={onlyLatestPatch} onChange={(e) => setonlyLatestPatch(e)}></Switch>
            </Space>
            {searchYoutubeButton(selectedChampion, onlyLatestPatch, latestPatchDate, locale)}
          </Space>
        </div>
      </main>
    </>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const champions = await getAllChampionWithPosionRate();

  const topChampions = champions.filter(champion => champion.roles.includes('TOP'))
  const jgChampions = champions.filter(champion => champion.roles.includes('JUNGLE'))
  const midChampions = champions.filter(champion => champion.roles.includes('MIDDLE'))
  const botChampions = champions.filter(champion => champion.roles.includes('BOTTOM'))
  const supportChampions = champions.filter(champion => champion.roles.includes('SUPPORT'))
  const patchDate = await getLatestPatchDateString()

  return {
    props: {
      topChampions: topChampions,
      jgChampions: jgChampions,
      midChampions: midChampions,
      botChampions: botChampions,
      supportChampions: supportChampions,
      latestPatchDate: patchDate
    }
  }
}
