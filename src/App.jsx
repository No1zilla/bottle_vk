import React, { useEffect, useState } from 'react';
import bridge from '@vkontakte/vk-bridge';
import {
  SplitLayout,
  SplitCol,
  View,
  Epic,
  Tabbar,
  TabbarItem,
  ConfigProvider,
} from '@vkontakte/vkui';
import {
  Icon28GameOutline,
  Icon28FavoriteOutline,
  Icon28UserCircleOutline,
} from '@vkontakte/icons';
import Home from './panels/Home.jsx';
import Game from './panels/Game.jsx';
import Results from './panels/Results.jsx';
import Leaderboard from './panels/Leaderboard.jsx';
import Profile from './panels/Profile.jsx';
import OfflineBanner from './components/OfflineBanner.jsx';
import { useVKUser } from './hooks/useVKUser.js';

export default function App() {
  const [story, setStory] = useState('game');
  const [activePanel, setActivePanel] = useState('home');
  const [players, setPlayers] = useState([]);
  const [scheme, setScheme] = useState('space_gray');
  const { user } = useVKUser();

  useEffect(() => {
    let unsub;
    try {
      unsub = bridge.subscribe(({ detail }) => {
        if (!detail) return;
        if (detail.type === 'VKWebAppUpdateConfig') {
          const s = detail.data?.scheme;
          if (s) setScheme(s);
        }
      });
    } catch (e) {
      // ignore in browser
    }
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  function clearGameSession() {
    try {
      sessionStorage.removeItem('bottle_game_spinnerIndex');
      sessionStorage.removeItem('bottle_game_targetIndex');
      sessionStorage.removeItem('bottle_game_task');
      sessionStorage.removeItem('bottle_game_phase');
    } catch {}
  }

  function goToGame() {
    setPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })));
    clearGameSession();
    setActivePanel('gameplay');
  }

  function endGame() {
    console.log('endGame called -> activePanel = results');
    setActivePanel('results');
  }

  function playAgain() {
    setPlayers((ps) => ps.map((p) => ({ ...p, score: 0 })));
    clearGameSession();
    setActivePanel('home');
  }

  const appearance =
    scheme === 'space_gray' || scheme === 'vkcom_dark' || scheme === 'client_dark'
      ? 'dark'
      : 'light';

  return (
    <ConfigProvider appearance={appearance}>
      <SplitLayout>
        <SplitCol>
          <OfflineBanner />
          <Epic
            activeStory={story}
            tabbar={
              <Tabbar>
                <TabbarItem
                  onClick={() => setStory('game')}
                  selected={story === 'game'}
                  text="Игра"
                >
                  <Icon28GameOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => setStory('leaderboard')}
                  selected={story === 'leaderboard'}
                  text="Рейтинг"
                >
                  <Icon28FavoriteOutline />
                </TabbarItem>
                <TabbarItem
                  onClick={() => setStory('profile')}
                  selected={story === 'profile'}
                  text="Профиль"
                >
                  <Icon28UserCircleOutline />
                </TabbarItem>
              </Tabbar>
            }
          >
            <View id="game" activePanel={activePanel}>
              <Home
                id="home"
                players={players}
                setPlayers={setPlayers}
                currentUser={user}
                onStart={goToGame}
              />
              <Game
                id="gameplay"
                players={players}
                setPlayers={setPlayers}
                onEndGame={endGame}
              />
              <Results id="results" players={players} onPlayAgain={playAgain} />
            </View>

            <View id="leaderboard" activePanel="leaderboard">
              <Leaderboard id="leaderboard" currentUser={user} />
            </View>

            <View id="profile" activePanel="profile">
              <Profile id="profile" currentUser={user} />
            </View>
          </Epic>
        </SplitCol>
      </SplitLayout>
    </ConfigProvider>
  );
}
